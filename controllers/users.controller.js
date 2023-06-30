const usersModel = require('../models/users.model.js');

function getAll(req, res, next) {
    return usersModel.getAll()
    .then(users => {
        res.status(200).send({ users });
    })
    .catch(next);
}

function get(req, res, next) {
    const { username } = req.params;

    return usersModel.get(username)
    .then(user => {
        res.status(200).send({ user });
    })
    .catch(next);
}

module.exports = {
    getAll,
    get
};