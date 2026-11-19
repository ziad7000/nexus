const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'internship'],
      required: true
    },
    salary: { type: Number },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'AI/ML', 'DevOps', 'Data Engineering', 'Other'],
      default: 'Other'
    },
    totalSlots: { type: Number, required: true, default: 1, min: 1 },
    remainingSlots: {
      type: Number,
      default: function () {
        return this.totalSlots !== undefined ? this.totalSlots : 1;
      },
      min: 0
    },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Pre-save hook to initialize remainingSlots on new documents if not explicitly provided
jobPostSchema.pre('validate', function () {
  if (this.isNew && (this.remainingSlots === undefined || this.remainingSlots === null)) {
    this.remainingSlots = this.totalSlots;
  }
});

module.exports = mongoose.model('JobPost', jobPostSchema);
