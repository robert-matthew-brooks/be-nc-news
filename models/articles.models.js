const db = require('../db/connection.js');

function getArticle(articleId) {
    if (!/[0-9]+/.test(articleId)) {
        return Promise.reject({ status: 400, msg: 'invalid article_id' });
    }

    const queryString = `
        SELECT * FROM articles
        WHERE article_id = $1;
    `;

    return db.query(queryString, [articleId])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'article_id not found' });
        }
        
        return rows[0];
    });
}

function getArticles() {
    return db.query(`
        SELECT
            articles.author,
            articles.title,
            articles.article_id,
            articles.topic,
            articles.created_at,
            articles.votes,
            articles.article_img_url,
            COUNT(*)::int AS comment_count
        FROM
            articles
        LEFT OUTER JOIN
            comments
        ON
            articles.article_id = comments.article_id
        GROUP BY
            articles.article_id
        ORDER BY
            articles.created_at DESC;
    `)
    .then(({ rows }) => {
        return rows;
    });
}

module.exports = {
    getArticle,
    getArticles
};