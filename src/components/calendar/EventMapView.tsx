import React, { useEffect, useState } from 'react';
import { Event } from '../../types';

interface EventMapViewProps {
 event: Event;
 height?: number;
}

export const EventMapView: React.FC<EventMapViewProps> = ({ event, height = 300 }) => {
 const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

 useEffect(() => {
   if (event.location) {
     geocodeAddress(event.location);
   }
 }, [event.location]);

 const geocodeAddress = async (address: string) => {
   try {
     const response = await fetch(
       `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
     );
     const data = await response.json();
     
     if (data.results && data.results.length > 0) {
       const { lat, lng } = data.results[0].geometry.location;
       setCoordinates({ lat, lng });
     }
   } catch (error) {
     console.error('Geocoding error:', error);
   }
 };

 const openInMaps = () => {
   if (coordinates) {
     const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
     window.open(url, '_blank');
   }
 };

 if (!event.location) {
   return (
     <div className="bg-gray-100 rounded-lg p-4 text-center">
       <p className="text-gray-500">No location specified</p>
     </div>
   );
 }

 return (
   <div className="space-y-2">
     {coordinates ? (
       <div className="relative">
         <iframe title="Event Location Map"
           src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${coordinates.lat},${coordinates.lng}&zoom=15`}
           width="100%"
           height={height}
           className="rounded-lg border-0"
           allowFullScreen
           loading="lazy"
           referrerPolicy="no-referrer-when-downgrade"
         />
         <button
           onClick={openInMaps}
           className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
         >
           Get Directions
         </button>
       </div>
     ) : (
       <div className="bg-gray-100 rounded-lg p-4 text-center" style={{ height }}>
         <p className="text-gray-500">Loading map...</p>
       </div>
     )}
   </div>
 );
};
