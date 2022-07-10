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

//get details of an event by id
router.get('/:eventId', async (req, res) => {
    try {

        const venueId = req.params.eventId;

        const event = await Event.findOne({
            attributes: {exclude: ['updatedAt', 'createdAt']},
            where: {
                id: venueId
            }

        });

        const group = await event.getGroup({
            attributes: ['id', 'name', 'private', 'city', 'state']
        });

        const venue = await event.getVenue({
            attributes: ['id', 'address', 'city', 'state', 'lat', 'lng']
        });

        const images = await event.getImages({
            attributes: ['url']
        });

        return res.json({
            event,
            Group: group,
            Venue: venue,
            images: images
        });
    } catch (error) {
        if (error.message === "Cannot read properties of null (reading 'getGroup')") {
            res.status(404);
            return res.json({
                message: "Event couldn't be found",
                statusCode: 404
            });
        }
    }


});

module.exports = router;
