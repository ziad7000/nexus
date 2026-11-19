const Application = require('../models/Application');
const JobPost = require('../models/JobPost');
const User = require('../models/User');
const { ProblemError } = require('../middleware/problemDetails');

// ==================== APPLICATIONS ====================

// @desc    Apply to a job with atomic concurrency control
// @route   POST /api/v1/jobs/:jobId/apply
// @access  Job Seeker only
exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // 1. Guard against pre-existing application
    const existingApp = await Application.findOne({
      user: req.user._id,
      job: jobId
    });

    if (existingApp) {
      return next(
        new ProblemError({
          status: 409,
          title: 'Conflict',
          detail: 'You have already submitted an application for this position.',
          code: 'DUPLICATE_APPLICATION'
        })
      );
    }

    // 2. Atomic Slot Reservation (Concurrency Safe)
    // Decrements remainingSlots ONLY IF remainingSlots > 0 and status is open
    const updatedJob = await JobPost.findOneAndUpdate(
      {
        _id: jobId,
        status: 'open',
        remainingSlots: { $gt: 0 }
      },
      {
        $inc: { remainingSlots: -1 }
      },
      {
        returnDocument: 'after'
      }
    );

    if (!updatedJob) {
      const jobCheck = await JobPost.findById(jobId);
      if (!jobCheck) {
        return next(
          new ProblemError({
            status: 404,
            title: 'Not Found',
            detail: 'Target job posting was not found.',
            code: 'JOB_NOT_FOUND'
          })
        );
      }
      return next(
        new ProblemError({
          status: 409,
          title: 'Conflict',
          detail: 'All available slots for this position have been filled.',
          code: 'SLOT_EXHAUSTED'
        })
      );
    }

    // 3. Automatically close job if slots reached zero
    if (updatedJob.remainingSlots === 0) {
      await JobPost.updateOne({ _id: updatedJob._id }, { $set: { status: 'closed' } });
    }

    // 4. Create Application with rollback guard
    let application;
    try {
      application = await Application.create({
        user: req.user._id,
        job: jobId,
        coverLetter: req.body.coverLetter || ''
      });
    } catch (createError) {
      // Rollback the reserved slot if application creation fails
      await JobPost.updateOne(
        { _id: jobId },
        {
          $inc: { remainingSlots: 1 },
          $set: { status: 'open' }
        }
      );
      return next(createError);
    }

    return res.status(201).json({
      success: true,
      data: {
        application,
        remainingSlots: updatedJob.remainingSlots
      }
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get applicants for a job (recruiter only)
// @route   GET /api/v1/jobs/:jobId/applicants
// @access  Recruiter (must own the job)
exports.getJobApplicants = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.jobId);

    if (!job) {
      return next(
        new ProblemError({
          status: 404,
          title: 'Not Found',
          detail: 'Job posting not found.',
          code: 'JOB_NOT_FOUND'
        })
      );
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return next(
        new ProblemError({
          status: 403,
          title: 'Forbidden',
          detail: 'You are not authorized to view applicants for this job.',
          code: 'UNAUTHORIZED_JOB_ACCESS'
        })
      );
    }

    const applications = await Application.find({ job: req.params.jobId }).populate(
      'user',
      'name email skills profilePicture'
    );

    res.json({
      success: true,
      total: applications.length,
      applications
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get my applications (job seeker)
// @route   GET /api/v1/applications/my
// @access  Job Seeker only
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user._id }).populate(
      'job',
      'title company type status location remainingSlots'
    );

    res.json({
      success: true,
      total: applications.length,
      applications
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update application status (recruiter only)
// @route   PATCH /api/v1/applications/:id/status
// @access  Recruiter (must own the job)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return next(
        new ProblemError({
          status: 404,
          title: 'Not Found',
          detail: 'Application not found.',
          code: 'APPLICATION_NOT_FOUND'
        })
      );
    }

    if (application.job.createdBy.toString() !== req.user._id.toString()) {
      return next(
        new ProblemError({
          status: 403,
          title: 'Forbidden',
          detail: 'Not authorized to update applications for this job.',
          code: 'UNAUTHORIZED_APPLICATION_ACCESS'
        })
      );
    }

    application.status = status;
    await application.save();

    res.json({
      success: true,
      application
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get all applications (admin only)
// @route   GET /api/v1/applications
// @access  Admin only
exports.getAllApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const applications = await Application.find()
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('job', 'title company');

    const total = await Application.countDocuments();

    res.json({
      success: true,
      total,
      page,
      applications
    });
  } catch (error) {
    return next(error);
  }
};
