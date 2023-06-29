const commentsModels = require('../models/comments.models.js');

function getComments(req, res, next) {
    const articleId = req.params.article_id;
    
    commentsModels.getComments(articleId)
    .then(comments => {
        res.status(200).send({ comments });
    })
    .catch(next);
}

function postComment(req, res, next) {
    const articleId = req.params.article_id;
    const { username, body } = req.body;

    commentsModels.postComment(articleId, username, body)
    .then(comment => {
        res.status(201).send({ comment });
    })
    .catch(next);
}

module.exports = {
    getComments,
    postComment
};