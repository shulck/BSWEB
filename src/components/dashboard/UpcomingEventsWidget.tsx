import React from 'react';
import { Link } from 'react-router-dom';
import { Event, EventType } from '../../types';

interface UpcomingEventsWidgetProps {
  events: Event[];
  isLoading?: boolean;
}

export const UpcomingEventsWidget: React.FC<UpcomingEventsWidgetProps> = ({
  events,
  isLoading = false
}) => {
  const upcomingEvents = events
    .filter(event => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const getEventTypeColor = (type: EventType) => {
    const colors = {
      [EventType.CONCERT]: 'bg-red-100 text-red-800',
      [EventType.FESTIVAL]: 'bg-orange-100 text-orange-800',
      [EventType.REHEARSAL]: 'bg-green-100 text-green-800',
      [EventType.MEETING]: 'bg-blue-100 text-blue-800',
      [EventType.INTERVIEW]: 'bg-purple-100 text-purple-800',
      [EventType.PHOTOSHOOT]: 'bg-pink-100 text-pink-800',
      [EventType.PERSONAL]: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatEventDate = (date: Date) => {
    const eventDate = new Date(date);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: eventDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatEventTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
        <Link
          to="/calendar"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all
        </Link>
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No upcoming events</p>
          <Link
            to="/calendar"
            className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
          >
            Schedule an event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="border-l-4 border-blue-400 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatEventDate(event.date)}</span>
                    <span>{formatEventTime(event.date)}</span>
                    {event.location && (
                      <span className="truncate max-w-32">📍 {event.location}</span>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    event.status === 'Confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
