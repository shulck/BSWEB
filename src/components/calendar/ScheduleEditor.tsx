import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

interface ScheduleEditorProps {
  schedule?: string[];
  onChange: (schedule: string[]) => void;
}

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
  schedule = [],
  onChange
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [scheduleText, setScheduleText] = useState(schedule.join('\n'));

  const saveSchedule = () => {
    const lines = scheduleText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    onChange(lines);
    setShowEditor(false);
  };

  const handleCancel = () => {
    setScheduleText(schedule.join('\n'));
    setShowEditor(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Schedule</span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setShowEditor(true)}
        >
          {schedule.length > 0 ? 'Edit Schedule' : 'Add Schedule'}
        </Button>
      </div>
      
      {schedule.length > 0 && !showEditor && (
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

      {showEditor && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <Textarea
            label="Schedule Items"
            value={scheduleText}
            onChange={(e) => setScheduleText(e.target.value)}
            rows={8}
            placeholder="Enter schedule items, one per line:&#10;10:00 - Load In&#10;11:00 - Sound Check (30 min)&#10;12:00 - Rehearsal: Special notes&#10;..."
            helperText="Format: Time - Activity (Duration): Notes"
          />
          
          <div className="flex justify-end space-x-2 mt-3">
            <Button variant="secondary" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveSchedule}>
              Save Schedule
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
