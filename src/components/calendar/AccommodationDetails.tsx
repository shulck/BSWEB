import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AccommodationDetailsProps {
 hotelName?: string;
 hotelAddress?: string;
 hotelCheckIn?: Date;
 hotelCheckOut?: Date;
 onHotelNameChange: (value: string) => void;
 onHotelAddressChange: (value: string) => void;
 onCheckInChange: (value: Date) => void;
 onCheckOutChange: (value: Date) => void;
}

export const AccommodationDetails: React.FC<AccommodationDetailsProps> = ({
 hotelName = '',
 hotelAddress = '',
 hotelCheckIn,
 hotelCheckOut,
 onHotelNameChange,
 onHotelAddressChange,
 onCheckInChange,
 onCheckOutChange
}) => {
 const openInMaps = () => {
   if (hotelAddress) {
     const encodedAddress = encodeURIComponent(hotelAddress);
     const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
     window.open(url, '_blank');
   }
 };

 const getDirections = () => {
   if (hotelAddress) {
     const encodedAddress = encodeURIComponent(hotelAddress);
     const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
     window.open(url, '_blank');
   }
 };

 const formatDateTimeLocal = (date?: Date) => {
   if (!date) return '';
   const offset = date.getTimezoneOffset() * 60000;
   const localDate = new Date(date.getTime() - offset);
   return localDate.toISOString().slice(0, 16);
 };

 const parseDateTimeLocal = (value: string) => {
   return value ? new Date(value) : new Date();
 };

 return (
   <div className="space-y-4">
     <Input
       label="Hotel Name"
       value={hotelName}
       onChange={(e) => onHotelNameChange(e.target.value)}
       placeholder="Enter hotel name"
     />

     <div className="space-y-2">
       <Input
         label="Hotel Address"
         value={hotelAddress}
         onChange={(e) => onHotelAddressChange(e.target.value)}
         placeholder="Enter hotel address"
       />
       
       {hotelAddress && (
         <div className="flex space-x-2">
           <Button
             type="button"
             variant="secondary"
             size="sm"
             onClick={openInMaps}
           >
             📍 View on Map
           </Button>
           <Button
             type="button"
             variant="secondary"
             size="sm"
             onClick={getDirections}
           >
             🧭 Get Directions
           </Button>
         </div>
       )}
     </div>

     {hotelName && (
       <>
         <Input
           label="Check-in Date & Time"
           type="datetime-local"
           value={formatDateTimeLocal(hotelCheckIn)}
           onChange={(e) => onCheckInChange(parseDateTimeLocal(e.target.value))}
         />

         <Input
           label="Check-out Date & Time"
           type="datetime-local"
           value={formatDateTimeLocal(hotelCheckOut)}
           onChange={(e) => onCheckOutChange(parseDateTimeLocal(e.target.value))}
         />
       </>
     )}
   </div>
 );
};
