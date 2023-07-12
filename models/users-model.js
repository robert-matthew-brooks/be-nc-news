const db = require('../db/connection.js');
const util = require('./util.js');

async function getAll() {
    const { rows } = await db.query(`
        SELECT * FROM users;
    `);

    return rows;
}

async function get(username) {
    await util.validateParams({ username })

    const { rows } = await db.query(`
        SELECT * FROM users
        WHERE username = $1;
    `, [username]);

    return rows[0];
}

module.exports = {
    getAll,
    get
};