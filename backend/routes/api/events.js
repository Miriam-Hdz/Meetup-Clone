const express = require('express');

const { requireAuth } = require('../../utils/auth');

const { Group } = require('../../db/models');
const { Member } = require('../../db/models');
const { Image } = require('../../db/models');
const { User } = require('../../db/models');
const { Venue } = require('../../db/models');
const { Event } = require('../../db/models');
const { Attendee } = require('../../db/models');
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

//edit an event by id
router.put('/:eventId', requireAuth, async (req, res) => {
try {
    const { user } = req;
    const eventId = req.params.eventId;
    const event = await Event.findByPk(eventId);
    const { venueId, name, type, capacity, price, description, startDate, endDate} = req.body;
    const host = await Member.findOne({
        where: {
            groupId: event.groupId,
            status: "host"
        }
    });
    const coHost = await Member.findOne({
        where: {
            groupId: event.groupId,
            status: "co-host"
        }
    });

    if ((user.id === host.userId) || (user.id === coHost.userId)) {
        event.set({
            venueId: venueId,
            name: name,
            type: type,
            capacity: capacity,
            price: price,
            description: description,
            startDate: startDate,
            endDate: endDate
        });

        const updatedEvent = await event.save();

        return res.json({
            id: updatedEvent.id,
            groupId: updatedEvent.groupId,
            venueId: updatedEvent.venueId,
            name: updatedEvent.name,
            type: updatedEvent.type,
            capacity: updatedEvent.capacity,
            price: updatedEvent.price,
            description: updatedEvent.description,
            startDate: updatedEvent.startDate,
            endDate: updatedEvent.endDate
        });
    } else {
        res.status(403);
        return res.json({
            message: "Forbidden",
            statusCode: 403
        });
    }

} catch (error) {
    if (error.message === "Cannot read properties of null (reading 'groupId')") {
        res.status(404);
        return res.json({
            message: "Event couldn't be found",
            statusCode: 404
        });
    } else if ((error.message === "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed") || (error.message === 'insert or update on table "Events" violates foreign key constraint "Events_venueId_fkey"')) {
        res.status(404);
            return res.json({
                message: "Venue couldn't be found",
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

//delete event by id
router.delete('/:eventId', requireAuth, async (req, res) => {
    try {
        const { user } = req;
        const eventId = req.params.eventId;
        const event = await Event.findByPk(eventId);
        const host = await Member.findOne({
            where: {
                groupId: event.groupId,
                status: "host"
            }
        });
        const coHost = await Member.findOne({
            where: {
                groupId: event.groupId,
                status: "co-host"
            }
        });

        if ((user.id === host.userId) || (user.id === coHost.userId)) {
            await event.destroy();

            return res.json({
                message: "Successfully deleted"
            });
        } else {
            res.status(403);
            return res.json({
                message: "Forbidden",
                statusCode: 403
            });
        }

    } catch (error) {
        if (error.message === "Cannot read properties of null (reading 'groupId')") {
            res.status(404);
            return res.json({
                message: "Event couldn't be found",
                statusCode: 404
           });
        }
    }
});

//request attendance to event by event id
router.post('/:eventId', requireAuth, async (req, res) => {
    try {
        const { user } = req;
        const eventId = req.params.eventId;
        const event = await Event.findByPk(eventId);
        const member = await Member.findOne({
            where: {
                userId: user.id
            }
        });
        const attendee = await Attendee.findOne({
            where: {
                eventId: eventId
            }
        });

        if (attendee) {
            if (attendee.status === "pending") {
                res.status(400);
                return res.json({
                    message: "Attendance has already been requested"
                });
            } else if (attendee.status === "member") {
                res.status(400);
                return res.json({
                    message: "User is already an attendee of the event",
                    statusCode: 400
                });
            }
        } else if ((member.groupId === event.groupId) && (member.status === "member")) {
            const newAttendee = await Attendee.create({
                status: "pending",
                userId: user.id,
                eventId: eventId
            });

            return res.json({
                eventId: newAttendee.eventId,
                userId: newAttendee.userId,
                status: newAttendee.status
            });
        } else if ((member.groupId === event.groupId) && (member.status === "host")) {
            const newAttendee = await Attendee.create({
                status: "pending",
                userId: user.id,
                eventId: eventId
            });

            return res.json({
                eventId: newAttendee.eventId,
                userId: newAttendee.userId,
                status: newAttendee.status
            });
        } else if ((member.groupId === event.groupId) && (member.status === "co-host")) {
            const newAttendee = await Attendee.create({
                status: "pending",
                userId: user.id,
                eventId: eventId
            });

            return res.json({
                eventId: newAttendee.eventId,
                userId: newAttendee.userId,
                status: newAttendee.status
            });
        } else {
            res.status(403);
            return res.json({
                message: "Forbidden",
                statusCode: 403
            });
        }

    } catch (error) {
        res.status(404);
        return res.json({
            message: "Event couldn't be found",
            statusCode: 404
        });
    }
});

//get all attendees of an event by id
router.get('/:eventId/attendees', async (req, res) => {
    try {
        const { user } = req;
        const eventId = req.params.eventId;
        const event = await Event.findByPk(eventId);
        const host = await Member.findOne({
            where: {
                groupId: event.groupId,
                status: "host"
            }
        });
        const coHost = await Member.findOne({
            where: {
                groupId: event.groupId,
                status: "co-host"
            }
        });
        if (user) {
            if ((user.id === host.userId) || (user.id === coHost.userId)) {
                const users = await User.findAll({
                    include: {
                        model: Attendee,
                        attributes: ['status'],
                        where: {
                            eventId: eventId
                        }
                    },
                    attributes: ['id', 'firstName', 'lastName']
                });

                return res.json({
                    Attendees: users
                });

            }
        } else {
            const users = await User.findAll({
                include: {
                    model: Attendee,
                    attributes: ['status'],
                    where: {
                        eventId: eventId,
                        status: {
                            [Op.or]: ['waitlist', 'member']
                        }
                    }
                },
                attributes: ['id', 'firstName', 'lastName']
            });

            return res.json({
                Attendees: users
            });
        }

    } catch (error) {
        if (error.message === "Cannot read properties of null (reading 'groupId')") {
            res.status(404);
            return res.json({
                message: "Event couldn't be found",
                statusCode: 404
            });
        }
    }
});

module.exports = router;
