import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiBell, FiUser, FiMenu, FiSearch } from 'react-icons/fi';

const roleBasedDashboards = {
    ADMIN: '/admin/dashboard',
    MENTOR: '/mentor/dashboard',
    STUDENT: '/student/dashboard',
    IA: '/ia/dashboard',
    LEADERSHIP: '/leadership/dashboard',
    EC: '/ec/dashboard',
};

export default function Header({ onSearch }) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [userName, setUserName] = useState('');

    const notifications = [
        { id: 1, message: 'You have a new message.' },
        { id: 2, message: 'Your report has been approved.' },
        { id: 3, message: 'Reminder: Meeting at 3 PM today.' },
    ];

    useEffect(() => {
        // Simulate fetching user role and name from localStorage or API
        const storedRole = localStorage.getItem('userRole') || 'ADMIN';
        const storedName = localStorage.getItem('userName') || 'John Doe';

        setUserRole(storedRole);
        setUserName(storedName);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        router.push('/');
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    // Toggle notifications and account menu with mutual exclusion
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        setShowAccountMenu(false);
    };

    const toggleAccountMenu = () => {
        setShowAccountMenu(!showAccountMenu);
        setShowNotifications(false);
    };

    return (
        <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
            {/* Logo & Dashboard Info */}
            <div className="flex items-center space-x-4 lg:space-x-6">
                <button
                    aria-label="Toggle menu"
                    className="lg:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <FiMenu className="text-2xl" />
                </button>

                {/* Logo */}
                <img src="/images/masai-logo.svg" alt="Logo" className="h-10 hidden lg:block" />
            </div>

            {/* Search Bar (Centered) */}
            <div className="flex-1 mx-6 hidden lg:flex items-center justify-center">
                <div className="relative w-full max-w-xl">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Search..."
                        aria-label="Search"
                    />
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-6 relative">
                {/* Notifications Button */}
                <div className="relative">
                    <button
                        aria-label="Notifications"
                        className="relative text-gray-600 hover:text-blue-600 focus:outline-none"
                        onClick={toggleNotifications}
                    >
                        <FiBell className="text-2xl" />
                        <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white" />
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg py-2 z-50">
                            <h2 className="px-4 py-2 text-gray-800 font-bold border-b">Notifications</h2>
                            {notifications.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {notifications.map((notification) => (
                                        <li key={notification.id} className="px-4 py-2 text-gray-700 hover:bg-gray-100">
                                            {notification.message}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="px-4 py-2 text-gray-500">No notifications available.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* User Account Button */}
                <div className="relative">
                    <button
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 focus:outline-none"
                        onClick={toggleAccountMenu}
                    >
                        <FiUser className="text-2xl" />
                        <span className="hidden lg:block font-medium">My Account</span>
                    </button>

                    {/* Account Dropdown Menu */}
                    {showAccountMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                            <button
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                onClick={() => router.push('/profile')}
                            >
                                Profile
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                onClick={() => router.push('/settings')}
                            >
                                Settings
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-10">
                    <nav className="flex flex-col space-y-4 p-4">
                        <button onClick={() => router.push('/profile')} className="text-gray-700 hover:text-blue-600 text-lg">
                            Profile
                        </button>
                        <button onClick={() => router.push('/settings')} className="text-gray-700 hover:text-blue-600 text-lg">
                            Settings
                        </button>
                        <button onClick={handleLogout} className="text-red-600 hover:text-red-800 text-lg">
                            Logout
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}