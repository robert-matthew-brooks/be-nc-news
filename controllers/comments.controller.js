const commentsModel = require('../models/comments.model.js');

function getAll(req, res, next) {
    const { article_id } = req.params;
    
    commentsModel.getAll(article_id)
    .then(comments => {
        res.status(200).send({ comments });
    })
    .catch(next);
}

function post(req, res, next) {
    const { article_id } = req.params;
    const { username, body } = req.body;

    commentsModel.post(article_id, username, body)
    .then(comment => {
        res.status(201).send({ comment });
    })
    .catch(next);
}

function remove(req, res, next) {
    const { comment_id } = req.params;

    commentsModel.remove(comment_id)
    .then(() => {
        res.status(204).send();
    })
    .catch(next);
}

function patch(req, res, next) {
    const { comment_id } = req.params;
    const { inc_votes } = req.body;

    commentsModel.patch(comment_id, inc_votes)
    .then(comment => {
        res.status(200).send({ comment });
    })
    .catch(next);
}

module.exports = {
    getAll,
    post,
    remove,
    patch
};