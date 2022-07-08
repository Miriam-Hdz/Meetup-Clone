const express = require('express');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const { Group } = require('../../db/models');


const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors
];

// Log in
router.post(
  '/',
  validateLogin,
  async (req, res, next) => {
    const { credential, password } = req.body;
    const user = await User.login({ credential, password });

    if (!user) {
      const err = new Error('Login failed');
      err.status = 401;
      err.title = 'Login failed';
      err.errors = ['The provided credentials were invalid.'];
      return next(err);
    }

    await setTokenCookie(res, user);

    return res.json({
      user
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
    restoreUser,
    (req, res) => {
      const { user } = req;
      if (user) {
        return res.json({
          user: user.toSafeObject()
        });
      } else return res.json({});
    }
  );

//Get all Groups joined or organized by the Current User
router.get('/groups', async (req, res) => {
  const { user } = req;
  const currentUser = await User.findByPk(user.id);
  const groups = await currentUser.getGroups();

  return res.json({"Groups": groups})

});

//create new group
router.post('/groups', async (req, res) => {
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
router.put('/groups/:groupId', async (req, res) => {
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
      return res.json({
        message: "Must be group organizer to make changes"
      });
    }

  } catch (error) {
    if (error.message ===  "Cannot read properties of null (reading 'organizerId')") {
      res.status(404);
      return res.json({
        message: "Group couldn't be found",
        statusCode: 404
      });
    } else if (error.message === 'Validation error: Validation len on about failed') {
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
  }

});

module.exports = router;
