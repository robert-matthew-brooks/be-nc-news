const TopicsModels = require('../models/topics.models.js');

class TopicsContoller {
    static getTopics(req, res, next) {
        return TopicsModels.getTopics()
        .then(topics => {
            res.status(200).send({ topics });
        })
        .catch(next);
    }
}

module.exports = TopicsContoller;