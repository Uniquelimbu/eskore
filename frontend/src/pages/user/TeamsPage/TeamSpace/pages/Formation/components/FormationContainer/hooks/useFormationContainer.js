import { useState, useEffect, useMemo, useRef } from 'react';
import { useTeam } from '../../../../../../../../../contexts/TeamContext';
import useFormationStore from '../../FormationBoard/store';
import { apiClient } from '../../../../../../../../../services';

export const useFormationContainer = ({ teamId, isManager, players = [] }) => {
  const { refreshCurrentTeam } = useTeam();
  
  // Store integration
  const {
    init,
    starters,
    subs,
    preset,
    loading,
    saved,
    saveError,
    pendingChanges,
    mapPlayersToPositions,
    movePlayerToPosition,
    movePlayerToSubSlot,
    swapPlayersInFormation,
    moveStarterToSubsGeneral,
    changePreset,
    exportAsPNG,
    saveFormation,
    saveWithRetry,
    clearSaveError,
    PRESETS
  } = useFormationStore();

  // Local state
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [swappingPlayers, setSwappingPlayers] = useState([]);
  const [managerPreferredFormation, setManagerPreferredFormation] = useState(null);
  const [showEditTab, setShowEditTab] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });

  // Refs
  const initializationRef = useRef(new Set());
  const lastTeamIdRef = useRef(null);
  const containerRef = useRef(null);
  const pitchRef = useRef(null);

  // Memoized store data
  const storeData = useMemo(() => ({
    starters: starters || [],
    subs: subs || [],
    preset,
    loading,
    saved,
    saveError,
    pendingChanges
  }), [starters, subs, preset, loading, saved, saveError, pendingChanges]);

  // Initialize formation
  useEffect(() => {
    if (!teamId || teamId === lastTeamIdRef.current) return;
    if (initializationRef.current.has(teamId)) return;

    console.log('FormationContainer: Initializing for team', teamId);
    initializationRef.current.add(teamId);
    lastTeamIdRef.current = teamId;

    const initializeFormation = async () => {
      try {
        await init(teamId, managerPreferredFormation);
      } catch (error) {
        console.error('FormationContainer: Initialization error:', error);
      } finally {
        setTimeout(() => {
          initializationRef.current.delete(teamId);
        }, 1000);
      }
    };

    initializeFormation();
  }, [teamId, init, managerPreferredFormation]);

  // Fetch manager preferences
  useEffect(() => {
    if (!teamId || !isManager) return;

    let isMounted = true;
    const fetchManagerPreferences = async () => {
      try {
        const response = await apiClient.get(`/teams/${teamId}/managers`);
        if (isMounted && response?.managers?.length > 0) {
          const preferredFormation = response.managers[0]?.Manager?.preferredFormation;
          if (preferredFormation && preferredFormation !== preset) {
            setManagerPreferredFormation(preferredFormation);
            changePreset(preferredFormation);
          }
        }
      } catch (error) {
        console.error('FormationContainer: Error fetching manager preferences:', error);
      }
    };

    const timeoutId = setTimeout(fetchManagerPreferences, 100);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [teamId, isManager, preset, changePreset]);

  // Map players to formation
  useEffect(() => {
    if (players && players.length > 0 && teamId) {
      console.log('FormationContainer: Mapping players:', players.length);
      mapPlayersToPositions(players);
    }
  }, [players, teamId, mapPlayersToPositions]);

  // Auto-save functionality
  useEffect(() => {
    if (!saved && !loading && teamId && pendingChanges) {
      console.log('FormationContainer: Auto-save triggered');
      
      const saveChanges = async () => {
        try {
          const result = await saveWithRetry();
          if (result?.success) {
            console.log('FormationContainer: Save successful');
            // Refresh team data if needed
            if (refreshCurrentTeam) {
              await refreshCurrentTeam();
            }
          }
        } catch (error) {
          console.error('FormationContainer: Save error:', error);
        }
      };
      
      saveChanges();
    }
  }, [saved, loading, teamId, saveWithRetry, pendingChanges, refreshCurrentTeam]);

  // Handle resize
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const height = width * (9/16);
      setDimensions({ width, height });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Event handlers
  const handlePresetChange = (newPreset) => {
    changePreset(newPreset);
    setShowEditTab(false);
  };

  const handlePlayerSelection = (player) => {
    setSelectedPlayer(player);
  };

  const handleExport = () => {
    if (containerRef.current) {
      exportAsPNG(containerRef.current);
    }
  };

  const handleManualSave = async () => {
    clearSaveError();
    try {
      await saveWithRetry();
    } catch (error) {
      console.error('Manual save error:', error);
    }
  };

  return {
    // Store data
    storeData,
    preset,
    loading,
    saved,
    saveError,
    pendingChanges,
    PRESETS,
    
    // Local state
    selectedPlayer,
    swappingPlayers,
    showEditTab,
    dimensions,
    
    // Refs
    containerRef,
    pitchRef,
    
    // Setters
    setSelectedPlayer,
    setSwappingPlayers,
    setShowEditTab,
    
    // Store actions
    movePlayerToPosition,
    movePlayerToSubSlot,
    swapPlayersInFormation,
    moveStarterToSubsGeneral,
    
    // Event handlers
    handlePresetChange,
    handlePlayerSelection,
    handleExport,
    handleManualSave
  };
};