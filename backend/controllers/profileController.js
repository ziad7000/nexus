const User = require('../models/User');
const bcrypt = require('bcryptjs');
const hf = require('../services/hfService');

// @desc    Get logged-in user's profile
// @route   GET /api/v1/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update profile
// @route   PATCH /api/v1/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'profilePicture', 'skills'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'skills') {
          if (Array.isArray(req.body.skills)) {
            updates.skills = req.body.skills.map(s => String(s).trim()).filter(Boolean);
          } else if (typeof req.body.skills === 'string') {
            updates.skills = req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
          }
        } else {
          updates[field] = req.body[field];
        }
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change password
// @route   PATCH /api/v1/profile/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Curated Software Engineering Skills Dictionary for instant, high-precision matching
const TECH_SKILLS = [
  // Languages
  { name: 'JavaScript', regex: /\b(javascript|es6|vanilla js)\b/i },
  { name: 'TypeScript', regex: /\btypescript\b/i },
  { name: 'Python', regex: /\bpython\b/i },
  { name: 'Java', regex: /\bjava\b/i, exclude: /\b(javascript)\b/i },
  { name: 'C++', regex: /(?:^|[^\w])c\+\+(?:[^\w]|$)/i },
  { name: 'C#', regex: /(?:^|[^\w])c#(?:[^\w]|$)/i },
  { name: 'Go', regex: /\b(golang|go language)\b/i },
  { name: 'Rust', regex: /\brust\b/i },
  { name: 'Ruby', regex: /\bruby\b/i },
  { name: 'PHP', regex: /\bphp\b/i },
  { name: 'Swift', regex: /\bswift\b/i },
  { name: 'Kotlin', regex: /\bkotlin\b/i },
  { name: 'Dart', regex: /\bdart\b/i },
  { name: 'SQL', regex: /\bsql\b/i },
  { name: 'HTML5', regex: /\bhtml5?\b/i },
  { name: 'CSS3', regex: /\bcss3?\b/i, check: (bio) => !/\btailwind\s*css\b/i.test(bio) || /\bcss3?\b/i.test(bio.replace(/\btailwind\s*css\b/gi, '')) },
  { name: 'Bash', regex: /\b(bash|shell scripting)\b/i },

  // Frontend Frameworks & Libraries
  { name: 'React', regex: /\b(react|reactjs|react\.js)\b/i, exclude: /\breact[ -]native\b/i },
  { name: 'React Native', regex: /\breact[ -]native\b/i },
  { name: 'Next.js', regex: /\b(next\.?js|nextjs)\b/i },
  { name: 'Vue.js', regex: /\b(vue|vuejs|vue\.js)\b/i },
  { name: 'Nuxt.js', regex: /\b(nuxt|nuxtjs|nuxt\.js)\b/i },
  { name: 'Angular', regex: /\bangular\b/i },
  { name: 'Svelte', regex: /\bsvelte\b/i },
  { name: 'Redux', regex: /\bredux\b/i },
  { name: 'Tailwind CSS', regex: /\btailwind(css)?\b/i },
  { name: 'Bootstrap', regex: /\bbootstrap\b/i },

  // Backend Frameworks & Runtimes
  { name: 'Node.js', regex: /\b(node|nodejs|node\.js)\b/i },
  { name: 'Express', regex: /\b(express|expressjs|express\.js)\b/i },
  { name: 'NestJS', regex: /\b(nestjs|nest\.js)\b/i },
  { name: 'FastAPI', regex: /\bfastapi\b/i },
  { name: 'Django', regex: /\bdjango\b/i },
  { name: 'Flask', regex: /\bflask\b/i },
  { name: 'Spring Boot', regex: /\bspring([ -]boot)?\b/i },
  { name: 'Ruby on Rails', regex: /\b(rails|ruby on rails)\b/i },
  { name: 'Laravel', regex: /\blaravel\b/i },
  { name: 'ASP.NET', regex: /\basp\.net\b/i },

  // Databases & Storage
  { name: 'MongoDB', regex: /\b(mongodb|mongo)\b/i },
  { name: 'PostgreSQL', regex: /\b(postgres|postgresql)\b/i },
  { name: 'MySQL', regex: /\bmysql\b/i },
  { name: 'Redis', regex: /\bredis\b/i },
  { name: 'SQLite', regex: /\bsqlite\b/i },
  { name: 'Elasticsearch', regex: /\belasticsearch\b/i },
  { name: 'DynamoDB', regex: /\bdynamodb\b/i },
  { name: 'Firebase', regex: /\bfirebase\b/i },
  { name: 'Supabase', regex: /\bsupabase\b/i },
  { name: 'Prisma', regex: /\bprisma\b/i },

  // Cloud, DevOps & Platforms
  { name: 'Docker', regex: /\bdocker\b/i },
  { name: 'Kubernetes', regex: /\b(kubernetes|k8s)\b/i },
  { name: 'AWS', regex: /\b(aws|amazon web services)\b/i },
  { name: 'Azure', regex: /\b(azure|microsoft azure)\b/i },
  { name: 'Google Cloud', regex: /\b(gcp|google cloud)\b/i },
  { name: 'CI/CD', regex: /\b(ci\/cd|ci-cd|continuous integration)\b/i },
  { name: 'GitHub Actions', regex: /\bgithub actions\b/i },
  { name: 'Terraform', regex: /\bterraform\b/i },
  { name: 'Linux', regex: /\blinux\b/i },
  { name: 'Nginx', regex: /\bnginx\b/i },
  { name: 'Git', regex: /\b(git|github|gitlab)\b/i },

  // APIs & Architecture
  { name: 'REST APIs', regex: /\b(rest|restful|rest apis?)\b/i },
  { name: 'GraphQL', regex: /\bgraphql\b/i },
  { name: 'Microservices', regex: /\bmicroservices?\b/i },
  { name: 'WebSockets', regex: /\bwebsockets?\b/i },
  { name: 'gRPC', regex: /\bgrpc\b/i },
  { name: 'Kafka', regex: /\bkafka\b/i },
  { name: 'RabbitMQ', regex: /\brabbitmq\b/i },

  // AI & Data Science
  { name: 'Machine Learning', regex: /\b(machine learning|ml)\b/i },
  { name: 'Deep Learning', regex: /\bdeep learning\b/i },
  { name: 'PyTorch', regex: /\bpytorch\b/i },
  { name: 'TensorFlow', regex: /\btensorflow\b/i },
  { name: 'Scikit-Learn', regex: /\b(scikit[ -]learn|sklearn)\b/i },
  { name: 'Pandas', regex: /\bpandas\b/i },
  { name: 'NumPy', regex: /\bnumpy\b/i },
  { name: 'NLP', regex: /\b(nlp|natural language processing)\b/i },
  { name: 'Computer Vision', regex: /\bcomputer vision\b/i },
  { name: 'LLMs', regex: /\b(llms?|large language models?)\b/i }
];

const extractFromDictionary = (bio) => {
  const found = [];
  for (const item of TECH_SKILLS) {
    if (item.regex.test(bio)) {
      if (item.exclude && item.exclude.test(bio) && !new RegExp(`\\b${item.name}\\b`, 'i').test(bio)) {
        continue;
      }
      if (item.check && !item.check(bio)) {
        continue;
      }
      found.push(item.name);
    }
  }
  return found;
};

const extractWithAI = async (bio) => {
  try {
    const prompt = `Extract all technical skills, programming languages, frameworks, libraries, databases, cloud platforms, and developer tools mentioned in the candidate bio below.
Return ONLY a valid JSON array of short skill names, e.g. ["React", "Node.js", "Docker"].
Do NOT include non-technical words, job titles, or explanatory sentences. If none are found, return [].

Bio:
${bio}

JSON:`;

    const response = await hf.chatCompletion({
      model: 'Qwen/Qwen2.5-7B-Instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.1
    });

    const content = response.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(item => typeof item === 'string' && item.trim().length > 1 && item.trim().length < 35)
          .map(item => item.trim());
      }
    }
  } catch (err) {
    console.warn('AI skill extraction warning:', err.message);
  }
  return [];
};

// @desc    Extract skills from user's bio using AI + Heuristic Extractor
// @route   POST /api/v1/profile/extract-skills
// @access  Private (all authenticated users)
exports.extractSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.bio || user.bio.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Bio is empty. Please add a bio to your profile first.'
      });
    }

    // 1. Fast, reliable dictionary extraction
    const dictionarySkills = extractFromDictionary(user.bio);

    // 2. AI model inference (runs concurrently or complements dictionary)
    const aiSkills = await extractWithAI(user.bio);

    // 3. Deduplicate preserving canonical casing
    const seen = new Set();
    const mergedSkills = [];

    for (const skill of [...dictionarySkills, ...aiSkills]) {
      const normalized = skill.toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        mergedSkills.push(skill);
      }
    }

    // 4. Fallback: capitalized tokens if both passes found no matches
    if (mergedSkills.length === 0) {
      const stopWords = new Set([
        'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they', 'it',
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'with', 'about', 'by', 'from', 'of', 'as', 'is', 'am', 'are', 'was',
        'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
        'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
        'experienced', 'passionate', 'motivated', 'enthusiastic', 'dedicated',
        'developer', 'engineer', 'professional', 'specialist', 'student', 'graduate',
        'university', 'college', 'school', 'team', 'company', 'years', 'experience',
        'seeking', 'looking', 'building', 'creating', 'solving', 'working', 'hello'
      ]);

      const candidates = user.bio.match(/[A-Za-z][A-Za-z0-9.+#-]+/g) || [];
      for (const word of candidates) {
        if (word.length >= 2 && !stopWords.has(word.toLowerCase()) && !seen.has(word.toLowerCase())) {
          seen.add(word.toLowerCase());
          mergedSkills.push(word);
          if (mergedSkills.length >= 8) break;
        }
      }
    }

    user.skills = mergedSkills;
    await user.save();

    res.json({
      success: true,
      skills: user.skills,
      extracted: user.skills
    });
  } catch (error) {
    console.error('Skill extraction fatal error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};