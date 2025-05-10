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
  // IMPORTANT: Adjust this path to point to your route files
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
