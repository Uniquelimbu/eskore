import React from 'react';
import PageLayout from '../../../components/layout/PageLayout/PageLayout';
import './NewsPage.css';

const NewsPage = () => {
  // Sample news data
  const newsItems = [
    {
      id: 1,
      title: "eSkore Launches New Performance Analytics Dashboard",
      date: "October 15, 2023",
      url: "https://www.linkedin.com/company/eskore-com/"
    },
    {
      id: 2,
      title: "Top 5 Ways Teams Are Using eSkore to Improve Performance",
      date: "September 28, 2023",
      url: "https://www.linkedin.com/company/eskore-com/"
    },
    {
      id: 3,
      title: "eSkore Partners with Major eSports Organizations for 2023 Season",
      date: "August 12, 2023",
      url: "https://www.linkedin.com/company/eskore-com/"
    },
    {
      id: 4,
      title: "New Team Management Features Coming to eSkore Platform",
      date: "July 30, 2023",
      url: "https://www.linkedin.com/company/eskore-com/"
    }
  ];

  const handleNewsClick = (url) => {
    // Open in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageLayout className="news-page-content" maxWidth="1200px" withPadding={true}>
      <div className="news-header">
        <h1>Latest News</h1>
        <p className="news-subtitle">Stay updated with the latest from eSkore</p>
      </div>

      <div className="news-grid">
        {newsItems.map(item => (
          <div 
            key={item.id} 
            className="news-card" 
            onClick={() => handleNewsClick(item.url)}
            tabIndex={0}
            role="link"
            aria-label={`Read more about ${item.title}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNewsClick(item.url);
              }
            }}
          >
            <div className="news-card-content">
              <span className="news-date">{item.date}</span>
              <h3 className="news-title">{item.title}</h3>
              <div className="news-read-more">
                <span>Read More</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default NewsPage;
