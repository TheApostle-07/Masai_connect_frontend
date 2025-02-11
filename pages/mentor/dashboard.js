import { useEffect, useState } from 'react';
import Sidebar from '../shared-components/Sidebar';
import Header from '../shared-components/Header';
import { 
  FiCalendar, 
  FiClock, 
  FiPlus, 
  FiXCircle, 
  FiUser, 
  FiUserCheck,
  FiCheckCircle,
  FiEdit,
  FiVideo,
  FiUsers,
  FiAward,
  FiActivity,
  FiBarChart2,
  FiMessageSquare,
  FiSmile,
  FiDollarSign
} from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement
);

const sessionTypeToDesiredRole = {
  "Peer-to-Peer": "IA",
  "Dost / EC Connect": "EC",
  "Leadership Connect": "LEADERSHIP",
  "Mentor Connect": "MENTOR"
};

// Returns the role to display for a given mentor and session type.
// Always returns the desired role or an empty string if none.
const getDisplayRole = (mentor, sessionType) => {
  if (!mentor || !sessionType) return "";
  return sessionTypeToDesiredRole[sessionType.id] || "";
};

// Helper: Parse a dd-mm-yyyy date string into a Date object.
const parseSlotDate = (dateStr) => {
  const [day, month, year] = dateStr.split('-');
  return new Date(year, month - 1, day);
};

// Helper functions for session time parsing.
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

// Helper: Get current week (Monday to Sunday)
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

// Helper: Group an array of slots by date.
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

export default function MentorDashboard() {
  // State for dashboard data (simulate fetch)
  const [dashboardData, setDashboardData] = useState({
    sessions: [],
    mentees: [
      { name: 'John Doe', progress: 80 },
      { name: 'Jane Smith', progress: 65 },
    ],
    performanceMetrics: {
      sessionRatings: [4.5, 4.8, 4.7, 4.9],
      sessionsCompleted: 25,
      upcomingSessions: 3,
      menteeProgress: [80, 65],
      feedbackScore: 4.7,
      mentoringHours: 40,
      engagementRate: 85,
      menteesAssigned: 10,
      menteeRetentionRate: 90,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Simulate data fetching
  useEffect(() => {
    const simulateFetchData = () => {
      setTimeout(() => {
        setDashboardData(dashboardData); // Use your simulated data
        setLoading(false);
      }, 1000);
    };
    simulateFetchData();
  }, []);

  // Compute chart data arrays and averages
  const sessionRatingsData = dashboardData.performanceMetrics.sessionRatings;
  const menteeProgressData = dashboardData.performanceMetrics.menteeProgress;
  const averageRating =
    sessionRatingsData.length > 0
      ? (sessionRatingsData.reduce((sum, rating) => sum + rating, 0) / sessionRatingsData.length).toFixed(1)
      : '0';

  // Expanded metrics array (20 metrics)
  const metricsArray = [
    { label: 'Sessions Completed', value: dashboardData.performanceMetrics.sessionsCompleted, icon: <FiUsers /> },
    { label: 'Upcoming Sessions', value: dashboardData.performanceMetrics.upcomingSessions, icon: <FiClock /> },
    { label: 'Feedback Score', value: `${averageRating}/5`, icon: <FiAward /> },
    { label: 'Mentoring Hours', value: `${dashboardData.performanceMetrics.mentoringHours} hrs`, icon: <FiClock /> },
    { label: 'Engagement Rate', value: `${dashboardData.performanceMetrics.engagementRate}%`, icon: <FiActivity /> },
    { label: 'Mentees Assigned', value: dashboardData.performanceMetrics.menteesAssigned, icon: <FiUsers /> },
    { label: 'Mentee Retention Rate', value: `${dashboardData.performanceMetrics.menteeRetentionRate}%`, icon: <FiAward /> },
    { label: 'Avg Session Duration', value: '75 min', icon: <FiClock /> },
    { label: 'Total Sessions', value: dashboardData.sessions.length, icon: <FiActivity /> },
    { label: 'Avg Mentee Progress', value: `${(dashboardData.performanceMetrics.menteeProgress.reduce((a, b) => a + b, 0) / dashboardData.performanceMetrics.menteeProgress.length).toFixed(1)}%`, icon: <FiBarChart2 /> },
    { label: 'Total Mentees', value: dashboardData.mentees.length, icon: <FiUsers /> },
    { label: 'New Mentees (Month)', value: 3, icon: <FiUser /> },
    { label: 'Total Messages', value: 150, icon: <FiMessageSquare /> },
    { label: 'Cancellation Rate', value: '5%', icon: <FiXCircle /> },
    { label: 'Avg Response Time', value: '2 min', icon: <FiClock /> },
    { label: 'Positive Feedback Rate', value: '95%', icon: <FiSmile /> },
    { label: 'Highest Rating', value: Math.max(...dashboardData.performanceMetrics.sessionRatings), icon: <FiAward /> },
    { label: 'Lowest Rating', value: Math.min(...dashboardData.performanceMetrics.sessionRatings), icon: <FiAward /> },
    { label: 'Total Earnings', value: '$1200', icon: <FiDollarSign /> },
    { label: 'Best Month', value: 'August', icon: <FiCalendar /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <Sidebar className="h-full" />
        <main className="flex-1 w-full p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-gray-300"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Mentor Dashboard</h1>
              
              {/* Charts Section */}
              <section className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Session Ratings Line Chart */}
                  <div className="bg-white shadow-md rounded-lg p-6 flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Session Ratings</h2>
                    <div className="flex-1 h-48">
                      <Line
                        data={{
                          labels: ['Session 1', 'Session 2', 'Session 3', 'Session 4'],
                          datasets: [
                            {
                              label: 'Rating',
                              data: sessionRatingsData,
                              borderColor: '#00A8E8',
                              backgroundColor: 'rgba(0, 168, 232, 0.3)',
                              tension: 0.3,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                        }}
                      />
                    </div>
                  </div>

                  {/* Mentee Progress Bar Chart */}
                  <div className="bg-white shadow-md rounded-lg p-6 flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Mentee Progress</h2>
                    <div className="flex-1 h-48">
                      <Bar
                        data={{
                          labels: dashboardData.mentees.map(m => m.name),
                          datasets: [
                            {
                              label: 'Progress %',
                              data: dashboardData.mentees.map(m => m.progress),
                              backgroundColor: '#007EA7',
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Metrics Cards Section */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metricsArray.map((metric, idx) => (
                  <div
                    key={idx}
                    className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow flex items-center space-x-4"
                  >
                    <div className="text-blue-500 text-4xl">{metric.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">{metric.label}</h3>
                      <p className="text-2xl font-bold text-blue-600">{metric.value}</p>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}