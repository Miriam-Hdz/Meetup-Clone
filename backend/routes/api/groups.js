const express = require('express');

const { requireAuth } = require('../../utils/auth');

const { Group } = require('../../db/models');
const { Member } = require('../../db/models');
const { Image } = require('../../db/models');
const { User } = require('../../db/models');
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

        if (error.message === "Cannot read properties of null (reading 'getUser')" || error.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
            res.status(404);
            return res.json({
                message: "Group couldn't be found",
                statusCode: 404
            });
        }
    }
});

module.exports = router;
