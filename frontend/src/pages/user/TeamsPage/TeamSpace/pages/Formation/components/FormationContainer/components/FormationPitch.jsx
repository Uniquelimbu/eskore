import React from 'react';
import { PitchMarkings, PositionMarker, PositionPlaceholder } from './index';
import PlayerChip from '../../PlayerChip/PlayerChip';
import { normalizedToPixel } from '../utils/positionUtils';

const FormationPitch = ({
  pitchRef,
  dimensions,
  preset,
  starters,
  positionMarkers,
  positionPlaceholders,
  isManager,
  selectedPlayer,
  swappingPlayers,
  onPlayerSelect,
  onPlayerDropOrSwap
}) => {
  return (
    <div 
      ref={pitchRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '625px',
        overflow: 'hidden'
      }}
    >
      <PitchMarkings />
      
      {/* Formation Label */}
      <div className="formation-label">
        <span className="preset-value">{preset}</span>
      </div>
      
      {/* Position markers */}
      {positionMarkers?.map(marker => (
        <PositionMarker
          key={marker.key}
          x={marker.x}
          y={marker.y}
          label={marker.label}
        />
      ))}
      
      {/* Position placeholders */}
      {positionPlaceholders?.map(placeholder => (
        <PositionPlaceholder
          key={placeholder.key}
          x={placeholder.x}
          y={placeholder.y}
          label={placeholder.label}
          positionId={placeholder.positionId}
          isManager={placeholder.isManager}
        />
      ))}
      
      {/* Player chips */}
      {Array.isArray(starters) ? starters.map(player => {
        if (!player) return null;
        const pixelPos = normalizedToPixel(player.xNorm, player.yNorm, dimensions);
        return (
          <PlayerChip
            key={player.id}
            id={player.id}
            x={pixelPos.x}
            y={pixelPos.y}
            label={player.position || player.label}
            jerseyNumber={player.jerseyNumber}
            playerName={player.playerName}
            isStarter={true}
            draggable={isManager && swappingPlayers.length === 0}
            onDropOrSwap={onPlayerDropOrSwap}
            isPlaceholder={false}
            positionId={player.positionId}
            indexInSubs={null}
            isSelected={selectedPlayer?.id === player.id}
            onSelect={onPlayerSelect}
            isSwapping={swappingPlayers.includes(player.id)}
          />
        );
      }) : null}
    </div>
  );
};

export default FormationPitch;