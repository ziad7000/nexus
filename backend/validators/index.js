const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['jobSeeker', 'recruiter', 'admin']).default('jobSeeker')
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

const createJobSchema = z.object({
  title: z.string().min(3, 'Job title is required'),
  company: z.string().min(2, 'Company name is required'),
  description: z.string().min(10, 'Detailed description is required'),
  location: z.string().min(2, 'Location is required'),
  type: z.enum(['full-time', 'part-time', 'internship']),
  salary: z.number().nonnegative().optional(),
  totalSlots: z.number().int().positive().default(1),
  requirements: z.array(z.string()).optional()
});

const applyJobSchema = z.object({
  coverLetter: z.string().max(2000).optional().default('')
});

const updateAppStatusSchema = z.object({
  status: z.enum(['pending', 'shortlisted', 'rejected'])
});

module.exports = {
  registerSchema,
  loginSchema,
  createJobSchema,
  applyJobSchema,
  updateAppStatusSchema
};
