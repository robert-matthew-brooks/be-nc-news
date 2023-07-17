const articlesModel = require('../models/articles-model.js');

async function get(req, res, next) {
    const { article_id } = req.params;
    
    try {
        const article = await articlesModel.get(article_id);
        res.status(200).send({ article });
    }

    catch(err) {
        next(err);
    }
}

async function getAll(req, res, next) {
    const { topic, sort_by, order, limit, p } = req.query;

    try {
        const { articles, total_count } = await articlesModel.getAll(topic, sort_by, order, limit, p);
        res.status(200).send({ articles, total_count });
    }

    catch(err) {
        next(err);
    }
}

async function patch(req, res, next) {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    try {
        const article = await articlesModel.patch(article_id, inc_votes);
        res.status(200).send({ article });
    }

    catch(err) {
        next(err);
    }
}

async function post(req, res, next) {
    const {
        author,
        title,
        body,
        topic,
        article_img_url
    } = req.body;

    try {
        const article = await articlesModel.post(author, title, body, topic, article_img_url);
        res.status(201).send({ article });
    }

    catch(err) {
        next(err);
    }
}

module.exports = {
    get,
    getAll,
    patch,
    post
};