import React from 'react';
import { AthletePageLayout } from '../components/PageLayout';
import SettingsComponent from '../../../features/settings/components/SettingsComponent';

function AthleteSettingsPage() {
  return (
    <AthletePageLayout
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <SettingsComponent userType="athlete" />
    </AthletePageLayout>
  );
}

export default AthleteSettingsPage;
