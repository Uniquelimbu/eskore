import { CIRCUIT_BREAKER_CONFIG } from '../config';

// Circuit breaker implementation to prevent excessive retries
class CircuitBreaker {
  constructor(options = {}) {
    this.failures = 0;
    this.lastFailure = 0;
    this.isOpen = false;
    this.threshold = options.threshold || CIRCUIT_BREAKER_CONFIG.THRESHOLD;
    this.resetTimeout = options.resetTimeout || CIRCUIT_BREAKER_CONFIG.RESET_TIMEOUT;
  }
  
  // Record a failure and potentially open the circuit
  recordFailure() {
    const now = Date.now();
    
    // Reset failure count if last failure was a while ago
    if (now - this.lastFailure > this.resetTimeout) {
      this.failures = 0;
    }
    
    this.failures++;
    this.lastFailure = now;
    
    if (this.failures >= this.threshold) {
      this.isOpen = true;
      
      // Auto-reset circuit after resetTimeout
      setTimeout(() => {
        this.reset();
      }, this.resetTimeout);
    }
  }
  
  // Check if circuit is open (prevent requests)
  isCircuitOpen() {
    // If circuit is open, but it's been a while, try to reset
    if (this.isOpen && Date.now() - this.lastFailure > this.resetTimeout) {
      this.reset();
    }
    return this.isOpen;
  }
  
  // Reset the circuit breaker
  reset() {
    this.failures = 0;
    this.isOpen = false;
  }
}

// Create a singleton instance for global use
export const circuitBreaker = new CircuitBreaker();

// Apply circuit breaker to an async operation
export const applyCircuitBreaker = (operation) => {
  if (circuitBreaker.isCircuitOpen()) {
    console.warn('Circuit breaker is open, request blocked');
    return Promise.reject(new Error('Service unavailable, circuit breaker open'));
  }
  
  return operation().catch(err => {
    circuitBreaker.recordFailure();
    throw err;
  });
};

// Create a named export object instead of anonymous default export
const circuitBreakerExports = {
  circuitBreaker,
  applyCircuitBreaker
};

export default circuitBreakerExports;
