const ArticlesModels = require('../models/articles.models.js');

class ArticlesController {
    static getArticle(req, res, next) {
        const articleId = req.params.article_id;
        
        ArticlesModels.getArticle(articleId)
        .then(article => {
            res.status(200).send({ article });
        })
        .catch(next);
    }
}

module.exports = ArticlesController;