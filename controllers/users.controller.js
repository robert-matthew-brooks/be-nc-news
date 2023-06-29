const usersModels = require('../models/users.models.js');

function getUsers(req, res, next) {
    return usersModels.getUsers()
    .then(users => {
        res.status(200).send({ users });
    })
    .catch(next);
}

module.exports = {
    getUsers
};