import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { UserPageLayout } from '../../../features/shared/components/UserPageLayout/UserPageLayout';
import styles from './HomePage.module.css';

function HomePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  useEffect(() => {
    // Set page title
    document.title = 'Athlete Dashboard | eSkore';
  }, []);
  
  return (
    <UserPageLayout
      title="Athlete Dashboard"
      description="Welcome to your athlete dashboard"
    >
      <div className={styles.athleteDashboard}>
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeHeader}>
            <h1>Welcome, {user?.firstName || 'Athlete'}</h1>
            <p className={styles.dashboardDate}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </section>
        
        <div className={styles.dashboardGrid}>
          {/* Upcoming Matches Card */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h2>Upcoming Matches</h2>
              <Link to="/athlete/matches" className={styles.viewAllLink}>View All</Link>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.upcomingMatch}>
                <div className={styles.matchDate}>June 15, 2023 - 15:00</div>
                <div className={styles.matchTeams}>
                  <span>FC United</span>
                  <span className={styles.vs}>vs</span>
                  <span>City FC</span>
                </div>
                <div className={styles.matchVenue}>Home Stadium</div>
              </div>
              <div className={styles.upcomingMatch}>
                <div className={styles.matchDate}>June 22, 2023 - 18:30</div>
                <div className={styles.matchTeams}>
                  <span>City FC</span>
                  <span className={styles.vs}>vs</span>
                  <span>FC United</span>
                </div>
                <div className={styles.matchVenue}>Away Field</div>
              </div>
            </div>
          </div>
          
          {/* Performance Stats Card */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h2>Performance Stats</h2>
              <Link to="/athlete/stats" className={styles.viewAllLink}>View Details</Link>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.statGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>7</div>
                  <div className={styles.statLabel}>Goals</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>5</div>
                  <div className={styles.statLabel}>Assists</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>12</div>
                  <div className={styles.statLabel}>Matches</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>85%</div>
                  <div className={styles.statLabel}>Pass Acc.</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team Updates Card */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h2>Your Teams</h2>
              <Link to="/athlete/teams" className={styles.viewAllLink}>View All</Link>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.teamItem}>
                <div className={styles.teamLogo}>FC</div>
                <div className={styles.teamDetails}>
                  <div className={styles.teamName}>FC United</div>
                  <div className={styles.teamRole}>First Team</div>
                </div>
              </div>
              <div className={styles.teamItem}>
                <div className={styles.teamLogo}>NT</div>
                <div className={styles.teamDetails}>
                  <div className={styles.teamName}>National Team U21</div>
                  <div className={styles.teamRole}>Squad Player</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Activity Feed Card */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h2>Recent Activity</h2>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.activityFeed}>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>🏆</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      You won <strong>Player of the Match</strong> in FC United vs City FC
                    </div>
                    <div className={styles.activityTime}>2 days ago</div>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>⚽</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      You scored 2 goals against Athletic Club
                    </div>
                    <div className={styles.activityTime}>1 week ago</div>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>👤</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      Coach James added match notes to your profile
                    </div>
                    <div className={styles.activityTime}>1 week ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserPageLayout>
  );
}

export default HomePage;
