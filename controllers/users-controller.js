const usersModel = require('../models/users-model.js');

async function getAll(req, res, next) {
    try {
        const users = await usersModel.getAll();
        res.status(200).send({ users });
    }

    catch(err) {
        next(err);
    }
}

async function get(req, res, next) {
    const { username } = req.params;

    try {
        const user = await usersModel.get(username);
        res.status(200).send({ user });
    }

    catch(err) {
        next(err);
    }
}

module.exports = {
    getAll,
    get
};