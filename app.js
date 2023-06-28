const express = require('express');

const apiController = require('./controllers/api.controller.js');
const topicsController = require('./controllers/topics.controller.js');
const articlesController = require('./controllers/articles.controller.js');
const commentsController = require('./controllers/comments.controller.js');
const errorHandlers = require('./error-handlers/error-handlers.js');

const app = express();
app.use(express.json());

// api
app.get('/api', apiController.getEndpointDetails);

// topics
app.get('/api/topics', topicsController.getTopics);

// articles
app.get('/api/articles/:article_id', articlesController.getArticle);
app.get('/api/articles', articlesController.getArticles);

// comments
app.get('/api/articles/:article_id/comments', commentsController.getComments);
app.post('/api/articles/:article_id/comments', commentsController.postComment)

// endpoint not found
app.all('*', (req, res, next) => {
    const err = { status: 404, msg: 'endpoint not found' };
    next(err, req, res, next);
})

// errors
app.use(errorHandlers.appErrorHandler);
app.use(errorHandlers.psqlErrorHandler);
app.use(errorHandlers.serverErrorHandler);

module.exports = app;