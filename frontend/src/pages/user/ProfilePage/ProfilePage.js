import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import PageLayout from '../../../components/layout/PageLayout/PageLayout';
import { useAuth } from '../../../contexts/AuthContext';
import RecentActivity from '../DashboardPage/components/RecentActivity'; // Reuse RecentActivity
import { dashboardService, profileService } from '../../../services'; // Updated import paths
import './ProfilePage.css'; // Import the CSS

// Placeholder Stats Component (Replace with actual data fetching later)
const ProfileStats = ({ user }) => (
  <div className="profile-stats-card card-style">
    <h3>Key Stats</h3>
    {/* Add a check for user or stats existence */}
    {user && user.stats ? (
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{user.stats.totalMatches || 0}</span>
          <span className="stat-label">Matches</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{user.stats.winRate || 0}%</span>
          <span className="stat-label">Win Rate</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{user.stats.kda ? user.stats.kda.toFixed(1) : '0.0'}</span>
          <span className="stat-label">Avg. KDA</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{user.position || 'N/A'}</span>
          <span class="stat-label">Position</span>
        </div>
      </div>
    ) : (
      <p className="no-stats-message">Stats are not available yet.</p>
    )}
  </div>
);

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState(null);
  const [refreshedUser, setRefreshedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch fresh user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUser(true);
        const userData = await profileService.getUserProfile();
        setRefreshedUser(userData);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Fall back to context user data if fetch fails
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch recent activity for the profile page
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        setError(null); // Reset error on new fetch
        // Assuming getRecentActivity fetches for the logged-in user
        const data = await dashboardService.getRecentActivity();
        setActivities(data || []);
      } catch (err) {
        console.error('Error fetching activities for profile:', err);
        setError('Failed to load recent activity.');
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, []); // Fetch on component mount

  // Fallback for missing user data
  const profileUser = refreshedUser || user || {};
  // More robust country mapping or use a library
  const countryMap = { us: 'United States', ca: 'Canada', np: 'Nepal' }; // Example mapping
  const displayCountry = profileUser.country ? (countryMap[profileUser.country.toLowerCase()] || profileUser.country) : 'Location Unknown';
  const joinDate = profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A';

  // Add navigation handler
  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  return (
    <PageLayout className="profile-page-content" maxWidth="1200px" withPadding={true}>
      <div className="profile-header card-style">
        <div className="profile-avatar-container">
          {/* Placeholder Avatar - Replace with actual image later */}
          <div className="profile-avatar-placeholder">
            {/* Use uppercase for consistency */}
            {profileUser.firstName ? profileUser.firstName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
        <div className="profile-info">
          <h1>{`${profileUser.firstName || ''} ${profileUser.lastName || 'User'}`}</h1>
          <p className="profile-username">@{profileUser.username || 'username'}</p>
          <div className="profile-meta">
            {/* Use displayCountry */}
            <span>📍 {displayCountry}</span>
            <span>⚽ {profileUser.position || 'Position N/A'}</span>
            {/* Use joinDate */}
            <span>🎂 Joined {joinDate}</span>
          </div>
        </div>
        <button className="edit-profile-button" onClick={handleEditProfile}>Edit Profile</button>
      </div>

      <div className="profile-body-grid">
        <div className="profile-main-column">
          {/* Placeholder for Bio/About section */}
          <div className="profile-bio card-style">
            <h3>About Me</h3>
            <p>{profileUser.bio || 'No bio available yet. Click "Edit Profile" to add one!'}</p>
          </div>

          {/* Re-use RecentActivity component */}
          <div className="profile-activity card-style">
            {/* Move header inside RecentActivity or style it here */}
            {/* <div className="section-header"><h2>Recent Activity</h2></div> */}
            {error && <div className="error-message">{error}</div>}
            {/* Pass activities and loading state */}
            <RecentActivity
              activities={activities}
              loading={loadingActivities}
            />
          </div>
        </div>

        <div className="profile-sidebar-column">
          {/* Pass the user object to ProfileStats */}
          <ProfileStats user={profileUser} />

          {/* Placeholder for Achievements or other sidebar content */}
          <div className="profile-achievements card-style">
            <h3>Achievements</h3>
            <p className="no-achievements-message">No achievements yet.</p>
            {/* List achievements here */}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
