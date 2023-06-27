const db = require('../db/connection.js');

class ArticlesModels {
    static getArticle(articleId) {
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
}

module.exports = ArticlesModels;