import { useState, useEffect } from 'react';
import Sidebar from '../shared-components/Sidebar';
import Header from '../shared-components/Header';
import Footer from '../shared-components/Footer';
import {
    FaUserCog,
    FaLock,
    FaBell,
    FaPalette,
    FaCreditCard,
    FaTabletAlt,
    FaFileAlt,
    FaUsers,
    FaHistory
} from 'react-icons/fa';
console.log(FaUserCog, FaLock, FaBell, FaPalette);
// Static settings options
// Comprehensive Static Settings Options
const settingsOptions = [
    {
        name: "Profile Settings",
        description: "Update your profile and account details",
        icon: <FaUserCog className="text-blue-500 text-2xl" />,
    },
    {
        name: "Security & Privacy",
        description: "Manage your passwords and security settings",
        icon: <FaLock className="text-blue-500 text-2xl" />,
    },
    {
        name: "Notifications",
        description: "Configure how you receive alerts",
        icon: <FaBell className="text-blue-500 text-2xl" />,
    },
    {
        name: "Appearance",
        description: "Customize themes and UI preferences",
        icon: <FaPalette className="text-blue-500 text-2xl" />,
    },
    {
        name: "Account Preferences",
        description: "Manage your language, region, and personalization options",
        icon: <FaUserCog className="text-blue-500 text-2xl" />,
    },
    {
        name: "Data & Storage",
        description: "Manage storage and data-saving settings",
        icon: <FaLock className="text-blue-500 text-2xl" />,
    },
    {
        name: "Privacy Shortcuts",
        description: "Quick access to privacy controls",
        icon: <FaLock className="text-blue-500 text-2xl" />,
    },
    {
        name: "Accessibility",
        description: "Adjust accessibility features to suit your needs",
        icon: <FaPalette className="text-blue-500 text-2xl" />,
    },
    {
        name: "Help & Support",
        description: "Find answers to common questions or get support",
        icon: <FaFileAlt className="text-blue-500 text-2xl" />,
    },
    {
        name: "Billing & Subscription",
        description: "Manage your payments, invoices, and subscriptions",
        icon: <FaCreditCard className="text-blue-500 text-2xl" />,
    },
    {
        name: "Connected Devices",
        description: "View and manage devices linked to your account",
        icon: <FaTabletAlt className="text-blue-500 text-2xl" />,
    },
    {
        name: "Backup & Restore",
        description: "Backup your settings and restore them when needed",
        icon: <FaLock className="text-blue-500 text-2xl" />,
    },
    {
        name: "Activity Log",
        description: "View recent account activities and sign-in history",
        icon: <FaHistory className="text-blue-500 text-2xl" />,
    },
    {
        name: "Family & Sharing",
        description: "Set up and manage family sharing options",
        icon: <FaUsers className="text-blue-500 text-2xl" />,
    },
    {
        name: "Legal & Policies",
        description: "Review terms of service and privacy policies",
        icon: <FaFileAlt className="text-blue-500 text-2xl" />,
    },
];

export default function SettingsPage() {
    const [settingsData, setSettingsData] = useState({
        username: '',
        email: '',
        notificationsEnabled: true,
        theme: 'light',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchSettingsData = async () => {
            try {
                // Simulate network delay
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Simulated settings data
                const simulatedData = {
                    username: 'john_doe',
                    email: 'john.doe@example.com',
                    notificationsEnabled: true,
                    theme: 'dark',
                };

                setSettingsData(simulatedData);
            } catch (err) {
                console.error('Error fetching settings data:', err);
                setError('Failed to load settings data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchSettingsData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettingsData({
            ...settingsData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setSuccessMessage('Settings updated successfully.');
        } catch (err) {
            console.error('Error saving settings data:', err);
            setError('Failed to save settings. Please try again later.');
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
                        <div className="max-w-8xl mx-auto bg-white shadow-lg rounded-lg p-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-6">⚙️ Settings</h1>

                            {/* Static Settings Cards */}
                            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {settingsOptions.map((option, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center p-6 bg-gray-50 border rounded-lg shadow-sm hover:shadow-lg transition transform hover:-translate-y-1"
                                    >
                                        <div className="bg-blue-100 p-4 rounded-full mr-4">
                                            {option.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800">{option.name}</h2>
                                            <p className="text-sm text-gray-600">{option.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                         
                        </div>
                    )}
                </main>
            </div>

        </div>
    );
}