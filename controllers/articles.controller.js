const articlesModel = require('../models/articles.model.js');

function get(req, res, next) {
    const { article_id } = req.params;
    
    articlesModel.get(article_id)
    .then(article => {
        res.status(200).send({ article });
    })
    .catch(next);
}

function getAll(req, res, next) {
    const { topic, sort_by, order } = req.query;

    articlesModel.getAll(topic, sort_by, order)
    .then(articles => {
        res.status(200).send({ articles });
    })
    .catch(next);
}

function patch(req, res, next) {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    articlesModel.patch(article_id, inc_votes)
    .then(article => {
        res.status(200).send({ article });
    })
    .catch(next);
}

module.exports = {
    get,
    getAll,
    patch
};