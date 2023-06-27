const ApiModels = require('../models/api.models.js');

class ApiContoller {
    static getEndpointDetails(req, res, next) {
        return ApiModels.getEndpointDetails()
        .then(endpoints => {
            res.status(200).send({ endpoints });
        })
        .catch(next);
    }
}

module.exports = ApiContoller;