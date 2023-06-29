const db = require('../db/connection.js');

function getUsers() {
    const queryString = `
        SELECT * FROM users;
    `;

    return db.query(queryString)
    .then(({ rows }) => {
        return rows;
    });
}

module.exports = {
    getUsers
};