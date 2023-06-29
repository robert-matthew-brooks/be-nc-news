const commentsModels = require('../models/comments.models.js');

function getComments(req, res, next) {
    const { article_id } = req.params;
    
    commentsModels.getComments(article_id)
    .then(comments => {
        res.status(200).send({ comments });
    })
    .catch(next);
}

function postComment(req, res, next) {
    const { article_id } = req.params;
    const { username, body } = req.body;

    commentsModels.postComment(article_id, username, body)
    .then(comment => {
        res.status(201).send({ comment });
    })
    .catch(next);
}

function deleteComment(req, res, next) {
    const { comment_id } = req.params;

    commentsModels.deleteComment(comment_id)
    .then(() => {
        res.status(204).send();
    })
    .catch(next);
}

module.exports = {
    getComments,
    postComment,
    deleteComment
};