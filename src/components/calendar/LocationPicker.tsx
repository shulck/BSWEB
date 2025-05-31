import React from 'react';
import { Input } from '../ui/Input';

interface LocationPickerProps {
  value?: string;
  onChange: (location: string) => void;
  placeholder?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter location'
}) => {
  const openInMaps = () => {
    if (value) {
      const encodedAddress = encodeURIComponent(value);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-2">
      <Input
        label="Location"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      
      {value && (
        <button
          type="button"
          onClick={openInMaps}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          📍 Open in Maps
        </button>
      )}
    </div>
  );
};
