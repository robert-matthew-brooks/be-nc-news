const db = require('../db/connection.js');
const validate = require('./validate.js');

async function getAll(article_id, limit = 10, offset = 0) {
    await Promise.all([
        validate.rejectIfNotInTable(article_id, 'articles', 'article_id'),
        validate.rejectIfNotNumber({ limit, offset }),
        validate.rejectIfLessThan({ limit }, 1),
        validate.rejectIfLessThan({ offset }, 0),
    ]);

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
        ORDER BY comments.created_at DESC
        LIMIT ${limit} OFFSET ${offset};
    `, [article_id]);

    const allCommentIds = await db.query(`
        SELECT comments.comment_id
        FROM articles
        JOIN comments
        ON articles.article_id = comments.article_id
        WHERE comments.article_id = $1;
    `, [article_id]);

    return {
        comments: rows,
        total_count: allCommentIds.rows.length
    };
}

async function post(article_id, username, comment) {
    await validate.rejectIfFalsy({ comment });
    await Promise.all([
        validate.rejectIfNotInTable(article_id, 'articles', 'article_id'),
        validate.rejectIfNotInTable(username, 'users', 'username')
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
    await validate.rejectIfNotInTable(comment_id, 'comments', 'comment_id');
        
    await db.query(`
        DELETE FROM comments
        WHERE comment_id = $1;
    `, [comment_id]);
}

async function patch(comment_id, inc_votes) {
    await validate.rejectIfFalsy({ inc_votes });
    await validate.rejectIfNotInTable(comment_id, 'comments', 'comment_id');

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