const db = require('../db/connection.js');

function getAll() {
    const queryString = `
        SELECT * FROM topics;
    `;

    return db.query(queryString)
    .then(({ rows }) => {
        return rows;
    });
}

module.exports = {
    getAll
};