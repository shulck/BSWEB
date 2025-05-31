import React, { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface LocationDetails {
 address: string;
 lat?: number;
 lng?: number;
}

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
 const [showModal, setShowModal] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [searchResults, setSearchResults] = useState<LocationDetails[]>([]);
 const [isSearching, setIsSearching] = useState(false);

 const searchLocations = useCallback(async (query: string) => {
   if (!query.trim()) return;
   
   setIsSearching(true);
   try {
     const response = await fetch(
       `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
     );
     const data = await response.json();
     
     if (data.results) {
       const results = data.results.slice(0, 5).map((place: any) => ({
         address: place.formatted_address,
         lat: place.geometry.location.lat,
         lng: place.geometry.location.lng
       }));
       setSearchResults(results);
     }
   } catch (error) {
     console.error('Location search error:', error);
   } finally {
     setIsSearching(false);
   }
 }, []);

 const selectLocation = (location: LocationDetails) => {
   onChange(location.address);
   setShowModal(false);
 };

 return (
   <>
     <div className="flex space-x-2">
       <Input
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder}
         className="flex-1"
       />
       <Button
         type="button"
         variant="secondary"
         onClick={() => setShowModal(true)}
       >
         📍 Map
       </Button>
     </div>

     <Modal
       isOpen={showModal}
       onClose={() => setShowModal(false)}
       title="Select Location"
       size="lg"
     >
       <div className="space-y-4">
         <div className="flex space-x-2">
           <Input
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search for places..."
             className="flex-1"
           />
           <Button
             onClick={() => searchLocations(searchQuery)}
             disabled={isSearching}
           >
             {isSearching ? 'Searching...' : 'Search'}
           </Button>
         </div>

         {searchResults.length > 0 && (
           <div className="space-y-2 max-h-60 overflow-y-auto">
             {searchResults.map((location, index) => (
               <button
                 key={index}
                 onClick={() => selectLocation(location)}
                 className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
               >
                 <div className="font-medium">{location.address}</div>
               </button>
             ))}
           </div>
         )}

         <div className="flex justify-end space-x-2">
           <Button variant="secondary" onClick={() => setShowModal(false)}>
             Cancel
           </Button>
         </div>
       </div>
     </Modal>
   </>
 );
};
