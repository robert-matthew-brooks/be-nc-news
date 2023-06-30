const usersModels = require('../models/users.models.js');

function getUsers(req, res, next) {
    return usersModels.getUsers()
    .then(users => {
        res.status(200).send({ users });
    })
    .catch(next);
}

function getUser(req, res, next) {
    const { username } = req.params;

    return usersModels.getUser(username)
    .then(user => {
        res.status(200).send({ user });
    })
    .catch(next);
}

module.exports = {
    getUsers,
    getUser
};