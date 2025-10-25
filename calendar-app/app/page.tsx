'use client';

import { useState } from 'react';

type Event = {
  id: string;
  type: string;
  color: string;
  time: number; // hour of the day (0-23)
  duration: number; // in hours
  title: string;
  notes?: string;
  date: Date;
  startTime: string;
  endTime: string;
  repeat: string;
  backup: boolean;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
};

type EventType = {
  name: string;
  color: string;
};

type Indicator = {
  id: string;
  label: string;
  numerator: number;
  denominator: number;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 3, 2)); // April 2, 2026
  const [indicators, setIndicators] = useState<Indicator[]>([
    { id: '1', label: 'Gospel Study', numerator: 5, denominator: 7 },
    { id: '2', label: 'Workout', numerator: 4, denominator: 7 },
    { id: '3', label: 'Work', numerator: 20, denominator: 40 },
    { id: '4', label: 'School', numerator: 15, denominator: 20 },
  ]);
  const [isEditingIndicators, setIsEditingIndicators] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(3); // April (0-indexed)
  const [pickerYear, setPickerYear] = useState(2026);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showEventTypeSelector, setShowEventTypeSelector] = useState(false);
  const [showEventDetailsForm, setShowEventDetailsForm] = useState(false);
  const [showEventSummary, setShowEventSummary] = useState(false);
  const [newEventTime, setNewEventTime] = useState<number>(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [showEventMenu, setShowEventMenu] = useState(false);

  // Drag and drop state
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previousEventState, setPreviousEventState] = useState<Event | null>(null);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);
  const [undoMessage, setUndoMessage] = useState('');

  // Clock time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<'start' | 'end'>('start');
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');
  const [clockMode, setClockMode] = useState<'hour' | 'minute'>('hour');

  // Event form state
  const [eventFormData, setEventFormData] = useState({
    type: '',
    color: '',
    title: '',
    notes: '',
    date: selectedDate,
    startTime: '7:30 AM',
    endTime: '8:00 AM',
    repeat: 'Does not repeat',
    backup: false,
    address: ''
  });

  const eventTypes: EventType[] = [
    { name: 'Relax', color: 'bg-green-400' },
    { name: 'School (Study)', color: 'bg-yellow-400' },
    { name: 'School (Class', color: 'bg-purple-300' },
    { name: 'Gospel (Church)', color: 'bg-pink-400' },
    { name: 'Gospel (Study)', color: 'bg-purple-500' },
    { name: 'Gospel (Meeting)', color: 'bg-gray-300' },
    { name: 'Work', color: 'bg-cyan-300' },
    { name: 'Travel', color: 'bg-pink-300' },
    { name: 'Meal', color: 'bg-orange-200' },
    { name: 'Workout', color: 'bg-gray-400' },
    { name: 'Other', color: 'bg-white' },
  ];

  const repeatOptions = ['Does not repeat', 'Daily', 'Weekly', 'Monthly', 'Yearly'];

  const handlePlusButtonClick = () => {
    const otherEventType = eventTypes.find(t => t.name === 'Other');
    setEventFormData({
      type: 'Other',
      color: otherEventType?.color || 'bg-gray-400',
      title: '',
      notes: '',
      date: selectedDate,
      startTime: '12:00 PM',
      endTime: '1:00 PM',
      repeat: 'Does not repeat',
      backup: false,
      address: ''
    });
    setIsEditingEvent(false);
    setSelectedEvent(null);
    setShowEventDetailsForm(true);
  };

  const handleCalendarClick = (hourIndex: number, event?: Event) => {
    // If clicking on an existing event, show summary instead
    if (event) {
      setSelectedEvent(event);
      setShowEventSummary(true);
      return;
    }

    // Otherwise, create new event
    setNewEventTime(hourIndex);
    const hour = hourIndex;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const startTime = `${displayHour}:00 ${period}`;

    const endHour = hourIndex + 1;
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    const endDisplayHour = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
    const endTime = `${endDisplayHour}:00 ${endPeriod}`;

    setEventFormData({
      type: '',
      color: '',
      title: '',
      notes: '',
      date: selectedDate,
      startTime,
      endTime,
      repeat: 'Does not repeat',
      backup: false,
      address: ''
    });
    setIsEditingEvent(false);
    setShowEventTypeSelector(true);
  };

  const handleEventTypeSelect = (eventType: EventType) => {
    setEventFormData({
      ...eventFormData,
      type: eventType.name,
      color: eventType.color
    });
    setShowEventTypeSelector(false);
    setShowEventDetailsForm(true);
  };

  const parseTimeToHour = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;

    let hour = parseInt(match[1]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    return hour;
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;

    let hour = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    return hour * 60 + minutes;
  };

  const calculateEventDuration = (startTime: string, endTime: string): number => {
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    const durationMinutes = endMinutes - startMinutes;
    return durationMinutes / 60; // Convert to hours
  };

  const calculateEventOffset = (startTime: string): number => {
    const match = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;

    const minutes = parseInt(match[2]);
    return minutes / 60; // Return fraction of hour for positioning
  };

  const handleSaveEvent = () => {
    const startHour = parseTimeToHour(eventFormData.startTime);
    const duration = calculateEventDuration(eventFormData.startTime, eventFormData.endTime);
    const now = new Date();

    if (isEditingEvent && selectedEvent) {
      // Update existing event
      const updatedEvents = events.map(evt =>
        evt.id === selectedEvent.id
          ? {
              ...evt,
              type: eventFormData.type,
              color: eventFormData.color,
              title: eventFormData.title || eventFormData.type,
              notes: eventFormData.notes,
              date: eventFormData.date,
              startTime: eventFormData.startTime,
              endTime: eventFormData.endTime,
              time: startHour,
              duration: duration,
              repeat: eventFormData.repeat,
              backup: eventFormData.backup,
              address: eventFormData.address,
              updatedAt: now
            }
          : evt
      );
      setEvents(updatedEvents);
    } else {
      // Create new event
      const newEvent: Event = {
        id: Date.now().toString(),
        type: eventFormData.type,
        color: eventFormData.color,
        time: startHour,
        duration: duration,
        title: eventFormData.title || eventFormData.type,
        notes: eventFormData.notes,
        date: eventFormData.date,
        startTime: eventFormData.startTime,
        endTime: eventFormData.endTime,
        repeat: eventFormData.repeat,
        backup: eventFormData.backup,
        address: eventFormData.address,
        createdAt: now,
        updatedAt: now
      };
      setEvents([...events, newEvent]);
    }

    setShowEventDetailsForm(false);
    setIsEditingEvent(false);
    setSelectedEvent(null);
    setEventFormData({
      type: '',
      color: '',
      title: '',
      notes: '',
      date: selectedDate,
      startTime: '7:30 AM',
      endTime: '8:00 AM',
      repeat: 'Does not repeat',
      backup: false,
      address: ''
    });
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;

    setEventFormData({
      type: selectedEvent.type,
      color: selectedEvent.color,
      title: selectedEvent.title,
      notes: selectedEvent.notes || '',
      date: selectedEvent.date,
      startTime: selectedEvent.startTime,
      endTime: selectedEvent.endTime,
      repeat: selectedEvent.repeat,
      backup: selectedEvent.backup,
      address: selectedEvent.address || ''
    });
    setIsEditingEvent(true);
    setShowEventSummary(false);
    setShowEventMenu(false);
    setShowEventDetailsForm(true);
  };

  const handleDuplicateEvent = () => {
    if (!selectedEvent) return;

    const now = new Date();
    const duplicatedEvent: Event = {
      ...selectedEvent,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    setEvents([...events, duplicatedEvent]);
    setShowEventMenu(false);
    setShowEventSummary(false);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    const updatedEvents = events.filter(evt => evt.id !== selectedEvent.id);
    setEvents(updatedEvents);
    setShowEventMenu(false);
    setShowEventSummary(false);
    setSelectedEvent(null);
  };

  const handleUndo = () => {
    if (!previousEventState) return;

    const updatedEvents = events.map(evt =>
      evt.id === previousEventState.id ? previousEventState : evt
    );
    setEvents(updatedEvents);
    setShowUndoSnackbar(false);
    setPreviousEventState(null);
  };

  const formatTimeFromHour = (hour: number, minutes: number = 0): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleEventDragStart = (event: Event, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setPreviousEventState({ ...event });
    setDraggedEvent(event);
    setIsDragging(true);

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartY(clientY);
    setDragStartX(clientX);
    setDragCurrentY(clientY);
    setDragCurrentX(clientX);
  };

  const handleEventDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !draggedEvent) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragCurrentY(clientY);
    setDragCurrentX(clientX);

    // Auto-scroll logic
    const windowHeight = window.innerHeight;
    if (clientY > windowHeight - 100) {
      window.scrollBy(0, 10);
    } else if (clientY < 100) {
      window.scrollBy(0, -10);
    }

    // Day switching logic
    const windowWidth = window.innerWidth;
    if (clientX < 96) { // Within 1 inch (96px) of left edge
      // Switch to previous day
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate);
    } else if (clientX > windowWidth - 96) { // Within 1 inch of right edge
      // Switch to next day
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate);
    }
  };

  const handleEventDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !draggedEvent) return;

    const clientY = 'touches' in e ? e.changedTouches[0].clientY : e.clientY;
    const deltaY = clientY - dragStartY;

    // Calculate new time based on drag distance (snap to 15-minute intervals)
    const minutesMoved = Math.round(deltaY / 64 * 60); // 64px per hour = pixels to minutes
    const totalMinutes = draggedEvent.time * 60 + calculateEventOffset(draggedEvent.startTime) * 60 + minutesMoved;

    // Snap to 15-minute intervals
    const snappedMinutes = Math.round(totalMinutes / 15) * 15;
    const clampedMinutes = Math.max(0, Math.min(23 * 60 + 45, snappedMinutes)); // 23:45 is latest

    const newHour = Math.floor(clampedMinutes / 60);
    const newMinutes = clampedMinutes % 60;
    const newStartTime = formatTimeFromHour(newHour, newMinutes);

    // Calculate end time based on duration
    const durationMinutes = draggedEvent.duration * 60;
    const endTotalMinutes = clampedMinutes + durationMinutes;
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinutes = endTotalMinutes % 60;
    const newEndTime = formatTimeFromHour(endHour, endMinutes);

    // Update the event
    const updatedEvents = events.map(evt =>
      evt.id === draggedEvent.id
        ? {
            ...evt,
            time: newHour,
            startTime: newStartTime,
            endTime: newEndTime,
            date: selectedDate,
            updatedAt: new Date()
          }
        : evt
    );

    setEvents(updatedEvents);
    setIsDragging(false);
    setDraggedEvent(null);

    // Show undo snackbar
    const timeStr = formatTimeFromHour(newHour, newMinutes);
    const dateStr = formatHeaderDate(selectedDate);
    setUndoMessage(`Moved to ${dateStr}, ${timeStr}`);
    setShowUndoSnackbar(true);

    // Auto-hide snackbar after 5 seconds
    setTimeout(() => {
      setShowUndoSnackbar(false);
      setPreviousEventState(null);
    }, 5000);
  };

  // Generate hours for the day
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour} ${period}`;
  });

  // Generate week days based on selected date
  const getWeekDays = () => {
    const days = [];
    const currentDate = new Date(selectedDate);
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Go back to the previous Wednesday
    const startDate = new Date(currentDate);
    const daysToSubtract = (dayOfWeek + 4) % 7; // Calculate days to Wednesday
    startDate.setDate(currentDate.getDate() - daysToSubtract);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        day: dayNames[date.getDay()],
        date: date.getDate(),
        fullDate: new Date(date),
        isSelected: date.toDateString() === selectedDate.toDateString()
      });
    }

    return days;
  };

  const weekDays = getWeekDays();

  // Format date for header
  const formatHeaderDate = (date: Date) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Generate calendar days for date picker
  const getCalendarDays = () => {
    const firstDay = new Date(pickerYear, pickerMonth, 1);
    const lastDay = new Date(pickerYear, pickerMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(pickerYear, pickerMonth, day);
    setSelectedDate(newDate);
    setShowDatePicker(false);
  };

  const handlePrevMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear(pickerYear - 1);
    } else {
      setPickerMonth(pickerMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear(pickerYear + 1);
    } else {
      setPickerMonth(pickerMonth + 1);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800" style={{ display: activeTab === 'calendar' ? 'flex' : 'none' }}>
        <button className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          className="flex items-center gap-2 hover:bg-gray-800 px-3 py-2 rounded transition-colors"
          onClick={() => {
            setShowDatePicker(true);
            setPickerMonth(selectedDate.getMonth());
            setPickerYear(selectedDate.getFullYear());
          }}
        >
          <span className="text-lg font-normal">{formatHeaderDate(selectedDate)}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <button className="p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          <button className="p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button className="p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Home Screen */}
      {activeTab === 'home' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-normal mb-2">Weekly Key Indicators</h1>
            <button
              onClick={() => setIsEditingIndicators(!isEditingIndicators)}
              className="text-pink-500 text-base hover:text-pink-400 transition-colors"
            >
              {isEditingIndicators ? 'Done' : 'Edit indicators'}
            </button>
          </div>

          {!isEditingIndicators ? (
            <div className="grid grid-cols-2 gap-4">
              {indicators.map((indicator) => (
                <div
                  key={indicator.id}
                  className="bg-gray-900 border border-gray-700 rounded-2xl p-4 aspect-square flex flex-col items-center justify-center"
                >
                  <div className="text-5xl font-light mb-2">
                    {indicator.numerator}/{indicator.denominator}
                  </div>
                  <div className="text-lg text-gray-300 text-center">
                    {indicator.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {indicators.map((indicator, index) => (
                <div
                  key={indicator.id}
                  className="bg-gray-900 border border-gray-700 rounded-2xl p-4"
                >
                  <div className="mb-3">
                    <label className="text-gray-400 text-sm mb-2 block">Label</label>
                    <input
                      type="text"
                      value={indicator.label}
                      onChange={(e) => {
                        const newIndicators = [...indicators];
                        newIndicators[index].label = e.target.value;
                        setIndicators(newIndicators);
                      }}
                      className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-2 text-lg focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Numerator</label>
                      <input
                        type="number"
                        value={indicator.numerator}
                        onChange={(e) => {
                          const newIndicators = [...indicators];
                          newIndicators[index].numerator = parseInt(e.target.value) || 0;
                          setIndicators(newIndicators);
                        }}
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-2 text-lg focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Denominator</label>
                      <input
                        type="number"
                        value={indicator.denominator}
                        onChange={(e) => {
                          const newIndicators = [...indicators];
                          newIndicators[index].denominator = parseInt(e.target.value) || 1;
                          setIndicators(newIndicators);
                        }}
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-2 text-lg focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIndicators(indicators.filter(ind => ind.id !== indicator.id));
                    }}
                    className="w-full py-2 text-red-500 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  const newIndicator: Indicator = {
                    id: Date.now().toString(),
                    label: 'New Indicator',
                    numerator: 0,
                    denominator: 7
                  };
                  setIndicators([...indicators, newIndicator]);
                }}
                className="w-full py-4 border-2 border-dashed border-gray-600 rounded-2xl text-gray-400 hover:border-pink-500 hover:text-pink-500 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Indicator
              </button>
            </div>
          )}
        </div>
      )}

      {/* Week Days */}
      {activeTab === 'calendar' && (
        <div className="flex border-b border-gray-800">
          <div className="w-16 shrink-0"></div>
          <div className="flex flex-1 overflow-x-auto">
            {weekDays.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(day.fullDate)}
                className={`flex-1 min-w-[60px] text-center py-3 cursor-pointer hover:bg-gray-800 transition-colors ${
                  day.isSelected ? 'border-2 border-pink-500' : 'border border-gray-700'
                }`}
              >
                <div className="text-xs text-gray-400">{day.day}</div>
                <div className={`text-2xl ${day.isSelected ? 'text-white' : 'text-gray-300'}`}>
                  {day.date}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      {activeTab === 'calendar' && (
        <div className="flex-1 overflow-y-auto relative">
          <div className="flex">
          {/* Time column */}
          <div className="w-16 shrink-0 border-r border-gray-800">
            {hours.map((hour, index) => (
              <div key={index} className="h-16 text-xs text-gray-400 pr-2 pt-1 text-right">
                {hour}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="flex-1 relative">
            {/* Hour slots */}
            {hours.map((hour, index) => (
              <button
                key={index}
                onClick={() => handleCalendarClick(index)}
                className="w-full h-16 border-b border-gray-800 hover:bg-gray-800 transition-colors text-left relative"
              />
            ))}

            {/* Render all events with proper positioning */}
            <div
              onMouseMove={handleEventDragMove}
              onMouseUp={handleEventDragEnd}
              onTouchMove={handleEventDragMove}
              onTouchEnd={handleEventDragEnd}
              className="absolute inset-0 pointer-events-none"
            >
              {events
                .filter(event => event.date.toDateString() === selectedDate.toDateString())
                .map(event => {
                  const offset = calculateEventOffset(event.startTime);
                  const heightInPixels = Math.max(event.duration * 64, 32);
                  let topPosition = event.time * 64 + offset * 64;

                  // If this is the dragged event, apply drag offset
                  if (isDragging && draggedEvent?.id === event.id) {
                    const dragOffsetY = dragCurrentY - dragStartY;
                    topPosition += dragOffsetY;
                  }

                  return (
                    <button
                      key={event.id}
                      onMouseDown={(e) => handleEventDragStart(event, e)}
                      onTouchStart={(e) => handleEventDragStart(event, e)}
                      onClick={(e) => {
                        if (!isDragging) {
                          e.stopPropagation();
                          handleCalendarClick(event.time, event);
                        }
                      }}
                      className={`absolute left-1 right-1 ${event.color} rounded px-2 py-1 text-xs text-black font-medium overflow-hidden flex items-start cursor-move pointer-events-auto ${
                        isDragging && draggedEvent?.id === event.id ? 'opacity-70 z-50' : ''
                      }`}
                      style={{
                        top: `${topPosition}px`,
                        height: `${heightInPixels}px`
                      }}
                    >
                      <span className="line-clamp-3">{event.title}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

          {/* Floating Action Button */}
          <button
            onClick={handlePlusButtonClick}
            className="fixed bottom-24 right-6 w-14 h-14 bg-pink-600 rounded-2xl flex items-center justify-center shadow-lg hover:bg-pink-700 transition-colors"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="flex items-center justify-around border-t border-gray-800 pb-safe bg-black">
        <button
          onClick={() => setActiveTab('home')}
          className="flex flex-col items-center py-3 px-6 transition-colors"
        >
          <svg className={`w-6 h-6 ${activeTab === 'home' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className="flex flex-col items-center py-2 px-8 transition-colors relative"
        >
          <div className={`rounded-full px-6 py-2 ${activeTab === 'calendar' ? 'bg-pink-600' : ''}`}>
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => setShowPaywallModal(true)}
          className="flex flex-col items-center py-3 px-6 transition-colors"
        >
          <svg className={`w-6 h-6 ${activeTab === 'profile' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        <button
          onClick={() => setShowPaywallModal(true)}
          className="flex flex-col items-center py-3 px-6 transition-colors"
        >
          <svg className={`w-6 h-6 ${activeTab === 'location' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button
          onClick={() => setShowPaywallModal(true)}
          className="flex flex-col items-center py-3 px-6 transition-colors"
        >
          <svg className={`w-6 h-6 ${activeTab === 'sync' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </nav>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowDatePicker(false)}
        >
          <div
            className="bg-gray-800 rounded-3xl p-6 mx-4 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl text-gray-300 mb-4">Select date</h2>

            {/* Current Selected Date Display */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
              <span className="text-4xl font-light">{formatHeaderDate(selectedDate)}</span>
              <button className="p-2 hover:bg-gray-700 rounded">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                className="flex items-center gap-2 text-lg hover:bg-gray-700 px-3 py-2 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <span>{monthNames[pickerMonth]} {pickerYear}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-700 rounded"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-700 rounded"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-sm text-gray-400 font-medium">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {getCalendarDays().map((day, index) => (
                  <div key={index} className="aspect-square">
                    {day ? (
                      <button
                        onClick={() => handleDateClick(day)}
                        className={`w-full h-full rounded-full flex items-center justify-center text-lg transition-colors ${
                          day === selectedDate.getDate() &&
                          pickerMonth === selectedDate.getMonth() &&
                          pickerYear === selectedDate.getFullYear()
                            ? 'bg-pink-500 text-white'
                            : 'hover:bg-gray-700 text-white'
                        }`}
                      >
                        {day}
                      </button>
                    ) : (
                      <div></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-6 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-6 py-2 text-pink-500 hover:bg-gray-700 rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Type Selector Modal */}
      {showEventTypeSelector && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEventTypeSelector(false)}
        >
          <div
            className="bg-gray-900 rounded-2xl p-4 mx-4 max-w-sm w-full max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-normal mb-4">Select Event Type</h2>

            <div className="space-y-1 mb-4">
              {eventTypes.map((eventType, index) => (
                <button
                  key={index}
                  onClick={() => handleEventTypeSelect(eventType)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg transition-colors text-left"
                >
                  <div className={`w-8 h-8 ${eventType.color} rounded-full shrink-0`}></div>
                  <span className="text-base">{eventType.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowEventTypeSelector(false)}
              className="w-full py-2.5 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Event Details Form Modal */}
      {showEventDetailsForm && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="min-h-screen p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowEventDetailsForm(false)}
                className="p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <button
                onClick={handleSaveEvent}
                className="bg-pink-400 text-black px-8 py-3 rounded-full font-medium hover:bg-pink-500 transition-colors"
              >
                Save
              </button>
            </div>

            {/* Event Type Dropdown */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Event Type</label>
              <select
                value={eventFormData.type}
                onChange={(e) => {
                  const selectedType = eventTypes.find(t => t.name === e.target.value);
                  setEventFormData({
                    ...eventFormData,
                    type: e.target.value,
                    color: selectedType?.color || ''
                  });
                }}
                className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-4 text-lg focus:outline-none focus:border-pink-500"
              >
                {eventTypes.map((type, i) => (
                  <option key={i} value={type.name} className="bg-black">
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Title"
                value={eventFormData.title}
                onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-4 text-lg placeholder-gray-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Notes */}
            <div className="mb-4">
              <textarea
                placeholder="Notes"
                value={eventFormData.notes}
                onChange={(e) => setEventFormData({ ...eventFormData, notes: e.target.value })}
                className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-4 text-lg placeholder-gray-500 focus:outline-none focus:border-pink-500 min-h-[100px]"
              />
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Date</label>
              <button
                onClick={() => {
                  setShowEventDetailsForm(false);
                  setShowDatePicker(true);
                }}
                className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-4 text-lg text-left flex items-center justify-between focus:outline-none focus:border-pink-500"
              >
                <span>{formatHeaderDate(eventFormData.date)}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Time</label>
                <button
                  type="button"
                  onClick={() => {
                    const match = eventFormData.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (match) {
                      setSelectedHour(parseInt(match[1]));
                      setSelectedMinute(parseInt(match[2]));
                      setSelectedPeriod(match[3].toUpperCase() as 'AM' | 'PM');
                    }
                    setTimePickerMode('start');
                    setClockMode('hour');
                    setShowTimePicker(true);
                  }}
                  className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-4 text-lg text-left focus:outline-none focus:border-pink-500"
                >
                  {eventFormData.startTime}
                </button>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Time</label>
                <button
                  type="button"
                  onClick={() => {
                    const match = eventFormData.endTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (match) {
                      setSelectedHour(parseInt(match[1]));
                      setSelectedMinute(parseInt(match[2]));
                      setSelectedPeriod(match[3].toUpperCase() as 'AM' | 'PM');
                    }
                    setTimePickerMode('end');
                    setClockMode('hour');
                    setShowTimePicker(true);
                  }}
                  className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-4 text-lg text-left focus:outline-none focus:border-pink-500"
                >
                  {eventFormData.endTime}
                </button>
              </div>
            </div>

            {/* Repeat */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Repeat</label>
              <select
                value={eventFormData.repeat}
                onChange={(e) => setEventFormData({ ...eventFormData, repeat: e.target.value })}
                className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-4 text-lg focus:outline-none focus:border-pink-500"
              >
                {repeatOptions.map((option, i) => (
                  <option key={i} value={option} className="bg-black">
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Backup Toggle */}
            <div className="mb-4 flex items-center justify-between py-3">
              <span className="text-lg">Backup</span>
              <button
                onClick={() => setEventFormData({ ...eventFormData, backup: !eventFormData.backup })}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  eventFormData.backup ? 'bg-pink-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    eventFormData.backup ? 'translate-x-7' : 'translate-x-1'
                  }`}
                ></div>
              </button>
            </div>

            {/* Address */}
            <button
              onClick={() => {
                const address = prompt('Enter address:');
                if (address) {
                  setEventFormData({ ...eventFormData, address });
                }
              }}
              className="w-full text-left py-4 flex items-center gap-3 hover:bg-gray-900 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-lg">{eventFormData.address || 'Address'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Event Summary View */}
      {showEventSummary && selectedEvent && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="min-h-screen p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setShowEventSummary(false)}
                className="p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              <h1 className="text-2xl font-normal flex-1 text-center">Event</h1>

              <button
                onClick={handleEditEvent}
                className="p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowEventMenu(!showEventMenu)}
                  className="p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showEventMenu && (
                  <div className="absolute top-12 right-0 bg-gray-800 rounded-lg shadow-lg py-2 min-w-[200px] z-10">
                    <button
                      onClick={handleDuplicateEvent}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors text-lg"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={handleDeleteEvent}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors text-lg"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-6">
              {/* Event Type */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Event Type</div>
                <div className="text-2xl">{selectedEvent.type}</div>
              </div>

              {/* Title */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Title</div>
                <div className="text-2xl">{selectedEvent.title}</div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Date</div>
                  <div className="text-xl">{formatHeaderDate(selectedEvent.date)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Time</div>
                  <div className="text-xl">{selectedEvent.startTime} – {selectedEvent.endTime}</div>
                </div>
              </div>

              {/* Notes */}
              {selectedEvent.notes && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Notes</div>
                  <div className="text-lg">{selectedEvent.notes}</div>
                </div>
              )}

              {/* Repeat */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Repeat</div>
                <div className="text-lg">{selectedEvent.repeat}</div>
              </div>

              {/* Backup */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Backup</div>
                <div className="text-lg">{selectedEvent.backup ? 'Yes' : 'No'}</div>
              </div>

              {/* Address */}
              {selectedEvent.address && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Address</div>
                  <div className="text-lg">{selectedEvent.address}</div>
                </div>
              )}

              {/* Created */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Created</div>
                <div className="text-lg">
                  {selectedEvent.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}, {selectedEvent.createdAt.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>

              {/* Updated */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Updated</div>
                <div className="text-lg">
                  {selectedEvent.updatedAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}, {selectedEvent.updatedAt.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clock Time Picker Modal */}
      {showTimePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-normal mb-4">Edit Event</h2>

            {/* Time Display */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                onClick={() => setClockMode('hour')}
                className={`text-5xl font-light px-4 py-2 rounded-lg ${
                  clockMode === 'hour' ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                {selectedHour.toString().padStart(2, '0')}
              </button>
              <span className="text-5xl">:</span>
              <button
                onClick={() => setClockMode('minute')}
                className={`text-5xl font-light px-4 py-2 rounded-lg ${
                  clockMode === 'minute' ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                {selectedMinute.toString().padStart(2, '0')}
              </button>
              <div className="flex flex-col ml-2">
                <button
                  onClick={() => setSelectedPeriod('AM')}
                  className={`px-3 py-1 rounded-t text-sm ${
                    selectedPeriod === 'AM' ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  AM
                </button>
                <button
                  onClick={() => setSelectedPeriod('PM')}
                  className={`px-3 py-1 rounded-b text-sm ${
                    selectedPeriod === 'PM' ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Clock Face */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              <svg viewBox="0 0 256 256" className="w-full h-full">
                {/* Clock circle */}
                <circle cx="128" cy="128" r="120" fill="#374151" />

                {/* Clock numbers */}
                {clockMode === 'hour' ? (
                  // Hour numbers (1-12)
                  [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180);
                    const x = 128 + 90 * Math.cos(angle);
                    const y = 128 + 90 * Math.sin(angle);
                    return (
                      <g key={hour}>
                        <circle
                          cx={x}
                          cy={y}
                          r="20"
                          fill={selectedHour === hour ? '#EC4899' : 'transparent'}
                          onClick={() => setSelectedHour(hour)}
                          style={{ cursor: 'pointer' }}
                        />
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="18"
                          onClick={() => setSelectedHour(hour)}
                          style={{ cursor: 'pointer' }}
                        >
                          {hour}
                        </text>
                      </g>
                    );
                  })
                ) : (
                  // Minute numbers (0, 5, 10, ..., 55)
                  [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((minute, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180);
                    const x = 128 + 90 * Math.cos(angle);
                    const y = 128 + 90 * Math.sin(angle);
                    return (
                      <g key={minute}>
                        <circle
                          cx={x}
                          cy={y}
                          r="20"
                          fill={selectedMinute === minute ? '#EC4899' : 'transparent'}
                          onClick={() => setSelectedMinute(minute)}
                          style={{ cursor: 'pointer' }}
                        />
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="16"
                          onClick={() => setSelectedMinute(minute)}
                          style={{ cursor: 'pointer' }}
                        >
                          {minute.toString().padStart(2, '0')}
                        </text>
                      </g>
                    );
                  })
                )}

                {/* Clock hand */}
                {clockMode === 'hour' ? (
                  <line
                    x1="128"
                    y1="128"
                    x2={128 + 60 * Math.cos(((selectedHour % 12) * 30 - 90) * (Math.PI / 180))}
                    y2={128 + 60 * Math.sin(((selectedHour % 12) * 30 - 90) * (Math.PI / 180))}
                    stroke="#EC4899"
                    strokeWidth="3"
                  />
                ) : (
                  <line
                    x1="128"
                    y1="128"
                    x2={128 + 80 * Math.cos((selectedMinute * 6 - 90) * (Math.PI / 180))}
                    y2={128 + 80 * Math.sin((selectedMinute * 6 - 90) * (Math.PI / 180))}
                    stroke="#EC4899"
                    strokeWidth="3"
                  />
                )}

                {/* Center dot */}
                <circle cx="128" cy="128" r="8" fill="#EC4899" />
              </svg>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowTimePicker(false)}
                className="px-6 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const timeStr = `${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;
                  if (timePickerMode === 'start') {
                    setEventFormData({ ...eventFormData, startTime: timeStr });
                  } else {
                    setEventFormData({ ...eventFormData, endTime: timeStr });
                  }
                  setShowTimePicker(false);
                }}
                className="px-6 py-2 text-pink-500 hover:bg-gray-800 rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Snackbar */}
      {showUndoSnackbar && (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between bg-white text-black rounded-lg shadow-lg p-4 animate-slide-up">
          <span className="text-base">{undoMessage}</span>
          <button
            onClick={handleUndo}
            className="text-pink-600 font-medium text-base ml-4"
          >
            Undo
          </button>
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywallModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowPaywallModal(false)}
        >
          <div
            className="bg-gray-800 rounded-3xl p-8 mx-4 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              
              <h2 className="text-2xl font-semibold mb-4 text-white">Premium Feature</h2>
              
              <p className="text-gray-300 mb-2 text-lg">
                This is an MVP demo
              </p>
              
              <p className="text-gray-400 mb-6 text-base">
                Not all features are currently available. Upgrade to unlock this feature and support development!
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    window.location.href = '/pricing';
                  }}
                  className="w-full px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium text-lg"
                >
                  Upgrade Now
                </button>
                
                <button
                  onClick={() => setShowPaywallModal(false)}
                  className="w-full px-6 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
