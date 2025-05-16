import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FormationContainer, 
  useFormationStore 
} from '../../components/formation';
import './Formation.css';

const Formation = () => {
  const { teamId } = useParams();
  const [isManager, setIsManager] = useState(true); // Default to true for demo
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch players data
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        // API call should go here instead of mock data
        // Example:
        // const response = await apiClient.get(`/api/teams/${teamId}/players`);
        // setPlayers(response.data);
        
        // Temporary empty array until API integration
        setPlayers([]);
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [teamId]);

  if (loading) {
    return <div className="formation-loading">Loading formation...</div>;
  }

  return (
    <div className="formation-page">
      <div className="formation-content">
        <FormationContainer 
          teamId={teamId} 
          isManager={isManager} 
          players={players} 
        />
      </div>
    </div>
  );
};

export default Formation;
