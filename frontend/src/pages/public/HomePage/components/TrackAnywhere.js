import React from 'react';
import styles from './TrackAnywhere.module.css';

/**
 * TrackAnywhere Component
 * A full-screen section showcasing the eSkore mobile app with app store download links,
 * featuring professional design elements with a subtle sports theme.
 */
const TrackAnywhere = () => {
  const appStoreLink = '#';
  const googlePlayLink = '#';

  return (
    <div className={styles.section}>
      <div className={styles.elements}>
        <div className={styles.dotsPattern}></div>
        <div className={styles.designCircle1}></div>
        <div className={styles.designCircle2}></div>
        <div className={styles.accentShape1}></div>
        <div className={styles.accentShape2}></div>
        <div className={styles.fieldGraphic}></div>
        <div className={styles.fieldCenter}></div>
        <div className={styles.centerLine}></div>
        <div className={styles.soccerIllustration}>
          <div className={styles.soccerPattern}></div>
        </div>
      </div>
      <h2 className={styles.heading}>
        Track Progress Anywhere,<br />with eSkore
      </h2>
      <div className={styles.buttonsContainer}>
        <a
          href={appStoreLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.storeButton}
          aria-label="Download on the App Store"
        >
          <img
            src={`${process.env.PUBLIC_URL}/images/logos/app-store-logo.png`}
            alt=""
          />
          <span>Download on the<br />App Store</span>
        </a>
        <a
          href={googlePlayLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.storeButton}
          aria-label="Get it on Google Play"
        >
          <img
            src={`${process.env.PUBLIC_URL}/images/logos/google-play-logo.png`}
            alt=""
          />
          <span>Get it on<br />Google Play</span>
        </a>
      </div>
    </div>
  );
};

export default TrackAnywhere;
