import { useEffect, useState } from 'react';
import Sidebar from '../shared-components/Sidebar';
import Header from '../shared-components/Header';
import { FiClock } from 'react-icons/fi';
import {
    FiCode,
    FiMonitor,
    FiTerminal,
    FiDatabase,
    FiCloud,
    FiLock,
    FiBook,
    FiTrendingUp,
    FiZap,
    FiTool,
} from 'react-icons/fi';

export default function StudentLectures() {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Dummy data with dynamic icons
    const dummyLectures = [
        {
            id: '1',
            title: 'Introduction to Web Development',
            description: 'Learn the basics of web development, including HTML, CSS, and JavaScript.',
            date: '2025-02-10T10:00:00Z',
            duration: '2 hours',
            icon: <FiCode className="text-blue-500" />,
        },
        {
            id: '2',
            title: 'Advanced JavaScript Concepts',
            description: 'Deep dive into closures, async patterns, and ES6+ features.',
            date: '2025-02-12T14:00:00Z',
            duration: '1.5 hours',
            icon: <FiTerminal className="text-blue-500" />,
        },
        {
            id: '3',
            title: 'React Fundamentals',
            description: 'Understand the core concepts of React and how to build dynamic user interfaces.',
            date: '2025-02-15T09:00:00Z',
            duration: '3 hours',
            icon: <FiMonitor className="text-blue-500" />,
        },
        {
            id: '4',
            title: 'Database Design and Management',
            description: 'Learn how to design and manage relational databases using SQL.',
            date: '2025-02-18T11:00:00Z',
            duration: '2 hours',
            icon: <FiDatabase className="text-blue-500" />,
        },
        {
            id: '5',
            title: 'Cloud Computing Basics',
            description: 'Get an overview of cloud platforms and learn how to deploy applications to the cloud.',
            date: '2025-02-20T13:00:00Z',
            duration: '2.5 hours',
            icon: <FiCloud className="text-blue-500" />,
        },
        {
            id: '6',
            title: 'Cybersecurity Essentials',
            description: 'Understand common security threats and best practices to secure applications.',
            date: '2025-02-22T15:00:00Z',
            duration: '2 hours',
            icon: <FiLock className="text-blue-500" />,
        },
        {
            id: '7',
            title: 'Data Structures and Algorithms',
            description: 'Master key data structures and algorithms with practical examples.',
            date: '2025-02-25T09:00:00Z',
            duration: '3 hours',
            icon: <FiBook className="text-blue-500" />,
        },
        {
            id: '8',
            title: 'Performance Optimization Techniques',
            description: 'Learn techniques to improve the performance of web applications.',
            date: '2025-02-28T10:00:00Z',
            duration: '1.5 hours',
            icon: <FiTrendingUp className="text-blue-500" />,
        },
        {
            id: '9',
            title: 'Version Control with Git',
            description: 'Explore how to use Git for version control and collaborate on projects.',
            date: '2025-03-01T14:00:00Z',
            duration: '2 hours',
            icon: <FiTool className="text-blue-500" />,
        },
        {
            id: '10',
            title: 'Introduction to APIs and RESTful Services',
            description: 'Understand how APIs work and how to build RESTful services.',
            date: '2025-03-03T12:00:00Z',
            duration: '2.5 hours',
            icon: <FiZap className="text-blue-500" />,
        },
    ];

    useEffect(() => {
        // Simulate fetching lectures with a delay
        setTimeout(() => {
            setLectures(dummyLectures);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex flex-1">
                <Sidebar className="h-full" />

                <main className="flex-1 w-full p-6 bg-gray-100">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-gray-300"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-600">{error}</div>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-6">Lectures</h1>

                            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {lectures.map((lecture) => (
                                    <div key={lecture.id} className="bg-white shadow-lg rounded-lg p-6 flex flex-col space-y-4">
                                        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                                            {lecture.icon}
                                            <span className="ml-2">{lecture.title}</span>
                                        </h2>
                                        <p className="text-sm text-gray-600">{lecture.description}</p>
                                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                                            <FiClock className="text-blue-500" />
                                            <span>{new Date(lecture.date).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">Duration: {lecture.duration}</p>
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