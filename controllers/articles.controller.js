const articlesModels = require('../models/articles.models.js');

function getArticle(req, res, next) {
    const articleId = req.params.article_id;
    
    articlesModels.getArticle(articleId)
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

module.exports = {
    getArticle,
    getArticles
};