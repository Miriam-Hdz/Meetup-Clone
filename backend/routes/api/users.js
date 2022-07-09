const express = require('express');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a firstName.'),
  check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('Please provide lastName.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];

// Sign up
  router.post(
    '/',
    validateSignup,
    async (req, res) => {
      try {

        const { email, firstName, lastName, password } = req.body;
        const user = await User.signup({ email, firstName, lastName, password });

        await setTokenCookie(res, user);

        return res.json({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          token: ""
        });

      } catch {
          res.status(403);
          return res.json({
            message: "User already exists",
            statusCode: 403,
            errors: {
              email: "User with that email already exists"
            }
          });
        }
    }
  );

module.exports = router;
