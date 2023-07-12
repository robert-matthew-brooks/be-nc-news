const express = require('express');
const apiController = require('../controllers/api-controller.js');
const topicsRouter = require('./topics-router.js');
const articlesRouter = require('./articles-router.js');
const commentsRouter = require('./comments-router.js');
const usersRouter = require('./users-router.js');

const apiRouter = express.Router();

apiRouter.get('/', apiController.getEndpointDetails);

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;