const commentsModels = require('../models/comments.models.js');

function getComments(req, res, next) {
    const articleId = req.params.article_id;
    
    commentsModels.getComments(articleId)
    .then(comments => {
        res.status(200).send({ comments });
    })
    .catch(next);
}

module.exports = {
    getComments
};