const express = require('express');
const ApiController = require('./controllers/api.controller.js');
const TopicsController = require('./controllers/topics.controller.js');
const ErrorHandlers = require('./error-handlers/error-handlers.js');

const app = express();

// api
app.get('/api', ApiController.getEndpointDetails);

// topics
app.get('/api/topics', TopicsController.getTopics);

// errors
app.use(ErrorHandlers.fsErrorHandler);
app.use(ErrorHandlers.psqlErrorHandler);
app.use(ErrorHandlers.serverErrorHandler);

module.exports = app;