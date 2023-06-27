const app = require('../app.js');
const data = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed.js');
const db = require('../db/connection.js');
const request = require('supertest');

beforeEach(() => {
    return seed(data);
});

afterAll(() => {
    db.end();
});

describe('GET /api/topics', () => {
    it('should return a 200 http status code', () => {
        return request(app)
        .get('/api/topics')
        .expect(200);
    });

    test('response data should be on a "topics" key', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
            expect(body).toHaveProperty('topics');
        });
    });
    
    test('response data should contain three topics', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
            expect(body.topics).toHaveLength(3);
        });
    });

    test('each topic should have correct object layout', () => {
        const objectLayout = {
            slug: expect.any(String),
            description: expect.any(String)
        };

        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
            for (const topic of body.topics) {
                expect(topic).toMatchObject(objectLayout);
            }
        });
    });

    test('response data should match the provided seed data', () => {
        const seedTopics = data.topicData;

        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
            expect(body.topics).toEqual(seedTopics);
        });
    });

    describe('error handling', () => {
        it('should return a http 500 error if table not available', () => {
            return db.query(`DROP TABLE IF EXISTS topics CASCADE;`)
            .then(() => {
                return request(app)
                .get('/api/topics')
                .expect(500)
            })
            .then(({ body }) => {
                expect(body.msg).toBe('table not found');
            });
        });
    });
});