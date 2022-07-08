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
//user.id match member id and get groups that match groupId
router.get('/groups', async (req, res) => {
  const { user } = req;
  const currentUser = await User.findByPk(user.id);
  const groups = await currentUser.getGroups();

  return res.json({"Groups": groups})

});

router.post('/groups', async (req, res) => {
  const { name, about, type, private, city, state } = req.body;
  const newGroup = await Group.create({
    name: name,
    about: about,
    type: type,
    private: private,
    city: city,
    state: state
  });

  res.status(201);
  return res.json(newGroup);
});

module.exports = router;
