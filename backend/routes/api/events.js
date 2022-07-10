const express = require('express');

const { requireAuth } = require('../../utils/auth');

const { Group } = require('../../db/models');
const { Member } = require('../../db/models');
const { Image } = require('../../db/models');
const { User } = require('../../db/models');
const { Venue } = require('../../db/models');
const { Event } = require('../../db/models');
const { Op } = require("sequelize");

const router = express.Router();

//get all events
router.get('/', async (req, res) => {
    const events = await Event.findAll({
        include: [
            {model: Group, attributes: ['id', 'name', 'city', 'state']},
            {model: Venue, attributes: ['id', 'city', 'state']}
        ],
        attributes: ['id', 'groupId', 'venueId', 'name', 'type', 'type', 'startDate', 'numAttending']

    });

    return res.json({Events: events});
});

module.exports = router;
