const request = require('supertest');
const app = require('../../app');
const { connectDB, disconnectDB } = require('../../config/db');

describe('API Health & RFC 7807 Error Handling', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_integration';
    process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexus_test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('GET /health returns 200 with service information and database status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('nexus-api');
    expect(res.body.database.status).toBe('connected');
  });

  test('GET /api/v1/docs/ serves interactive Swagger UI documentation', async () => {
    const res = await request(app).get('/api/v1/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Swagger UI');
  });

  test('Invalid routes return RFC 7807 problem details 404', async () => {
    const res = await request(app).get('/api/v1/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('RESOURCE_NOT_FOUND');
    expect(res.body.status).toBe(404);
    expect(res.body.title).toBe('Not Found');
  });

  test('POST /api/v1/auth/register with invalid payload returns RFC 7807 422 with invalidParams', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: '123' }); // missing name, bad email, short password

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(Array.isArray(res.body.invalidParams)).toBe(true);
    expect(res.body.invalidParams.length).toBeGreaterThanOrEqual(2);
  });

  test('POST /api/v1/profile/extract-skills extracts technical skills from bio', async () => {
    const email = `candidate_${Date.now()}@example.com`;
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Skill Test Candidate',
        email,
        password: 'password123',
        role: 'jobSeeker'
      });
    expect(regRes.status).toBe(201);
    const token = regRes.body.token;

    // Update bio
    await request(app)
      .patch('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bio: 'Senior engineer specializing in React, Node.js, TypeScript, PostgreSQL, and Docker. Strong with AWS and CI/CD.'
      });

    // Extract skills
    const extractRes = await request(app)
      .post('/api/v1/profile/extract-skills')
      .set('Authorization', `Bearer ${token}`);

    expect(extractRes.status).toBe(200);
    expect(extractRes.body.success).toBe(true);
    expect(Array.isArray(extractRes.body.skills)).toBe(true);
    expect(extractRes.body.skills).toContain('React');
    expect(extractRes.body.skills).toContain('Node.js');
    expect(extractRes.body.skills).toContain('Docker');
    expect(extractRes.body.skills).toContain('AWS');
  });

  test('PATCH /api/v1/profile allows manual skills update', async () => {
    const email = `manual_skills_${Date.now()}@example.com`;
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Manual Candidate',
        email,
        password: 'password123',
        role: 'jobSeeker'
      });
    const token = regRes.body.token;

    const patchRes = await request(app)
      .patch('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        skills: 'Python, Kubernetes, Redis'
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.user.skills).toEqual(['Python', 'Kubernetes', 'Redis']);
  });

  test('GET /api/v1/jobs filters accurately by category, keyword, and escaped regex characters', async () => {
    const JobPost = require('../../models/JobPost');
    const User = require('../../models/User');

    // Create a recruiter user to author jobs
    const recruiter = await User.create({
      name: 'Filter Test Recruiter',
      email: `recruiter_${Date.now()}@example.com`,
      password: 'password123',
      role: 'recruiter'
    });

    // Seed test jobs
    await JobPost.create([
      {
        title: 'Backend C++ Systems Architect',
        company: 'CoreEngine Ltd',
        description: 'Design ultra low-latency C++ trading systems with concurrent ring buffers.',
        requirements: ['C++', 'Multithreading', 'Linux'],
        location: 'Remote',
        type: 'full-time',
        category: 'Backend',
        createdBy: recruiter._id
      },
      {
        title: 'Senior Frontend React Engineer',
        company: 'DesignFlow Inc',
        description: 'Build responsive web apps with React, Vite, and modern CSS.',
        requirements: ['React', 'TypeScript', 'CSS'],
        location: 'Berlin, Germany',
        type: 'full-time',
        category: 'Frontend',
        createdBy: recruiter._id
      }
    ]);

    // Test 1: Category filter
    const catRes = await request(app).get('/api/v1/jobs?category=Backend');
    expect(catRes.status).toBe(200);
    expect(catRes.body.jobs.every((j) => j.category === 'Backend')).toBe(true);

    // Test 2: Regex special characters (C++)
    const cppRes = await request(app).get('/api/v1/jobs?keyword=C%2B%2B');
    expect(cppRes.status).toBe(200);
    expect(cppRes.body.jobs.some((j) => j.title.includes('C++'))).toBe(true);

    // Test 3: Requirements keyword search
    const reqRes = await request(app).get('/api/v1/jobs?keyword=Multithreading');
    expect(reqRes.status).toBe(200);
    expect(reqRes.body.jobs.some((j) => j.requirements.includes('Multithreading'))).toBe(true);

    // Test 4: Location filter
    const locRes = await request(app).get('/api/v1/jobs?location=Berlin');
    expect(locRes.status).toBe(200);
    expect(locRes.body.jobs.some((j) => j.location.includes('Berlin'))).toBe(true);
  });
});
