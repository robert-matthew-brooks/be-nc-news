const express = require('express');
const usersController = require('../controllers/users.controller.js');

const usersRouter = express.Router();

usersRouter.get('/', usersController.getAll);
usersRouter.get('/:username', usersController.get);

module.exports = usersRouter;