const express = require('express');
const {
  getJobs,
  getJob,
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getRecommendedJobs,
  toggleSaveJob,
  getSavedJobs,
  generateCoverLetter
} = require('../controllers/jobController');
const {
  applyToJob,
  getJobApplicants
} = require('../controllers/applicationController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createJobSchema, applyJobSchema } = require('../validators');

const router = express.Router();

// Public routes
router.get('/', optionalProtect, getJobs);

// Protected routes (require valid JWT)
router.use(protect);

// Job Seeker routes
router.get('/recommended', authorize('jobSeeker'), getRecommendedJobs);
router.get('/saved', authorize('jobSeeker'), getSavedJobs);
router.post('/:id/save', authorize('jobSeeker'), toggleSaveJob);
router.post('/:jobId/apply', authorize('jobSeeker'), validate(applyJobSchema), applyToJob);
router.post('/:id/cover-letter', authorize('jobSeeker'), generateCoverLetter);

// Recruiter routes
router.get('/my-jobs', authorize('recruiter'), getMyJobs);
router.get('/:jobId/applicants', authorize('recruiter'), getJobApplicants);
router.post('/', authorize('recruiter'), validate(createJobSchema), createJob);
router.patch('/:id', authorize('recruiter'), updateJob);
router.delete('/:id', authorize('recruiter', 'admin'), deleteJob);

// Get single job detail (must be after specific endpoints)
router.get('/:id', getJob);

module.exports = router;
