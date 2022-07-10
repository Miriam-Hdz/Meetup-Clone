const express = require('express');

const { requireAuth } = require('../../utils/auth');

const { Group } = require('../../db/models');
const { Member } = require('../../db/models');
const { Image } = require('../../db/models');
const { User } = require('../../db/models');
const { Op } = require("sequelize");

const router = express.Router();

//get all events
router.get('/', async (req, res) => {
    
});

module.exports = router;
