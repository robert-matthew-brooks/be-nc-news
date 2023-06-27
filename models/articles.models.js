const db = require('../db/connection.js');

class ArticlesModels {
    static getArticle(articleId) {
        if (!/[0-9]+/.test(articleId)) {
            return Promise.reject({ status: 400, msg: 'invalid article id' });
        }

        const queryString = `
            SELECT * FROM articles
            WHERE article_id = $1;
        `;

        return db.query(queryString, [articleId])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'article not found' });
            }
            
            return rows[0];
        });
    }

    static getArticles() {
        return db.query(`SELECT * FROM articles;`)
        .then(({ rows }) => {
            return rows;
        });
    }
}

module.exports = ArticlesModels;