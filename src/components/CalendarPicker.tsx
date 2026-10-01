import React, { useState } from 'react';

interface CalendarPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  className?: string;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ 
  selectedDate, 
  onSelectDate,
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date(selectedDate);
    d.setDate(1); // Start at the beginning of the selected month
    return d;
  });

  // Function to get ordinal suffix (st, nd, rd, th)
  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Format date as "Oct 4th" with ordinal indicator as superscript
  const formatDateWithOrdinal = (date: Date): JSX.Element => {
    const month = date.toLocaleDateString('default', { month: 'short' });
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    
    return (
      <span>
        {month} {day}<sup>{suffix}</sup>
      </span>
    );
  };

  // Get all Sundays in and around the current month
  const getAllSundays = (): Date[] => {
    const sundays: Date[] = [];
    
    // Calculate the first Sunday that appears in our view (could be from previous month)
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    
    // Calculate the first Sunday to display (may be from previous month)
    let firstSunday = new Date(firstDayOfMonth);
    if (dayOfWeek !== 0) {
      firstSunday.setDate(firstDayOfMonth.getDate() - dayOfWeek); // Go back to the Sunday before
    }
    
    // Calculate the last Sunday to display (may be from next month)
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0); // Last day of month
    const lastDayOfWeek = endDate.getDay();
    let lastSunday = new Date(endDate);
    if (lastDayOfWeek !== 0) {
      lastSunday.setDate(endDate.getDate() + (7 - lastDayOfWeek)); // Go forward to the next Sunday
    }
    
    // Now iterate from the first Sunday to the last Sunday
    let currentSunday = new Date(firstSunday);
    while (currentSunday <= lastSunday) {
      sundays.push(new Date(currentSunday));
      currentSunday.setDate(currentSunday.getDate() + 7);
    }
    
    return sundays;
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const goToToday = () => {
    const today = new Date();
    today.setDate(1);
    setCurrentMonth(today);
  };

  // Get all Sundays for the calendar
  const sundays = getAllSundays();

  return (
    <div className={`calendar-picker ${className}`}>
      <div className="calendar-header">
        <button onClick={goToPreviousMonth}>&lt;</button>
        <h3>
          {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={goToNextMonth}>&gt;</button>
        <button onClick={goToToday}>Today</button>
      </div>
      
      <div className="calendar-grid">
        <div className="calendar-day-header">Sun</div>
        
        {sundays.map((sunday) => (
          <button
            key={sunday.getTime()} // Using timestamp as key to ensure uniqueness
            className={`calendar-day ${
              selectedDate.toDateString() === sunday.toDateString() ? 'selected' : ''
            }`}
            onClick={() => onSelectDate(sunday)}
          >
            {formatDateWithOrdinal(sunday)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarPicker;