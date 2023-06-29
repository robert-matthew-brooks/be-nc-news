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

function getArticles() {
    return db.query(`
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
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC;
    `)
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