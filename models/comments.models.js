const db = require('../db/connection.js');
const util = require('./util.js');

function getComments(article_id) {
    const queryString = `
        SELECT * FROM articles
        WHERE article_id = $1;
    `;

    return util.checkInDatabase('articles', 'article_id', article_id)
    .then(() => {
        
        const queryString = `
            SELECT comments.comment_id,
                   comments.votes,
                   comments.created_at,
                   comments.author,
                   comments.body,
                   comments.article_id 
            FROM articles
            JOIN comments
            ON articles.article_id = comments.article_id
            WHERE comments.article_id = $1
            ORDER BY comments.created_at DESC;
        `;

        return db.query(queryString, [article_id])
    })
    .then(({ rows }) => {
        return rows;
    });
}

function postComment(article_id, username, body) {
    if (!body) return Promise.reject({ status: 400, msg: 'invalid comment' });
    if (!username) return Promise.reject({ status: 400, msg: 'invalid username' });

    return Promise.all([
        util.checkInDatabase('articles', 'article_id', article_id),
    ])
    .then(() => {
        const queryString = `
            INSERT INTO comments
                (article_id, author, body) 
            VALUES
                ($1, $2, $3)
            RETURNING *;
        `;

        return db.query(queryString, [article_id, username, body])
    })
    .then(({ rows }) => {
        return rows[0];
    })
}

function deleteComment(comment_id) {
    return util.checkInDatabase('comments', 'comment_id', comment_id)
    .then(() => {
        const queryString = `
            DELETE FROM comments
            WHERE comment_id = $1;
        `;
        
        return db.query(queryString, [comment_id]);
    });
}

module.exports = {
    getComments,
    postComment,
    deleteComment
};