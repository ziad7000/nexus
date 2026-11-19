const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/User');
const JobPost = require('../../models/JobPost');
const Application = require('../../models/Application');
const { connectDB, disconnectDB } = require('../../config/db');

describe('Concurrency Control: Job Application Slot Race Proof Test', () => {
  let recruiterToken;
  let recruiterUser;
  let testJob;
  const TOTAL_SLOTS = 5;
  const CONCURRENT_APPLICANTS = 25;
  const candidateTokens = [];
  const candidateUsers = [];

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret_concurrency_proof';
    process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexus_test';
    await connectDB();

    // Clean up test collections
    await User.deleteMany({ email: /@test-race\.internal$/ });
    await JobPost.deleteMany({ title: 'Race Condition Test Position' });
    await Application.deleteMany({});

    // 1. Create recruiter
    recruiterUser = await User.create({
      name: 'Lead Recruiter',
      email: 'recruiter@test-race.internal',
      password: 'password123',
      role: 'recruiter',
      status: 'approved'
    });

    recruiterToken = jwt.sign(
      { _id: recruiterUser._id, role: recruiterUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 2. Create job with limited slots (5 slots)
    testJob = await JobPost.create({
      title: 'Race Condition Test Position',
      company: 'High-Concurrency Systems Inc.',
      description: 'Stress testing atomic slot decrement under heavy parallel load.',
      location: 'Remote',
      type: 'full-time',
      category: 'Backend',
      totalSlots: TOTAL_SLOTS,
      remainingSlots: TOTAL_SLOTS,
      status: 'open',
      createdBy: recruiterUser._id
    });

    // 3. Create 25 distinct candidates and generate their JWT tokens
    for (let i = 1; i <= CONCURRENT_APPLICANTS; i++) {
      const candidate = await User.create({
        name: `Applicant Candidate ${i}`,
        email: `candidate${i}@test-race.internal`,
        password: 'password123',
        role: 'jobSeeker',
        status: 'approved'
      });
      candidateUsers.push(candidate);

      const token = jwt.sign(
        { _id: candidate._id, role: candidate.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      candidateTokens.push(token);
    }
  });

  afterAll(async () => {
    // Teardown test artifacts
    await User.deleteMany({ email: /@test-race\.internal$/ });
    if (testJob && testJob._id) {
      await JobPost.deleteMany({ _id: testJob._id });
      await Application.deleteMany({ job: testJob._id });
    }
    await disconnectDB();
  });

  test('Guarantees zero oversubscription when 25 candidates apply simultaneously for 5 slots', async () => {
    // Dispatch 25 simultaneous parallel HTTP POST requests
    const promises = candidateTokens.map((token, index) => {
      return request(app)
        .post(`/api/v1/jobs/${testJob._id}/apply`)
        .set('Authorization', `Bearer ${token}`)
        .send({ coverLetter: `Parallel application submission by candidate #${index + 1}` });
    });

    const results = await Promise.all(promises);

    // Filter statuses
    const successes = results.filter((res) => res.status === 201);
    const conflicts = results.filter((res) => res.status === 409);
    const others = results.filter((res) => res.status !== 201 && res.status !== 409);

    // 1. No unexpected errors occurred
    expect(others.length).toBe(0);

    // 2. Exactly 5 applicants succeeded
    expect(successes.length).toBe(TOTAL_SLOTS);

    // 3. Exactly 20 applicants were safely rejected with Conflict
    expect(conflicts.length).toBe(CONCURRENT_APPLICANTS - TOTAL_SLOTS);

    // Verify response structure of rejected requests follows RFC 7807
    const sampleConflict = conflicts[0].body;
    expect(sampleConflict.code).toBe('SLOT_EXHAUSTED');
    expect(sampleConflict.status).toBe(409);

    // 4. Verify Database state: remainingSlots MUST be exactly 0, never negative
    const refreshedJob = await JobPost.findById(testJob._id);
    expect(refreshedJob.remainingSlots).toBe(0);
    expect(refreshedJob.status).toBe('closed');

    // 5. Verify total created Application records equals TOTAL_SLOTS
    const actualApplicationsCount = await Application.countDocuments({ job: testJob._id });
    expect(actualApplicationsCount).toBe(TOTAL_SLOTS);
  });
});
