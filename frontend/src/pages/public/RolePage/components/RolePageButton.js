import React from 'react';
import Button from '../../../../components/ui/Button/Button';
import { pageSpecificClass } from '../../../../utils/cssUtils';
import './RolePageButton.css'; // Page-specific styles

/**
 * RolePage-specific button with custom styling
 * Leverages the global Button component but with isolated styles
 */
const RolePageButton = (props) => {
  // Create a namespace for this page's specific button
  const namespace = pageSpecificClass('role', 'button');
  
  return (
    <Button 
      {...props}
      namespace={namespace}
    />
  );
};

export default RolePageButton;
