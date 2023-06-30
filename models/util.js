const format = require('pg-format');
const db = require('../db/connection.js');

function validateParams(params) {
    const checks = [];

    const greenlists = {
        sort_by: ['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count'],
        order: ['ASC', 'DESC']
    };

    if (Object.keys(params).includes('article_id')) {
        checks.push(rejectIfNotInTable('articles', 'article_id', params.article_id));
    }

    if (Object.keys(params).includes('comment_id')) {
        checks.push(rejectIfNotInTable('comments', 'comment_id', params.comment_id));
    }

    if (Object.keys(params).includes('username')) {
        checks.push(rejectIfNotInTable('users', 'username', params.username));
    }

    if (Object.keys(params).includes('topic')) {
        if (params.topic !== '%') checks.push(rejectIfNotInTable('topics', 'slug', params.topic));
        checks.push(rejectIfFalsy('topic', params.topic));
    }

    if (Object.keys(params).includes('comment')) {
        checks.push(rejectIfFalsy('comment', params.comment));
    }

    if (Object.keys(params).includes('inc_votes')) {
        checks.push(rejectIfFalsy('inc_votes', params.inc_votes));
    }

    if (Object.keys(params).includes('sort_by')) {
        checks.push(rejectIfNotInGreenlist('sort_by', params.sort_by, greenlists.sort_by));
    }

    if (Object.keys(params).includes('order')) {
        checks.push(rejectIfNotInGreenlist('order', params.order, greenlists.order));
    }

    return Promise.all(checks);
}

function rejectIfFalsy(name, value) {
    if (!value) {
        return Promise.reject({ status: 400, msg: `invalid ${name}` })
    }
}

function rejectIfNotInGreenlist(name, value, greenlist) {
    if (!greenlist.includes(value)) {
        return Promise.reject({ status: 400, msg: `invalid ${name}`});
    }
}

function rejectIfNotInTable(table, column, value) {
    const queryString = format(`
        SELECT * FROM %I
        WHERE %I = $1;
    `, table, column);

    return db.query(queryString, [value])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: `${column} not found`});
        }
    });
}

module.exports = {
    validateParams
};