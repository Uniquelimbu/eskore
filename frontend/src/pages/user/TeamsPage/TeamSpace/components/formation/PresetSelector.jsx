import React from 'react';

const PRESETS = [
  { value: '4-3-3', label: '4-3-3' },
  { value: '4-4-2', label: '4-4-2' },
  { value: '3-5-2', label: '3-5-2' },
  { value: '5-3-2', label: '5-3-2' },
  { value: '4-2-3-1', label: '4-2-3-1' },
];

const PresetSelector = ({ currentPreset, onChangePreset, disabled }) => {
  return (
    <div className="preset-selector flex items-center">
      <label htmlFor="formation-preset" className="text-gray-300 mr-2">
        Formation:
      </label>
      <select
        id="formation-preset"
        value={currentPreset}
        onChange={(e) => onChangePreset(e.target.value)}
        disabled={disabled}
        className={`
          bg-gray-800 text-white border border-gray-700 rounded px-3 py-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {PRESETS.map((preset) => (
          <option key={preset.value} value={preset.value}>
            {preset.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PresetSelector;
