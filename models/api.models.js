const fs = require('fs/promises');

class ApiModels {
    static getEndpointDetails() {
        return fs.readFile(`${__dirname}/../endpoints.json`, 'utf-8')
        .then(data => {
            const endpoints = JSON.parse(data);
            return endpoints;
        });
    }
}

module.exports = ApiModels;