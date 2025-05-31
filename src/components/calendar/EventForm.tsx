import React, { useState, useEffect } from 'react';
import { Event, EventType, EventStatus } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { LocationPicker } from './LocationPicker';
import { ScheduleEditor } from './ScheduleEditor';
import { ContactsEditor } from './ContactsEditor';
import { AccommodationDetails } from './AccommodationDetails';
import { RecurringEventOptions } from './RecurringEventOptions';

interface EventContact {
 id: string;
 name: string;
 email: string;
 phone: string;
 role: string;
}

interface EventFormProps {
 event?: Event | null;
 selectedDate?: Date | null;
 onSubmit: (events: Omit<Event, 'id'>[]) => void;
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
   date: selectedDate || new Date(),
   type: EventType.REHEARSAL,
   status: EventStatus.BOOKED,
   location: '',
   hotelName: '',
   hotelAddress: '',
   hotelCheckIn: new Date(),
   hotelCheckOut: new Date(),
   fee: '',
   currency: 'USD',
   notes: '',
   organizerName: '',
   organizerEmail: '',
   organizerPhone: '',
   coordinatorName: '',
   coordinatorEmail: '',
   coordinatorPhone: '',
   isPersonal: false,
 });

 const [schedule, setSchedule] = useState<string[]>([]);
 const [additionalContacts, setAdditionalContacts] = useState<EventContact[]>([]);
 const [isRecurring, setIsRecurring] = useState(false);
 const [endDate, setEndDate] = useState(new Date());
 const [errors, setErrors] = useState<Record<string, string>>({});

 useEffect(() => {
   if (event) {
     setFormData({
       title: event.title,
       date: new Date(event.date),
       type: event.type,
       status: event.status,
       location: event.location || '',
       hotelName: event.hotelName || '',
       hotelAddress: event.hotelAddress || '',
       hotelCheckIn: event.hotelCheckIn || new Date(),
       hotelCheckOut: event.hotelCheckOut || new Date(),
       fee: event.fee?.toString() || '',
       currency: event.currency || 'USD',
       notes: event.notes || '',
       organizerName: event.organizerName || '',
       organizerEmail: event.organizerEmail || '',
       organizerPhone: event.organizerPhone || '',
       coordinatorName: event.coordinatorName || '',
       coordinatorEmail: event.coordinatorEmail || '',
       coordinatorPhone: event.coordinatorPhone || '',
       isPersonal: event.isPersonal,
     });
     setSchedule(event.schedule || []);
   } else {
     const nextDay = new Date(formData.date);
     nextDay.setDate(nextDay.getDate() + 1);
     setEndDate(nextDay);
   }
 }, [event, formData.date]);

 const validateForm = () => {
   const newErrors: Record<string, string> = {};

   if (!formData.title.trim()) {
     newErrors.title = 'Title is required';
   }

   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
 };

 const createEventData = (date: Date): Omit<Event, 'id'> => {
   return {
     title: formData.title.trim(),
     date,
     type: formData.type,
     status: formData.status,
     location: formData.location.trim() || undefined,
     organizerName: formData.organizerName.trim() || undefined,
     organizerEmail: formData.organizerEmail.trim() || undefined,
     organizerPhone: formData.organizerPhone.trim() || undefined,
     coordinatorName: formData.coordinatorName.trim() || undefined,
     coordinatorEmail: formData.coordinatorEmail.trim() || undefined,
     coordinatorPhone: formData.coordinatorPhone.trim() || undefined,
     hotelName: formData.hotelName.trim() || undefined,
     hotelAddress: formData.hotelAddress.trim() || undefined,
     hotelCheckIn: formData.hotelName ? formData.hotelCheckIn : undefined,
     hotelCheckOut: formData.hotelName ? formData.hotelCheckOut : undefined,
     fee: formData.fee ? parseFloat(formData.fee) : undefined,
     currency: formData.currency,
     notes: formData.notes.trim() || undefined,
     schedule: schedule.length > 0 ? schedule : undefined,
     setlistId: undefined,
     groupId: '',
     isPersonal: formData.isPersonal,
   };
 };

 const generateRecurringEvents = (): Omit<Event, 'id'>[] => {
   if (!isRecurring) {
     return [createEventData(formData.date)];
   }

   const events: Omit<Event, 'id'>[] = [];
   const start = new Date(formData.date);
   const end = new Date(endDate);
   
   const timeComponents = {
     hours: start.getHours(),
     minutes: start.getMinutes()
   };

   for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
     const eventDate = new Date(currentDate);
     eventDate.setHours(timeComponents.hours, timeComponents.minutes, 0, 0);
     
     events.push(createEventData(eventDate));
   }

   return events;
 };

 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault();
   
   if (!validateForm()) return;

   const events = generateRecurringEvents();
   onSubmit(events);
 };

 const eventTypeOptions = Object.values(EventType).map(type => ({
   value: type,
   label: type,
 }));

 const eventStatusOptions = Object.values(EventStatus).map(status => ({
   value: status,
   label: status,
 }));

 const showOrganizerSection = [EventType.CONCERT, EventType.FESTIVAL, EventType.INTERVIEW, EventType.PHOTOSHOOT].includes(formData.type);
 const showCoordinatorSection = [EventType.CONCERT, EventType.FESTIVAL].includes(formData.type);
 const showAccommodationSection = [EventType.CONCERT, EventType.FESTIVAL, EventType.PHOTOSHOOT].includes(formData.type);
 const showFeeSection = [EventType.CONCERT, EventType.FESTIVAL, EventType.INTERVIEW, EventType.PHOTOSHOOT].includes(formData.type);

 return (
   <div className="max-h-[80vh] overflow-y-auto">
     <form onSubmit={handleSubmit} className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Input
           label="Event Title*"
           value={formData.title}
           onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
           error={errors.title}
           placeholder="Enter event title"
         />

         <Select
           label="Event Type*"
           value={formData.type}
           onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as EventType }))}
           options={eventTypeOptions}
         />

         <Input
           label="Date & Time*"
           type="datetime-local"
           value={formData.date.toISOString().slice(0, 16)}
           onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
         />

         <Select
           label="Status"
           value={formData.status}
           onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as EventStatus }))}
           options={eventStatusOptions}
         />
       </div>

       <RecurringEventOptions
         isRecurring={isRecurring}
         endDate={endDate}
         onRecurringChange={setIsRecurring}
         onEndDateChange={setEndDate}
         startDate={formData.date}
       />

       <div>
         <LocationPicker
           value={formData.location}
           onChange={(location) => setFormData(prev => ({ ...prev, location }))}
           placeholder="Event location"
         />
       </div>

       <ScheduleEditor
         schedule={schedule}
         onChange={setSchedule}
       />

       {showOrganizerSection && (
         <div className="border-t pt-6">
           <h3 className="text-lg font-medium text-gray-900 mb-4">Organizer Information</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Input
               label="Name"
               value={formData.organizerName}
               onChange={(e) => setFormData(prev => ({ ...prev, organizerName: e.target.value }))}
               placeholder="Organizer name"
             />
             <Input
               label="Email"
               type="email"
               value={formData.organizerEmail}
               onChange={(e) => setFormData(prev => ({ ...prev, organizerEmail: e.target.value }))}
               placeholder="organizer@example.com"
             />
             <Input
               label="Phone"
               type="tel"
               value={formData.organizerPhone}
               onChange={(e) => setFormData(prev => ({ ...prev, organizerPhone: e.target.value }))}
               placeholder="+1234567890"
             />
           </div>
         </div>
       )}

       {showCoordinatorSection && (
         <div className="border-t pt-6">
           <h3 className="text-lg font-medium text-gray-900 mb-4">Coordinator Information</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Input
               label="Name"
               value={formData.coordinatorName}
               onChange={(e) => setFormData(prev => ({ ...prev, coordinatorName: e.target.value }))}
               placeholder="Coordinator name"
             />
             <Input
               label="Email"
               type="email"
               value={formData.coordinatorEmail}
               onChange={(e) => setFormData(prev => ({ ...prev, coordinatorEmail: e.target.value }))}
               placeholder="coordinator@example.com"
             />
             <Input
               label="Phone"
               type="tel"
               value={formData.coordinatorPhone}
               onChange={(e) => setFormData(prev => ({ ...prev, coordinatorPhone: e.target.value }))}
               placeholder="+1234567890"
             />
           </div>
         </div>
       )}

       <ContactsEditor
         contacts={additionalContacts}
         onChange={setAdditionalContacts}
       />

       {showAccommodationSection && (
         <div className="border-t pt-6">
           <h3 className="text-lg font-medium text-gray-900 mb-4">Accommodation</h3>
           <AccommodationDetails
             hotelName={formData.hotelName}
             hotelAddress={formData.hotelAddress}
             hotelCheckIn={formData.hotelCheckIn}
             hotelCheckOut={formData.hotelCheckOut}
             onHotelNameChange={(value) => setFormData(prev => ({ ...prev, hotelName: value }))}
             onHotelAddressChange={(value) => setFormData(prev => ({ ...prev, hotelAddress: value }))}
             onCheckInChange={(value) => setFormData(prev => ({ ...prev, hotelCheckIn: value }))}
             onCheckOutChange={(value) => setFormData(prev => ({ ...prev, hotelCheckOut: value }))}
           />
         </div>
       )}

       {showFeeSection && (
         <div className="border-t pt-6">
           <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Details</h3>
           <div className="grid grid-cols-2 gap-4">
             <Input
               label="Fee"
               type="number"
               step="0.01"
               value={formData.fee}
               onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
               placeholder="0.00"
             />
             <Input
               label="Currency"
               value={formData.currency}
               onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
               placeholder="USD"
             />
           </div>
         </div>
       )}

       <div className="border-t pt-6">
         <Textarea
           label="Notes"
           value={formData.notes}
           onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
           rows={3}
           placeholder="Additional notes..."
         />
       </div>

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
           {isRecurring ? `Create ${generateRecurringEvents().length} Events` : (event ? 'Update Event' : 'Create Event')}
         </Button>
       </div>
     </form>
   </div>
 );
};
