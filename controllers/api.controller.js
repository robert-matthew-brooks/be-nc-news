const endpoints_json = require('../endpoints.json');

class ApiContoller {
    static getEndpointDetails(req, res, next) {
        res.status(200).send(endpoints_json);
    }
}

module.exports = ApiContoller;