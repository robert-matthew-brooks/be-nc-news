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

    test('each article should have correct object layout', () => {
        const objectLayout = {
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String)
        };

        const supertestRequests = [];

        for (let i=1; i<=13; i++) {  // 13 articles in test db
            const pendingRequest = request(app)
            .get(`/api/articles/${i}`)
            .expect(200);
            
            const article = new Promise((resolve, reject) => {
                pendingRequest.then(({ body }) => {
                    resolve(body.article);
                })
                .catch(err => reject(err));
            });

            supertestRequests.push(article);
        }

        return Promise.all(supertestRequests)
        .then(articles => {
            for (const article in articles) {
                expect(articles[article]).toMatchObject(objectLayout);
            }
        });
    });

    test('response data should match the provided seed data', () => {
        const seedArticles = data.articleData;

        const supertestRequests = [];

        for (let i=0; i<seedArticles.length; i++) {
            const seedArticle = seedArticles[i];

            // timestamps in SQL have not been stored as UTC, need converting

            const timestamp = new Date(seedArticle.created_at);
            const localTimestamp = new Date(timestamp.getTime() + timestamp.getTimezoneOffset()*60000)
            seedArticle.created_at = localTimestamp.toISOString();

            const pendingRequest = request(app)
            .get(`/api/articles/${i+1}`)
            .expect(200);
            
            const articles = new Promise((resolve, reject) => {
                pendingRequest.then(({ body }) => {
                    const article = body.article;
                    resolve({ seedArticle, article });
                })
                .catch(err => reject(err));
            });

            supertestRequests.push(articles);
        }

        return Promise.all(supertestRequests)
        .then((supertestResponses) => {
            for (const response of supertestResponses) {
                expect(response.article).toMatchObject(response.seedArticle);
            }
        });
    });

    describe('error handling', () => {
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