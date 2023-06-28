const db = require('../db/connection.js');
const util = require('./util.js');

function getComments(articleId) {
    if (!/[0-9]+/.test(articleId)) {
        return Promise.reject({ status: 400, msg: 'invalid article_id' });
    }

    const queryString = `
        SELECT * FROM articles
        WHERE article_id = $1;
    `;

    return util.checkInDatabase('articles', 'article_id', articleId)
    .then(() => {
        
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

function postComment(articleId, username, body) {
    if (!/[0-9]+/.test(articleId)) {
        return Promise.reject({ status: 400, msg: 'invalid article_id' });
    }
    else if (!body) {
        return Promise.reject({ status: 400, msg: 'invalid comment' });
    }
    else if (!username) {
        return Promise.reject({ status: 400, msg: 'invalid username' });
    }

    return Promise.all([
        util.checkInDatabase('articles', 'article_id', articleId),
        util.checkInDatabase('users', 'username', username)
    ])
    .then(() => {
        const queryString = `
            INSERT INTO comments
                (article_id, author, body) 
            VALUES
                ($1, $2, $3)
            RETURNING *;
        `;

        return db.query(queryString, [articleId, username, body])
    })
    .then(({ rows }) => {
        return rows[0];
    })
}

module.exports = {
    getComments,
    postComment
};