const express = require('express');
const usersController = require('../controllers/users.controller.js');

const usersRouter = express.Router();

usersRouter.get('/', usersController.getUsers);

module.exports = usersRouter;
