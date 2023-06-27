const CommentsModels = require('../models/comments.models.js');

class CommentsController {
    static getComments(req, res, next) {
        const articleId = req.params.article_id;
        
        CommentsModels.getComments(articleId)
        .then(comments => {
            res.status(200).send({ comments });
        })
        .catch(next);
    }
}

module.exports = CommentsController;