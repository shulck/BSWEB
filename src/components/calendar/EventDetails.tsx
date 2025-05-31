import React from 'react';
import { Event, EventType } from '../../types';
import { Button } from '../ui/Button';
import { EventMapView } from './EventMapView';

interface Contact {
 role: string;
 name: string;
 email: string;
 phone: string;
}

interface EventDetailsProps {
 event: Event;
 onEdit: () => void;
 onDelete: () => void;
 canEdit?: boolean;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
 event,
 onEdit,
 onDelete,
 canEdit = true,
}) => {
 const formatDate = (date: Date) => {
   return new Date(date).toLocaleDateString('en-US', {
     weekday: 'long',
     year: 'numeric',
     month: 'long',
     day: 'numeric',
   });
 };

 const formatTime = (date: Date) => {
   return new Date(date).toLocaleTimeString('en-US', {
     hour: '2-digit',
     minute: '2-digit',
   });
 };

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

 const getStatusColor = (status: string) => {
   return status === 'Confirmed' 
     ? 'bg-green-100 text-green-800' 
     : 'bg-yellow-100 text-yellow-800';
 };

 const contacts: Contact[] = [];
 
 if (event.organizerName || event.organizerEmail || event.organizerPhone) {
   contacts.push({
     role: 'Organizer',
     name: event.organizerName || '',
     email: event.organizerEmail || '',
     phone: event.organizerPhone || '',
   });
 }

 if (event.coordinatorName || event.coordinatorEmail || event.coordinatorPhone) {
   contacts.push({
     role: 'Coordinator',
     name: event.coordinatorName || '',
     email: event.coordinatorEmail || '',
     phone: event.coordinatorPhone || '',
   });
 }

 const openInMaps = (address: string) => {
   const encodedAddress = encodeURIComponent(address);
   const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
   window.open(url, '_blank');
 };

 const getDirections = (address: string) => {
   const encodedAddress = encodeURIComponent(address);
   const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
   window.open(url, '_blank');
 };

 return (
   <div className="max-h-[80vh] overflow-y-auto space-y-6">
     <div className="flex items-start justify-between sticky top-0 bg-white z-10 pb-4 border-b">
       <div>
         <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
         <div className="flex items-center space-x-2 mt-2">
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
             {event.type}
           </span>
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
             {event.status}
           </span>
           {event.isPersonal && (
             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
               Personal
             </span>
           )}
         </div>
       </div>

       {canEdit && (
         <div className="flex space-x-2">
           <Button variant="secondary" size="sm" onClick={onEdit}>
             Edit
           </Button>
           <Button variant="danger" size="sm" onClick={onDelete}>
             Delete
           </Button>
         </div>
       )}
     </div>

     <div className="bg-gray-50 rounded-lg p-4">
       <h3 className="font-medium text-gray-900 mb-2">Date & Time</h3>
       <p className="text-gray-700">{formatDate(event.date)}</p>
       <p className="text-gray-700">{formatTime(event.date)}</p>
     </div>

     {event.location && (
       <div>
         <h3 className="font-medium text-gray-900 mb-3">Location</h3>
         <div className="space-y-3">
           <div className="bg-gray-50 rounded-lg p-4">
             <p className="text-gray-700 mb-3">📍 {event.location}</p>
             <div className="flex space-x-2">
               <Button
                 variant="secondary"
                 size="sm"
                 onClick={() => openInMaps(event.location!)}
               >
                 View on Map
               </Button>
               <Button
                 variant="secondary"
                 size="sm"
                 onClick={() => getDirections(event.location!)}
               >
                 Get Directions
               </Button>
             </div>
           </div>
           <EventMapView event={event} height={250} />
         </div>
       </div>
     )}

     {event.schedule && event.schedule.length > 0 && (
       <div>
         <h3 className="font-medium text-gray-900 mb-3">Schedule</h3>
         <div className="bg-blue-50 rounded-lg p-4">
           <div className="space-y-3">
             {event.schedule.map((item, index) => {
               const match = item.match(/(\d{2}:\d{2})\s*-\s*([^(]+)(?:\s*\((\d+)\s*min\))?\s*:?\s*(.*)?/);
               if (match) {
                 const [, time, activity, duration, description] = match;
                 return (
                   <div key={index} className="flex items-start space-x-4 p-3 bg-white rounded border-l-4 border-blue-400">
                     <div className="flex-shrink-0">
                       <span className="text-sm font-medium text-blue-600">{time}</span>
                     </div>
                     <div className="flex-grow">
                       <div className="flex items-center space-x-2">
                         <span className="font-medium text-gray-900">{activity.trim()}</span>
                         {duration && (
                           <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                             {duration} min
                           </span>
                         )}
                       </div>
                       {description && description.trim() && (
                         <p className="text-sm text-gray-600 mt-1">{description.trim()}</p>
                       )}
                     </div>
                   </div>
                 );
               } else {
                 return (
                   <div key={index} className="p-3 bg-white rounded border-l-4 border-blue-400">
                     <span className="text-gray-900">{item}</span>
                   </div>
                 );
               }
             })}
           </div>
         </div>
       </div>
     )}

     {contacts.length > 0 && (
       <div>
         <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {contacts.map((contact, index) => (
             <div key={index} className="bg-gray-50 rounded-lg p-4">
               <h4 className="font-medium text-gray-700 mb-2">{contact.role}</h4>
               {contact.name && (
                 <p className="text-gray-900">{contact.name}</p>
               )}
               {contact.email && (
                 <p className="text-gray-700">📧 {contact.email}</p>
               )}
               {contact.phone && (
                 <p className="text-gray-700">📞 {contact.phone}</p>
               )}
             </div>
           ))}
         </div>
       </div>
     )}

     {event.hotelName && (
       <div>
         <h3 className="font-medium text-gray-900 mb-3">Accommodation</h3>
         <div className="bg-gray-50 rounded-lg p-4">
           <p className="text-gray-900 font-medium">{event.hotelName}</p>
           {event.hotelAddress && (
             <div className="mt-2">
               <p className="text-gray-700">📍 {event.hotelAddress}</p>
               <div className="flex space-x-2 mt-2">
                 <Button
                   variant="secondary"
                   size="sm"
                   onClick={() => openInMaps(event.hotelAddress!)}
                 >
                   View on Map
                 </Button>
                 <Button
                   variant="secondary"
                   size="sm"
                   onClick={() => getDirections(event.hotelAddress!)}
                 >
                   Get Directions
                 </Button>
               </div>
             </div>
           )}
           {(event.hotelCheckIn || event.hotelCheckOut) && (
             <div className="mt-2 text-gray-700">
               {event.hotelCheckIn && (
                 <p>Check-in: {formatDate(event.hotelCheckIn)} {formatTime(event.hotelCheckIn)}</p>
               )}
               {event.hotelCheckOut && (
                 <p>Check-out: {formatDate(event.hotelCheckOut)} {formatTime(event.hotelCheckOut)}</p>
               )}
             </div>
           )}
         </div>
       </div>
     )}

     {event.fee && (
       <div>
         <h3 className="font-medium text-gray-900 mb-3">Financial Details</h3>
         <div className="bg-gray-50 rounded-lg p-4">
           <p className="text-gray-900 font-medium">
             Fee: {event.fee} {event.currency || 'USD'}
           </p>
         </div>
       </div>
     )}

     {event.notes && (
       <div>
         <h3 className="font-medium text-gray-900 mb-3">Notes</h3>
         <div className="bg-gray-50 rounded-lg p-4">
           <p className="text-gray-700 whitespace-pre-wrap">{event.notes}</p>
         </div>
       </div>
     )}
   </div>
 );
};
