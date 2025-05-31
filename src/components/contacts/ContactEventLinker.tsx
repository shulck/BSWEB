import React, { useState, useEffect } from 'react';
import { Contact, Event } from '../../types';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface ContactEventLinkerProps {
  contact: Contact;
  events: Event[];
  onLink: (contactId: string, eventId: string) => void;
  onUnlink: (contactId: string) => void;
}

export const ContactEventLinker: React.FC<ContactEventLinkerProps> = ({
  contact,
  events,
  onLink,
  onUnlink
}) => {
  const [selectedEventId, setSelectedEventId] = useState('');
  
  useEffect(() => {
    setSelectedEventId(contact.eventId || '');
  }, [contact]);

  const upcomingEvents = events
    .filter(event => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const eventOptions = [
    { value: '', label: 'No event linked' },
    ...upcomingEvents.map(event => ({
      value: event.id!,
      label: `${event.title} - ${new Date(event.date).toLocaleDateString()}`
    }))
  ];

  const handleLink = () => {
    if (selectedEventId) {
      onLink(contact.id!, selectedEventId);
    } else {
      onUnlink(contact.id!);
    }
  };

  const linkedEvent = events.find(e => e.id === contact.eventId);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link to Event
        </label>
        
        {linkedEvent && (
          <div className="mb-2 p-2 bg-blue-50 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Currently linked to:</span>
              <div className="mt-1">
                <span className="text-blue-800">{linkedEvent.title}</span>
                <span className="text-gray-600 ml-2">
                  {new Date(linkedEvent.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <Select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          options={eventOptions}
        />
      </div>

      <Button
        size="sm"
        onClick={handleLink}
        disabled={selectedEventId === (contact.eventId || '')}
      >
        {selectedEventId ? 'Link to Event' : 'Unlink from Event'}
      </Button>
    </div>
  );
};
