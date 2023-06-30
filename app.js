const express = require('express');

const apiController = require('./controllers/api.controller.js');
const topicsController = require('./controllers/topics.controller.js');
const articlesController = require('./controllers/articles.controller.js');
const commentsController = require('./controllers/comments.controller.js');
const usersController = require('./controllers/users.controller.js');
const controllers = require('./controllers/index.js');
const errorHandlers = require('./error-handlers/error-handlers.js');

const app = express();

app.use(express.json());

app.get('/api', apiController.getEndpointDetails);
app.get('/api', controllers.api.getEndpointDetails);

app.get('/api/topics', topicsController.getTopics);
app.get('/api/topics', controllers.topics.getTopics);

app.get('/api/articles/:article_id', articlesController.getArticle);
app.get('/api/articles', articlesController.getArticles);
app.patch('/api/articles/:article_id', articlesController.patchArticle);
app.get('/api/articles/:article_id', controllers.articles.getArticle);
app.get('/api/articles', controllers.articles.getArticles);
app.patch('/api/articles/:article_id', controllers.articles.patchArticle);

app.get('/api/articles/:article_id/comments', commentsController.getComments);
app.post('/api/articles/:article_id/comments', commentsController.postComment);
app.delete('/api/comments/:comment_id', commentsController.deleteComment);
app.get('/api/articles/:article_id/comments', controllers.comments.getComments);
app.post('/api/articles/:article_id/comments', controllers.comments.postComment);
app.delete('/api/comments/:comment_id', controllers.comments.deleteComment);

app.get('/api/users', usersController.getUsers);
app.get('/api/users', controllers.users.getUsers);

app.all('*', (req, res, next) => {
    next({ status: 404, msg: 'endpoint not found' });
})

app.use(errorHandlers.appErrorHandler);
app.use(errorHandlers.psqlErrorHandler);
app.use(errorHandlers.serverErrorHandler);

module.exports = app;