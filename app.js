const express = require('express');

const apiController = require('./controllers/api.controller.js');
const topicsController = require('./controllers/topics.controller.js');
const articlesController = require('./controllers/articles.controller.js');
const commentsController = require('./controllers/comments.controller.js');
const errorHandlers = require('./error-handlers/error-handlers.js');

const app = express();
app.use(express.json());

app.get('/api', apiController.getEndpointDetails);

app.get('/api/topics', topicsController.getTopics);

app.get('/api/articles/:article_id', articlesController.getArticle);
app.get('/api/articles', articlesController.getArticles);
app.patch('/api/articles/:article_id', articlesController.patchArticle);

app.get('/api/articles/:article_id/comments', commentsController.getComments);
app.post('/api/articles/:article_id/comments', commentsController.postComment);
app.delete('/api/comments/:comment_id', commentsController.deleteComment);

app.all('*', (req, res, next) => {
    const err = { status: 404, msg: 'endpoint not found' };
    next(err, req, res, next);
})

app.use(errorHandlers.appErrorHandler);
app.use(errorHandlers.psqlErrorHandler);
app.use(errorHandlers.serverErrorHandler);

module.exports = app;