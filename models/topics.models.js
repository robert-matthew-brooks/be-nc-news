const db = require('../db/connection.js');

class TopicsModels {
    static getTopics() {
        return db.query(`SELECT * FROM topics;`)
        .then(({ rows }) => {
            return rows;
        });
    }
}

module.exports = TopicsModels;