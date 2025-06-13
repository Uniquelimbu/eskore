/**
 * useErrorTracking Hook
 * Advanced error tracking and analytics for TeamSpace error management
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { trackErrorEvent, generateErrorId, sanitizeErrorData } from '../utils/errorHelpers';
import { getErrorConfig } from '../utils/errorConfigs';
import { ANALYTICS_EVENTS, ERROR_TYPES } from '../constants';

/**
 * Custom hook for comprehensive error tracking and analytics
 * @param {Object} options - Hook configuration options
 * @returns {Object} Error tracking state and methods
 */
const useErrorTracking = ({
  errorType = ERROR_TYPES.GENERIC,
  errorId = null,
  userId = null,
  teamId = null,
  sessionId = null,
  enableAnalytics = true,
  enableConsoleLogging = process.env.NODE_ENV === 'development',
  enableLocalStorage = true,
  trackUserActions = true,
  trackPerformance = true,
  trackContext = true,
  batchSize = 10,
  flushInterval = 30000, // 30 seconds
  maxStorageSize = 1000, // Max number of events to store locally
  customMetadata = {}
} = {}) => {
  // State management
  const [trackingSession, setTrackingSession] = useState(null);
  const [eventQueue, setEventQueue] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [lastFlushTime, setLastFlushTime] = useState(Date.now());
  const [isTracking, setIsTracking] = useState(enableAnalytics);
  const [trackingStats, setTrackingStats] = useState({
    eventsTracked: 0,
    errorsTracked: 0,
    userActionsTracked: 0,
    performanceMetricsTracked: 0,
    sessionDuration: 0
  });

  // Refs for cleanup and persistence
  const flushIntervalRef = useRef(null);
  const sessionStartTime = useRef(Date.now());
  const performanceObserver = useRef(null);
  const errorHistory = useRef([]);
  const userActionHistory = useRef([]);

  // Error configuration
  const errorConfig = useMemo(() => {
    return getErrorConfig(errorType);
  }, [errorType]);

  // Generate or use provided session ID
  const currentSessionId = useMemo(() => {
    return sessionId || generateErrorId();
  }, [sessionId]);

  // Generate or use provided error ID
  const currentErrorId = useMemo(() => {
    return errorId || generateErrorId();
  }, [errorId]);

  /**
   * Get browser memory information safely
   */
  const getMemoryInfo = useCallback(() => {
    try {
      if (performance && performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
    } catch (error) {
      console.warn('Memory information not available:', error);
    }
    return null;
  }, []);

  /**
   * Get connection information safely
   */
  const getConnectionInfo = useCallback(() => {
    try {
      const connection = navigator.connection || 
                        navigator.mozConnection || 
                        navigator.webkitConnection;
      
      if (connection) {
        return {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }
    } catch (error) {
      console.warn('Connection information not available:', error);
    }
    return null;
  }, []);

  /**
   * Get performance timing information safely
   */
  const getPerformanceTiming = useCallback(() => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource').slice(-10);
      
      return {
        navigation: navigation ? {
          domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
          domContentLoadedEventStart: navigation.domContentLoadedEventStart,
          loadEventEnd: navigation.loadEventEnd,
          loadEventStart: navigation.loadEventStart,
          responseEnd: navigation.responseEnd,
          responseStart: navigation.responseStart
        } : null,
        paint: paint.map(entry => ({
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration
        })),
        resources: resources.map(entry => ({
          name: entry.name,
          duration: entry.duration,
          transferSize: entry.transferSize
        }))
      };
    } catch (error) {
      console.warn('Performance timing not available:', error);
      return null;
    }
  }, []);

  /**
   * Initialize tracking session
   */
  const initializeSession = useCallback(() => {
    const session = {
      id: currentSessionId,
      errorId: currentErrorId,
      startTime: sessionStartTime.current,
      userId,
      teamId,
      errorType,
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: getConnectionInfo(),
      memory: getMemoryInfo(),
      ...customMetadata
    };

    setTrackingSession(session);
    
    if (enableAnalytics) {
      trackErrorEvent(ANALYTICS_EVENTS.ERROR_DISPLAYED, {
        ...session,
        timestamp: Date.now()
      });
    }

    return session;
  }, [
    currentSessionId,
    currentErrorId,
    userId,
    teamId,
    errorType,
    customMetadata,
    enableAnalytics,
    getConnectionInfo,
    getMemoryInfo
  ]);

  /**
   * Create base event data
   */
  const createBaseEvent = useCallback((eventType, data = {}) => {
    return {
      id: generateErrorId(),
      type: eventType,
      sessionId: currentSessionId,
      errorId: currentErrorId,
      timestamp: Date.now(),
      errorType,
      userId,
      teamId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      ...data
    };
  }, [currentSessionId, currentErrorId, errorType, userId, teamId]);

  /**
   * Add event to queue and update statistics
   */
  const addEventToQueue = useCallback((event) => {
    setEventQueue(prev => {
      const newQueue = [...prev, event];
      
      // Limit queue size
      if (newQueue.length > maxStorageSize) {
        return newQueue.slice(-maxStorageSize);
      }
      
      return newQueue;
    });

    setTotalEvents(prev => prev + 1);
    
    // Update tracking statistics
    setTrackingStats(prev => ({
      ...prev,
      eventsTracked: prev.eventsTracked + 1,
      sessionDuration: Date.now() - sessionStartTime.current
    }));

    // Log to console in development
    if (enableConsoleLogging) {
      console.group(`🔍 Error Tracking: ${event.type}`);
      console.log('Event:', event);
      console.log('Queue size:', eventQueue.length + 1);
      console.groupEnd();
    }
  }, [eventQueue.length, maxStorageSize, enableConsoleLogging]);

  /**
   * Track error events
   */
  const trackError = useCallback((error, context = {}) => {
    const sanitizedError = sanitizeErrorData(error);
    const event = createBaseEvent(ANALYTICS_EVENTS.ERROR_DISPLAYED, {
      error: sanitizedError,
      errorMessage: error?.message || 'Unknown error',
      errorStack: error?.stack,
      errorCode: error?.code,
      severity: errorConfig.severity,
      category: errorConfig.category,
      context: {
        ...context,
        timestamp: Date.now(),
        performanceNow: performance.now(),
        memory: getMemoryInfo(),
        connection: getConnectionInfo()
      }
    });

    addEventToQueue(event);
    errorHistory.current.push(event);
    
    setTrackingStats(prev => ({
      ...prev,
      errorsTracked: prev.errorsTracked + 1
    }));

    return event.id;
  }, [createBaseEvent, errorConfig, addEventToQueue, getMemoryInfo, getConnectionInfo]);

  /**
   * Track user actions
   */
  const trackUserAction = useCallback((action, data = {}) => {
    if (!trackUserActions) return null;

    const event = createBaseEvent('user_action', {
      action,
      actionData: data,
      timestamp: Date.now(),
      performanceNow: performance.now(),
      memory: getMemoryInfo()
    });

    addEventToQueue(event);
    userActionHistory.current.push(event);
    
    setTrackingStats(prev => ({
      ...prev,
      userActionsTracked: prev.userActionsTracked + 1
    }));

    return event.id;
  }, [trackUserActions, createBaseEvent, addEventToQueue, getMemoryInfo]);

  /**
   * Track performance metrics
   */
  const trackPerformanceMetrics = useCallback((metrics, context = {}) => {
    if (!trackPerformance) return null;

    const event = createBaseEvent('performance_metric', {
      metrics,
      context,
      timing: getPerformanceTiming(),
      memory: getMemoryInfo(),
      connection: getConnectionInfo()
    });

    addEventToQueue(event);
    
    setTrackingStats(prev => ({
      ...prev,
      performanceMetricsTracked: prev.performanceMetricsTracked + 1
    }));

    return event.id;
  }, [trackPerformance, createBaseEvent, addEventToQueue, getPerformanceTiming, getMemoryInfo, getConnectionInfo]);

  /**
   * Track custom events
   */
  const trackCustomEvent = useCallback((eventType, data = {}) => {
    const event = createBaseEvent(eventType, {
      customData: data,
      timestamp: Date.now(),
      memory: getMemoryInfo(),
      connection: getConnectionInfo()
    });

    addEventToQueue(event);
    return event.id;
  }, [createBaseEvent, addEventToQueue, getMemoryInfo, getConnectionInfo]);

  /**
   * Flush events to analytics service
   */
  const flushEvents = useCallback(async () => {
    if (eventQueue.length === 0 || !enableAnalytics) return;

    const eventsToFlush = eventQueue.slice(0, batchSize);
    
    try {
      // Send to multiple analytics services
      const promises = [];

      // Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        promises.push(
          Promise.all(eventsToFlush.map(event => {
            return new Promise(resolve => {
              try {
                window.gtag('event', event.type, {
                  ...event,
                  event_category: 'error_tracking',
                  event_label: event.errorType,
                  custom_map: event
                });
                resolve();
              } catch (error) {
                console.warn('GA tracking failed:', error);
                resolve();
              }
            });
          }))
        );
      }

      // Custom analytics endpoint
      if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
        promises.push(
          fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              events: eventsToFlush,
              session: trackingSession
            })
          }).catch(error => {
            console.warn('Analytics endpoint failed:', error);
          })
        );
      }

      // Console logging in development
      if (enableConsoleLogging) {
        promises.push(
          Promise.resolve().then(() => {
            console.group(`📊 Flushing ${eventsToFlush.length} events`);
            console.table(eventsToFlush);
            console.groupEnd();
          })
        );
      }

      await Promise.allSettled(promises);

      // Remove flushed events from queue
      setEventQueue(prev => prev.slice(batchSize));
      setLastFlushTime(Date.now());

    } catch (error) {
      console.error('Failed to flush tracking events:', error);
    }
  }, [eventQueue, enableAnalytics, batchSize, trackingSession, enableConsoleLogging]);

  /**
   * Save events to local storage
   */
  const saveToLocalStorage = useCallback(() => {
    if (!enableLocalStorage || typeof window === 'undefined') return;

    try {
      const storageData = {
        events: eventQueue,
        session: trackingSession,
        stats: trackingStats,
        timestamp: Date.now()
      };

      localStorage.setItem(
        `teamspace_error_tracking_${currentSessionId}`,
        JSON.stringify(storageData)
      );
    } catch (error) {
      console.warn('Failed to save tracking data to localStorage:', error);
    }
  }, [enableLocalStorage, eventQueue, trackingSession, trackingStats, currentSessionId]);

  /**
   * Load events from local storage
   */
  const loadFromLocalStorage = useCallback(() => {
    if (!enableLocalStorage || typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(`teamspace_error_tracking_${currentSessionId}`);
      if (stored) {
        const data = JSON.parse(stored);
        return data;
      }
    } catch (error) {
      console.warn('Failed to load tracking data from localStorage:', error);
    }
    
    return null;
  }, [enableLocalStorage, currentSessionId]);

  /**
   * Get tracking summary
   */
  const getTrackingSummary = useCallback(() => {
    return {
      session: trackingSession,
      stats: {
        ...trackingStats,
        queueSize: eventQueue.length,
        sessionDuration: Date.now() - sessionStartTime.current,
        lastFlushTime,
        totalEvents
      },
      errorHistory: errorHistory.current.slice(-10), // Last 10 errors
      userActionHistory: userActionHistory.current.slice(-20), // Last 20 actions
      performance: {
        memory: getMemoryInfo(),
        connection: getConnectionInfo(),
        timing: performance.now()
      }
    };
  }, [trackingSession, trackingStats, eventQueue.length, lastFlushTime, totalEvents, getMemoryInfo, getConnectionInfo]);

  /**
   * Clear tracking data
   */
  const clearTrackingData = useCallback(() => {
    setEventQueue([]);
    setTotalEvents(0);
    setTrackingStats({
      eventsTracked: 0,
      errorsTracked: 0,
      userActionsTracked: 0,
      performanceMetricsTracked: 0,
      sessionDuration: 0
    });
    errorHistory.current = [];
    userActionHistory.current = [];
    
    if (enableLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`teamspace_error_tracking_${currentSessionId}`);
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }, [enableLocalStorage, currentSessionId]);

  /**
   * Enable/disable tracking
   */
  const toggleTracking = useCallback((enabled) => {
    setIsTracking(enabled);
    if (!enabled) {
      clearTrackingData();
    }
  }, [clearTrackingData]);

  // Initialize session on mount
  useEffect(() => {
    if (isTracking) {
      const session = initializeSession();
      
      // Load previous session data if available
      const storedData = loadFromLocalStorage();
      if (storedData) {
        setEventQueue(storedData.events || []);
        setTrackingStats(storedData.stats || trackingStats);
      }
    }
  }, [isTracking, initializeSession, loadFromLocalStorage]);

  // Set up periodic flushing
  useEffect(() => {
    if (isTracking && enableAnalytics) {
      flushIntervalRef.current = setInterval(() => {
        flushEvents();
      }, flushInterval);

      return () => {
        if (flushIntervalRef.current) {
          clearInterval(flushIntervalRef.current);
        }
      };
    }
  }, [isTracking, enableAnalytics, flushEvents, flushInterval]);

  // Save to localStorage periodically
  useEffect(() => {
    if (isTracking && enableLocalStorage) {
      const saveInterval = setInterval(saveToLocalStorage, 10000); // Save every 10 seconds
      return () => clearInterval(saveInterval);
    }
  }, [isTracking, enableLocalStorage, saveToLocalStorage]);

  // Set up performance observer
  useEffect(() => {
    if (isTracking && trackPerformance && typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        performanceObserver.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            trackPerformanceMetrics({
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime,
              entryType: entry.entryType
            });
          });
        });

        performanceObserver.current.observe({ 
          entryTypes: ['measure', 'navigation', 'paint', 'largest-contentful-paint'] 
        });

        return () => {
          if (performanceObserver.current) {
            performanceObserver.current.disconnect();
          }
        };
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }
    }
  }, [isTracking, trackPerformance, trackPerformanceMetrics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
      }
      
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
      
      // Final flush and save
      if (isTracking) {
        flushEvents();
        saveToLocalStorage();
      }
    };
  }, [isTracking, flushEvents, saveToLocalStorage]);

  return {
    // State
    isTracking,
    trackingSession,
    eventQueue,
    totalEvents,
    trackingStats,
    
    // Tracking methods
    trackError,
    trackUserAction,
    trackPerformance: trackPerformanceMetrics,
    trackCustomEvent,
    
    // Management methods
    flushEvents,
    clearTrackingData,
    toggleTracking,
    
    // Utility methods
    getTrackingSummary,
    saveToLocalStorage,
    loadFromLocalStorage,
    
    // Configuration
    errorConfig,
    currentSessionId,
    currentErrorId,
    
    // Computed values
    queueSize: eventQueue.length,
    sessionDuration: Date.now() - sessionStartTime.current,
    isQueueFull: eventQueue.length >= maxStorageSize
  };
};

export default useErrorTracking;