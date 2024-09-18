const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Import your Express app
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock MongoDB server
let mongoServer;

// Initialize before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 10000);

// Clean up the DB after each test
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// Close connection after all tests
afterAll(async () => {
  if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
});

// Test registration
describe('User Registration', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.name).toBe('Test User'); // This line causes error
    // expect(res.body.user.name).toBe('Test User'); // This line causes error
  });

  it('should return error for duplicate email', async () => {
    // Register the same user twice
    await request(app).post('/api/users/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/users/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('User already exists');
  });
});

// Test login
describe('User Login', () => {
  it('should login a registered user', async () => {
    // Register a user first
    await request(app).post('/api/users/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return error for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid email or password');
  });
});

// Test profile retrieval
describe('User Profile', () => {
  it('should retrieve user profile when authenticated', async () => {
    // Register and login user to get token
    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    const token = res.body.token;

    const profileRes = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileRes.statusCode).toEqual(200);
    expect(profileRes.body).toHaveProperty('name', 'Test User');
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/users/profile');

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Not authorized, no token');
  });
});
