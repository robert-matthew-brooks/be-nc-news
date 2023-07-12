const express = require('express');
const articlesController = require('../controllers/articles-controller.js');
const commentsController = require('../controllers/comments-controller.js');

const articlesRouter = express.Router();

articlesRouter.get('/:article_id', articlesController.get);
articlesRouter.get('/', articlesController.getAll);
articlesRouter.patch('/:article_id', articlesController.patch);

articlesRouter.get('/:article_id/comments', commentsController.getAll);
articlesRouter.post('/:article_id/comments', commentsController.post);

module.exports = articlesRouter;