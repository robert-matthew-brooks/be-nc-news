const topicsModel = require('../models/topics-model.js');

async function getAll(req, res, next) {
    try {
        const topics = await topicsModel.getAll();
        res.status(200).send({ topics });
    }
    
    catch(err) {
        next(err);
    }
}

module.exports = {
    getAll
};