/**
 * Initializes all models and applies enhancements
 */
const { enhanceModel } = require('../utils/sequelizeEnhancer');
const models = require('./index');
const logger = require('../utils/logger');

/**
 * Initialize all models and apply enhancements
 * This improves serialization safety across all models
 */
function initializeModels() {
  logger.info('Initializing and enhancing models...');
  
  try {
    // Apply the enhanceModel function to each model
    let enhancedCount = 0;
    
    Object.entries(models).forEach(([name, model]) => {
      if (model && model.prototype && typeof model.prototype.toJSON === 'function') {
        enhanceModel(model);
        enhancedCount++;
        logger.debug(`Enhanced model: ${name}`);
      }
    });
    
    logger.info(`${enhancedCount} models initialized and enhanced successfully`);
    return true;
  } catch (error) {
    logger.error('Failed to initialize models:', error);
    return false;
  }
}

module.exports = initializeModels;
