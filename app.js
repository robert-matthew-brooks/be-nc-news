const express = require('express');
const cors = require('cors');

const apiRouter = require('./routers/api-router.js');
const errorHandlers = require('./error-handlers/error-handlers.js');

const app = express();
app.use(cors());
app.use(express.json());
app.set('json spaces', 2);

app.use('/api', apiRouter);

app.all('*', (req, res, next) => {
    next({ status: 404, msg: 'endpoint not found' });
})

app.use(errorHandlers.appErrorHandler);
app.use(errorHandlers.psqlErrorHandler);
app.use(errorHandlers.serverErrorHandler);

module.exports = app;
