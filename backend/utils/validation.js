const { validationResult } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);
// console.log(req);
  if (!validationErrors.isEmpty()) {
    const errors = validationErrors
      .array()
      .map((error) => `${error.msg}`);

    _res.status(400);
    _res.json({
      message: "Validation error",
      statusCode: 400,
      errors: {
        email: "Invalid email",
        firstName: "First Name is required",
        lastName: "Last Name is required"
      }
    });
    next(err);
  }
  next();
};

module.exports = {
    handleValidationErrors
};
