const topicsModel = require('../models/topics.model.js');

function getAll(req, res, next) {
    return topicsModel.getAll()
    .then(topics => {
        res.status(200).send({ topics });
    })
    .catch(next);
}

module.exports = {
    getAll
};