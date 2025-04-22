import React from 'react';

const RoleDescription = ({ roleId }) => {
  const roleDetails = {
    athlete: {
      benefits: [
        'Track your performance across multiple games',
        'Identify areas for improvement with detailed analytics',
        'Compare your stats with other players',
        'Set and track personal goals'
      ]
    },
    coach: {
      benefits: [
        'Monitor your team\'s performance',
        'Track individual player progress',
        'Develop data-driven strategies',
        'Identify strengths and weaknesses'
      ]
    },
    team: {
      benefits: [
        'Manage team roster and schedules',
        'Track overall team performance',
        'Monitor trends across seasons',
        'Generate reports for sponsors and stakeholders'
      ]
    }
  };

  const details = roleDetails[roleId] || { benefits: [] };

  return (
    <div className="role-details">
      <h3>Benefits</h3>
      <ul className="benefits-list">
        {details.benefits.map((benefit, index) => (
          <li key={index}>{benefit}</li>
        ))}
      </ul>
    </div>
  );
};

export default RoleDescription;
