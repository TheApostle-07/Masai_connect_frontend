import { useEffect, useState } from 'react';
import Sidebar from '../shared-components/Sidebar';
import Header from '../shared-components/Header';
import {
  FiCalendar,
  FiClock,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiEdit,
} from 'react-icons/fi';

/**
 * Parse a date string in "dd-mm-yyyy" format into a Date object.
 */
const parseSlotDate = (dateStr) => {
  const [day, month, year] = dateStr.split('-');
  return new Date(year, month - 1, day);
};

/**
 * Convert a date string from "dd-mm-yyyy" to "yyyy-mm-dd" format for HTML input.
 */
const convertDateToInputValue = (dateStr) => {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
};

/**
 * Generate time slots between startTime and endTime with a given slotDuration and buffer.
 * Returns an array of objects: { display, start, end }.
 */
const generateTimeSlots = (startTime, endTime, slotDuration, buffer) => {
  const slots = [];
  const toMinutes = (timeStr) => {
    const [hh, mm] = timeStr.split(':').map(Number);
    return hh * 60 + mm;
  };
  const toDisplay = (totalMins) => {
    const hh = Math.floor(totalMins / 60);
    const mm = totalMins % 60;
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const displayHour = hh % 12 === 0 ? 12 : hh % 12;
    const displayMinute = mm.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${ampm}`;
  };
  let start = toMinutes(startTime);
  const end = toMinutes(endTime);
  while (start + slotDuration <= end) {
    const slotStart = start;
    const slotEnd = start + slotDuration;
    slots.push({
      display: `${toDisplay(slotStart)} - ${toDisplay(slotEnd)}`,
      start: (() => {
        const hh = Math.floor(slotStart / 60).toString().padStart(2, '0');
        const mm = (slotStart % 60).toString().padStart(2, '0');
        return `${hh}:${mm}`;
      })(),
      end: (() => {
        const hh = Math.floor(slotEnd / 60).toString().padStart(2, '0');
        const mm = (slotEnd % 60).toString().padStart(2, '0');
        return `${hh}:${mm}`;
      })(),
    });
    start = slotEnd + buffer;
  }
  return slots;
};

/**
 * Get the current week (Monday to Sunday) as an array of objects.
 */
const getCurrentWeek = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const weekDays = [];
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const day = current.getDate().toString().padStart(2, '0');
    const month = (current.getMonth() + 1).toString().padStart(2, '0');
    const year = current.getFullYear();
    weekDays.push({
      day: dayNames[i],
      date: `${day}-${month}-${year}`,
      iso: current.toISOString().split('T')[0],
    });
  }
  return weekDays;
};

/**
 * Group an array of slots by date.
 */
const groupSlotsByDate = (slotsArray) => {
  return slotsArray.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});
};

/**
 * AccordionGroup Component: Displays slots for one day in a collapsible section.
 */
function AccordionGroup({ date, slots, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const getDayName = (dateStr) => {
    const dateObj = parseSlotDate(dateStr);
    return dateObj.toLocaleString('en-US', { weekday: 'long' });
  };
  return (
    <div className="mb-4 border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between bg-gradient-to-r from-gray-100 to-gray-200 p-3 hover:from-gray-200 hover:to-gray-300 transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-2">
          <FiCheckCircle className="text-green-500" />
          <span className="text-lg font-semibold text-gray-800">
            {date} ({getDayName(date)})
          </span>
        </div>
        <span className="text-xl">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center space-x-2 bg-gray-50 p-2 rounded shadow-md"
            >
              <FiCalendar className="text-blue-500" />
              <span className="text-gray-800 font-medium">{slot.date}</span>
              <FiClock className="text-blue-500" />
              <span className="text-gray-800">{slot.display}</span>
              <button
                onClick={() => onEdit(slot)}
                className="ml-auto transition-transform transform hover:scale-110 text-blue-500"
              >
                <FiEdit />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MentorManageSlots() {
  // ----- Slot Data and State -----
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Open'); // "Open", "Booked", "Archived"

  // ----- Modal State for Creating Slots -----
  const [modalVisible, setModalVisible] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true); // Default to advanced (weekly view)

  // Basic creation fields (not used in advanced mode)
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotError, setNewSlotError] = useState('');

  // Advanced creation fields
  const [selectedWeekDays, setSelectedWeekDays] = useState([]); // Array of date strings "dd-mm-yyyy"
  const [startTime, setStartTime] = useState('10:00'); // 24-hour format
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30); // in minutes
  const [bufferTime, setBufferTime] = useState(0);
  const [saveSettings, setSaveSettings] = useState(false);
  const [savedSettings, setSavedSettings] = useState(null);

  // ----- Success Modal State -----
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [createdSlots, setCreatedSlots] = useState([]);

  // ----- Edit Modal State -----
  const [editSlot, setEditSlot] = useState(null);
  const [editSlotError, setEditSlotError] = useState('');

  // Handler for saving edited slot with duplicate check.
  const handleSaveEditedSlot = async () => {
    if (!editSlot) return;
    // Check for duplicates (excluding the current slot)
    const duplicate = slots.some(
      (slot) =>
        slot.id !== editSlot.id &&
        slot.date === editSlot.date &&
        slot.startTime === editSlot.startTime
    );
    if (duplicate) {
      setEditSlotError('A slot with the same date and start time already exists.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      // Update the slot in the backend
      const res = await fetch(`https://masai-connect-backend-w28f.vercel.app/api/slots/${editSlot.id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editSlot)
      });
      if (!res.ok) throw new Error("Failed to update slot");
      const updatedSlot = await res.json();
      setSlots(slots.map(slot => (slot.id === updatedSlot._id ? updatedSlot : slot)));
      setEditSlot(null);
      setEditSlotError('');
    } catch (err) {
      setEditSlotError(err.message);
    }
  };

  // Get current week view.
  const currentWeek = getCurrentWeek();

  // ----- Fetch Slots from the Backend -----
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const token = localStorage.getItem('token');
        // For testing, using Rufus Bright's ID as the mentor id.
        const mentorId = "679c6adcfa0a2f65ce121758";
        // Fetch slots for the current activeTab (e.g., "Open")
        const res = await fetch(`https://masai-connect-backend-w28f.vercel.app/api/slots?mentor=${mentorId}&status=${activeTab}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch slots");
        const data = await res.json();
        // Assume backend returns an array of slot documents. Map them to our component format.
        const fetchedSlots = data.map(slot => ({
          id: slot._id,
          date: slot.date,
          time: slot.time,
          display: slot.time, // You can adjust this if your backend returns a separate display field
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status
        }));
        setSlots(fetchedSlots);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [activeTab]);

  // ----- Color Coding for Slot Statuses -----
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Open':
        return 'border-blue-500 bg-blue-50';
      case 'Booked':
        return 'border-yellow-500 bg-yellow-50';
      case 'Archived':
        return 'border-gray-400 bg-gray-100';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  // ----- Filter Slots by Active Tab (client-side fallback) -----
  const filteredSlots = slots.filter((slot) => slot.status === activeTab);

  // ----- Modal Open/Close Functions -----
  const openModal = () => {
    setSelectedWeekDays([]);
    setStartTime('10:00');
    setEndTime('17:00');
    setSlotDuration(30);
    setBufferTime(0);
    setSaveSettings(false);
    setNewSlotError('');
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  // ----- Create New Slots (Advanced Weekly View) -----
  const handleCreateSlots = async () => {
    if (selectedWeekDays.length === 0) {
      setNewSlotError('Please select at least one day from the week.');
      return;
    }
    if (!startTime || !endTime) {
      setNewSlotError('Please select both start and end times.');
      return;
    }
    let generatedSlots = [];
    selectedWeekDays.forEach((day) => {
      const timeObjs = generateTimeSlots(startTime, endTime, Number(slotDuration), Number(bufferTime));
      timeObjs.forEach((timeObj) => {
        generatedSlots.push({
          id: Math.random().toString(36).substring(2, 9), // temporary id
          date: day,
          time: timeObj.display,
          display: timeObj.display,
          startTime: timeObj.start,
          endTime: timeObj.end,
          status: 'Open',
          mentor: "679c6adcfa0a2f65ce121758" // Set the mentor id
        });
      });
    });
    // Check for duplicates against existing slots
    const duplicateExists = generatedSlots.some(newSlot =>
      slots.some(existing =>
        existing.date === newSlot.date && existing.startTime === newSlot.startTime
      )
    );
    if (duplicateExists) {
      setNewSlotError('Some slots already exist for the selected time range. Adjust your settings.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      // Create slots in the backend by sending an array
      const res = await fetch(`https://masai-connect-backend-w28f.vercel.app/api/slots`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(generatedSlots)
      });
      if (!res.ok) throw new Error("Failed to create slots");
      const data = await res.json();
      // Backend should return the created slots (with real _id values)
      setSlots([...slots, ...data.map(slot => ({
        id: slot._id,
        date: slot.date,
        time: slot.time,
        display: slot.time,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status
      }))]);
      setCreatedSlots(data);
      if (saveSettings) {
        const settings = { selectedWeekDays, startTime, endTime, slotDuration, bufferTime };
        localStorage.setItem('mentorSlotSettings', JSON.stringify(settings));
        setSavedSettings(settings);
      }
      setModalVisible(false);
      setSuccessModalVisible(true);
    } catch (err) {
      setNewSlotError(err.message);
    }
  };

  // ----- Archive and Delete Actions (with API integration) -----
  const handleArchive = async (slotId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://masai-connect-backend-w28f.vercel.app/api/slots/${slotId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Archived' })
      });
      if (!res.ok) throw new Error("Failed to archive slot");
      const updatedSlot = await res.json();
      setSlots(slots.map(s => (s.id === updatedSlot._id ? {
        id: updatedSlot._id,
        date: updatedSlot.date,
        time: updatedSlot.time,
        display: updatedSlot.time,
        startTime: updatedSlot.startTime,
        endTime: updatedSlot.endTime,
        status: updatedSlot.status
      } : s)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (slotId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://masai-connect-backend-w28f.vercel.app/api/slots/${slotId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete slot");
      setSlots(slots.filter(s => s.id !== slotId));
    } catch (err) {
      console.error(err);
    }
  };

  // ----- Toggle Selection for a Day in the Week View -----
  const toggleWeekDay = (day) => {
    if (selectedWeekDays.includes(day)) {
      setSelectedWeekDays(selectedWeekDays.filter((d) => d !== day));
    } else {
      setSelectedWeekDays([...selectedWeekDays, day]);
    }
  };

  // ----- Group Filtered Slots by Date for Main View -----
  const groupedFilteredSlots = groupSlotsByDate(filteredSlots);
  const sortedFilteredDates = Object.keys(groupedFilteredSlots).sort(
    (a, b) => parseSlotDate(a) - parseSlotDate(b)
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar className="h-full" />
        <main className="flex-1 w-full p-8 bg-gray-100 relative">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage My Slots</h1>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-gray-300"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex space-x-6 mb-8 border-b pb-2">
                {['Open', 'Booked', 'Archived'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`font-medium pb-2 transition-all ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-500 text-blue-500'
                        : 'text-gray-500 hover:text-blue-500'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Main Slots List: Grouped by Date */}
              {sortedFilteredDates.length === 0 ? (
                <p className="text-gray-600">No {activeTab.toLowerCase()} slots found.</p>
              ) : (
                <div className="space-y-6">
                  {sortedFilteredDates.map((date) => (
                    <AccordionGroup
                      key={date}
                      date={date}
                      slots={groupedFilteredSlots[date]}
                      onEdit={setEditSlot}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Floating "Add Slot" Button */}
          <button
            onClick={openModal}
            className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full shadow-xl flex items-center space-x-2 transform transition-transform hover:scale-105"
          >
            <FiPlus className="text-xl" />
            <span>Add Slot</span>
          </button>

          {/* Create Slot Modal */}
          {modalVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl relative">
                <button className="absolute top-4 right-4" onClick={closeModal}>
                  <FiXCircle className="text-red-500 text-2xl" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Create New Slots
                </h2>
                {newSlotError && <p className="text-red-500 mb-2">{newSlotError}</p>}

                {/* Week View: Display current week days as selectable cards */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Select Days for this Week
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {currentWeek.map((dayObj) => (
                      <button
                        key={dayObj.date}
                        type="button"
                        className={`py-2 rounded border transition-all ${
                          selectedWeekDays.includes(dayObj.date)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                        }`}
                        onClick={() => toggleWeekDay(dayObj.date)}
                      >
                        <div className="text-sm">{dayObj.day}</div>
                        <div className="text-xs">{dayObj.date}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Settings Form */}
                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="toggleAdvanced"
                      className="mr-2"
                      checked={showAdvanced}
                      onChange={() => setShowAdvanced(!showAdvanced)}
                    />
                    <label htmlFor="toggleAdvanced" className="text-gray-700 font-medium">
                      Use Custom Time Range & Settings
                    </label>
                  </div>
                  {showAdvanced && (
                    <>
                      <div className="flex space-x-4">
                        <div>
                          <label className="block mb-1 font-medium text-gray-700">
                            Start Time (24hr)
                          </label>
                          <input
                            type="time"
                            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-medium text-gray-700">
                            End Time (24hr)
                          </label>
                          <input
                            type="time"
                            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <div>
                          <label className="block mb-1 font-medium text-gray-700">
                            Slot Duration (min)
                          </label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                            value={slotDuration}
                            onChange={(e) => setSlotDuration(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-medium text-gray-700">
                            Buffer (min)
                          </label>
                          <select
                            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                            value={bufferTime}
                            onChange={(e) => setBufferTime(e.target.value)}
                          >
                            <option value="0">No buffer</option>
                            <option value="5">5 min</option>
                            <option value="10">10 min</option>
                            <option value="20">20 min</option>
                            <option value="30">30 min</option>
                            <option value="60">1 hr</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="saveSettings"
                          checked={saveSettings}
                          onChange={() => setSaveSettings(!saveSettings)}
                        />
                        <label htmlFor="saveSettings" className="font-medium text-gray-700">
                          Save these settings for reuse
                        </label>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={closeModal}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSlots}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-all"
                  >
                    Create Slot(s)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {successModalVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Slots Created Successfully!
                  </h2>
                  <button onClick={() => setSuccessModalVisible(false)}>
                    <FiXCircle className="text-red-500 text-2xl" />
                  </button>
                </div>
                <div className="mb-4 text-gray-600 flex-shrink-0">
                  <p>
                    {createdSlots.length} slot{createdSlots.length > 1 && 's'} have been created.
                  </p>
                </div>
                {/* Scrollable Content: Grouped by Date */}
                <div className="overflow-y-auto flex-1 pr-2">
                  {Object.keys(groupSlotsByDate(createdSlots))
                    .sort((a, b) => parseSlotDate(a) - parseSlotDate(b))
                    .map((date) => (
                      <AccordionGroup
                        key={date}
                        date={date}
                        slots={createdSlots.filter(slot => slot.date === date)}
                        onEdit={() => {}}
                      />
                    ))}
                </div>
                {/* Modal Footer */}
                <div className="mt-4 flex justify-end flex-shrink-0">
                  <button
                    onClick={() => setSuccessModalVisible(false)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Slot Modal */}
          {editSlot && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl relative">
                <button
                  className="absolute top-4 right-4"
                  onClick={() => { setEditSlot(null); setEditSlotError(''); }}
                >
                  <FiXCircle className="text-red-500 text-2xl" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Slot</h2>
                {editSlotError && <p className="text-red-500 mb-2">{editSlotError}</p>}
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                      value={convertDateToInputValue(editSlot.date)}
                      onChange={(e) =>
                        setEditSlot({
                          ...editSlot,
                          date: e.target.value.split('-').reverse().join('-'),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Start Time</label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                      value={editSlot.startTime}
                      onChange={(e) =>
                        setEditSlot({
                          ...editSlot,
                          startTime: e.target.value,
                          time: `${e.target.value} - ${editSlot.endTime}`,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">End Time</label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                      value={editSlot.endTime}
                      onChange={(e) =>
                        setEditSlot({
                          ...editSlot,
                          endTime: e.target.value,
                          time: `${editSlot.startTime} - ${e.target.value}`,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => { setEditSlot(null); setEditSlotError(''); }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditedSlot}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}