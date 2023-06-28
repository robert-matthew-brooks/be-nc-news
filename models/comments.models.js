const db = require('../db/connection.js');

function getComments(articleId) {
    if (!/[0-9]+/.test(articleId)) {
        return Promise.reject({ status: 400, msg: 'invalid article id' });
    }

    const queryString = `
        SELECT * FROM articles
        WHERE article_id = $1;
    `;

    return db.query(queryString, [articleId])   // db query to check the article exists
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'article not found' });
        }
        
        const queryString = `
            SELECT
                comments.comment_id,
                comments.votes,
                comments.created_at,
                comments.author,
                comments.body,
                comments.article_id 
            FROM
                articles
            JOIN
                comments
            ON
                articles.article_id = comments.article_id
            WHERE
                comments.article_id = $1
            ORDER BY
                comments.created_at DESC;
        `;

        return db.query(queryString, [articleId])
    })
    .then(({ rows }) => {
        return rows;
    });
}

module.exports = {
    getComments
};