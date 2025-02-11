import { useEffect, useState } from 'react';
import Sidebar from '../shared-components/Sidebar';
import Header from '../shared-components/Header';
import { 
  FiCalendar, 
  FiClock, 
  FiUserCheck, 
  FiVideo, 
  FiCheckCircle 
} from 'react-icons/fi';

/**
 * Helper: Parse a dd-mm-yyyy date string into a JS Date object.
 */
const parseSessionDate = (dateStr) => {
  const [day, month, year] = dateStr.split('-');
  return new Date(year, month - 1, day);
};

/**
 * Helper: Given a session (with date and time), return an object with its start and end Date objects.
 */
const getSessionTimes = (session) => {
  const date = parseSessionDate(session.date);
  const [startTimeStr, endTimeStr] = session.time.split(' - ');
  
  const parseTime = (timeStr) => {
    const [time, meridian] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (meridian === 'PM' && hours !== 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  };
  
  const { hours: startHours, minutes: startMinutes } = parseTime(startTimeStr);
  const { hours: endHours, minutes: endMinutes } = parseTime(endTimeStr);
  
  const startDateTime = new Date(date);
  const endDateTime = new Date(date);
  startDateTime.setHours(startHours, startMinutes, 0, 0);
  endDateTime.setHours(endHours, endMinutes, 0, 0);
  
  return { startDateTime, endDateTime };
};

/**
 * Determine the join button state for a session.
 * - If the session is marked as "Completed" or the current time is after the session’s end time, return a disabled button with "Session Ended".
 * - Otherwise (for upcoming and ongoing sessions), return an enabled join button.
 */
const getJoinButtonStatus = (session) => {
  const { startDateTime, endDateTime } = getSessionTimes(session);
  const now = new Date();

  if (session.status === 'Completed' || now > endDateTime) {
    return { disabled: true, label: 'Session Ended' };
  }
  return { disabled: false, label: 'Join' };
};

export default function MentorSchedule() {
  // ----- State for Sessions -----
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState("Upcoming");

  // ----- Pagination State -----
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when activeTab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // ----- Fetch Sessions from the Backend -----
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // For testing, we use Rufus Bright's _id as the mentor id.
        const mentorId = "679c6adcfa0a2f65ce121758";
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("Token not found in localStorage.");
        }
        const response = await fetch(`https://masai-connect-backend-w28f.vercel.app/api/bookings?user=${mentorId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch sessions.");
        }
        const data = await response.json();
        const sessionsData = data.map((booking) => ({
          id: booking._id,
          title: booking.sessionType,
          studentName: booking.student?.name || "Student",
          date: booking.slot.date,
          time: booking.slot.time,
          status: booking.status,
          mode: booking.mode,
          agenda: booking.agenda,
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

  // ----- Utility: Color Coding Based on Session Status -----
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'border-blue-500 bg-blue-50';
      case 'In Progress':
        return 'border-yellow-500 bg-yellow-50';
      case 'Completed':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  // ----- Filtering Sessions by Active Tab -----
  const filteredSessions = sessions.filter((session) => {
    const { startDateTime, endDateTime } = getSessionTimes(session);
    const now = new Date();
    if (activeTab === 'Upcoming') {
      return startDateTime > now;
    } else if (activeTab === 'Ongoing') {
      return now >= startDateTime && now <= endDateTime;
    } else if (activeTab === 'Past') {
      return now > endDateTime;
    }
    return true;
  });

  // ----- Pagination Logic -----
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar className="h-full" />
        <main className="flex-1 w-full p-8 bg-gray-100">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Mentor Schedule</h1>
          {/* Tabs */}
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
          {filteredSessions.length === 0 ? (
            <p className="text-gray-600">No {activeTab.toLowerCase()} sessions found.</p>
          ) : (
            <>
              {/* Session Cards */}
              <div className="space-y-6 relative">
                {paginatedSessions.map((session) => {
                  const joinStatus = getJoinButtonStatus(session);
                  return (
                    <div
                      key={session.id}
                      className={`relative border-l-4 p-6 rounded shadow-md ${getStatusClasses(session.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">
                          {session.title}
                        </h2>
                        <span className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-700">
                          {session.mode}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1 flex items-center space-x-1">
                        <FiUserCheck className="text-blue-500" />
                        <span className="font-medium">Student:</span>
                        <span>{session.studentName}</span>
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <FiCalendar className="text-blue-500" />
                        <span>{session.date}</span>
                        <FiClock className="text-blue-500" />
                        <span>{session.time}</span>
                      </div>
                      {session.agenda && (
                        <p className="mt-2 text-gray-600">
                          <span className="font-medium">Agenda:</span> {session.agenda}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-500">Status: {session.status}</p>
                      {/* Join Button / Status Indicator */}
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
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-4 mt-8">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}