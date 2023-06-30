const request = require('supertest');

const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const data = require('../db/data/test-data/index.js');

beforeEach(() => {
    return seed(data);
});

afterAll(() => {
    db.end();
});

describe('ALL invalid endpoint', () => {
    test('404: should have correct error message if endpoint not found', () => {
        return request(app)
        .get('/api/not_an_endpoint')
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('endpoint not found');
        });
    });
});

describe('GET /api/topics', () => {
    test('200: should have 3 topics with correct object layout', () => {
        const expectedTopic = {
            slug: expect.any(String),
            description: expect.any(String)
        };

        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
            expect(body.topics).toHaveLength(3);

            for (const topic of body.topics) {
                expect(topic).toMatchObject(expectedTopic);
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
            const endpoints = body;
            const supertestRequests = [];

            for (const endpoint in endpoints) {
                if (endpoint !== 'GET /api') {
                    const method = endpoint.substring(0, endpoint.indexOf(' '));
                    const url = endpoint
                        .substring(endpoint.indexOf(' ')+1)
                        .replace(':username', 'butter_bridge')
                        .replaceAll(/:[\w\d]+(?=$|\/)/g, '1');
                    
                    const exampleResponse = endpoints[endpoint].exampleResponse;
                    const exampleRequest = endpoints[endpoint].exampleRequest;

                    const wrapperKey = Object.keys(exampleResponse)[0];

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
                    
                    const dataElements = new Promise((resolve, reject) => {
                        pendingRequest.then(({ body }) => {
                            let elements = body[wrapperKey];
                            if (!Array.isArray(elements)) elements = [elements];

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
            for (const response of supertestResponses) {
                for (const element of response.elements) {
                    if (element) {
                        for(const key of Object.keys(element)) {
                            expect(response.example).toHaveProperty(key);
                            expect(typeof response.example[key]).toBe(typeof element[key]);
                        }
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
        const expectedArticle = {
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
                expect(article).toMatchObject(expectedArticle);
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
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({ body }) => {
            expect(body.comments).toBeEmpty();
        });
    });

    test('200: should have 11 comments with correct object layout', () => {
        const expectedComment = {
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
                expect(comment).toMatchObject(expectedComment);
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
        const expectedComment = {
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
            expect(body.comment).toMatchObject(expectedComment);
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
        test('400: should have correct error message if article_id is not a number', () => {
            return request(app)
            .post('/api/articles/not_a_number/comments')
            .send(postCommentRequest)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid text representation');
            });
        });

        test('404: should have correct error message if article_id not found', () => {
            return request(app)
            .post('/api/articles/99/comments')
            .send(postCommentRequest)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('article_id not found');
            });
        });

        test('400: should have correct error message if no request is sent', () => {
            return request(app)
            .post('/api/articles/1/comments')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid comment');
            });
        });

        test('400: should have correct error message if username is blank', () => {
            const blankUsername = {
                username: '',
                body: 'test_body'
            }

            return request(app)
            .post('/api/articles/1/comments')
            .send(blankUsername)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('username not found');
            });
        });

        test('400: should have correct error message if username is missing', () => {
            const noUsername = {
                body: 'test_body'
            }

            return request(app)
            .post('/api/articles/1/comments')
            .send(noUsername)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('username not found');
            });
        });

        test('400: should have correct error message if username not found', () => {
            const unknownUsername = {
                username: 'not_a_username',
                body: 'test_body'
            }

            return request(app)
            .post('/api/articles/1/comments')
            .send(unknownUsername)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('username not found');
            });
        });

        test('400: should have correct error message if message body is blank', () => {
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

        test('400: should have correct error message if message body is missing', () => {
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
        .patch('/api/articles/1')
        .send({ inc_votes: 1 })
        .expect(200)
        .then(({ body }) => {
            expect(body.article).toMatchObject(expectedArticle);
        });
    });

    test('addition of votes should be recorded correctly', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: 1 })
        .expect(200)
        .then(() => {
            return request(app)
            .get('/api/articles/1')
            .expect(200)
        })
        .then(({ body }) => {
            expect(body.article.votes).toBe(101);
        });
    });

    test('subtraction votes should be recorded correctly', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: -1 })
        .expect(200)
        .then(() => {
            return request(app)
            .get('/api/articles/1')
            .expect(200)
        })
        .then(({ body }) => {
            expect(body.article.votes).toBe(99);
        });
    });

    test('consecutive changes to the votes should be recorded correctly', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: 10 })
        .expect(200)
        .then(() => {
            return request(app)
            .get('/api/articles/1')
            .expect(200)
        })
        .then(({ body }) => {
            expect(body.article.votes).toBe(110);

            return request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: -200 })
            .expect(200)
        })
        .then(() => {
            return request(app)
            .get('/api/articles/1')
            .expect(200)
        })
        .then(({ body }) => {
            expect(body.article.votes).toBe(-90);
        });
    });

    describe('error handling', () => {
        test('400: should have correct error message if article_id is not a number', () => {
            return request(app)
            .patch('/api/articles/not_a_number')
            .send({ inc_votes: 1 })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid text representation');
            });
        });

        test('404: should have correct error message if article_id not found', () => {
            return request(app)
            .patch('/api/articles/99')
            .send({ inc_votes: 1 })
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('article_id not found');
            });
        });

        test('400: should have correct error message if no request is sent', () => {
            return request(app)
            .patch('/api/articles/1')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid inc_votes');
            });
        });

        test('400: should have correct error message if inc_vote is not a number', () => {
            return request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: 'one' })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid text representation');
            });
        });

        test('400: should have correct error message if inc_vote is 0', () => {
            return request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: 0 })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid inc_votes');
            });
        });
    });
});

describe('DELETE /api/comments/:comment_id', () => {
    test('204: should have no content', () => {
        return request(app)
        .delete('/api/comments/1')
        .expect(204)
        .then(({ body }) => {
            expect(body).toBeEmpty();
        });
    });

    test('number of comments should decrease by one after successful deletion', () => {
        return request(app)
        .delete('/api/comments/5')
        .expect(204)
        .then(() => {
            return request(app)
            .get('/api/articles/1/comments')
            .expect(200);
        })
        .then(({ body }) => {
            expect(body.comments.length).toBe(10);
        });
    });

    describe('error handling', () => {
        test('400: should have correct error message if comment_id is not a number', () => {
            return request(app)
            .delete('/api/comments/not_a_number')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid text representation');
            });
        });

        test('404: should have correct error message if comment_id not found', () => {
            return request(app)
            .delete('/api/comments/99')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('comment_id not found');
            });
        });
    });
});

describe('GET /api/users', () => {
    test('200: should have 4 users with correct object layout', () => {
        const expectedUser = {
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String)
        };

        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body }) => {
            expect(body.users).toHaveLength(4);

            for (const user of body.users) {
                expect(user).toMatchObject(expectedUser);
            }
        });
    });

    describe('error handling', () => {
        test('500: should have correct error message if users table not found', () => {
            return db.query(`DROP TABLE IF EXISTS users CASCADE;`)
            .then(() => {
                return request(app)
                .get('/api/users')
                .expect(500)
            })
            .then(({ body }) => {
                expect(body.msg).toBe('undefined table');
            });
        });
    });
});

describe('GET /api/articles (queries)', () => {
    test('200: should have 13 articles when unrecognised query is ignored', () => {
        return request(app)
        .get('/api/articles?not_a_variable=not_a_value')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toHaveLength(13);
        });
    });

    test('200: should have 12 articles when filtered by topic "mitch"', () => {
        return request(app)
        .get('/api/articles?topic=mitch')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toHaveLength(12);

            for (const article of body.articles) {
                expect(article.topic).toBe('mitch');
            }
        });
    });

    test('200: should have 1 article when filtered by topic "CaTs" (when topic is not lowercase)', () => {
        return request(app)
        .get('/api/articles?topic=CaTs')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toHaveLength(1);
            expect(body.articles[0].topic).toBe('cats');
        });
    });

    test('200: should have articles sorted in descending author order (when order is specified)', () => {
        return request(app)
        .get('/api/articles?sort_by=author&order=desc')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toBeSortedBy('author', { descending: true });
        });
    });

    test('200: should have articles sorted in ascending author order', () => {
        return request(app)
        .get('/api/articles?sort_by=author&order=asc')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toBeSortedBy('author');
        });
    });

    test('200: should have 12 articles sorted in descending votes order', () => {
        return request(app)
        .get('/api/articles?topic=mitch&sort_by=votes&order=desc')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toHaveLength(12);

            for (const article of body.articles) {
                expect(article.topic).toBe('mitch');
            }

            expect(body.articles).toBeSortedBy('votes', { descending: true });
        });
    });

    test('200: should have 12 articles sorted in ascending date order (when queries are rearranged)', () => {
        return request(app)
        .get('/api/articles?order=asc&sort_by=date&topic=mitch')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toHaveLength(12);

            for (const article of body.articles) {
                expect(article.topic).toBe('mitch');
            }

            expect(body.articles).toBeSortedBy('created_at');
        });
    });

    test('should not be vulnerable to sql injection in the topic value', () => {
        return request(app)
        .get("/api/articles/?topic='group by articles.article_id;drop table users cascade;select * from articles--")
        .then(() => {
            return request(app)
            .get('/api/users')
        })
        .then(({ body }) => {
            expect(body.msg).not.toBe('undefined table');
            expect(body.users).toBeDefined();
        });
    });

    describe('error handling', () => {
        test('400: should have correct error message if topic is missing', () => {
            return request(app)
            .get('/api/articles?topic=')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid topic');
            });
        });

        test('404: should have correct error message when topic not found', () => {
            return request(app)
            .get('/api/articles?topic=not_a_topic')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('slug not found');
            });
        });

        test('400: should have correct error message if sort_by is missing', () => {
            return request(app)
            .get('/api/articles?sort_by=')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid sort_by');
            });
        });

        test('400: should have correct error message if sort_by is invalid', () => {
            return request(app)
            .get('/api/articles?sort_by=invalid')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid sort_by');
            });
        });

        test('400: should have correct error message if order is missing', () => {
            return request(app)
            .get('/api/articles?order=')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid order');
            });
        });

        test('400: should have correct error message if order is invalid', () => {
            return request(app)
            .get('/api/articles?order=invalid')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid order');
            });
        });
    });
});

describe('GET /api/articles/:article_id (comment_count)', () => {
    test('200: should have article with the correct object layout', () => {
        const expectedArticle = {
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
        };

        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
            expect(body.article).toMatchObject(expectedArticle);
        });
    });
});

describe('GET /api/users/:user_id', () => {
    test('200: should have user with the correct object layout', () => {
        const expectedUser = {
            username: expect.any(String),
            avatar_url: expect.any(String),
            name: expect.any(String)
        };

        return request(app)
        .get('/api/users/butter_bridge')
        .expect(200)
        .then(({ body }) => {
            expect(body.user).toMatchObject(expectedUser);
        });
    });

    describe('error handling', () => {
        test('404: should have correct error message if username not found', () => {
            return request(app)
            .get('/api/users/not_a_username')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('username not found');
            });
        });
    });
});

describe('PATCH /api/comments/:comment_id', () => {
    test('200: should have updated comment with correct object layout', () => {
        const expectedComment = {
            comment_id: expect.any(Number),
            body: expect.any(String),
            article_id: expect.any(Number),
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
        };

        return request(app)
        .patch('/api/comments/1')
        .send({ inc_votes: 1 })
        .expect(200)
        .then(({ body }) => {
            expect(body.comment).toMatchObject(expectedComment);
        });
    });

    test('addition of votes should be recorded correctly', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({ inc_votes: 1 })
        .expect(200)
        .then(({ body }) => {
            expect(body.comment.votes).toBe(17);
        });
    });

    test('subtraction votes should be recorded correctly', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({ inc_votes: -1 })
        .expect(200)
        .then(({ body }) => {
            expect(body.comment.votes).toBe(15);
        });
    });

    test('consecutive changes to the votes should be recorded correctly', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({ inc_votes: 10 })
        .expect(200)
        .then(({ body }) => {
            expect(body.comment.votes).toBe(26);

            return request(app)
            .patch('/api/comments/1')
            .send({ inc_votes: -200 })
            .expect(200)
        })
        .then(({ body }) => {
            expect(body.comment.votes).toBe(-174);
        });
    });

    describe('error handling', () => {
        test('400: should have correct error message if comment_id is not a number', () => {
            return request(app)
            .patch('/api/comments/not_a_number')
            .send({ inc_votes: 1 })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid text representation');
            });
        });

        test('404: should have correct error message if comment_id not found', () => {
            return request(app)
            .patch('/api/comments/99')
            .send({ inc_votes: 1 })
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('comment_id not found');
            });
        });

        test('400: should have correct error message if no request is sent', () => {
            return request(app)
            .patch('/api/comments/1')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid inc_votes');
            });
        });

        test('400: should have correct error message if inc_vote is not a number', () => {
            return request(app)
            .patch('/api/comments/1')
            .send({ inc_votes: 'one' })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid text representation');
            });
        });

        test('400: should have correct error message if inc_vote is 0', () => {
            return request(app)
            .patch('/api/comments/1')
            .send({ inc_votes: 0 })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('invalid inc_votes');
            });
        });
    });
});