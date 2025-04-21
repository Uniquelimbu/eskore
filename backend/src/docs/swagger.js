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

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: [
    './src/routes/*.js',
    './src/models/*.js',
    './src/docs/components/*.yaml'
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Setup function to configure routes
const setupSwagger = (app) => {
  try {
    // Serve swagger docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }'
    }));
    
    // Make swagger.json available
    app.get('/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    
    logger.info(`API Documentation available at http://localhost:${process.env.PORT || 5000}/api-docs`);
  } catch (error) {
    logger.warn('Could not set up Swagger documentation:', error.message);
  }
};

module.exports = setupSwagger;
