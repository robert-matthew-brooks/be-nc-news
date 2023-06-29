const db = require('../db/connection.js');

function getTopics() {
    const queryString = `
        SELECT * FROM topics;
    `;

    return db.query(queryString)
    .then(({ rows }) => {
        return rows;
    });
}

module.exports = {
    getTopics
};