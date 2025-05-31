import React from 'react';
import { Event, EventType } from '../../types';

interface CalendarGridProps {
  currentDate: Date;
  events: Event[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  events,
  onDateClick,
  onEventClick,
}) => {
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Получаем первый день месяца и количество дней
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  // Создаем массив дней для отображения
  const days = [];
  
  // Добавляем пустые ячейки для дней предыдущего месяца
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  
  // Добавляем дни текущего месяца
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeColor = (type: EventType) => {
    const colors = {
      [EventType.CONCERT]: 'bg-red-500',
      [EventType.FESTIVAL]: 'bg-orange-500', 
      [EventType.REHEARSAL]: 'bg-green-500',
      [EventType.MEETING]: 'bg-blue-500',
      [EventType.INTERVIEW]: 'bg-purple-500',
      [EventType.PHOTOSHOOT]: 'bg-pink-500',
      [EventType.PERSONAL]: 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header с днями недели */}
      <div className="grid grid-cols-7 gap-0 border-b">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Сетка календаря */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-24 border-r border-b last:border-r-0"></div>;
          }

          const dayEvents = getEventsForDate(date);
          const isToday = date.toDateString() === today.toDateString();
          const isCurrentMonth = date.getMonth() === month;

          return (
            <div
              key={index}
              className={`h-24 border-r border-b last:border-r-0 p-1 cursor-pointer hover:bg-gray-50 ${
                !isCurrentMonth ? 'bg-gray-100' : ''
              }`}
              onClick={() => onDateClick(date)}
            >
              <div className={`text-sm ${isToday ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                {date.getDate()}
              </div>
              
              {/* События дня */}
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs px-1 py-0.5 rounded text-white truncate cursor-pointer ${getEventTypeColor(event.type)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
