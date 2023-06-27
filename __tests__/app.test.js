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

describe('GET /api/articles/:article_id', () => {
    test('response data should be on an "article" key with a 200 http status code', () => {
        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
            expect(body).toHaveProperty('article');
        });
    });

    test('article should match expected test article', () => {
        const expectedArticle = {
            article_id: 1,  // assume psql assigns this article a serial primary key of 1
            title: 'Living in the shadow of a great man',
            topic: 'mitch',
            author: 'butter_bridge',
            body: 'I find this existence challenging',
            created_at: '2020-07-09T20:11:00.000Z',
            votes: 100,
            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
        };

        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
            expect(body.article).toMatchObject(expectedArticle);
        });
    });

    describe('error handling', () => {
        it('should return a http 400 error if provided id is not a number', () => {
            return request(app)
            .get('/api/articles/not_a_number')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid article id');
            });
        });

        it('should return a http 404 error if article not in database', () => {
            return request(app)
            .get('/api/articles/99')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('article not found');
            });
        });
    });
});

describe('endpoint not found', () => {
    it('should return a http 404 error if endpoint not found', () => {
        return request(app)
        .get('/api/not_an_endpoint')
        .expect(404)
        .then(({ body }) => {
            console.log(body);
            expect(body.msg).toBe('endpoint not found');
        });
    });
});