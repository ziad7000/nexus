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

// Public routes (optionally authenticated to resolve saved status)
router.get('/', optionalProtect, getJobs);

// Job Seeker authenticated routes
router.get('/recommended', protect, authorize('jobSeeker'), getRecommendedJobs);
router.get('/saved', protect, authorize('jobSeeker'), getSavedJobs);
router.post('/:id/save', protect, authorize('jobSeeker'), toggleSaveJob);
router.post('/:jobId/apply', protect, authorize('jobSeeker'), validate(applyJobSchema), applyToJob);
router.post('/:id/cover-letter', protect, authorize('jobSeeker'), generateCoverLetter);

// Recruiter authenticated routes
router.get('/my-jobs', protect, authorize('recruiter'), getMyJobs);
router.get('/:jobId/applicants', protect, authorize('recruiter'), getJobApplicants);
router.post('/', protect, authorize('recruiter'), validate(createJobSchema), createJob);
router.patch('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

// Public single job detail (mounted after /recommended, /saved, /my-jobs)
router.get('/:id', optionalProtect, getJob);

module.exports = router;
