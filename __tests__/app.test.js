const request = require('supertest');

const fs = require('fs/promises');
const app = require('../app.js');
const data = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed.js');
const db = require('../db/connection.js');

beforeEach(() => {
    return seed(data);
});

afterAll(() => {
    db.end();
});

describe('GET /api/topics', () => {
    test('200: should have 3 topics with correct object layout', () => {
        const objectLayout = {
            slug: expect.any(String),
            description: expect.any(String)
        };

        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
            expect(body.topics).toHaveLength(3);

            for (const topic of body.topics) {
                expect(topic).toMatchObject(objectLayout);
            }
        });
    });

    describe('error handling', () => {
        test('500: should have correct error message if topics table not found', () => {
            return db.query(`DROP TABLE IF EXISTS topics CASCADE;`)
            .then(() => {
                return request(app)
                .get('/api/topics')
                .expect(500)
            })
            .then(({ body }) => {
                expect(body.msg).toBe('undefined table');
            });
        });
    });
});

describe('GET /api', () => {
    test('200: should match what is in the endpoints.json file', () => {
        const endpoints_json = require('../endpoints.json');

        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
            expect(body).toEqual(endpoints_json);
        });
    });

    test('200: should have exampleResponse properties whose object layouts match the server endpoint responses', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {

            // get list of endpoints from /api
            
            const endpoints = body;
            const supertestRequests = [];

            for (const endpoint in endpoints) {
                if (endpoint !== 'GET /api') {

                    // extract METHOD and URL from each endpoint

                    const method = endpoint.split(' ')[0];
                    const url = endpoint
                        .split(' ')[1]
                        .replaceAll(/:[\w\d]+(?=$|\/)/g, '1');     // (account for parametric endpoints - SQL serials, replace with 1)

                    // extract the /api example response

                    const exampleResponse = endpoints[endpoint].exampleResponse;
                    const exampleRequest = endpoints[endpoint].exampleRequest;

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
});

describe('GET /api/articles/:article_id', () => {
    test('200: should have article with the correct object layout', () => {
        const expectedArticle = {
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String)
        };

        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
            expect(body.article).toMatchObject(expectedArticle);
        });
    });

    describe('error handling', () => {
        test('400: should have correct error message if article_id is not a number', () => {
            return request(app)
            .get('/api/articles/not_a_number')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid text representation');
            });
        });

        test('404: should have correct error message if article_id not found', () => {
            return request(app)
            .get('/api/articles/99')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('article_id not found');
            });
        });
    });
});

describe('GET /api/articles', () => {
    test('200: should have 13 articles with correct object layout', () => {
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
            expect(body.articles).toHaveLength(13);

            for (const article of body.articles) {
                expect(article).toMatchObject(objectLayout);
                expect(article).not.toHaveProperty('body');
            }
        });
    });

    test('200: should have articles sorted in descending date order', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toBeSortedBy('created_at', { descending: true });
        });
    });

    describe('error handling', () => {
        test('500: should have correct error message if articles table not found', () => {
            return db.query(`DROP TABLE IF EXISTS articles CASCADE;`)
            .then(() => {
                return request(app)
                .get('/api/articles')
                .expect(500)
            })
            .then(({ body }) => {
                expect(body.msg).toBe('undefined table');
            });
        });
    });
});

describe('GET /api/articles/:article_id/comments', () => {
    test('200: should have an empty array if article has no comments', () => {
        return request(app)
        .get('/api/articles/2/comments')    // article 2 has no corresponding comments
        .expect(200)
        .then(({ body }) => {
            expect(body.comments).toBeEmpty();
        });
    });

    test('200: should have 11 comments with correct object layout', () => {
        const objectLayout = {
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number)
        };

        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
            expect(body.comments).toHaveLength(11);

            for (const comment of body.comments) {
                expect(comment).toMatchObject(objectLayout);
            }
        });
    });

    test('200: should have comments sorted in descending date order', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
            expect(body.comments).toBeSortedBy('created_at', { descending: true });
        });
    });

    describe('error handling', () => {
        test('400: should have correct error message if article_id is not a number', () => {
            return request(app)
            .get('/api/articles/not_a_number/comments')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid text representation');
            });
        });

        test('404: should have correct error message if article_id not found', () => {
            return request(app)
            .get('/api/articles/99/comments')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('article_id not found');
            });
        });
    });
});

describe('POST /api/articles/:article_id/comments', () => {
    const postCommentRequest = {
        username: 'butter_bridge',
        body: 'test_body'
    };

    test('201: should have comment with correct object layout', () => {
        const objectLayout = {
            comment_id: expect.any(Number),
            body: expect.any(String),
            article_id: expect.any(Number),
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
        };

        return request(app)
        .post('/api/articles/1/comments')
        .send(postCommentRequest)
        .expect(201)
        .then(({ body }) => {
            expect(body.comment).toMatchObject(objectLayout);
            expect(body.comment.author).toBe(postCommentRequest.username);
            expect(body.comment.body).toBe(postCommentRequest.body);
        });
    });
    
    test('number of comments should increase by one after successful post', () => {
        let commentsBefore;
        let commentsAfter;

        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
            commentsBefore = body.comments.length;

            return request(app)
            .post('/api/articles/1/comments')
            .send(postCommentRequest)
            .expect(201);
        })
        .then(() => {
            return request(app)
            .get('/api/articles/1/comments')
            .expect(200);
        })
        .then(({ body }) => {
            commentsAfter = body.comments.length;
            
            expect(commentsAfter).toBe(commentsBefore + 1);
        });
    });

    describe('error handling', () => {
        it('400: should have correct error message if article_id is not a number', () => {
            return request(app)
            .post('/api/articles/not_a_number/comments')
            .send(postCommentRequest)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid text representation');
            });
        });

        it('404: should have correct error message if article_id not found', () => {
            return request(app)
            .post('/api/articles/99/comments')
            .send(postCommentRequest)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('article_id not found');
            });
        });

        it('400: should have correct error message if no request is sent', () => {
            return request(app)
            .post('/api/articles/1/comments')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid comment');
            });
        });

        it('400: should have correct error message if username is blank', () => {
            const blankUsername = {
                username: '',
                body: 'test_body'
            }

            return request(app)
            .post('/api/articles/1/comments')
            .send(blankUsername)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid username');
            });
        });

        it('400: should have correct error message if username is missing', () => {
            const noUsername = {
                body: 'test_body'
            }

            return request(app)
            .post('/api/articles/1/comments')
            .send(noUsername)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid username');
            });
        });

        it('400: should have correct error message if username not found', () => {
            const unknownUsername = {
                username: 'not_a_username',
                body: 'test_body'
            }

            return request(app)
            .post('/api/articles/1/comments')
            .send(unknownUsername)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('foreign key violation');
            });
        });

        it('400: should have correct error message if message body is blank', () => {
            const blankBody = {
                username: 'butter_bridge',
                body: ''
            }

            return request(app)
            .post('/api/articles/1/comments')
            .send(blankBody)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid comment');
            });
        });

        it('400: should have correct error message if message body is missing', () => {
            const noBody = {
                username: 'butter_bridge',
            }

            return request(app)
            .post('/api/articles/1/comments')
            .send(noBody)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid comment');
            });
        });
    });
});

describe('PATCH /api/articles/:article_id', () => {
    test('200: should have updated article with correct object layout', () => {
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

        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: 1 })
        .expect(200)
        .then(({ body }) => {
            expect(body.article).toMatchObject(objectLayout);
        });
    });

    test('addition of votes should be recorded correctly', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: 1 }) // add one vote
        .expect(200)
        .then(() => {
            return request(app)
            .get('/api/articles/1')
            .expect(200)
        })
        .then(({ body }) => {
            expect(body.article.votes).toBe(101);  // check one vote was added
        });
    });

    test('subtraction votes should be recorded correctly', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: -1 }) // remove one vote
        .expect(200)
        .then(() => {
            return request(app)
            .get('/api/articles/1')
            .expect(200)
        })
        .then(({ body }) => {
            expect(body.article.votes).toBe(99);  // check one vote was removed
        });
    });

    test('consecutive changes to the votes should be recorded correctly', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: 10 }) // add ten votes
        .expect(200)
        .then(() => {
            return request(app)
            .get('/api/articles/1')
            .expect(200)
        })
        .then(({ body }) => {
            expect(body.article.votes).toBe(110);  // check ten votes were added

            return request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: -200 })  // subtract 200 votes
            .expect(200)
        })
        .then(() => {
            return request(app)
            .get('/api/articles/1')
            .expect(200)
        })
        .then(({ body }) => {
            expect(body.article.votes).toBe(-90);    // check 200 votes subtracted
        });
    });

    describe('error handling', () => {
        it('400: should have correct error message if article_id is not a number', () => {
            return request(app)
            .patch('/api/articles/not_a_number')
            .send({ inc_votes: 1 })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid text representation');
            });
        });

        it('404: should have correct error message if article_id not found', () => {
            return request(app)
            .patch('/api/articles/99')
            .send({ inc_votes: 1 })
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('article_id not found');
            });
        });

        it('400: should have correct error message if no request is sent', () => {
            return request(app)
            .patch('/api/articles/1')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid vote');
            });
        });

        it('400: should have correct error message if inc_vote is not a number', () => {
            return request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: 'one' })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid text representation');
            });
        });

        it('400: should have correct error message if inc_vote is 0', () => {
            return request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: 0 })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid vote');
            });
        });
    });
});

describe('endpoint not found', () => {
    test('404: should have correct error message if endpoint not found', () => {
        return request(app)
        .get('/api/not_an_endpoint')
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('endpoint not found');
        });
    });
});