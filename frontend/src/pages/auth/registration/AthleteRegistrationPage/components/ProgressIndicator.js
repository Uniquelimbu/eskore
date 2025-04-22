import React from 'react';

const ProgressIndicator = ({ currentStep, totalSteps }) => {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);
  
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
      
      <div className="step-indicators">
        {steps.map(step => (
          <div 
            key={step} 
            className={`step-indicator ${currentStep >= step ? 'completed' : ''}`}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 ? 'Account' : step === 2 ? 'Profile' : 'Gaming'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
