const express = require('express');
const articlesController = require('../controllers/articles.controller.js');
const commentsController = require('../controllers/comments.controller.js');

const articlesRouter = express.Router();

articlesRouter.get('/:article_id', articlesController.getArticle);
articlesRouter.get('/', articlesController.getArticles);
articlesRouter.patch('/:article_id', articlesController.patchArticle);

articlesRouter.get('/:article_id/comments', commentsController.getComments);
articlesRouter.post('/:article_id/comments', commentsController.postComment);

module.exports = articlesRouter;