const express = require('express');
const commentsController = require('../controllers/comments-controller.js');

const commentsRouter = express.Router();

commentsRouter.delete('/:comment_id', commentsController.remove);
commentsRouter.patch('/:comment_id', commentsController.patch)

module.exports = commentsRouter;
