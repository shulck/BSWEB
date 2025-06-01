import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchEvents, addEvent, addRecurringEvents, updateEvent, deleteEvent } from '../store/slices/eventsSlice';
import { MainLayout } from '../components/layout/MainLayout';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { EventForm } from '../components/calendar/EventForm';
import { EventDetails } from '../components/calendar/EventDetails';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ContactService } from '../services/contactService';
import { Event, EventType } from '../types';

type ModalType = 'create' | 'edit' | 'view' | null;

export const CalendarPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { events, isLoading, error } = useAppSelector((state) => state.events);
  const { currentUser } = useAppSelector((state) => state.user);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');

  useEffect(() => {
    if (currentUser?.groupId) {
      dispatch(fetchEvents(currentUser.groupId));
    }
  }, [dispatch, currentUser?.groupId]);

  const filteredEvents = events.filter(event => 
    filterType === 'all' || event.type === filterType
  );

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setModalType('create');
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalType('view');
  };

  const handleCreateEvent = async (eventsData: Omit<Event, 'id'>[], contacts?: any[]) => {
    if (!currentUser?.groupId) {
      console.error('No groupId found for user');
      return;
    }

    const eventsWithGroupId = eventsData.map(eventData => ({
      ...eventData,
      groupId: currentUser.groupId!,
    }));

    try {
      let createdEventId: string | undefined;
      
      if (eventsWithGroupId.length === 1) {
        const result = await dispatch(addEvent(eventsWithGroupId[0])).unwrap();
        createdEventId = result.id;
      } else {
        await dispatch(addRecurringEvents(eventsWithGroupId)).unwrap();
      }
      
      // Сохраняем дополнительные контакты после создания события
      if (contacts && contacts.length > 0 && createdEventId) {
        for (const contact of contacts) {
          await ContactService.addContact({
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            role: contact.role,
            groupId: currentUser.groupId,
            eventId: createdEventId,
            eventTag: eventsWithGroupId[0].title,
            eventType: eventsWithGroupId[0].type
          });
        }
      }
      
      setModalType(null);
      setSelectedDate(null);
      dispatch(fetchEvents(currentUser.groupId));
    } catch (error) {
      console.error('Failed to create event(s):', error);
      alert('Failed to create event(s): ' + (error as Error).message);
    }
  };

  const handleUpdateEvent = async (events: Omit<Event, 'id'>[], contacts?: any[]) => {
    if (!selectedEvent?.id || !currentUser?.groupId || events.length === 0) return;

    const eventData = events[0];
    
    try {
      await dispatch(updateEvent({ 
        eventId: selectedEvent.id, 
        event: {
          ...eventData,
          groupId: currentUser.groupId
        }
      })).unwrap();
      
      setModalType(null);
      setSelectedEvent(null);
      dispatch(fetchEvents(currentUser.groupId));      
    } catch (error) {
      console.error('Failed to update event:', error);
      alert('Failed to update event: ' + (error as Error).message);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id || !currentUser?.groupId) return;

    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await dispatch(deleteEvent(selectedEvent.id)).unwrap();
        setModalType(null);
        setSelectedEvent(null);
        dispatch(fetchEvents(currentUser.groupId));
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event: ' + (error as Error).message);
      }
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const eventTypeOptions = [
    { value: 'all', label: 'All Events' },
    ...Object.values(EventType).map(type => ({
      value: type,
      label: type,
    }))
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600">Manage your band's events and schedule</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EventType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {eventTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button
              onClick={() => {
                setSelectedDate(null);
                setModalType('create');
              }}
              className="whitespace-nowrap"
            >
              + Add Event
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-xl font-semibold text-gray-900">{monthYear}</h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <Button variant="secondary" onClick={goToToday}>
            Today
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <CalendarGrid
            currentDate={currentDate}
            events={filteredEvents}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
            <p className="text-2xl font-bold text-gray-900">{filteredEvents.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">This Month</h3>
            <p className="text-2xl font-bold text-blue-600">
              {filteredEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getMonth() === currentDate.getMonth() && 
                       eventDate.getFullYear() === currentDate.getFullYear();
              }).length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Upcoming</h3>
            <p className="text-2xl font-bold text-green-600">
              {filteredEvents.filter(event => new Date(event.date) > new Date()).length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Confirmed</h3>
            <p className="text-2xl font-bold text-purple-600">
              {filteredEvents.filter(event => event.status === 'Confirmed').length}
            </p>
          </div>
        </div>

        <Modal
          isOpen={modalType === 'create'}
          onClose={closeModal}
          title="Create New Event"
          size="xl"
        >
          <EventForm
            selectedDate={selectedDate}
            onSubmit={handleCreateEvent}
            onCancel={closeModal}
            isLoading={isLoading}
          />
        </Modal>

        <Modal
          isOpen={modalType === 'edit'}
          onClose={closeModal}
          title="Edit Event"
          size="xl"
        >
          <EventForm
            event={selectedEvent}
            onSubmit={handleUpdateEvent}
            onCancel={closeModal}
            isLoading={isLoading}
          />
        </Modal>

        <Modal
          isOpen={modalType === 'view'}
          onClose={closeModal}
          title="Event Details"
          size="lg"
        >
          {selectedEvent && (
            <EventDetails
              event={selectedEvent}
              onEdit={() => setModalType('edit')}
              onDelete={handleDeleteEvent}
            />
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};
