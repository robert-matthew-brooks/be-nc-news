const db = require('../db/connection.js');
const util = require('./util.js');

async function getAll(article_id) {
    await util.rejectIfNotInTable(article_id, 'articles', 'article_id');

    const { rows } = await db.query(`
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
    `, [article_id]);

    return rows;
}

async function post(article_id, username, comment) {
    await util.rejectIfFalsy({ comment });
    await Promise.all([
        util.rejectIfNotInTable(article_id, 'articles', 'article_id'),
        util.rejectIfNotInTable(username, 'users', 'username')
    ]);

    const { rows } = await db.query(`
        INSERT INTO comments
            (article_id, author, body) 
        VALUES
            ($1, $2, $3)
        RETURNING *;
    `, [article_id, username, comment]);

    return rows[0];
}

async function remove(comment_id) {
    await util.rejectIfNotInTable(comment_id, 'comments', 'comment_id');
        
    await db.query(`
        DELETE FROM comments
        WHERE comment_id = $1;
    `, [comment_id]);
}

async function patch(comment_id, inc_votes) {
    await util.rejectIfFalsy({ inc_votes });
    await util.rejectIfNotInTable(comment_id, 'comments', 'comment_id');

    const { rows } = await db.query(`
        UPDATE comments
        SET votes = votes + $2
        WHERE comment_id = $1
        RETURNING *;
    `, [comment_id, inc_votes]);

    return rows[0];
}

module.exports = {
    getAll,
    post,
    remove,
    patch
};