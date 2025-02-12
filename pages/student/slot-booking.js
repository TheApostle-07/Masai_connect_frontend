import { useEffect, useState } from 'react';
import Sidebar from '../shared-components/Sidebar';
import Header from '../shared-components/Header';
import * as JwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';

import { 
  FiCalendar, 
  FiClock, 
  FiPlus, 
  FiXCircle, 
  FiUser, 
  FiUserCheck,
  FiCheckCircle,
  FiEdit,
  FiVideo
} from 'react-icons/fi';

// Maximum number of bookings allowed per student.
const MAX_BOOKINGS = 15;

// ----- Dummy Connection Types (static) -----
const connectionTypes = [
  {
    id: 'Peer-to-Peer',
    label: 'Peer-to-Peer / IA Connect',
    description: 'Discuss your progress, challenges, and goals with fellow peers or IAs.',
  },
  {
    id: 'Dost / EC Connect',
    label: 'Dost / EC Connect',
    description: 'Book a session with EC support or Dost for academic and personal guidance.',
  },
  {
    id: 'Leadership Connect',
    label: 'Leadership Connect',
    description: 'Engage in strategic conversations with leaders to gain insights on success.',
  },
  {
    id: 'Mentor Connect',
    label: 'Mentor Connect',
    description: 'Schedule a one-on-one session with a mentor to discuss your projects.',
  },
];

// ----- Mapping from connection type to user role -----
const roleMapping = {
  peer: 'IA',
  dost: 'EC',
  leadership: 'LEADERSHIP',
  mentor: 'MENTOR',
};

// ----- Color mapping for Connection Types -----
const connectionTypeColors = {
  "Peer-to-Peer": {
    bg: "bg-green-100",
    border: "border-green-300",
    text: "text-green-700"
  },
  "Dost / EC Connect": {
    bg: "bg-purple-100",
    border: "border-purple-300",
    text: "text-purple-700"
  },
  "Leadership Connect": {
    bg: "bg-red-100",
    border: "border-red-300",
    text: "text-red-700"
  },
  "Mentor Connect": {
    bg: "bg-orange-100",
    border: "border-orange-300",
    text: "text-orange-700"
  },
};

const sessionTypeToDesiredRole = {
  "Peer-to-Peer": "IA",
  "Dost / EC Connect": "EC",
  "Leadership Connect": "LEADERSHIP",
  "Mentor Connect": "MENTOR"
};

// Returns the role to display for a given mentor and session type.
// Always returns the desired role.
const getDisplayRole = (mentor, sessionType) => {
  if (!mentor || !sessionType) return "";
  return sessionTypeToDesiredRole[sessionType.id] || "";
};

// ----- Helper: Parse a dd-mm-yyyy date string into a Date object -----
const parseSlotDate = (dateStr) => {
  const [day, month, year] = dateStr.split('-');
  return new Date(year, month - 1, day);
};

// ----- New Helper Functions for Session Time Parsing -----
const parseTimeString = (timeStr) => {
  const [time, meridian] = timeStr.split(' ');
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute, meridian };
};

const convertTo24Hour = (hour, meridian) => {
  if (meridian.toUpperCase() === "PM" && hour !== 12) return hour + 12;
  if (meridian.toUpperCase() === "AM" && hour === 12) return 0;
  return hour;
};

const parseSessionSlotTime = (dateStr, timeRange) => {
  const [startTimeStr, endTimeStr] = timeRange.split(' - ');
  const [day, month, year] = dateStr.split('-').map(Number);
  
  const { hour: startHour, minute: startMinute, meridian: startMeridian } = parseTimeString(startTimeStr);
  const { hour: endHour, minute: endMinute, meridian: endMeridian } = parseTimeString(endTimeStr);
  
  const start = new Date(year, month - 1, day);
  start.setHours(convertTo24Hour(startHour, startMeridian), startMinute, 0, 0);
  
  const end = new Date(year, month - 1, day);
  end.setHours(convertTo24Hour(endHour, endMeridian), endMinute, 0, 0);
  
  return { start, end };
};

const getSessionStatus = (session) => {
  const { start, end } = parseSessionSlotTime(session.slot.date, session.slot.time);
  const now = new Date();
  if (now < start) return "Upcoming";
  if (now > end) return "Past";
  return "Ongoing";
};

// ----- Helper: Get current week (Monday to Sunday) -----
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

// ----- Helper: Group an array of slots by date -----
const groupSlotsByDate = (slotsArray) => {
  return slotsArray.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});
};

/**
 * AccordionGroup Component:
 * Displays slots for one day in a collapsible section.
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
              {onEdit && (
                <button
                  onClick={() => onEdit(slot)}
                  className="ml-auto transition-transform transform hover:scale-110 text-blue-500"
                >
                  <FiEdit />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentSlotBooking() {
  // ----- Booking Flow State -----
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingStep, setBookingStep] = useState('selectType'); 
  const [selectedSessionType, setSelectedSessionType] = useState(null);
  const [selectedSessionMode, setSelectedSessionMode] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [mentors, setMentors] = useState([]); // Course-specific experts
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [agenda, setAgenda] = useState('');

  // ----- Course State (fetched from backend) -----
  const [course, setCourse] = useState(null);

  // ----- Booked Sessions (Bookings) State -----
  const [sessions, setSessions] = useState([]);

  // ----- Active Tab for Displaying Sessions -----
  const [activeTab, setActiveTab] = useState("Upcoming");

  // ----- Available Slots for Selected Mentor -----
  const [availableSlots, setAvailableSlots] = useState([]);

  // ----- Open/Close Booking Modal -----
  const openBookingModal = () => {
    setBookingStep('selectType');
    setSelectedSessionType(null);
    setSelectedSessionMode(null);
    setSelectedMentor(null);
    setSelectedSlot(null);
    setAgenda('');
    setBookingModalVisible(true);
  };
  const closeBookingModal = () => {
    setBookingModalVisible(false);
  };

  // ----- Dummy Check: Is a slot already booked? -----
  const isSlotBooked = (slotId) => {
    return sessions.some(
      (session) =>
        session.slotId === slotId && session.mentor._id === selectedMentor?._id
    );
  };

 useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("Token not found in localStorage.");
        }
        // Decode the token to get the student ID (adjust the key if needed)
        const decoded = JwtDecode.jwtDecode(token);
        const studentId = decoded.user_id; // or decoded.id based on your token payload

        const res = await fetch(`https://masai-connect-backend-w28f.vercel.app/api/bookings?user=${studentId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch sessions.");
        const data = await res.json();
        const sessionsData = data.map((booking) => ({
          id: booking._id,
          sessionType: booking.sessionType,
          sessionMode: booking.mode,
          mentor: booking.mentor, // Assumes mentor is populated
          slot: booking.slot,
          slotId: booking.slot.slotId,
          agenda: booking.agenda,
          status: booking.status,
          zoomJoinUrl: booking.zoomJoinUrl,
        }));
        setSessions(sessionsData);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // ----- Fetch Course Details -----
  const COURSE_ID = "67a9b3795cf0982adcc295d7";
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://masai-connect-backend-w28f.vercel.app/api/courses/${COURSE_ID}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch course");
        const data = await res.json();
        setCourse(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCourse();
  }, []);

  // ----- Fetch Relevant Experts Based on Course & Session Type -----
  useEffect(() => {
    if (bookingStep === 'selectMentor' && selectedSessionType && course) {
      let userIds = [];
      if (selectedSessionType.id === "Peer-to-Peer") {
        userIds = course.IAs.map(item => item._id);
      } else if (selectedSessionType.id === "Dost / EC Connect") {
        userIds = course.ECs.map(item => item._id);
      } else if (
        selectedSessionType.id === "Leadership Connect" ||
        selectedSessionType.id === "Mentor Connect"
      ) {
        userIds = course.mentors.map(item => item._id);
      }
      if (userIds && userIds.length > 0) {
        const fetchUsersByIds = async () => {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://masai-connect-backend-w28f.vercel.app/api/users?ids=${userIds.join(',')}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch users by ids");
            const data = await res.json();
            setMentors(data);
          } catch (err) {
            console.error(err);
          }
        };
        fetchUsersByIds();
      } else {
        setMentors([]);
      }
    }
  }, [bookingStep, selectedSessionType, course]);

  // ----- Fetch Available Slots for Selected Mentor -----
  useEffect(() => {
    const fetchSlots = async () => {
      if (bookingStep === 'selectSlot' && selectedMentor) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`https://masai-connect-backend-w28f.vercel.app/api/slots?mentor=${selectedMentor._id}&status=Open`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Failed to fetch slots");
          const data = await res.json();
          // Filter slots to include only those from today to next week
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          const filteredSlots = data.filter(slot => {
            const slotDate = parseSlotDate(slot.date);
            return slotDate >= today && slotDate <= nextWeek;
          });
          setAvailableSlots(filteredSlots);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchSlots();
  }, [bookingStep, selectedMentor]);

  // ----- Confirm Booking: Create a New Booking via Backend -----
  const confirmBooking = async () => {
    if (sessions.length >= MAX_BOOKINGS) {
      alert("You have reached your maximum booking limit.");
      return;
    }
    const token = localStorage.getItem('token');
    const payload = {
      student: "679c6adcfa0a2f65ce121758",    
      mentor: selectedMentor._id,              
      sessionType: selectedSessionType.id,     
      mode: selectedSessionMode,               
      slot: {                                   
        slotId: selectedSlot.slotId || selectedSlot._id,  
        date: selectedSlot.date,
        time: selectedSlot.time,
      },
      agenda: agenda.trim(),                    
    };
    try {
      const res = await fetch("https://masai-connect-backend-w28f.vercel.app/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Booking creation failed");
      }
      const booking = await res.json();
      setSessions([...sessions, {
        id: booking._id,
        sessionType: booking.sessionType,
        sessionMode: booking.mode,
        mentor: booking.mentor,
        slot: booking.slot,
        slotId: booking.slot.slotId,
        agenda: booking.agenda,
        status: booking.status,
        zoomJoinUrl: booking.zoomJoinUrl,
      }]);
      setBookingStep('success');
      setTimeout(() => {
        setBookingModalVisible(false);
      }, 2000);
    } catch (error) {
      console.error("Error creating booking:", error);
      alert(error.message);
    }
  };

  // ----- Utility: Color-coding for sessions based on status -----
  const getStatusColor = (status) => {
    if (status === 'Booked') return 'border-blue-500 bg-blue-50';
    if (status === 'Rescheduled') return 'border-amber-500 bg-amber-50';
    if (status === 'Attended') return 'border-green-500 bg-green-50';
    return 'border-gray-500 bg-gray-50';
  };

  // ----- Determine Join Button Status -----
  const getJoinButtonStatus = (session) => {
    const { start, end } = parseSessionSlotTime(session.slot.date, session.slot.time);
    const now = new Date();
    if (session.status === 'Completed' || now > end) {
      return { disabled: true, label: 'Session Ended' };
    }
    // Show join button for both Upcoming and Ongoing sessions
    return { disabled: false, label: 'Join' };
  };

  // ----- Filtering Sessions by Active Tab -----
  const filteredSessions = sessions.filter((session) => {
    const sessionStatus = getSessionStatus(session);
    if (activeTab === 'Upcoming') {
      return sessionStatus === "Upcoming" || sessionStatus === "Ongoing";
    } else if (activeTab === 'Ongoing') {
      return sessionStatus === "Ongoing";
    } else if (activeTab === 'Past') {
      return sessionStatus === "Past";
    }
    return true;
  });

  // ----- Get Current Week (if needed) -----
  const currentWeek = getCurrentWeek();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full p-8 bg-gray-100 relative">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Sessions</h1>
          {/* ----- Tabs for Sessions ----- */}
          <div className="flex space-x-6 mb-8 border-b pb-2">
            {['Upcoming', 'Ongoing', 'Past'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-medium pb-2 transition-all ${
                  activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* ----- Display Sessions ----- */}
          {filteredSessions.length === 0 ? (
            <p className="text-gray-600">No {activeTab.toLowerCase()} sessions found.</p>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const sessionStatus = getSessionStatus(session);
                const joinStatus = getJoinButtonStatus(session);
                return (
                  <div
                    key={session.id}
                    className={`relative border-l-4 p-4 rounded shadow-md ${getStatusColor(session.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {session.sessionType?.label ?? session.sessionType}
                      </h2>
                      <span className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-700">
                        {session.sessionMode}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">
                      With {session.mentor.name}
                      {getDisplayRole(session.mentor, selectedSessionType) && 
                        ` (${getDisplayRole(session.mentor, selectedSessionType)})`}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <FiCalendar className="text-blue-500" />
                      <span>{session.slot.date}</span>
                      <FiClock className="text-blue-500" />
                      <span>{session.slot.time}</span>
                    </div>
                    {session.agenda && (
                      <p className="mt-2 text-gray-600">
                        <span className="font-medium">Agenda:</span> {session.agenda}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">Status: {session.status}</p>
                    {/* ----- Join Button / Status Indicator ----- */}
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                      {joinStatus && (
                        <a
                          href={!joinStatus.disabled ? session.zoomJoinUrl : undefined}
                          onClick={(e) => {
                            if (joinStatus.disabled) e.preventDefault();
                          }}
                          className={`inline-flex items-center px-6 py-2 rounded-lg transition-all duration-300 shadow-lg ${
                            joinStatus.disabled
                              ? 'bg-blue-300 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          } text-white`}
                          target={joinStatus.disabled ? "_self" : "_blank"}
                          rel={joinStatus.disabled ? undefined : "noopener noreferrer"}
                        >
                          <FiVideo className="h-5 w-5 mr-2" />
                          <span>{joinStatus.label}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* ----- Floating "Book Session" Button ----- */}
          <button
            onClick={openBookingModal}
            disabled={sessions.length >= MAX_BOOKINGS}
            title={sessions.length >= MAX_BOOKINGS ? `Booking limit reached. You can only book ${MAX_BOOKINGS} sessions.` : ""}
            className={`fixed bottom-6 right-6 ${
              sessions.length >= MAX_BOOKINGS 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            } text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-colors`}
          >
            Book Session
          </button>
          {/* ----- Booking Modal ----- */}
          {bookingModalVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 w-full max-w-2xl shadow-lg relative">
                <button
                  className="absolute top-4 right-4"
                  onClick={closeBookingModal}
                >
                  <FiXCircle className="text-red-500 text-2xl" />
                </button>
                {/* ----- Step 1: Select Session Type ----- */}
                {bookingStep === 'selectType' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Select Session Type</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {connectionTypes.map((type) => {
                        const colors = connectionTypeColors[type.id] || {};
                        return (
                          <button
                            key={type.id}
                            className={`shadow-lg rounded-lg p-6 transition-all ${colors.bg || 'bg-white'} ${colors.border ? 'border ' + colors.border : ''} hover:shadow-xl`}
                            onClick={() => {
                              setSelectedSessionType(type);
                              setBookingStep('selectMentor');
                            }}
                          >
                            <div className="flex items-center space-x-4">
                              <FiUser className={`text-7xl ${colors.text || 'text-blue-500'}`} />
                              <div>
                                <h3 className="text-xl font-medium text-gray-800">{type.label}</h3>
                                <p className="text-sm text-gray-600">{type.description}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* ----- Step 2: Select Mentor/Leader (Course-Specific) ----- */}
                {bookingStep === 'selectMentor' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                      Select {selectedSessionType.label.includes('Leadership') ? 'Leader' : 'Mentor'}
                    </h2>
                    <div className="max-h-[300px] overflow-y-auto pr-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {mentors.length > 0 ? (
                          mentors.map((mentor) => (
                            <button
                              key={mentor._id}
                              className="bg-white border border-gray-300 rounded-lg p-6 flex items-center hover:shadow-lg transition-all hover:bg-gray-100"
                              onClick={() => {
                                setSelectedMentor(mentor);
                                setBookingStep('selectSlot');
                              }}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="bg-blue-100 rounded-full p-3">
                                  {selectedSessionType.label.includes('Leadership') ? (
                                    <FiUserCheck className="text-blue-500 text-2xl" />
                                  ) : (
                                    <FiUser className="text-blue-500 text-2xl" />
                                  )}
                                </div>
                                <div className="text-left">
                                  <p className="text-lg font-medium text-gray-800">{mentor.name}</p>
                                  {getDisplayRole(mentor, selectedSessionType) && (
                                    <p className="text-sm text-gray-600">
                                      ({getDisplayRole(mentor, selectedSessionType)})
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="text-gray-600">No mentors found.</p>
                        )}
                      </div>
                    </div>
                    <button
                      className="mt-6 text-blue-600 hover:underline"
                      onClick={() => setBookingStep('selectType')}
                    >
                      Back
                    </button>
                  </div>
                )}
                {/* ----- Step 3: Select a Slot (Single Scrollable Container) ----- */}
                {bookingStep === 'selectSlot' && (
                  <div className="p-6 bg-white rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Select a Slot</h2>
                    <div className="relative w-full max-h-[500px] overflow-auto">
                      {availableSlots.length > 0 ? (
                        <div className="inline-flex flex-nowrap space-x-6 pb-4">
                          {Object.entries(groupSlotsByDate(availableSlots))
                            .sort(([dateA], [dateB]) => parseSlotDate(dateA) - parseSlotDate(dateB))
                            .map(([date, slots]) => (
                              <div
                                key={date}
                                className="flex-shrink-0 min-w-[200px] w-64 border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                              >
                                <h3 className="text-xl font-medium text-gray-700 mb-4">{date}</h3>
                                <div className="flex flex-col space-y-4">
                                  {slots.map((slot) => {
                                    const booked = isSlotBooked(slot._id || slot.id);
                                    return (
                                      <button
                                        key={slot._id || slot.id}
                                        className={`w-full text-center p-4 rounded-lg transition-all ${
                                          booked
                                            ? 'bg-red-100 text-red-500 cursor-not-allowed'
                                            : 'bg-blue-50 hover:bg-blue-100 text-gray-800'
                                        }`}
                                        disabled={booked}
                                        onClick={() => {
                                          setSelectedSlot(slot);
                                          setBookingStep('selectMode');
                                        }}
                                      >
                                        {slot.time}
                                        {booked && <span className="block text-sm mt-1">Booked</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10">
                          <FiXCircle className="text-gray-400 text-5xl" />
                          <p className="text-gray-500 mt-4">No available slots at the moment</p>
                        </div>
                      )}
                    </div>
                    <button
                      className="mt-6 text-blue-600 hover:underline"
                      onClick={() => setBookingStep('selectMentor')}
                    >
                      Back
                    </button>
                  </div>
                )}
                {/* ----- Step 4: Select Session Mode ----- */}
                {bookingStep === 'selectMode' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Select Session Mode</h2>
                    <div className="flex space-x-6">
                      <button
                        onClick={() => {
                          setSelectedSessionMode('Private');
                          setBookingStep('confirm');
                        }}
                        className="flex-1 border rounded-lg p-6 text-center hover:bg-gray-100 transition-all"
                      >
                        <span className="block text-2xl font-semibold text-gray-800">Private</span>
                        <span className="block text-sm text-gray-600 mt-1">
                          One-to-one session offering personalized attention.
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSessionMode('Public');
                          setBookingStep('confirm');
                        }}
                        className="flex-1 border rounded-lg p-6 text-center hover:bg-gray-100 transition-all"
                      >
                        <span className="block text-2xl font-semibold text-gray-800">Public</span>
                        <span className="block text-sm text-gray-600 mt-1">
                          One-to-many session where multiple participants join.
                        </span>
                      </button>
                    </div>
                    <button
                      className="mt-6 text-blue-600 hover:underline"
                      onClick={() => setBookingStep('selectSlot')}
                    >
                      Back
                    </button>
                  </div>
                )}
                {/* ----- Step 5: Confirm Booking ----- */}
                {bookingStep === 'confirm' && (
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Booking</h2>
                    <div className="space-y-4">
                      <div>
                        <span className="font-medium text-gray-700">Session Type:</span> {selectedSessionType.label}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Mode:</span> {selectedSessionMode}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">With:</span> {selectedMentor.name}
                        {getDisplayRole(selectedMentor, selectedSessionType) && (
                          <> ({getDisplayRole(selectedMentor, selectedSessionType)})</>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiCalendar className="text-blue-500" />
                        <span className="font-medium text-gray-700">Date:</span> {selectedSlot.date}
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiClock className="text-blue-500" />
                        <span className="font-medium text-gray-700">Time:</span> {selectedSlot.time}
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1" htmlFor="agenda">
                          Agenda for the session <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="agenda"
                          maxLength={200}
                          required
                          className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="Enter agenda..."
                          value={agenda}
                          onChange={(e) => setAgenda(e.target.value)}
                        ></textarea>
                        <p className="text-right text-sm text-gray-500 mt-1">{agenda.length} / 200 characters</p>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between">
                      <button
                        onClick={() => setBookingStep('selectMode')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={confirmBooking}
                        disabled={!agenda.trim()}
                        className={`${
                          !agenda.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white font-medium py-2 px-6 rounded transition-colors`}
                      >
                        Confirm Booking
                      </button>
                    </div>
                  </div>
                )}
                {/* ----- Step 6: Booking Success ----- */}
                {bookingStep === 'success' && (
                  <div className="flex flex-col items-center justify-center">
                    <FiCheckCircle className="text-green-500 text-5xl mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Booking Confirmed!</h2>
                    <div className="mt-4 border p-4 rounded-lg w-full bg-blue-50">
                      <p>
                        <span className="font-medium text-gray-700">Session Type:</span> {selectedSessionType.label}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Mode:</span> {selectedSessionMode}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">With:</span> {selectedMentor.name}
                        {getDisplayRole(selectedMentor, selectedSessionType) && (
                          <> ({getDisplayRole(selectedMentor, selectedSessionType)})</>
                        )}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Date:</span> {selectedSlot.date}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Time:</span> {selectedSlot.time}
                      </p>
                      {agenda && (
                        <p>
                          <span className="font-medium text-gray-700">Agenda:</span> {agenda}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
