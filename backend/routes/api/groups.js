const express = require('express');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group } = require('../../db/models');

const router = express.Router();

//get all groups
router.get('/', async (req, res) => {
    const groups = await Group.findAll()

    return res.json({
        Groups: groups
    })
});

//get group by id
router.get('/:groupId', async (req, res) => {
    const id = req.params.groupId;
    const groups = await Group.findAll({
        where: {
            id: id
        }
    });

    return res.json({
        Groups: groups
    });
});

module.exports = router;
