const request = require('supertest');
const fs = require('fs/promises');

const db = require('../db/connection.js');
const app = require('../app.js');
const seed = require('../db/seeds/seed.js');
const data = require('../db/data/test-data/index.js');


beforeEach(() => {
    return seed(data);
});

afterAll(() => {
    db.end();
});

describe('GET /api/topics', () => {
    test('response data should be on a "topics" key with 200 http status', () => {
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
        const expectedTopic = {
            description: 'The man, the Mitch, the legend',
            slug: 'mitch'
        };

        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
            expect(body.topics[0]).toEqual(expectedTopic);
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

describe('GET /api', () => {
    test('response data should be on an "endpoints" key with 200 http status', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
            expect(body).toHaveProperty('endpoints');
        });
    });

    test('response data should match what is in the endpoints.json file', () => {
        let fileContents;

        return fs.readFile(`${__dirname}/../endpoints.json`, 'utf-8')
        .then(data => {
            fileContents = JSON.parse(data);
            
            return request(app)
            .get('/api')
            .expect(200)
        })
        .then(({ body }) => {
            expect(body.endpoints).toEqual(fileContents);
        });
    });

    test('example response from /api should match the format of the actual response provided by the endpoint', () => {

        // this test should be dynamic for an evolving endpoints.json file
        // so this test doesn't need to be updated when endpoints.json is updated

        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {

            // get list of endpoints from /api
            
            const endpoints = body.endpoints;
            const supertestRequests = [];

            for (const endpoint in endpoints) {
                if (endpoint !== 'GET /api') {

                    // extract METHOD and URL from each endpoint

                    const method = endpoint.split(' ')[0];
                    const url = endpoint
                        .split(' ')[1]
                        .replaceAll(/:[\w\d]+($|\/)/g, '1');     // (account for parametric endpoints - SQL serials, replace with 1)

                    // extract the /api example response

                    const exampleResponse = endpoints[endpoint].exampleResponse;
                    const exampleRequest = endpoints[endpoint].exampleRequest || {};

                    // also extract the key the response array is assigned to

                    const wrapperKey = Object.keys(exampleResponse)[0];

                    // make supertest requests to all endpoints (varying depening on METHOD)
                    
                    let pendingRequest;
                    
                    if (method === 'GET') {
                        pendingRequest = request(app).get(url).send(exampleRequest).expect(200);
                    }
                    else if (method === 'POST') {
                        pendingRequest = request(app).post(url).send(exampleRequest).expect(201);
                    }
                    else if (method === 'PATCH') {
                        pendingRequest = request(app).patch(url).send(exampleRequest).expect(200);
                    }
                    else if (method === 'DELETE') {
                        pendingRequest = request(app).delete(url).send(exampleRequest).expect(204);
                    }
                    
                    // store the server response data as promise (alongside /api example response to compare to)
                    // ...so all endpoint responses can be passed to next promise chain step together

                    const dataElements = new Promise((resolve, reject) => {
                        pendingRequest.then(({ body }) => {
                            let elements = body[wrapperKey];
                            if (!Array.isArray(elements)) elements = [elements];    // (account for requests not coming back as array, eg single item from database)

                            let example = exampleResponse[wrapperKey];
                            if (Array.isArray(example)) example = example[0];

                            resolve({ example, elements });
                        })
                        .catch(err => reject(err));
                    });

                    supertestRequests.push(dataElements);
                }
            }

            return Promise.all(supertestRequests);
        })
        .then(supertestResponses => {
            
            // iterate through server responses for each endpoint
            
            for (const response of supertestResponses) {
                
                // iterate through all elements in response array, compare them to example

                for (const element of response.elements) {

                    // iterate through all keys of endpoint response element
                    // confirm the example does contain the required key with matching data type
                    
                    for(const key of Object.keys(element)) {
                        expect(response.example).toHaveProperty(key);
                        expect(typeof response.example[key]).toBe(typeof element[key]);
                    }
                }
            }
        });
    });

    describe('error handling', () => {
        it('should return a http 500 error if endpoints.json file not available', () => {
            const correctPath = `${__dirname}/../endpoints.json`;
            const incorrectPath = `${__dirname}/../endpointsss.json`;

            return fs.rename(correctPath, incorrectPath)
            .then(() => {
                return request(app)
                .get('/api')
                .expect(500)
            })
            .then(({ body }) => {
                expect(body.msg).toBe('file not found');
            })
            .then(() => {
                fs.rename(incorrectPath, correctPath);
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

describe('GET /api/articles', () => {
    test('response data should be on a "articles" key with 200 http status', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
            expect(body).toHaveProperty('articles');
        });
    });
    
    test('response data should contain thirteen articles', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toHaveLength(13);
        });
    });

    test('each article should have correct object layout', () => {
        const objectLayout = {
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number)
        };

        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
            for (const article of body.articles) {
                expect(article).toMatchObject(objectLayout);
            }
        });
    });

    test('each article should not have a body property', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
            for (const article of body.articles) {
                expect(article).not.toHaveProperty('body');
            }
        });
    });

    test('response data should match the provided seed data', () => {
        const expectedArticle = {
            author: 'icellusedkars',
            title: 'Eight pug gifs that remind me of mitch',
            article_id: 3,
            topic: 'mitch',
            created_at: '2020-11-03T09:12:00.000Z',
            votes: 0,
            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
            comment_count: 2
        };

        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles[0]).toEqual(expectedArticle);
        });
    });

    test('articles should be sorted in descending date order', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toBeSortedBy('created_at', { descending: true });
        });
    });

    describe('error handling', () => {
        it('should return a http 500 error if table not available', () => {
            return db.query(`DROP TABLE IF EXISTS articles CASCADE;`)
            .then(() => {
                return request(app)
                .get('/api/articles')
                .expect(500)
            })
            .then(({ body }) => {
                expect(body.msg).toBe('table not found');
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
            expect(body.msg).toBe('endpoint not found');
        });
    });
});