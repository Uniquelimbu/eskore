const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { version } = require('../../package.json');
const logger = require('../utils/logger');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'eSkore API Documentation',
    version,
    description: 'API documentation for eSkore - Grassroots Football Management Platform',
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC',
    },
    contact: {
      name: 'API Support',
      url: 'https://eskore.com/support',
      email: 'support@eskore.com',
    },
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:5000',
      description: `${process.env.NODE_ENV || 'development'} server`,
    },
  ],
  components: {
    schemas: {
      // User schema
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          profileImageUrl: { type: 'string', nullable: true },
          country: { type: 'string', nullable: true },
          position: { type: 'string', nullable: true },
          // Add other user properties as needed
        }
      },
      // UserOutput schema (for responses with sanitized data)
      UserOutput: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          profileImageUrl: { type: 'string', nullable: true }
          // Add other user properties that are returned to clients
        }
      },
      // Team schema
      Team: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          abbreviation: { type: 'string', nullable: true },
          logoUrl: { type: 'string', nullable: true },
          foundedYear: { type: 'integer', nullable: true },
          city: { type: 'string', nullable: true },
          nickname: { type: 'string', nullable: true }
          // Add other team properties
        }
      },
      // TeamWithMembers schema
      TeamWithMembers: {
        allOf: [
          { $ref: '#/components/schemas/Team' },
          {
            type: 'object',
            properties: {
              Users: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string' }
                  }
                }
              }
            }
          }
        ]
      },
      // TeamMember schema
      TeamMember: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          avatar: { type: 'string', nullable: true },
          role: { type: 'string' },
          position: { type: 'string', nullable: true },
          jerseyNumber: { type: 'integer', nullable: true }
        }
      },
      // League schema
      League: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      // LeagueInput schema (for create/update)
      LeagueInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      },
      // Match schema
      Match: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          homeTeamId: { type: 'integer' },
          awayTeamId: { type: 'integer' },
          homeScore: { type: 'integer', nullable: true },
          awayScore: { type: 'integer', nullable: true },
          status: { type: 'string', enum: ['scheduled', 'live', 'completed', 'postponed', 'cancelled'] },
          date: { type: 'string', format: 'date-time' },
          leagueId: { type: 'integer' },
          homeTeam: { $ref: '#/components/schemas/Team' },
          awayTeam: { $ref: '#/components/schemas/Team' },
          league: { $ref: '#/components/schemas/League' }
        }
      },
      // MatchInput schema (for create)
      MatchInput: {
        type: 'object',
        required: ['homeTeamId', 'awayTeamId', 'date', 'leagueId'],
        properties: {
          homeTeamId: { type: 'integer' },
          awayTeamId: { type: 'integer' },
          homeScore: { type: 'integer', nullable: true },
          awayScore: { type: 'integer', nullable: true },
          status: { 
            type: 'string', 
            enum: ['scheduled', 'live', 'completed', 'postponed', 'cancelled'],
            default: 'scheduled'
          },
          date: { type: 'string', format: 'date-time' },
          leagueId: { type: 'integer' }
        }
      },
      // MatchResultInput schema (for updates)
      MatchResultInput: {
        type: 'object',
        properties: {
          homeScore: { type: 'integer' },
          awayScore: { type: 'integer' },
          status: { 
            type: 'string', 
            enum: ['scheduled', 'live', 'completed', 'postponed', 'cancelled']
          }
        }
      },
      // Tournament schemas
      Tournament: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          status: { 
            type: 'string', 
            enum: ['draft', 'registration', 'active', 'completed', 'cancelled']
          },
          creatorId: { type: 'integer' }
        }
      },
      TournamentWithCreator: {
        allOf: [
          { $ref: '#/components/schemas/Tournament' },
          {
            type: 'object',
            properties: {
              creator: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' }
                }
              }
            }
          }
        ]
      },
      TournamentDetail: {
        allOf: [
          { $ref: '#/components/schemas/TournamentWithCreator' },
          {
            type: 'object',
            properties: {
              Users: {
                type: 'array',
                items: {
                  allOf: [
                    { $ref: '#/components/schemas/UserOutput' },
                    {
                      type: 'object',
                      properties: {
                        UserTournament: {
                          type: 'object',
                          properties: {
                            role: { type: 'string' }
                          }
                        }
                      }
                    }
                  ]
                }
              },
              Teams: {
                type: 'array',
                items: {
                  allOf: [
                    { $ref: '#/components/schemas/Team' },
                    {
                      type: 'object',
                      properties: {
                        TeamTournament: {
                          type: 'object',
                          properties: {
                            status: { type: 'string' }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      },
      CreateTournamentInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          status: { 
            type: 'string', 
            enum: ['draft', 'registration', 'active', 'completed', 'cancelled'],
            default: 'draft'
          }
        }
      },
      UpdateTournamentInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          status: { 
            type: 'string', 
            enum: ['draft', 'registration', 'active', 'completed', 'cancelled']
          }
        }
      },
      // UserTeam and TeamTournament schemas
      UserTeam: {
        type: 'object',
        properties: {
          userId: { type: 'integer' },
          teamId: { type: 'integer' },
          role: { type: 'string', enum: ['manager', 'assistant_manager', 'athlete', 'coach'] }
        }
      },
      TeamTournament: {
        type: 'object',
        properties: {
          teamId: { type: 'integer' },
          tournamentId: { type: 'integer' },
          status: { type: 'string', enum: ['registered', 'accepted', 'rejected'] }
        }
      },
      UserTournament: {
        type: 'object',
        properties: {
          userId: { type: 'integer' },
          tournamentId: { type: 'integer' },
          role: { type: 'string', enum: ['participant', 'organizer', 'staff'] }
        }
      },
      // CreateTeamInput and UpdateTeamInput
      CreateTeamInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          abbreviation: { type: 'string' },
          foundedYear: { type: 'integer' },
          city: { type: 'string' },
          nickname: { type: 'string' }
        }
      },
      UpdateTeamInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          abbreviation: { type: 'string' },
          foundedYear: { type: 'integer' },
          city: { type: 'string' },
          nickname: { type: 'string' }
        }
      },
      // UpdateUserProfileInput
      UpdateUserProfileInput: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          dob: { type: 'string', format: 'date' },
          country: { type: 'string' },
          height: { type: 'number' },
          position: { type: 'string' },
          bio: { type: 'string' }
        }
      },
      // Pagination
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          pages: { type: 'integer' }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                error: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Unauthorized'
                    },
                    code: {
                      type: 'string',
                      example: 'UNAUTHORIZED'
                    }
                  }
                }
              }
            }
          }
        }
      },
      BadRequestError: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                error: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Validation failed'
                    },
                    code: {
                      type: 'string',
                      example: 'VALIDATION_ERROR'
                    }
                  }
                }
              }
            }
          }
        }
      },
    }
  },
  security: [{
    bearerAuth: []
  }]
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: ['./src/routes/*.js'], // This line ensures JSDoc comments in your route files are processed
};

// Initialize swagger-jsdoc
let swaggerSpec;
try {
  swaggerSpec = swaggerJSDoc(options);
  logger.info('Swagger specification generated successfully.');
} catch (error) {
  logger.error('Error generating Swagger specification:', error);
  // Fallback or default spec in case of error, or rethrow
  swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'eSkore API Documentation (Error)',
      version: '0.0.0',
      description: 'Error generating API documentation. Please check the logs.',
    },
    paths: {}
  };
}

// Function to setup Swagger UI
const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info(`Swagger UI available at /api-docs`);
};

module.exports = setupSwagger;
