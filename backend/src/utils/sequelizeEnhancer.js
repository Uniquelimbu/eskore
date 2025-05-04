/**
 * Enhances Sequelize models with safer serialization
 */
const { toSafeObject } = require('./safeSerializer');

/**
 * Creates a safe copy of model data with sensitive fields removed
 * @param {Object} data - Original data from model
 * @returns {Object} Cleaned data object
 */
function cleanModelData(data) {
  // Create a deep clone to avoid modifying the original
  const cleaned = JSON.parse(JSON.stringify(data));
  
  // Remove sensitive/internal fields
  delete cleaned.passwordHash;
  delete cleaned.password;
  delete cleaned._previousDataValues;
  delete cleaned._changed;
  delete cleaned._options;
  delete cleaned._attributes;
  delete cleaned.uniqno;
  
  return cleaned;
}

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
    
    // Clean sensitive data
    const cleaned = cleanModelData(original);
    
    // Process with safe serializer for extra protection
    return toSafeObject(cleaned);
  };
  
  return model;
}

module.exports = { enhanceModel };
