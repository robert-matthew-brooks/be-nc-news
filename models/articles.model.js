const db = require('../db/connection.js');
const util = require('./util.js');

function get(article_id) {
    return util.validateParams({ article_id })
    .then(() => {
        const queryString = `
            SELECT articles.article_id,
                articles.title,
                articles.topic,
                articles.author,
                articles.body,
                articles.created_at,
                articles.votes,
                articles.article_img_url,
                COUNT(*)::int AS comment_count
            FROM articles
            LEFT OUTER JOIN comments
            ON articles.article_id = comments.article_id
            WHERE articles.article_id = $1
            GROUP BY articles.article_id;
        `;

        return db.query(queryString, [article_id]);
    })
    .then(({ rows }) => {
        return rows[0];
    });
}

function getAll(topic = '%', sort_by = 'date', order = 'DESC') {
    topic = topic.toLowerCase();
    sort_by = sort_by.toLowerCase();
    if (sort_by === 'date') sort_by = 'created_at';
    order = order.toUpperCase();

    return util.validateParams({ topic, sort_by, order })
    .then(() => {
        const queryString = `
            SELECT articles.author,
                articles.title,
                articles.article_id,
                articles.topic,
                articles.created_at,
                articles.votes,
                articles.article_img_url,
                COUNT(*)::int AS comment_count
            FROM articles
            LEFT OUTER JOIN comments
            ON articles.article_id = comments.article_id
            WHERE lower(articles.topic) LIKE $1
            GROUP BY articles.article_id ORDER BY ${sort_by} ${order};
        `;

        return db.query(queryString, [topic]);
    })
    .then(({ rows }) => {
        return rows;
    });
}

function patch(article_id, inc_votes) {
    return util.validateParams({ article_id, inc_votes })
    .then(() => {
        const queryString = `
            UPDATE articles
            SET votes = votes + $2
            WHERE article_id = $1
            RETURNING *;
        `;

        return db.query(queryString, [article_id, inc_votes]);
    })
    .then(({ rows }) => {
        return rows[0];
    });
}

module.exports = {
    get,
    getAll,
    patch
};