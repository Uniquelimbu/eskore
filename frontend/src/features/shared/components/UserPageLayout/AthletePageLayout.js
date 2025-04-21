/**
 * @deprecated This component has been moved to the athlete feature.
 * Please import from '@/features/athlete/components/PageLayout' instead.
 */

import { AthletePageLayout } from '../../../../features/athlete/components/PageLayout';

console.warn(
  'Importing AthletePageLayout from shared/components/UserPageLayout is deprecated. ' +
  'Please update your imports to use features/athlete/components/PageLayout instead.'
);

export default AthletePageLayout;
