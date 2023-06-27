const express = require('express');
const TopicsController = require('./controllers/topics.controller.js');
const ErrorHandlers = require('./error-handlers/error-handlers.js');

const app = express();

// topics
app.get('/api/topics', TopicsController.getTopics);

// errors
app.use(ErrorHandlers.psqlErrorsHandler);
app.use(ErrorHandlers.serverErrorsHandler);

module.exports = app;