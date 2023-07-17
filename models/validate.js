const format = require('pg-format');
const db = require('../db/connection.js');

const greenlists = {
    sort_by: ['author', 'title', 'topic', 'created_at', 'votes', 'comment_count'],
    order: ['ASC', 'DESC']
};

function rejectIfFalsy(values) {
    for (const key in values) {
        if (!values[key]) {
            return Promise.reject({ status: 400, msg: `invalid ${key}` })
        }
    }
}

function rejectIfNotPositiveNumeric(values) {
    for (const key in values) {
        if (!/^[\d]+$/.test(values[key]) || +values[key] <= 0) {
            return Promise.reject({ status: 400, msg: `invalid ${key}` })
        }
    }
}

function rejectIfNotInGreenlist(values, greenlist) {
    for (const key in values) {
        if (!greenlist.includes(values[key])) {
            return Promise.reject({ status: 400, msg: `invalid ${key}`});
        }
    }
}

async function rejectIfNotInTable(value, table, column) {
    const queryString = format(`
        SELECT * FROM %I
        WHERE %I = $1;
    `, table, column);

    const { rows } = await db.query(queryString, [value]);

    if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: `${column} not found`});
    }
}

module.exports = {
    greenlists,
    rejectIfFalsy,
    rejectIfNotPositiveNumeric,
    rejectIfNotInGreenlist,
    rejectIfNotInTable
};