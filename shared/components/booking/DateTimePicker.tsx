"use client";
import React, { useState, useMemo } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../utils';

interface TimeSlot {
  time: string;
  available: boolean;
  price?: number; // Optional surge pricing
}

interface DateTimePickerProps {
  selectedDate?: Date;
  selectedTime?: string;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  unavailableDates?: Date[];
  timeSlots?: TimeSlot[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  unavailableDates = [],
  timeSlots = [],
  minDate = new Date(),
  maxDate,
  className
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Default time slots if none provided
  const defaultTimeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: true },
    { time: '10:30', available: false },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '12:00', available: false },
    { time: '12:30', available: false },
    { time: '13:00', available: true },
    { time: '13:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: false },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
    { time: '17:00', available: true },
    { time: '17:30', available: true },
    { time: '18:00', available: false },
  ];

  const availableTimeSlots = timeSlots.length > 0 ? timeSlots : defaultTimeSlots;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate => 
      date.toDateString() === unavailableDate.toDateString()
    );
  };

  const isDateDisabled = (date: Date) => {
    if (!date) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    return isDateUnavailable(date);
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate || !date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Date & Time</h2>
        <p className="text-muted-foreground">
          Choose your preferred appointment date and time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Select Date</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && !isDateDisabled(date) && onDateSelect(date)}
                  disabled={!date || isDateDisabled(date)}
                  className={cn(
                    'h-10 w-full text-sm rounded-lg transition-all duration-200',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    !date && 'invisible',
                    date && isDateDisabled(date) && 'text-muted-foreground/50 cursor-not-allowed',
                    date && isDateSelected(date) && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    date && !isDateDisabled(date) && !isDateSelected(date) && 'hover:bg-accent'
                  )}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-primary rounded-full"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-muted-foreground/30 rounded-full"></div>
                    <span>Unavailable</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Select Time</h3>
            </div>
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                Available times for {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="pt-0">
            {!selectedDate ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Please select a date first</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {availableTimeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && onTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className={cn(
                        'p-3 rounded-lg text-sm font-medium transition-all duration-200',
                        'border border-border hover:border-primary/50',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        !slot.available && 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60',
                        slot.available && selectedTime === slot.time && 'bg-primary text-primary-foreground border-primary',
                        slot.available && selectedTime !== slot.time && 'hover:bg-accent hover:text-accent-foreground',
                        slot.price && slot.available && 'relative'
                      )}
                    >
                      <div className="text-center">
                        <div className="font-medium">{formatTime(slot.time)}</div>
                        {slot.price && (
                          <div className="text-xs text-primary mt-1">
                            +${slot.price}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Available times</span>
                    <span>{availableTimeSlots.filter(s => s.available).length} slots</span>
                  </div>
                  
                  {selectedTime && (
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-primary">
                            {formatTime(selectedTime)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {selectedDate.toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                        <Badge variant="secondary" size="sm">
                          Selected
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
