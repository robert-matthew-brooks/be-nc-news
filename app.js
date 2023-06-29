const express = require('express');

const controllers = require('./controllers/index.js');
const errorHandlers = require('./error-handlers/error-handlers.js');

const app = express();
app.use(express.json());

app.get('/api', controllers.api.getEndpointDetails);

app.get('/api/topics', controllers.topics.getTopics);

app.get('/api/articles/:article_id', controllers.articles.getArticle);
app.get('/api/articles', controllers.articles.getArticles);
app.patch('/api/articles/:article_id', controllers.articles.patchArticle);

app.get('/api/articles/:article_id/comments', controllers.comments.getComments);
app.post('/api/articles/:article_id/comments', controllers.comments.postComment);
app.delete('/api/comments/:comment_id', controllers.comments.deleteComment);

app.get('/api/users', controllers.users.getUsers);

app.all('*', (req, res, next) => {
    const err = { status: 404, msg: 'endpoint not found' };
    next(err, req, res, next);
})

app.use(errorHandlers.appErrorHandler);
app.use(errorHandlers.psqlErrorHandler);
app.use(errorHandlers.serverErrorHandler);

module.exports = app;