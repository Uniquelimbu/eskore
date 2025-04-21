import React from 'react';
import { UserPageLayout } from '../shared/components/UserPageLayout/UserPageLayout';
import SettingsComponent from './components/SettingsComponent';

function SettingsPage() {
  return (
    <UserPageLayout
      title="Settings"
      description="Manage your account settings"
    >
      <SettingsComponent userType="user" />
    </UserPageLayout>
  );
}

export default SettingsPage;
