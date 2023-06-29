const api = require('./api.controller.js');
const topics = require('./topics.controller.js');
const articles = require('./articles.controller.js');
const comments = require('./comments.controller.js');
const users = require('./users.controller.js');

module.exports = {
    api,
    topics,
    articles,
    comments,
    users
};