import { useEffect, useState } from 'react';
import Sidebar from '../shared-components/Sidebar';
import Header from '../shared-components/Header';
import { FiFileText, FiCheckCircle, FiClock, FiEdit2 } from 'react-icons/fi';

export default function StudentAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Dummy assignment data
    const dummyAssignments = [
        {
            id: '1',
            title: 'HTML & CSS Basics',
            description: 'Create a simple static webpage using HTML and CSS.',
            dueDate: '2025-02-20T23:59:59Z',
            status: 'Pending',
            icon: <FiEdit2 className="text-blue-500" />,
        },
        {
            id: '2',
            title: 'JavaScript Functions',
            description: 'Write functions to perform various arithmetic operations.',
            dueDate: '2025-02-22T23:59:59Z',
            status: 'Completed',
            icon: <FiCheckCircle className="text-green-500" />,
        },
        {
            id: '3',
            title: 'React Components',
            description: 'Build a basic React app with functional components.',
            dueDate: '2025-02-28T23:59:59Z',
            status: 'Completed',
            icon: <FiEdit2 className="text-blue-500" />,
        },
        {
            id: '4',
            title: 'Database Design',
            description: 'Design a relational database schema for a library system.',
            dueDate: '2025-03-05T23:59:59Z',
            status: 'Pending',
            icon: <FiEdit2 className="text-blue-500" />,
        },
        {
            id: '5',
            title: 'API Integration',
            description: 'Implement API calls to fetch data from a public RESTful service.',
            dueDate: '2025-03-10T23:59:59Z',
            status: 'Completed',
            icon: <FiCheckCircle className="text-green-500" />,
        },
        {
            id: '6',
            title: 'Git Basics',
            description: 'Learn how to use Git for version control and manage repositories.',
            dueDate: '2025-02-25T23:59:59Z',
            status: 'Pending',
            icon: <FiEdit2 className="text-blue-500" />,
        },
        {
            id: '7',
            title: 'CSS Animations',
            description: 'Create interactive web pages with advanced CSS animations.',
            dueDate: '2025-03-01T23:59:59Z',
            status: 'Completed',
            icon: <FiCheckCircle className="text-green-500" />,
        },
        {
            id: '8',
            title: 'Node.js Basics',
            description: 'Build a simple server using Node.js and Express.',
            dueDate: '2025-03-08T23:59:59Z',
            status: 'Completed',
            icon: <FiEdit2 className="text-blue-500" />,
        },
        {
            id: '9',
            title: 'Redux State Management',
            description: 'Integrate Redux to manage the state of a React application.',
            dueDate: '2025-03-15T23:59:59Z',
            status: 'Pending',
            icon: <FiEdit2 className="text-blue-500" />,
        },
        {
            id: '10',
            title: 'Responsive Web Design',
            description: 'Ensure that a web page is fully responsive on mobile and desktop.',
            dueDate: '2025-03-12T23:59:59Z',
            status: 'Completed',
            icon: <FiCheckCircle className="text-green-500" />,
        },
        {
            id: '11',
            title: 'API Documentation',
            description: 'Create clear and concise documentation for a REST API.',
            dueDate: '2025-03-18T23:59:59Z',
            status: 'Completed',
            icon: <FiEdit2 className="text-blue-500" />,
        },
        {
            id: '12',
            title: 'Testing with Jest',
            description: 'Write unit tests for JavaScript functions using Jest.',
            dueDate: '2025-03-20T23:59:59Z',
            status: 'Completed',
            icon: <FiEdit2 className="text-blue-500" />,
        },
    ];

    useEffect(() => {
        // Simulate fetching assignments with a delay
        setTimeout(() => {
            setAssignments(dummyAssignments);
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
                            <h1 className="text-2xl font-bold text-gray-800 mb-6">Assignments</h1>

                            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {assignments.map((assignment) => (
                                    <div key={assignment.id} className="bg-white shadow-lg rounded-lg p-6 flex flex-col space-y-4">
                                        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                                            {assignment.icon}
                                            <span className="ml-2">{assignment.title}</span>
                                        </h2>
                                        <p className="text-sm text-gray-600">{assignment.description}</p>
                                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                                            <FiClock className="text-blue-500" />
                                            <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
                                        </div>
                                        <p
                                            className={`text-sm font-semibold ${
                                                assignment.status === 'Completed'
                                                    ? 'text-green-600'
                                                    : 'text-red-500'
                                            }`}
                                        >
                                            Status: {assignment.status}
                                        </p>
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