const db = require('../db/connection.js');
const validate = require('./validate.js');

async function get(article_id) {
    await validate.rejectIfNotInTable(article_id, 'articles', 'article_id');

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

async function getAll(topic = '%', sort_by = 'date', order = 'DESC', limit = 10, p = 1) {
    topic = topic.toLowerCase();
    sort_by = sort_by.toLowerCase();
    if (sort_by === 'date') sort_by = 'created_at';
    order = order.toUpperCase();

    await Promise.all([
        validate.rejectIfFalsy({ topic }),
        validate.rejectIfNotInGreenlist({ sort_by }, validate.greenlists.sort_by),
        validate.rejectIfNotInGreenlist({ order }, validate.greenlists.order),
        validate.rejectIfNotNumber({ limit, p }),
        validate.rejectIfLessThan({ limit, p }, 1),
    ]);
    if (topic !== '%') await validate.rejectIfNotInTable(topic, 'topics', 'slug');

    const offset = limit * (p-1);

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
        GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order}
        LIMIT ${limit} OFFSET ${offset};
    `, [topic]);

    const allArticleIds = await db.query(`
        SELECT articles.article_id
        FROM articles
        WHERE lower(articles.topic) LIKE $1;
    `, [topic]);

    return {
        articles: rows,
        total_count: allArticleIds.rows.length
    };
}

async function patch(article_id, inc_votes) {
    await validate.rejectIfFalsy({ inc_votes });
    await validate.rejectIfNotInTable(article_id, 'articles', 'article_id');

    const { rows } = await db.query(`
        UPDATE articles
        SET votes = votes + $2
        WHERE article_id = $1
        RETURNING *;
    `, [article_id, inc_votes]);
    return rows[0];
}

async function post(author, title, body, topic, article_img_url) {
    await validate.rejectIfFalsy({ body, author, title, topic });
    await Promise.all([
        validate.rejectIfNotInTable(author, 'users', 'username'),
        validate.rejectIfNotInTable(topic, 'topics', 'slug')
    ]);

    if (!article_img_url) {
        article_img_url = 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700';
    }

    const { rows } = await db.query(`
        INSERT INTO articles
            (author, title, body, topic, article_img_url) 
        VALUES
            ($1, $2, $3, $4, $5)
        RETURNING *;
    `, [author, title, body, topic, article_img_url]);
    return rows[0];
}

module.exports = {
    get,
    getAll,
    patch,
    post
};