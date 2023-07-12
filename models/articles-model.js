const db = require('../db/connection.js');
const util = require('./util.js');

async function get(article_id) {
    await  util.validateParams({ article_id });

    const { rows } = await db.query(`
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
    `, [article_id]);

    return rows[0];
}

async function getAll(topic = '%', sort_by = 'date', order = 'DESC') {
    topic = topic.toLowerCase();
    sort_by = sort_by.toLowerCase();
    if (sort_by === 'date') sort_by = 'created_at';
    order = order.toUpperCase();

    await util.validateParams({ topic, sort_by, order });

    const { rows } = await db.query(`
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
    `, [topic]);

    return rows;
}

async function patch(article_id, inc_votes) {
    await util.validateParams({ article_id, inc_votes });

    const { rows } = await db.query(`
        UPDATE articles
        SET votes = votes + $2
        WHERE article_id = $1
        RETURNING *;
    `, [article_id, inc_votes]);
    return rows[0];
}

module.exports = {
    get,
    getAll,
    patch
};