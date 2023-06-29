const articlesModels = require('../models/articles.models.js');

function getArticle(req, res, next) {
    const { article_id } = req.params;
    
    articlesModels.getArticle(article_id)
    .then(article => {
        res.status(200).send({ article });
    })
    .catch(next);
}

function getArticles(req, res, next) {
    articlesModels.getArticles()
    .then(articles => {
        res.status(200).send({ articles });
    })
    .catch(next);
}

function patchArticle(req, res, next) {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    articlesModels.patchArticle(article_id, inc_votes)
    .then(article => {
        res.status(200).send({ article });
    })
    .catch(next);
}

module.exports = {
    getArticle,
    getArticles,
    patchArticle
};