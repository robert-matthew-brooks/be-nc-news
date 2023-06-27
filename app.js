const express = require('express');
const TopicsController = require('./controllers/topics.controller.js');
const ArticlesController = require('./controllers/articles.controller.js');
const ErrorHandlers = require('./error-handlers/error-handlers.js');

const app = express();

// topics
app.get('/api/topics', TopicsController.getTopics);

// articles
app.get('/api/articles/:article_id', ArticlesController.getArticle);

// errors
app.use(ErrorHandlers.appErrorHandler);
app.use(ErrorHandlers.psqlErrorsHandler);
app.use(ErrorHandlers.serverErrorsHandler);

module.exports = app;