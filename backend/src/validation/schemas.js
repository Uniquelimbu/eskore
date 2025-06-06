const { body, param, query } = require('express-validator');

// --------------------------------------------------
// Re-usable validation rule helpers
// --------------------------------------------------

// Email rule generator (default field: "email")
const emailRule = (field = 'email') =>
  body(field)
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail();

// Password rule generator – can enforce required + min length
// usage: passwordRule({ required: true, min: 8 })
const passwordRule = ({ field = 'password', required = false, min = 6 } = {}) => {
  let chain = body(field);
  if (required) {
    chain = chain.notEmpty().withMessage('Password is required');
  }
  return chain
    .isLength({ min })
    .withMessage(`Password must be at least ${min} characters long`);
};

// Match score / status reusable rules (homeScore, awayScore, status)
const matchScoreStatusRules = [
  body('homeScore')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Home score must be a non-negative integer')
    .toInt(),
  body('awayScore')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Away score must be a non-negative integer')
    .toInt(),
  body('status')
    .optional()
    .isIn(['scheduled', 'live', 'completed', 'cancelled', 'postponed'])
    .withMessage('Status must be valid')
];

// Auth schemas 
const auth = {
  registerUserSchema: [
    emailRule(),
    passwordRule({ required: true, min: 6 }),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required'),
    body('dob')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid date in ISO format')
  ],
  
  loginSchema: [
    emailRule(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  
  passwordResetRequestSchema: [
    emailRule()
  ],
  
  passwordResetSchema: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],

  // Adding schema for checking email endpoint
  checkEmailSchema: [
    query('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email address')
  ]
};

// User schemas (new)
const user = {
  userIdParam: [
    param('id')
      .isInt()
      .withMessage('User ID must be an integer')
      .toInt()
  ],
  
  updateProfileSchema: [
    body('firstName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty'),
    body('lastName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Last name cannot be empty'),
    body('dob')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid date in ISO format'),
    body('country')
      .optional()
      .trim()
      .isString()
      .withMessage('Country must be a string'),
    body('height')
      .optional()
      .isFloat({ min: 50, max: 300 })
      .withMessage('Height must be a valid number between 50 and 300 cm'),
    body('position')
      .optional()
      .trim()
      .isString()
      .withMessage('Position must be a string'),
    body('bio')
      .optional()
      .trim()
      .isString()
      .withMessage('Bio must be a string')
  ],
  
  changePasswordSchema: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('Confirm password is required')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ]
};

// Tournament schemas
const tournament = {
  tournamentIdParam: [
    param('id')
      .isInt()
      .withMessage('Tournament ID must be an integer')
      .toInt()
  ],
  
  participantBody: [
    body('userId')
      .isInt()
      .withMessage('User ID must be an integer')
      .toInt(),
    body('role')
      .optional()
      .isIn(['organizer', 'referee', 'participant'])
      .withMessage('Role must be one of: organizer, referee, participant')
  ],
  
  createTournament: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Tournament name is required')
      .isLength({ max: 100 })
      .withMessage('Tournament name must be less than 100 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date in ISO format'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date in ISO format')
      .custom((value, { req }) => {
        if (!req.body.startDate) return true;
        return new Date(value) > new Date(req.body.startDate);
      })
      .withMessage('End date must be after start date'),
    body('status')
      .optional()
      .isIn(['draft', 'registration', 'active', 'completed', 'cancelled'])
      .withMessage('Status must be valid')
  ]
};

// Define a single source of truth for team field validation rules
const teamRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Team name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.&'()]+$/)
    .withMessage('Team name can only contain letters, numbers, spaces, and basic symbols (-, _, ., &, \', (, ))'),
  body('abbreviation')
    .notEmpty()
    .withMessage('Abbreviation is required')
    .trim()
    .isLength({ min: 2, max: 3 })
    .withMessage('Abbreviation must be 2-3 characters')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Abbreviation can only contain letters and numbers')
    .toUpperCase(),
  body('foundedYear')
    .optional({ checkFalsy: true })
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(`Please enter a valid founded year between 1800 and ${new Date().getFullYear()}`)
    .toInt(),
  body('city')
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage('City must be a string')
    .isLength({ max: 100 })
    .withMessage('City name must be less than 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.&'()áéíóúÁÉÍÓÚñÑçÇâêîôûÂÊÎÔÛäëïöüÄËÏÖÜàèìòùÀÈÌÒÙ]+$/)
    .withMessage('City name can only contain letters, numbers, spaces, accented characters, and basic symbols (-, _, ., &, \', (, ))'),
  body('nickname')
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage('Nickname must be a string')
    .isLength({ max: 100 })
    .withMessage('Nickname must be less than 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.&'()]+$/)
    .withMessage('Nickname can only contain letters, numbers, spaces, and basic symbols (-, _, ., &, \', (, ))')
];

// Team schemas
const team = {
  // Used for general team updates
  teamSchema: teamRules,
  // Used specifically when creating a team; keep same rules to avoid divergence
  createTeam: teamRules,
  
  teamMemberSchema: [
    body('userId')
      .isInt()
      .withMessage('User ID must be an integer')
      .toInt(),
    body('role')
      .isIn(['manager', 'assistant_manager', 'athlete'])
      .withMessage('Role must be one of: manager, assistant_manager, athlete')
  ],
  
  teamIdParam: [
    param('id')
      .isInt()
      .withMessage('Team ID must be an integer')
      .toInt()
  ]
};

// League schemas
const league = {
  leagueSchema: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('League name is required')
      .isLength({ max: 100 })
      .withMessage('League name must be less than 100 characters'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date in ISO format'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date in ISO format')
      .custom((value, { req }) => {
        if (!req.body.startDate) return true;
        return new Date(value) > new Date(req.body.startDate);
      })
      .withMessage('End date must be after start date')
  ],
  
  leagueIdParam: [
    param('id')
      .isInt()
      .withMessage('League ID must be an integer')
      .toInt()
  ]
};

// Match schemas (deduplicated)
const match = {
  matchSchema: [
    body('homeTeamId')
      .isInt()
      .withMessage('Home team ID must be an integer')
      .toInt(),
    body('awayTeamId')
      .isInt()
      .withMessage('Away team ID must be an integer')
      .toInt()
      .custom((value, { req }) => value !== req.body.homeTeamId)
      .withMessage('Home team and away team must be different'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid date in ISO format'),
    ...matchScoreStatusRules
  ],
  
  // Used when only updating a match result
  matchResultSchema: matchScoreStatusRules,
  
  // Add the missing ID param validation
  matchIdParam: [
    param('id')
      .isInt()
      .withMessage('Match ID must be an integer')
      .toInt()
  ]
};

module.exports = {
  auth,
  user, // Add the new user schemas
  tournament,
  team,
  league,
  match
};
