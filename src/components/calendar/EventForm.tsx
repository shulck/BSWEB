import React, { useState, useEffect } from 'react';
import { Event, EventType, EventStatus } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

interface Contact {
  id: string;
  role: string;
  name: string;
  email: string;
  phone: string;
}

interface ScheduleItem {
  id: string;
  time: string;
  activity: string;
  description: string;
  duration: string;
}

interface EventFormProps {
  event?: Event | null;
  selectedDate?: Date | null;
  onSubmit: (event: Omit<Event, 'id'> | Event) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
  event,
  selectedDate,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '19:00',
    type: EventType.REHEARSAL,
    status: EventStatus.BOOKED,
    location: '',
    hotelName: '',
    hotelAddress: '',
    hotelCheckIn: '',
    hotelCheckOut: '',
    fee: '',
    currency: 'USD',
    notes: '',
    isPersonal: false,
  });

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      role: 'Organizer',
      name: '',
      email: '',
      phone: '',
    },
    {
      id: '2',
      role: 'Coordinator',
      name: '',
      email: '',
      phone: '',
    },
  ]);

  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    {
      id: '1',
      time: '',
      activity: '',
      description: '',
      duration: '60',
    }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Автозаполнение даты из календаря
    if (!event && selectedDate) {
      // Исправляем проблему с часовыми поясами
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      setFormData(prev => ({
        ...prev,
        date: dateStr,
        time: '19:00'
      }));
    }

    // Заполнение формы для редактирования события
    if (event) {
      const eventDate = new Date(event.date);
      // Исправляем проблему с часовыми поясами для редактирования
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');
      const eventDateStr = `${year}-${month}-${day}`;
      
      setFormData({
        title: event.title,
        date: eventDateStr,
        time: eventDate.toTimeString().slice(0, 5),
        type: event.type,
        status: event.status,
        location: event.location || '',
        hotelName: event.hotelName || '',
        hotelAddress: event.hotelAddress || '',
        hotelCheckIn: event.hotelCheckIn ? (() => {
          const checkInDate = new Date(event.hotelCheckIn);
          const year = checkInDate.getFullYear();
          const month = String(checkInDate.getMonth() + 1).padStart(2, '0');
          const day = String(checkInDate.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })() : '',
        hotelCheckOut: event.hotelCheckOut ? (() => {
          const checkOutDate = new Date(event.hotelCheckOut);
          const year = checkOutDate.getFullYear();
          const month = String(checkOutDate.getMonth() + 1).padStart(2, '0');
          const day = String(checkOutDate.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })() : '',
        fee: event.fee ? event.fee.toString() : '',
        currency: event.currency || 'USD',
        notes: event.notes || '',
        isPersonal: event.isPersonal,
      });

      // Initialize contacts from event data
      const initialContacts: Contact[] = [];
      
      if (event.organizerName || event.organizerEmail || event.organizerPhone) {
        initialContacts.push({
          id: '1',
          role: 'Organizer',
          name: event.organizerName || '',
          email: event.organizerEmail || '',
          phone: event.organizerPhone || '',
        });
      }

      if (event.coordinatorName || event.coordinatorEmail || event.coordinatorPhone) {
        initialContacts.push({
          id: '2',
          role: 'Coordinator',
          name: event.coordinatorName || '',
          email: event.coordinatorEmail || '',
          phone: event.coordinatorPhone || '',
        });
      }

      if (initialContacts.length === 0) {
        initialContacts.push({
          id: '1',
          role: 'Organizer',
          name: '',
          email: '',
          phone: '',
        });
      }

      setContacts(initialContacts);

      // Initialize schedule from event data
      if (event.schedule && event.schedule.length > 0) {
        const initialSchedule = event.schedule.map((item, index) => {
          const match = item.match(/(\d{2}:\d{2})\s*-\s*([^(]+)\s*\((\d+)\s*min\):\s*(.*)/);
          if (match) {
            return {
              id: (index + 1).toString(),
              time: match[1],
              activity: match[2].trim(),
              duration: match[3],
              description: match[4].trim(),
            };
          }
          return {
            id: (index + 1).toString(),
            time: '',
            activity: item,
            description: '',
            duration: '60',
          };
        });
        setSchedule(initialSchedule);
      }
    }
  }, [event, selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleContactChange = (contactId: string, field: keyof Contact, value: string) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, [field]: value }
        : contact
    ));
  };

  const handleScheduleChange = (scheduleId: string, field: keyof ScheduleItem, value: string) => {
    setSchedule(prev => prev.map(item => 
      item.id === scheduleId 
        ? { ...item, [field]: value }
        : item
    ));
  };

  const addContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      role: '',
      name: '',
      email: '',
      phone: '',
    };
    setContacts(prev => [...prev, newContact]);
  };

  const removeContact = (contactId: string) => {
    if (contacts.length > 1) {
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    }
  };

  const addScheduleItem = () => {
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      time: '',
      activity: '',
      description: '',
      duration: '60',
    };
    setSchedule(prev => [...prev, newItem]);
  };

  const removeScheduleItem = (scheduleId: string) => {
    if (schedule.length > 1) {
      setSchedule(prev => prev.filter(item => item.id !== scheduleId));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const datetime = new Date(`${formData.date}T${formData.time}`);

    const organizer = contacts.find(c => c.role.toLowerCase() === 'organizer');
    const coordinator = contacts.find(c => c.role.toLowerCase() === 'coordinator');

    const formattedSchedule = schedule
      .filter(item => item.activity.trim())
      .map(item => {
        if (item.time && item.activity) {
          const timeStr = item.time;
          const activityStr = item.activity.trim();
          const durationStr = item.duration ? `(${item.duration} min)` : '';
          const descriptionStr = item.description.trim() ? `: ${item.description.trim()}` : '';
          return `${timeStr} - ${activityStr} ${durationStr}${descriptionStr}`;
        }
        return item.activity.trim();
      });

    const eventData = {
      ...(event && { id: event.id }),
      title: formData.title.trim(),
      date: datetime,
      type: formData.type,
      status: formData.status,
      location: formData.location.trim() || undefined,
      organizerName: organizer?.name.trim() || undefined,
      organizerEmail: organizer?.email.trim() || undefined,
      organizerPhone: organizer?.phone.trim() || undefined,
      coordinatorName: coordinator?.name.trim() || undefined,
      coordinatorEmail: coordinator?.email.trim() || undefined,
      coordinatorPhone: coordinator?.phone.trim() || undefined,
      hotelName: formData.hotelName.trim() || undefined,
      hotelAddress: formData.hotelAddress.trim() || undefined,
      hotelCheckIn: formData.hotelCheckIn ? new Date(formData.hotelCheckIn) : undefined,
      hotelCheckOut: formData.hotelCheckOut ? new Date(formData.hotelCheckOut) : undefined,
      fee: formData.fee ? parseFloat(formData.fee) : undefined,
      currency: formData.currency,
      notes: formData.notes.trim() || undefined,
      schedule: formattedSchedule.length > 0 ? formattedSchedule : undefined,
      setlistId: undefined,
      groupId: '',
      isPersonal: formData.isPersonal,
    };

    onSubmit(eventData);
  };

  const eventTypeOptions = Object.values(EventType).map(type => ({
    value: type,
    label: type,
  }));

  const eventStatusOptions = Object.values(EventStatus).map(status => ({
    value: status,
    label: status,
  }));

  const contactRoleOptions = [
    { value: 'Organizer', label: 'Organizer' },
    { value: 'Coordinator', label: 'Coordinator' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Sound Engineer', label: 'Sound Engineer' },
    { value: 'Lighting Engineer', label: 'Lighting Engineer' },
    { value: 'Stage Manager', label: 'Stage Manager' },
    { value: 'Security', label: 'Security' },
    { value: 'Venue Contact', label: 'Venue Contact' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Catering', label: 'Catering' },
    { value: 'Other', label: 'Other' },
  ];

  const activityOptions = [
    { value: 'Load In', label: 'Load In' },
    { value: 'Sound Check', label: 'Sound Check' },
    { value: 'Rehearsal', label: 'Rehearsal' },
    { value: 'Performance', label: 'Performance' },
    { value: 'Meet & Greet', label: 'Meet & Greet' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Photo Shoot', label: 'Photo Shoot' },
    { value: 'Break', label: 'Break' },
    { value: 'Meal', label: 'Meal' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Setup', label: 'Setup' },
    { value: 'Breakdown', label: 'Breakdown' },
    { value: 'Load Out', label: 'Load Out' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Event Title*"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="Enter event title"
          />

          <Select
            label="Event Type*"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={eventTypeOptions}
          />

          <Input
            label="Date*"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
          />

          <Input
            label="Time*"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
            error={errors.time}
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={eventStatusOptions}
          />

          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Event location"
          />
        </div>

        {/* Schedule */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Time"
                type="time"
                value={schedule[0]?.time || ''}
                onChange={(e) => handleScheduleChange('1', 'time', e.target.value)}
              />
              <Input
                label="Activity"
                value={schedule[0]?.activity || ''}
                onChange={(e) => handleScheduleChange('1', 'activity', e.target.value)}
                placeholder="Activity name"
              />
              <Input
                label="Duration (min)"
                type="number"
                value={schedule[0]?.duration || '60'}
                onChange={(e) => handleScheduleChange('1', 'duration', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border-t pt-6">
          <Textarea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Additional notes..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
          >
            {event ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};
