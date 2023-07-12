const express = require('express');
const topicsController = require('../controllers/topics-controller.js');

const topicsRouter = express.Router();

topicsRouter.get('/', topicsController.getAll);

module.exports = topicsRouter;