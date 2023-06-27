const fs = require('fs/promises');

class ApiModels {
    static getEndpointDetails() {
        return fs.readFile(`${__dirname}/../endpoints.json`, 'utf-8')
        .then(data => {
            const endpoints = JSON.parse(data);

            const requiredKeys = {
                description: '',
                allowedQueries: [],
                exampleRequest: {},
                exampleResponse: {}
            };

            for (const endpoint in endpoints) {
                for (const key in requiredKeys) {
                    if (!endpoints[endpoint].hasOwnProperty(key) && endpoint !== "GET /api") {
                        endpoints[endpoint][key] = requiredKeys[key];
                    }
                }
            }

            return endpoints;
        });
    }
}

module.exports = ApiModels;