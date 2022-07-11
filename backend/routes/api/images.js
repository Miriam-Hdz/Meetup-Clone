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

router.delete('/:imageId', requireAuth, async (req, res) => {
        const {user} = req;
        const imageId = req.params.imageId;
        const verificationImage = await Image.findOne({
            where: {
                id: imageId,
                imageableId: user.id
            }
        });
        const isImage = await Image.findByPk(imageId);

        if (verificationImage) {
            await verificationImage.destroy();
            return res.json({
                message: "Successfully deleted",
                statusCode: 200
            });
        } else if (!isImage) {
            res.status(404);
            return res.json({
            message: "Image couldn't be found",
            statusCode: 404
        });
        } else {
            res.status(403);
            return res.json({
            message: "Forbidden",
            statusCode: 403
        });
        }
});

module.exports = router;
