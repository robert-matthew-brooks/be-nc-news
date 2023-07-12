const endpoints_json = require('../endpoints.json');

function getEndpointDetails(req, res, next) {
    res.status(200).send(endpoints_json);
}

module.exports = {
    getEndpointDetails
};