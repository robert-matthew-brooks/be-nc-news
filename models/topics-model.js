const db = require('../db/connection.js');

async function getAll() {
    const { rows } = await db.query(`
        SELECT * FROM topics;
    `)
    
    return rows;
}

module.exports = {
    getAll
};