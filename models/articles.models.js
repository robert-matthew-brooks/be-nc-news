const format = require('pg-format');
const db = require('../db/connection.js');
const util = require('./util.js');

function getArticle(article_id) {
    const queryString = `
        SELECT * FROM articles
        WHERE article_id = $1;
    `;

    return db.query(queryString, [article_id])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'article_id not found' });
        }
        
        return rows[0];
    });
}

function getArticles(topic = '%', sort_by = 'date', order = 'DESC') {
    topic = topic.toLowerCase();
    sort_by = sort_by.toLowerCase();
    if (sort_by === 'date') sort_by = 'created_at';
    order = order.toUpperCase();

    const allowedQueries = {
        sort_by: ['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count'],
        order: ['ASC', 'DESC']
    };

    if (!topic) return Promise.reject({ status: 400, msg: 'invalid topic'});
    if (!allowedQueries.sort_by.includes(sort_by)) return Promise.reject({ status: 400, msg: 'invalid sort_by'});
    if (!allowedQueries.order.includes(order)) return Promise.reject({ status: 400, msg: 'invalid order'});

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
        GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order};
    `;

    return db.query(queryString, [topic])
    .then(({ rows }) => {
        return rows;
    });
}

function patchArticle(article_id, inc_votes) {
    if (!inc_votes) {
        return Promise.reject({ status: 400, msg: 'invalid vote' });
    }

    return util.checkInDatabase('articles', 'article_id', article_id)
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
    getArticle,
    getArticles,
    patchArticle
};