const mongoose = require('mongoose');
const JobPost = require('../models/JobPost');
const User = require('../models/User');
const hf = require('../services/hfService');      

// Cosine similarity calculation for vector comparison
const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magA && magB ? dot / (magA * magB) : 0;
};

// Helper function: AI Category Classification
const classifyCategory = async (description) => {
  const validCategories = ["Frontend", "Backend", "AI/ML", "DevOps", "Data Engineering", "Other"];

  const classifyByKeywords = (text) => {
    const lower = (text || '').toLowerCase();
    if (lower.includes('frontend') || lower.includes('react') || lower.includes('css') || lower.includes('vue') || lower.includes('ui/ux') || lower.includes('angular')) {
      return 'Frontend';
    }
    if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine learning') || lower.includes('llm') || lower.includes('nlp') || lower.includes('pytorch') || lower.includes('transformer') || lower.includes('deep learning')) {
      return 'AI/ML';
    }
    if (lower.includes('devops') || lower.includes('kubernetes') || lower.includes('docker') || lower.includes('sre') || lower.includes('terraform') || lower.includes('cloud') || lower.includes('aws')) {
      return 'DevOps';
    }
    if (lower.includes('data engineer') || lower.includes('spark') || lower.includes('etl') || lower.includes('pipeline') || lower.includes('sql') || lower.includes('warehouse') || lower.includes('hadoop')) {
      return 'Data Engineering';
    }
    if (lower.includes('backend') || lower.includes('api') || lower.includes('node') || lower.includes('express') || lower.includes('database') || lower.includes('microservices') || lower.includes('golang') || lower.includes('java')) {
      return 'Backend';
    }
    return 'Other';
  };

  try {
    const result = await hf.zeroShotClassification({
      model: "facebook/bart-large-mnli",
      inputs: description,
      parameters: {
        candidate_labels: validCategories
      }
    });

    let predicted = null;
    if (Array.isArray(result)) {
      predicted = result[0]?.label || result[0]?.labels?.[0];
    } else if (result) {
      predicted = result.labels?.[0] || result.label;
    }

    if (predicted && validCategories.includes(predicted)) {
      return predicted;
    }
    return classifyByKeywords(description);
  } catch (error) {
    console.warn('AI classification failed, falling back to keyword heuristic:', error.message);
    return classifyByKeywords(description);
  }
};

// @desc    Get all jobs (public, paginated, filterable)
// @route   GET /api/v1/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (req.query.keyword && req.query.keyword.trim()) {
      const escapedKeyword = req.query.keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedKeyword, $options: 'i' } },
        { description: { $regex: escapedKeyword, $options: 'i' } },
        { company: { $regex: escapedKeyword, $options: 'i' } },
        { requirements: { $regex: escapedKeyword, $options: 'i' } }
      ];
    }
    if (req.query.location && req.query.location.trim()) {
      const escapedLocation = req.query.location.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.location = { $regex: escapedLocation, $options: 'i' };
    }
    if (req.query.type && req.query.type.trim()) {
      filter.type = req.query.type.trim();
    }
    if (req.query.category && req.query.category.trim() && req.query.category !== 'All') {
      filter.category = req.query.category.trim();
    }
    if (req.query.status && req.query.status.trim()) {
      filter.status = req.query.status.trim();
    }
    
    const jobs = await JobPost.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');
    
    const total = await JobPost.countDocuments(filter);

    let savedJobIds = [];
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user && user.savedJobs) {
        savedJobIds = user.savedJobs.map(id => id.toString());
      }
    }

    const jobsWithSaved = jobs.map(job => ({
      ...job.toObject(),
      isSaved: savedJobIds.includes(job._id.toString())
    }));
    
    res.json({
      success: true,
      total,
      page,
      jobs: jobsWithSaved
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/v1/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const job = await JobPost.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    let isSaved = false;
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user && user.savedJobs) {
        isSaved = user.savedJobs.some(id => id.toString() === job._id.toString());
      }
    }
    
    res.json({
      success: true,
      job: {
        ...job.toObject(),
        isSaved
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create job (recruiter only, must be approved)
// @route   POST /api/v1/jobs
// @access  Recruiter (approved only)
// @desc    Create job (recruiter only, must be approved)
// @route   POST /api/v1/jobs
// @access  Recruiter (approved only)
exports.createJob = async (req, res) => {
  try {

    // Check if recruiter is approved
    if (req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Wait for admin approval before posting jobs.'
      });
    }

    // AI Classification
    const category = await classifyCategory(req.body.description);

    const totalSlots = req.body.totalSlots ? parseInt(req.body.totalSlots, 10) : 1;
    const remainingSlots = req.body.remainingSlots !== undefined ? parseInt(req.body.remainingSlots, 10) : totalSlots;

    const job = await JobPost.create({
      ...req.body,
      totalSlots,
      remainingSlots,
      category,           // auto-assigned by AI
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recruiter's own jobs
// @route   GET /api/v1/jobs/my-jobs
// @access  Recruiter only
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await JobPost.find({ createdBy: req.user._id });
    
    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update job (recruiter owner only)
// @route   PATCH /api/v1/jobs/:id
// @access  Recruiter (owner only)
// @desc    Update job (recruiter owner only)
// @route   PATCH /api/v1/jobs/:id
// @access  Recruiter (owner only)
exports.updateJob = async (req, res) => {
  try {
    let job = await JobPost.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns this job
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this job'
      });
    }

    // Re-classify if description changed
    if (req.body.description && req.body.description !== job.description) {
      req.body.category = await classifyCategory(req.body.description);
    }
    
    job = await JobPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete job (recruiter owner or admin)
// @route   DELETE /api/v1/jobs/:id
// @access  Recruiter (owner) or Admin
exports.deleteJob = async (req, res) => {
  try {
    const job = await JobPost.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    const isOwner = job.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }
    
    await job.deleteOne();
    
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==================== AI JOB RECOMMENDATIONS ====================

// @desc    Get job recommendations based on user's skills
// @route   GET /api/v1/jobs/recommended
// @access  Job Seeker only
exports.getRecommendedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobs = await JobPost.find({ status: 'open' });

    // Get saved job IDs for this user
    const savedJobIds = user.savedJobs.map(id => id.toString());

    if (!user.skills || user.skills.length === 0) {
      return res.json({
        success: true,
        jobs: jobs.map(job => ({ ...job.toObject(), isSaved: savedJobIds.includes(job._id.toString()) })),
        message: 'Add skills to your profile to get personalized recommendations'
      });
    }

    if (jobs.length === 0) {
      return res.json({ success: true, jobs: [], message: 'No open jobs available' });
    }

    const studentText = user.skills.join(', ');
    const jobTexts = jobs.map(job =>
      `${job.title} ${job.requirements ? job.requirements.join(', ') : ''}`
    );

    try {
      const embeddings = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: [studentText, ...jobTexts]
      });

      const studentVector = embeddings[0];
      const jobsWithScores = jobs.map((job, index) => ({
        ...job.toObject(),
        isSaved: savedJobIds.includes(job._id.toString()),
        score: cosineSimilarity(studentVector, embeddings[index + 1])
      }));

      jobsWithScores.sort((a, b) => b.score - a.score);

      res.json({ success: true, jobs: jobsWithScores });
    } catch (aiError) {
      console.error('Recommendation failed:', aiError.message);
      res.json({
        success: true,
        jobs: jobs.map(job => ({ ...job.toObject(), isSaved: savedJobIds.includes(job._id.toString()) })),
        message: 'AI service unavailable. Showing all jobs.'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SAVE JOBS ====================

// @desc    Save or unsave a job (toggle)
// @route   POST /api/v1/jobs/:id/save
// @access  Job Seeker only
exports.toggleSaveJob = async (req, res) => {
  try {
    const job = await JobPost.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot save a closed job'
      });
    }
    
    const user = await User.findById(req.user._id);
    const isSaved = user.savedJobs.includes(job._id);
    
    if (isSaved) {
      user.savedJobs = user.savedJobs.filter(
        id => id.toString() !== job._id.toString()
      );
      await user.save();
      
      res.json({
        success: true,
        message: 'Job removed from saved',
        saved: false
      });
    } else {
      user.savedJobs.push(job._id);
      await user.save();
      
      res.json({
        success: true,
        message: 'Job saved',
        saved: true
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all saved jobs for logged-in user
// @route   GET /api/v1/jobs/saved
// @access  Job Seeker only
exports.getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs');

    const jobs = user.savedJobs.map(job => ({
      ...job.toObject(),
      isSaved: true
    }));

    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.generateCoverLetter = async (req, res) => {
  try {
    const job = await JobPost.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const user = await User.findById(req.user._id);
    const bio = user.bio || 'A motivated professional looking for impactful opportunities.';
    const skillsList = user.skills && user.skills.length > 0 ? user.skills.join(', ') : 'modern software development';

    const fallbackCoverLetter = `Dear Hiring Team at ${job.company},

I am writing to express my strong enthusiasm for the ${job.title} position at ${job.company}.

With a background in ${skillsList} and a passion for engineering high-quality solutions, I am confident in my ability to make an immediate impact on your team. 

Key qualifications I bring to this position:
${job.requirements && job.requirements.length > 0 ? job.requirements.slice(0, 4).map(r => `• Hands-on experience with ${r}`).join('\n') : `• Demonstrated experience aligned with ${job.title}`}

About me:
${bio}

I would welcome the opportunity to speak with your team about how my experience and technical background can contribute to ${job.company}'s ongoing success. Thank you for your time and consideration.

Sincerely,
${user.name}`;

    try {
      console.log('Generating AI cover letter for job:', job.title);

      const prompt = `Write a concise, professional cover letter for the following job and applicant. Return only the cover letter body text, with no introductory banter.

Job Title: ${job.title}
Company: ${job.company}
Job Description: ${job.description}

Applicant Name: ${user.name}
Applicant Bio: ${bio}
Applicant Skills: ${skillsList}

Cover Letter:`;

      const response = await hf.chatCompletion({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      });

      const generated = response.choices?.[0]?.message?.content?.trim();
      return res.json({
        success: true,
        coverLetter: generated || fallbackCoverLetter
      });
    } catch (aiError) {
      console.warn('AI cover letter generation failed, using intelligent template:', aiError.message);
      return res.json({
        success: true,
        coverLetter: fallbackCoverLetter
      });
    }
  } catch (error) {
    console.error('Cover letter fatal error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};