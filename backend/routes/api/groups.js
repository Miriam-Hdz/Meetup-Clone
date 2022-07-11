const express = require('express');

const { requireAuth } = require('../../utils/auth');

const { Group } = require('../../db/models');
const { Member } = require('../../db/models');
const { Image } = require('../../db/models');
const { User } = require('../../db/models');
const { Event } = require('../../db/models');
const { Venue } = require('../../db/models');
const { Op } = require("sequelize");

const router = express.Router();

//get all groups
router.get('/', async (req, res) => {
    const groups = await Group.findAll()

    return res.json({
        Groups: groups
    })
});

//get group and organizer by group id
router.get('/:groupId', async (req, res) => {
    const id = req.params.groupId;

    try {
        const group = await Group.findOne({
            where: {
                id: id
            }
        });

        const images = await Image.findAll({
            attributes: ['url'],
            where: {
                groupId: id
            }
        });

        const member = await Member.findOne({
            where: {
                groupId: id,
                organizer: true
            }
        });

        const user = await member.getUser({
            attributes: ['id', 'firstName', 'lastName'],
        });

        return res.json({
            Group: group,
            images: images,
            Organizer: user
        });

    } catch (error) {
        if (error.message === "Cannot read properties of null (reading 'getUser')") {
            res.status(404);
            return res.json({
                message: "Group couldn't be found",
                statusCode: 404
            });
        }
    }
});

//get all members of a group
router.get('/:groupId/members', async (req, res) => {
    const groupId = req.params.groupId;

    const members = await Member.findAll({
        include: [
            {model: User, attributes: ['id', 'firstName', 'lastName']}
        ],
        attributes: ['status'],
        where: {
            groupId: groupId,
            status: {
                [Op.or]: ['co-host', 'member']
            }
        }
    });

    return res.json({
        Members: members
    });
});

//request membership to group based on group's id
router.post('/:groupId', requireAuth, async (req, res) => {
    try {

        const { user } = req;
        const groupId = req.params.groupId;
        const [member, created] = await Member.findOrCreate({
            where: {
                userId: user.id,
                groupId: groupId
            },
            defaults: {
                status: "pending",
                organizer: false,
                userId: user.id,
                groupId: groupId,
            }
        });

        if (created) {
           return res.json({
            groupId: member.groupId,
            userId: member.userId,
            status: member.status
           });
        } else if (!created && member.status === "pending") {
            res.status(400);
            res.json({
                message: "Membership has already been requested",
                statusCode: 400
            });
        } else if (!created && (member.status === "member" || member.status === "co-host" || member.status === "host")) {
            res.status(400);
            return res.json({
                message: "User is already a member of the group",
                statusCode: 400
            });
        }

    } catch(error) {

        if (error.message === "Cannot read properties of null (reading 'getUser')" || error.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed' || error.message === 'insert or update on table "Members" violates foreign key constraint "Members_groupId_fkey"') {
            res.status(404);
            return res.json({
                message: "Group couldn't be found",
                statusCode: 404
            });
        }
    }
});

//get all events of a group specified by its id
router.get('/:groupId/events', async (req, res) => {
        const groupId = req.params.groupId;
        const group = await Group.findByPk(groupId);
        if (group) {
            const events = await Event.findAll({
                include: [
                    {model: Group, attributes: ['id', 'name', 'city', 'state']},
                    {model: Venue, attributes: ['id', 'city', 'state']}
                ],
                attributes: ['id', 'groupId', 'venueId', 'name', 'type', 'type', 'startDate', 'numAttending'],
                where: {
                    groupId: groupId
                }

            });

            return res.json({Events: events});

        } else if (!group) {
            res.status(404);
            return res.json({
                message: "Group couldn't be found",
                statusCode: 404
            });
        }

});

// create a new venue for a gorup
router.post('/:groupId/venues', requireAuth, async (req, res) => {
    try {

        const { user } = req;
        const { address, city, state, lat, lng } = req.body;
        const groupId = req.params.groupId;
        const group = await Group.findByPk(groupId);
        const coHost = await Member.findOne({
            where: {
                groupId: groupId,
                status: "co-host"
            }
        });

        if ((user.id === group.organizerId) || (user.id === coHost.userId)) {
            const newVenue = await Venue.create({
                address: address,
                city: city,
                state: state,
                lat: lat,
                lng: lng,
                groupId: groupId
            });

            return res.json({
                id: newVenue.id,
                groupId: newVenue.groupId,
                address: newVenue.address,
                city: newVenue.city,
                state: newVenue.state,
                lat: newVenue.lat,
                lng: newVenue.lng
            });
        } else {
            res.status(403);
            return res.json({
                message: "Forbidden",
                statusCode: 403
            });
        }
    } catch (error) {
        if (error.message === "Cannot read properties of null (reading 'organizerId')") {
            res.status(404);
            return res.json({
                message: "Group couldn't be found",
                statusCode: 404
            });
        }
        res.status(400);
        return res.json({
            message: "Validation error",
            statusCode: 400,
            errors: {
            address: "Street address is required",
            city: "City is required",
            state: "State is required",
            lat: "Latitude is not valid",
            lng: "Longitude is not valid"
            }
        });

    }

});

//create an event for group specified by group id
router.post('/:groupId/events', requireAuth, async (req, res) => {
    try {
        const { user } = req;
        const groupId = req.params.groupId;
        const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
        const group = await Group.findByPk(groupId);
        const coHost = await Member.findOne({
            where: {
                groupId: groupId,
                status: "co-host"
            }
        });
        const venue = Venue.findByPk(venueId);


        if ((user.id === group.organizerId) || (user.id === coHost.userId)) {
            const newEvent = await Event.create({
                venueId: venueId,
                name: name,
                type: type,
                capacity: capacity,
                price: price,
                description: description,
                startDate: startDate,
                endDate: endDate,
                groupId: groupId
            });

            console.log(newEvent)

            return res.json({
                id: newEvent.id,
                groupId: groupId,
                venueId: newEvent.venueId,
                name: newEvent.name,
                type: newEvent.type,
                capacity: newEvent.capacity,
                price: newEvent.price,
                description: newEvent.description,
                startDate: newEvent.startDate,
                endDate: newEvent.endDate
            });
        } else {
            res.status(403);
            return res.json({
                message: "Forbidden",
                statusCode: 403
            });
        }
    } catch (error) {
        if (error.message === "Cannot read properties of null (reading 'organizerId')") {
            res.status(404);
            return res.json({
                message: "Group couldn't be found",
                statusCode: 404
            });
        } else {
            res.status(400);
            return res.json({
                message: "Validation error",
                statusCode: 400,
                errors: {
                  venueId: "Venue does not exist",
                  name: "Name must be at least 5 characters",
                  type: "Type must be Online or In person",
                  capacity: "Capacity must be an integer",
                  price: "Price is invalid",
                  description: "Description is required",
                  startDate: "Start date must be in the future",
                  endDate: "End date is less than start date",
                }
              });
        }
    }

});

module.exports = router;
