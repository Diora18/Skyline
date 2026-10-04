import React, { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DateTimePicker({
  value,
  onChange,
  name,
  id,
  placeholder = 'Select date & time...',
  className,
  required = false,
  disabled = false,
  dateOnly = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial value (expected YYYY-MM-DDTHH:mm or ISO or YYYY-MM-DD)
  const initialDate = React.useMemo(() => {
    if (!value) return new Date();
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [value]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

  // Time state
  const [hours, setHours] = useState(initialDate.getHours());
  const [minutes, setMinutes] = useState(initialDate.getMinutes());

  // Sync internal state if external value changes
  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
        setHours(parsed.getHours());
        setMinutes(parsed.getMinutes());
      }
    }
  }, [value]);

  const [openUpward, setOpenUpward] = useState(false);
  const [openRightAligned, setOpenRightAligned] = useState(false);

  // Auto-detect viewport boundaries so popover never gets cut off
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const popoverHeight = dateOnly ? 290 : 360;

      if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }

      if (rect.left + 320 > window.innerWidth && rect.right - 320 >= 0) {
        setOpenRightAligned(true);
      } else {
        setOpenRightAligned(false);
      }
    }
  }, [isOpen, dateOnly]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date-time for display
  const displayFormatted = React.useMemo(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return '';
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    if (dateOnly) {
      return `${day}-${month}-${year}`;
    }
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${day}-${month}-${year} ${hh}:${mm}`;
  }, [selectedDate, hours, minutes, dateOnly]);

  // Helper to emit datetime-local or date format: YYYY-MM-DD or YYYY-MM-DDTHH:mm
  const emitChange = (dateObj, h = hours, m = minutes) => {
    if (!dateObj) return;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    let stringVal = '';
    if (dateOnly) {
      stringVal = `${year}-${month}-${day}`;
    } else {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      stringVal = `${year}-${month}-${day}T${hh}:${mm}`;
    }

    if (onChange) {
      onChange({
        target: {
          name: name || id || '',
          value: stringVal,
        },
      });
    }
  };

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Calendar days grid computation
  const calendarDays = React.useMemo(() => {
    const days = [];
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(viewYear, viewMonth, i),
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(viewYear, viewMonth + 1, i),
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handleDaySelect = (dayObj) => {
    const newDate = new Date(
      dayObj.date.getFullYear(),
      dayObj.date.getMonth(),
      dayObj.day,
      hours,
      minutes
    );
    setSelectedDate(newDate);
    emitChange(newDate, hours, minutes);
  };

  const handleTimeChange = (newHours, newMinutes) => {
    setHours(newHours);
    setMinutes(newMinutes);
    const dateToUse = selectedDate || new Date();
    setSelectedDate(dateToUse);
    emitChange(dateToUse, newHours, newMinutes);
  };

  const isToday = (dayObj) => {
    const today = new Date();
    return (
      dayObj.isCurrentMonth &&
      dayObj.day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  };

  const isSelectedDay = (dayObj) => {
    if (!selectedDate) return false;
    return (
      dayObj.isCurrentMonth &&
      dayObj.day === selectedDate.getDate() &&
      viewMonth === selectedDate.getMonth() &&
      viewYear === selectedDate.getFullYear()
    );
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
      {/* Hidden input for form submission */}
      <input
        id={id}
        name={name}
        type="hidden"
        value={value || ''}
        required={required}
      />

      {/* Styled Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-xl border border-input bg-card px-3.5 text-xs font-semibold text-foreground transition-all duration-200 outline-none',
          'hover:border-primary/50 hover:bg-muted/40 focus:ring-2 focus:ring-primary/40 focus:border-primary',
          isOpen && 'border-primary ring-2 ring-primary/30 shadow-md',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className={cn('truncate', !displayFormatted && 'text-muted-foreground/70')}>
          {displayFormatted || placeholder}
        </span>
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 ml-2 shrink-0">
          <CalendarDays className="size-4" />
        </div>
      </button>

      {/* Theme Floating Calendar Popover */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 w-80 rounded-2xl border border-border/80 bg-card p-4 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150',
            openUpward ? 'bottom-full mb-2 top-auto' : 'top-full mt-2 bottom-auto',
            openRightAligned ? 'right-0 left-auto' : 'left-0 right-auto'
          )}
        >
          {/* Header Month & Year Navigator */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="flex size-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="text-sm font-bold text-foreground">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="flex size-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              title="Next Month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/70">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-4">
            {calendarDays.map((d, index) => {
              const selected = isSelectedDay(d);
              const today = isToday(d);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDaySelect(d)}
                  className={cn(
                    'h-8 w-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all duration-150 mx-auto select-none',
                    !d.isCurrentMonth && 'text-muted-foreground/30 hover:text-foreground/50',
                    d.isCurrentMonth && !selected && 'text-foreground hover:bg-primary/15 hover:text-primary hover:scale-105',
                    today && !selected && 'border border-primary text-primary font-bold',
                    selected && 'bg-primary text-primary-foreground font-extrabold shadow-md shadow-primary/30 scale-105'
                  )}
                >
                  {d.day}
                </button>
              );
            })}
          </div>

          {/* Time Picker Section */}
          <div className="border-t border-border/80 pt-3 space-y-2">
            {!dateOnly && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" /> Time
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Hours Select */}
                  <select
                    value={hours}
                    onChange={(e) => handleTimeChange(Number(e.target.value), minutes)}
                    className="rounded-lg border border-input bg-background px-2 py-1 text-xs font-bold text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>

                  <span className="text-xs font-bold text-muted-foreground">:</span>

                  {/* Minutes Select */}
                  <select
                    value={minutes}
                    onChange={(e) => handleTimeChange(hours, Number(e.target.value))}
                    className="rounded-lg border border-input bg-background px-2 py-1 text-xs font-bold text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                      <option key={m} value={m}>
                        {String(m).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Quick Action Footer */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setSelectedDate(now);
                  setHours(now.getHours());
                  setMinutes(now.getMinutes());
                  setViewYear(now.getFullYear());
                  setViewMonth(now.getMonth());
                  emitChange(now, now.getHours(), now.getMinutes());
                }}
                className="text-primary font-bold hover:underline text-[11px]"
              >
                Set Today
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
