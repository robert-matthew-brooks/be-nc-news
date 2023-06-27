const express = require('express');

const ApiController = require('./controllers/api.controller.js');
const TopicsController = require('./controllers/topics.controller.js');
const ArticlesController = require('./controllers/articles.controller.js');
const ErrorHandlers = require('./error-handlers/error-handlers.js');


const app = express();

// api
app.get('/api', ApiController.getEndpointDetails);

// topics
app.get('/api/topics', TopicsController.getTopics);

// articles
app.get('/api/articles/:article_id', ArticlesController.getArticle);
app.get('/api/articles', ArticlesController.getArticles);

// endpoint not found
app.all('*', (req, res, next) => {
    const err = { status: 404, msg: 'endpoint not found' };
    next(err, req, res, next);
})

// errors
app.use(ErrorHandlers.appErrorHandler);
app.use(ErrorHandlers.fsErrorHandler);
app.use(ErrorHandlers.psqlErrorHandler);
app.use(ErrorHandlers.serverErrorHandler);

module.exports = app;