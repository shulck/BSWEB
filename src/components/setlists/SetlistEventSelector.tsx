import React from 'react';
import { Event } from '../../types';
import { Select } from '../ui/Select';

interface SetlistEventSelectorProps {
  events: Event[];
  selectedEventId?: string;
  onSelect: (eventId: string) => void;
}

export const SetlistEventSelector: React.FC<SetlistEventSelectorProps> = ({
  events,
  selectedEventId,
  onSelect
}) => {
  const upcomingEvents = events
    .filter(event => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const eventOptions = [
    { value: '', label: 'No event selected' },
    ...upcomingEvents.map(event => ({
      value: event.id!,
      label: `${event.title} - ${new Date(event.date).toLocaleDateString()}`
    }))
  ];

  return (
    <div className="space-y-2">
      <Select
        label="Link to Event"
        value={selectedEventId || ''}
        onChange={(e) => onSelect(e.target.value)}
        options={eventOptions}
      />
      
      {selectedEventId && (
        <div className="text-sm text-gray-600">
          This setlist will be linked to the selected event
        </div>
      )}
    </div>
  );
};
