import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiHelpCircle } from 'react-icons/fi';

export default function PendingApproval() {
    const router = useRouter();
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        status: '',
        roles: [],
    });

    // Fetch user details on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Session expired. Please log in again.');
            router.push('/');
            return;
        }

        async function fetchUserStatus() {
            try {
                const response = await fetch('https://masai-connect-backend-w28f.vercel.app/api/get-user-status', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch user status');

                const data = await response.json();
                const { name, email, status, roles } = data;

                if (status === 'ACTIVE') {
                    handleRoleRedirection(roles);
                } else {
                    setUserData({ name, email, status, roles });
                }
            } catch (error) {
                console.error('Error fetching user status:', error);
                alert('Error fetching user status. Please log in again.');
                router.push('/');
            }
        }

        fetchUserStatus();
    }, [router]);

    // Handle role-based redirection
    const handleRoleRedirection = (roles) => {
        if (roles.length === 1) {
            redirectToDashboard(roles[0]);
        } else {
            router.push('/select-role');
        }
    };

    // Generate initials from user name
    const getInitials = (name) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white shadow-2xl rounded-xl p-12 max-w-lg w-full space-y-8">
                <div className="flex flex-col items-center space-y-4">
                    {/* Avatar */}
                    <div className="relative bg-blue-200 text-blue-600 rounded-full h-24 w-24 flex items-center justify-center text-4xl font-extrabold">
                        {getInitials(userData.name || 'User')}
                        <span className="absolute top-0 right-0 h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500"></span>
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Account Pending Approval</h1>
                </div>

                {/* User Details */}
                <div className="text-left space-y-2">
                    <p className="text-lg text-gray-900">
                        <strong>Name:</strong> {userData.name}
                    </p>
                    <p className="text-lg text-gray-900">
                        <strong>Email:</strong> {userData.email}
                    </p>
                    <p className="text-lg text-gray-900">
                        <strong>Status:</strong> {userData.status}
                    </p>
                </div>

                {/* Message */}
                <p className="text-gray-700 leading-relaxed text-center">
                    Your account is currently pending approval. You will be notified once it has been approved.
                </p>

                {/* Contact Details */}
                <div className="text-left bg-gray-100 p-4 rounded-lg shadow-inner">
                    <div className="flex items-center space-x-2 mb-2">
                        <FiHelpCircle className="text-blue-600 text-xl" />
                        <h2 className="text-lg font-semibold text-gray-800">Need Help?</h2>
                    </div>
                    <p className="text-gray-600">Please contact us at:</p>
                    <p className="text-blue-600 font-medium underline">masaiconnect@gmail.com</p>
                </div>

                {/* Return to Home Button */}
                <button
                    onClick={() => router.push('/')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
}

function redirectToDashboard(role) {
    const dashboardRoutes = {
        ADMIN: '/admin/dashboard',
        MENTOR: '/mentor/dashboard',
        STUDENT: '/student/dashboard',
        IA: '/ia/dashboard',
        LEADERSHIP: '/leadership/dashboard',
        EC: '/ec/dashboard',
    };

    window.location.href = dashboardRoutes[role] || '/dashboard';
}