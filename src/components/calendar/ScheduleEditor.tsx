import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface ScheduleItem {
 id: string;
 time: string;
 activity: string;
 duration: number;
 notes?: string;
}

interface ScheduleEditorProps {
 schedule?: string[];
 onChange: (schedule: string[]) => void;
}

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
 schedule = [],
 onChange
}) => {
 const [showModal, setShowModal] = useState(false);
 const [items, setItems] = useState<ScheduleItem[]>(() => {
   return schedule.map((item, index) => {
     const match = item.match(/(\d{2}:\d{2})\s*-\s*([^(]+)(?:\s*\((\d+)\s*min\))?\s*:?\s*(.*)?/);
     if (match) {
       return {
         id: `item-${index}`,
         time: match[1],
         activity: match[2].trim(),
         duration: parseInt(match[3]) || 60,
         notes: match[4]?.trim() || ''
       };
     }
     return {
       id: `item-${index}`,
       time: '',
       activity: item,
       duration: 60,
       notes: ''
     };
   });
 });

 const addItem = () => {
   const newItem: ScheduleItem = {
     id: `item-${Date.now()}`,
     time: '',
     activity: '',
     duration: 60,
     notes: ''
   };
   setItems([...items, newItem]);
 };

 const updateItem = (id: string, field: keyof ScheduleItem, value: string | number) => {
   setItems(items.map(item => 
     item.id === id ? { ...item, [field]: value } : item
   ));
 };

 const removeItem = (id: string) => {
   setItems(items.filter(item => item.id !== id));
 };

 const saveSchedule = () => {
   const scheduleStrings = items
     .filter(item => item.activity.trim())
     .map(item => {
       let scheduleString = '';
       if (item.time) {
         scheduleString += `${item.time} - `;
       }
       scheduleString += item.activity;
       if (item.duration && item.duration !== 60) {
         scheduleString += ` (${item.duration} min)`;
       }
       if (item.notes) {
         scheduleString += `: ${item.notes}`;
       }
       return scheduleString;
     });
   
   onChange(scheduleStrings);
   setShowModal(false);
 };

 const activityPresets = [
   'Load In',
   'Sound Check',
   'Rehearsal',
   'Performance',
   'Meet & Greet',
   'Interview',
   'Photo Shoot',
   'Break',
   'Meal',
   'Travel',
   'Setup',
   'Breakdown',
   'Load Out'
 ];

 return (
   <>
     <div className="space-y-2">
       <div className="flex justify-between items-center">
         <span className="text-sm font-medium text-gray-700">Schedule</span>
         <Button
           type="button"
           variant="secondary"
           size="sm"
           onClick={() => setShowModal(true)}
         >
           {schedule.length > 0 ? 'Edit Schedule' : 'Add Schedule'}
         </Button>
       </div>
       
       {schedule.length > 0 && (
         <div className="bg-gray-50 rounded-lg p-3 space-y-1">
           {schedule.slice(0, 3).map((item, index) => (
             <div key={index} className="text-sm text-gray-700">
               • {item}
             </div>
           ))}
           {schedule.length > 3 && (
             <div className="text-sm text-gray-500">
               +{schedule.length - 3} more items
             </div>
           )}
         </div>
       )}
     </div>

     <Modal
       isOpen={showModal}
       onClose={() => setShowModal(false)}
       title="Edit Schedule"
       size="xl"
     >
       <div className="space-y-4 max-h-96 overflow-y-auto">
         {items.map((item, index) => (
           <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-lg">
             <Input
               type="time"
               value={item.time}
               onChange={(e) => updateItem(item.id, 'time', e.target.value)}
               className="col-span-2"
               placeholder="Time"
             />
             
             <div className="col-span-4">
               <Input
                 value={item.activity}
                 onChange={(e) => updateItem(item.id, 'activity', e.target.value)}
                 placeholder="Activity"
                 list={`activities-${item.id}`}
               />
               <datalist id={`activities-${item.id}`}>
                 {activityPresets.map(preset => (
                   <option key={preset} value={preset} />
                 ))}
               </datalist>
             </div>
             
             <Input
               type="number"
               value={item.duration}
               onChange={(e) => updateItem(item.id, 'duration', parseInt(e.target.value) || 60)}
               className="col-span-2"
               placeholder="Min"
               min="1"
             />
             
             <Input
               value={item.notes || ''}
               onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
               className="col-span-3"
               placeholder="Notes"
             />
             
             <Button
               type="button"
               variant="danger"
               size="sm"
               onClick={() => removeItem(item.id)}
               className="col-span-1"
             >
               ×
             </Button>
           </div>
         ))}
         
         <Button
           type="button"
           variant="secondary"
           onClick={addItem}
           className="w-full"
         >
           + Add Item
         </Button>
       </div>
       
       <div className="flex justify-end space-x-2 pt-4 border-t">
         <Button variant="secondary" onClick={() => setShowModal(false)}>
           Cancel
         </Button>
         <Button onClick={saveSchedule}>
           Save Schedule
         </Button>
       </div>
     </Modal>
   </>
 );
};
