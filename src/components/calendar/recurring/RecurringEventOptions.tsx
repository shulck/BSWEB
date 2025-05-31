import React from 'react';
import { Input } from '../../ui/Input';

interface RecurringEventOptionsProps {
  isRecurring: boolean;
  endDate: Date;
  onRecurringChange: (isRecurring: boolean) => void;
  onEndDateChange: (endDate: Date) => void;
  startDate: Date;
}

export const RecurringEventOptions: React.FC<RecurringEventOptionsProps> = ({
  isRecurring,
  endDate,
  onRecurringChange,
  onEndDateChange,
  startDate
}) => {
  const calculateEventCount = () => {
    if (!isRecurring) return 1;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(1, diffDays + 1);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleEndDateChange = (value: string) => {
    const newEndDate = new Date(value);
    if (newEndDate >= startDate) {
      onEndDateChange(newEndDate);
    }
  };

  const eventCount = calculateEventCount();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="recurring"
          checked={isRecurring}
          onChange={(e) => onRecurringChange(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
          Create recurring events
        </label>
      </div>

      {isRecurring && (
        <div className="space-y-3 pl-6">
          <Input
            label="End Date"
            type="date"
            value={formatDateForInput(endDate)}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={formatDateForInput(startDate)}
          />
          
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>{eventCount}</strong> events will be created from{' '}
              <strong>{startDate.toLocaleDateString()}</strong> to{' '}
              <strong>{endDate.toLocaleDateString()}</strong>
            </p>
            
            {eventCount > 30 && (
              <p className="text-sm text-orange-600 mt-1">
                ⚠️ Creating many events may affect performance
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
