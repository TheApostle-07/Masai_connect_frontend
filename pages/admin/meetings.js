import { useState, useEffect } from 'react';
import Sidebar from '../shared-components/Sidebar';
import Header from '../shared-components/Header';
import { FiCalendar, FiClock, FiExternalLink, FiX, FiPlus, FiTag, FiMail, FiVideo,FiArrowRightCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function AdminMeetings() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDateTime: '',
        endDateTime: '',
        participants: [],
    });
    const [participantEmail, setParticipantEmail] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Fetch meetings from backend
    useEffect(() => {
        const fetchMeetingsData = async () => {
            try {
                const response = await fetch('http://localhost:5003/api/meetings');

                if (!response.ok) {
                    throw new Error('Failed to load meetings data');
                }

                const data = await response.json();

                // Sort meetings by date (most recent first)
                setMeetings(data.meetings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
            } catch (err) {
                console.error('Error fetching meetings data:', err);
                setError('Failed to load meetings data.');
            } finally {
                setLoading(false);
            }
        };

        fetchMeetingsData();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Add participant to form data
    const addParticipant = () => {
        if (participantEmail) {
            setFormData({ ...formData, participants: [...formData.participants, { email: participantEmail }] });
            setParticipantEmail('');
        }
    };

    // Calculate meeting duration in minutes
    const calculateDuration = (start, end) => {
        const startTime = new Date(start);
        const endTime = new Date(end);
        return Math.floor((endTime - startTime) / (1000 * 60)); // Duration in minutes
    };

    // Handle meeting creation
    const handleCreateMeeting = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5003/api/meetings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    startTime: formData.startDateTime,
                    duration: calculateDuration(formData.startDateTime, formData.endDateTime),
                    labels: formData.participants.map((p) => p.email),
                    createdBy: '67a4ac4c648240ef8e4e8ba6',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create meeting');
            }

            const data = await response.json();

            setMeetings([data.meeting, ...meetings]);
            setSuccessMessage('Meeting created successfully!');
            setShowModal(false);
        } catch (error) {
            console.error('Error creating meeting:', error);
            alert('Error creating meeting.');
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex flex-1">
                <Sidebar />

                <main className="flex-1 p-6 bg-gray-100">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-gray-300"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-600">{error}</div>
                    ) : (
                        <div className="max-w-8xl mx-auto bg-white shadow-lg rounded-lg p-8 relative">
                            <h1 className="text-3xl font-bold text-gray-800 mb-6">🗓️ Manage Meetings</h1>

                            {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

                            <h2 className="text-xl font-bold mb-4">Upcoming Meetings</h2>
                            {meetings.length > 0 ? (
    <ul className="space-y-4">
        {meetings.map((meeting) => (
            <li key={meeting._id} className="p-6 border rounded-lg bg-white shadow-lg flex items-center hover:shadow-xl hover:border-blue-500 transition-all duration-300 space-x-6 transform hover:-translate-y-1">
                {/* Icon */}
                <div className="flex items-center justify-center bg-blue-100 text-blue-500 rounded-full h-12 w-12">
                    <FiCalendar className="h-7 w-7" />
                </div>

                {/* Meeting Details */}
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{meeting.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{meeting.description || 'No description provided.'}</p>
                    <p className="text-sm text-gray-500 flex items-center space-x-2 mt-2">
                        <FiClock className="h-5 w-5 text-blue-500" />
                        <span>
                            {new Date(meeting.startTime).toLocaleString(undefined, {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    </p>
                </div>

                {/* Join Button */}
                <a
                    href={meeting.zoomJoinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
                >
                    <span>Join</span>
                    <FiExternalLink className="h-5 w-5 ml-2" />
                </a>
            </li>
        ))}
    </ul>
) : (
    <p className="text-center text-gray-500">No meetings scheduled.</p>
)}
                            {/* Floating button to create a new meeting */}
                            <button
                                className="fixed bottom-20 right-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-300 hover:w-52"
                                onClick={() => setShowModal(true)}
                                title="Create New Meeting"
                            >
                                <div className="flex items-center space-x-10">
                                    <span className="text-2xl font-bold transition-transform duration-300 transform hover:translate-x-[-10px]">+</span>
                                    <span className="text-lg font-medium opacity-0 hover:opacity-100 transition-opacity duration-300">
                                        New Meeting
                                    </span>
                                </div>
                            </button>

                            {/* Meeting creation modal */}
                            {showModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Create New Meeting</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800">
                    <FiX size={24} />
                </button>
            </div>
            <form onSubmit={handleCreateMeeting} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Meeting Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter meeting title"
                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Meeting Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter meeting description"
                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Start Time</label>
                        <input
                            type="datetime-local"
                            name="startDateTime"
                            value={formData.startDateTime}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">End Time</label>
                        <input
                            type="datetime-local"
                            name="endDateTime"
                            value={formData.endDateTime}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                </div>
                
                {/* Add labels */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Labels</label>
                    <div className="flex items-center space-x-4 mb-2">
                        <input
                            type="text"
                            value={participantEmail}
                            onChange={(e) => setParticipantEmail(e.target.value)}
                            placeholder="Add a label or participant email"
                            className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={addParticipant}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                            <FiPlus size={20} />
                        </button>
                    </div>

                    {/* Display added labels */}
                    {formData.participants.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.participants.map((label, index) => (
                                <span key={index} className="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full shadow-sm">
                                    <FiTag size={16} />
                                    <span>{label.email}</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex space-x-4">
                    <button type="submit" className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                        Create Meeting
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}