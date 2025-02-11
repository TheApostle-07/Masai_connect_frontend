import { useEffect, useState } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement, ArcElement } from 'chart.js';
import Sidebar from '../shared-components/Sidebar';
import Header from '../shared-components/Header';

ChartJS.register(
    Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement, ArcElement
);

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState({
        sessions: [],
        reports: [],
        userMetrics: {
            roles: { students: 70, mentors: 20, admins: 10 },
            newSignups: [5, 10, 7, 12, 20, 30],
            revenue: [2000, 3000, 5000, 4000, 6000, 7000],
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const simulateFetchData = () => {
            const simulatedResponse = {
                sessions: [
                    {
                        _id: '1',
                        title: 'Web Development Basics',
                        date: new Date().toISOString(),
                        description: 'An introductory session on web development.',
                        meetingLink: 'https://zoom.us/j/1234567890',
                    },
                    {
                        _id: '2',
                        title: 'Advanced JavaScript',
                        date: new Date(Date.now() + 86400000).toISOString(),
                        description: 'An advanced session covering closures and async patterns.',
                        meetingLink: 'https://zoom.us/j/9876543210',
                    },
                ],
                reports: [
                    {
                        date: new Date().toISOString(),
                        usersActive: 30,
                        sessionsBooked: 35,
                    },
                    {
                        date: new Date(Date.now() - 86400000).toISOString(),
                        usersActive: 60,
                        sessionsBooked: 40,
                    },
                    {
                        date: new Date().toISOString(),
                        usersActive: 30,
                        sessionsBooked: 35,
                    },
                    {
                        date: new Date(Date.now() - 86400000).toISOString(),
                        usersActive: 70,
                        sessionsBooked: 40,
                    },
                ],
                userMetrics: {
                    roles: { students: 70, mentors: 20, admins: 10 },
                    newSignups: [5, 10, 7, 12, 20, 30],
                    revenue: [2000, 3000, 5000, 4000, 6000, 7000],
                },
            };

            setTimeout(() => {
                setDashboardData(simulatedResponse);
                setLoading(false);
            }, 1000);
        };

        simulateFetchData();
    }, []);

    // Prepare data for charts
    const reportDates = dashboardData.reports.map((report) => new Date(report.date).toLocaleDateString());
    const usersActiveData = dashboardData.reports.map((report) => report.usersActive);
    const sessionsBookedData = dashboardData.reports.map((report) => report.sessionsBooked);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex flex-1">
                <Sidebar className="h-full"/>

                <main className="flex-1 w-full p-6 bg-gray-100">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-t-4 border-gray-300"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-600">{error}</div>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

                            {/* Metrics Section */}
                            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-0 flex-grow h-[95vh]">
    {/* Active Users Chart */}
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Users Active Over Time</h2>
        <div className="flex-1">
            <Line
                data={{
                    labels: reportDates,
                    datasets: [
                        {
                            label: 'Users Active',
                            data: usersActiveData,
                            borderColor: '#007EA7',
                            backgroundColor: 'rgba(0, 126, 167, 0.3)',
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

    {/* Sessions Booked Chart */}
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Sessions Booked</h2>
        <div className="flex-1">
            <Bar
                data={{
                    labels: reportDates,
                    datasets: [
                        {
                            label: 'Sessions Booked',
                            data: sessionsBookedData,
                            backgroundColor: '#FCA311',
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

    {/* Role Distribution Chart */}
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Role Distribution</h2>
        <div className="flex-1">
            <Doughnut
                data={{
                    labels: ['Students', 'Mentors', 'Admins'],
                    datasets: [
                        {
                            data: Object.values(dashboardData.userMetrics.roles),
                            backgroundColor: ['#007EA7', '#FCA311', '#00A8E8'],
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                }}
            />
        </div>
    </div>

    {/* New Signups Over Time */}
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">New Signups Over Time</h2>
        <div className="flex-1">
            <Line
                data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'New Signups',
                            data: dashboardData.userMetrics.newSignups,
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

    {/* Revenue Chart */}
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col h-[45vh]">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Revenue</h2>
        <div className="flex-1">
            <Bar
                data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Revenue',
                            data: dashboardData.userMetrics.revenue,
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

    {/* Sessions Overview */}
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Sessions Overview</h2>
        <div className="flex-1">
            <Pie
                data={{
                    labels: ['Completed', 'Upcoming', 'Cancelled'],
                    datasets: [
                        {
                            data: [12, 8, 2],
                            backgroundColor: ['#007EA7', '#FCA311', '#E94E77'],
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                }}
            />
        </div>
    </div>
</section>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}