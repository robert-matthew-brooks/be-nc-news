const db = require('../db/connection.js');
const util = require('./util.js');

function getAll() {
    const queryString = `
        SELECT * FROM users;
    `;

    return db.query(queryString)
    .then(({ rows }) => {
        return rows;
    });
}

function get(username) {
    return util.validateParams({ username })
    .then(() => {
        const queryString = `
            SELECT * FROM users
            WHERE username = $1;
        `;

        return db.query(queryString, [username]);
    })
    .then(({ rows }) => {
        return rows[0];
    });
}

module.exports = {
    getAll,
    get
};