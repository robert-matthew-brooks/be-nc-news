const db = require('../db/connection.js');

function getTopics() {
    return db.query(`SELECT * FROM topics;`)
    .then(({ rows }) => {
        return rows;
    });
}

module.exports = {
    getTopics
};