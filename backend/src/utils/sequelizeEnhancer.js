/**
 * Enhances Sequelize models with safer serialization
 */
const { toSafeObject } = require('./serializationUtils');

/**
 * Enhances a Sequelize model with safer toJSON method
 * @param {Object} model - Sequelize model to enhance
 */
function enhanceModel(model) {
  const originalToJSON = model.prototype.toJSON;
  
  // Override toJSON to return a safely serializable object
  model.prototype.toJSON = function() {
    // Get the original result
    const original = originalToJSON.call(this);
    
    // Process it to be safely serializable - use toSafeObject for deep sanitization if needed
    const safe = {
      ...original,
      // Remove any problematic fields
      passwordHash: undefined,
      password: undefined,
      _previousDataValues: undefined,
      _changed: undefined,
      _options: undefined,
      _attributes: undefined,
      uniqno: undefined
    };
    
    return safe;
  };
  
  return model;
}

module.exports = { enhanceModel };
