const request = require('supertest');
const app = require('../../app');
const { connectDB, disconnectDB } = require('../../config/db');

describe('API Health & RFC 7807 Error Handling', () => {
  beforeAll(async () => {
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
});
