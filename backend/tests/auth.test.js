const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

// Append a timestamp to make the email unique across test runs
const uniqueEmail = `testuser_${Date.now()}@example.com`;
const testPassword = 'password123';

describe('Auth API Endpoints', () => {
    
    // Test for TC001: Register with valid data
    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullname: 'Test User',
                email: uniqueEmail,
                password: testPassword,
                gender: 'Laki-laki',
                birth_date: '2000-01-01'
            });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Register berhasil');
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', uniqueEmail);
    });

    // Test for Registration with an existing email (should fail)
    it('should fail registration if email is already registered', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullname: 'Test User Duplicate',
                email: uniqueEmail, // using the same email from previous test
                password: testPassword
            });
        
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Email sudah terdaftar!');
    });

    // Test for TC003: Login with valid credentials
    it('should login successfully with correct credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: uniqueEmail,
                password: testPassword
            });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', uniqueEmail);
        
        expect(res.body).toHaveProperty('message');
    });

    // Test for TC004: Login with incorrect password
    it('should fail login with incorrect password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: uniqueEmail,
                password: 'wrongpassword'
            });
        
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Password salah');
    });

    // Cleanup: Close DB connection after tests are done
    afterAll((done) => {
        // Option to delete the test user:
        // db.query('DELETE FROM users WHERE email = ?', [uniqueEmail], () => { ... });
        db.end(done);
    });
});
