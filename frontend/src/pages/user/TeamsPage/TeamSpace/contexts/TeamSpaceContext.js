import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useTeam } from '../../../../../contexts/TeamContext';

const TeamSpaceContext = createContext();

const teamSpaceReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_PAGE':
      return { ...state, activePage: action.payload };
    case 'SET_SIDEBAR_STATE':
      return { ...state, sidebarCollapsed: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  activePage: 'dashboard',
  sidebarCollapsed: false,
  loading: false,
  error: null
};

export const TeamSpaceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(teamSpaceReducer, initialState);
  
  // Access global team data
  const { currentTeam, isManager, teamMembers } = useTeam();

  const setActivePage = useCallback((page) => {
    dispatch({ type: 'SET_ACTIVE_PAGE', payload: page });
  }, []);

  const setSidebarState = useCallback((collapsed) => {
    dispatch({ type: 'SET_SIDEBAR_STATE', payload: collapsed });
    
    // Update DOM classes
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const value = {
    // State
    ...state,
    
    // Team data from global context
    currentTeam,
    isManager,
    teamMembers,
    
    // Actions
    setActivePage,
    setSidebarState,
    setLoading,
    setError,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  };

  return (
    <TeamSpaceContext.Provider value={value}>
      {children}
    </TeamSpaceContext.Provider>
  );
};

export const useTeamSpace = () => {
  const context = useContext(TeamSpaceContext);
  if (!context) {
    throw new Error('useTeamSpace must be used within a TeamSpaceProvider');
  }
  return context;
};