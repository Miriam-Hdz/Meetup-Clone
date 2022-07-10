const express = require('express');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { Group } = require('../../db/models');
const { Member } = require('../../db/models');
const { Op, UniqueConstraintError } = require('sequelize');


const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Email is required'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Password is required'),
  handleValidationErrors
];

// Log in
router.post(
  '/',
  async (req, res, next) => {
    const { credential, password } = req.body;
    const user = await User.login({ credential, password });

    if (credential === '' || password === '') {
      res.status(400);
      res.json({
        message: "Validation error",
        statusCode: 400,
        errors: {
          email: "Email is required",
          password: "Password is required"
        }
      });
      return next(err);
    }
    if (!user) {
      res.status(401);
      res.json({
        message: "Invalid credentials",
        statusCode: 401
      });
      return next(err);
    }

    await setTokenCookie(res, user);

    return res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: ""
    });
  }
);

// Log out
router.delete(
    '/',
    (_req, res) => {
      res.clearCookie('token');
      return res.json({ message: 'success' });
    }
  );

// Restore session user
router.get(
    '/',
    restoreUser, requireAuth,
    (req, res) => {
      const { user } = req;
      if (user) {
        return res.json({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        });
      }
    }
  );


//Get all Groups joined or organized by the Current User
router.get('/groups', requireAuth, async (req, res) => {

  const { user } = req;
  const currentUser = await User.findByPk(user.id);
  const groups = await currentUser.getGroups();


  return res.json({"Groups": groups})

});

//create new group
router.post('/groups', requireAuth, async (req, res) => {
  const { name, about, type, private, city, state } = req.body;
  const { user } = req;

  try {
    const newGroup = await Group.create({
      name: name,
      about: about,
      type: type,
      private: private,
      city: city,
      state: state,
      numMembers: 1,
      organizerId: user.id
    });

    const group = await Group.findOne({
      attributes: {exclude: ['numMembers']},
      where: {
        id: newGroup.id
      }
    });

    res.status(201);
    return res.json(group);

  } catch {
    res.status(400);
    return res.json({
      message: "Validation Error",
      statusCode: 400,
      errors: {
      name: "Name must be 60 characters or less",
      about: "About must be 50 characters or more",
      type: "Type must be Online or In person",
      private: "Private must be a boolean",
      city: "City is required",
      state: "State is required",
      }
    });
  }
});

//update group by current user if current user is the organizer
router.put('/groups/:groupId', requireAuth, async (req, res) => {
  const { user } = req;
  const groupId = req.params.groupId;
  const { name, about, type, private, city, state } = req.body;

  try {
    const groupToUpdate = await Group.findOne({
      attributes: {exclude: ['numMembers']},
      where: {
        id: groupId
      }
    });

    if (user.id === groupToUpdate.organizerId) {
        groupToUpdate.set({
          name: name,
          about: about,
          type: type,
          private: private,
          city: city,
          state: state
        });

        await groupToUpdate.save();

        const updatedGroup = await Group.findOne({
          attributes: {exclude: ['numMembers']},
          where: {
            id: groupId
          }
        });

        return res.json(updatedGroup);
    } else {
      res.status(403);
      return res.json({
        message: "Forbidden",
        statusCode: 403
      });
    }

  } catch (error) {
    if (error.message ===  "Cannot read properties of null (reading 'organizerId')") {
      res.status(404);
      return res.json({
        message: "Group couldn't be found",
        statusCode: 404
      });
    }
      res.status(400);
      return res.json({
        message: "Validation Error",
        statusCode: 400,
        errors: {
        name: "Name must be 60 characters or less",
        about: "About must be 50 characters or more",
        type: "Type must be Online or In person",
        private: "Private must be a boolean",
        city: "City is required",
        state: "State is required"
        }
      });
  }
});

//organizer can delete group
router.delete('/groups/:groupId', requireAuth, async (req, res) => {
  const groupId = req.params.groupId;
  const { user } = req;
  const groupToDelete = await Group.findOne({
    where: {
      id: groupId
    }
  });

  try {
    if (user.id === groupToDelete.organizerId) {
      await groupToDelete.destroy();

      return res.json({
        message: "Successfuly deleted",
        statusCode: 200
      });
    } else {
      res.status(403);
      return res.json({
        message: "Forbidden",
        statusCode: 403
      });
    }

  } catch (error) {
    if (error.message ===  "Cannot read properties of null (reading 'organizerId')") {
      res.status(404);
      return res.json({
        message: "Group couldn't be found",
        statusCode: 404
      });
    }
  }
});

//get all members of a group
router.get('/groups/:groupId/members', async (req, res) => {
  const groupId = req.params.groupId;
  const { user } = req;
  const group = await Group.findByPk(groupId);

try {
  if (user.id === group.organizerId) {
    const members = await Member.findAll({
      include: [
          {model: User, attributes: ['id', 'firstName', 'lastName']}
      ],
      attributes: ['status'],
      where: {
          groupId: groupId
      }
    });

    return res.json({
      Members: members
    });
  } else {
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
  }

} catch (error) {
  if (error.message ===  "Cannot read properties of null (reading 'organizerId')") {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404
    });
  }
}


});

module.exports = router;
