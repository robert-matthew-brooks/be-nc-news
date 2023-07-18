const commentsModel = require('../models/comments-model.js');

async function getAll(req, res, next) {
    const { article_id } = req.params;
    const { limit, p } = req.query;
    
    try {
        const { comments, total_count } = await commentsModel.getAll(article_id, limit, p);
        res.status(200).send({ comments, total_count });
    }
    
    catch(err) {
        next(err);
    }
}

async function post(req, res, next) {
    const { article_id } = req.params;
    const { username, body } = req.body;

    try {
        const comment = await commentsModel.post(article_id, username, body);
        res.status(201).send({ comment });
    }
    
    catch(err) {
        next(err);
    }
}

async function remove(req, res, next) {
    const { comment_id } = req.params;

    try {
        await commentsModel.remove(comment_id);
        res.status(204).send();
    }
    
    catch(err) {
        next(err);
    }
}

async function patch(req, res, next) {
    const { comment_id } = req.params;
    const { inc_votes } = req.body;

    try {
        const comment = await commentsModel.patch(comment_id, inc_votes);
        res.status(200).send({ comment });
    }
    
    catch(err) {
        next(err);
    }
}

module.exports = {
    getAll,
    post,
    remove,
    patch
};