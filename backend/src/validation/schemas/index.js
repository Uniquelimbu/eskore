const { body, param } = require('express-validator');

const user = {
  userIdParam: [
    param('userId').isInt().withMessage('User ID must be an integer').toInt()
  ],
  userSchema: [
    body('username').isString().withMessage('Username must be a string'),
    body('email').isEmail().withMessage('Email must be a valid email address')
  ]
};

const team = {
  teamIdParam: [
    param('teamId').isInt().withMessage('Team ID must be an integer').toInt()
  ],
  teamSchema: [
    body('name').isString().withMessage('Team name must be a string')
  ]
};

const formation = {
  teamIdParam: [
    param('teamId').isInt().withMessage('Team ID must be an integer').toInt()
  ],
  formationSchema: [
    body('schema_json').isObject().withMessage('Schema must be a JSON object')
  ]
};

module.exports = {
  user,
  team,
  formation,
};