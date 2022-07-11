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

router.put('/:venueId', requireAuth, async (req, res) => {
    try {

        const { user } = req;
        const venueId = req.params.venueId;
        const venue = await Venue.findByPk(venueId);
        const groupId = venue.groupId;
        const { address, city, state, lat, lng } = req.body;
        const coHost = await Member.findOne({
            where: {
                status: "co-host",
                groupId: groupId
            }
        });
        const host = await Member.findOne({
            where: {
                organizer: true,
                groupId: groupId
            }
        });
        console.log(coHost.userId);
        console.log(host);

        if ((user.id === host.userId) || (user.id === coHost.userId)) {
            venue.set({
                address: address,
                city: city,
                state: state,
                lat: lat,
                lng: lng
            });

            const updatedVenue = await venue.save();

            return res.json({
                id: updatedVenue.id,
                groupId: updatedVenue.groupId,
                address: updatedVenue.address,
                city: updatedVenue.city,
                state: updatedVenue.state,
                lat: updatedVenue.lat,
                lng: updatedVenue.lng
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
                message: "Venue couldn't be found",
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

module.exports = router;
