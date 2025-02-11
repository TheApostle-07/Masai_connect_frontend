import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    FiUser,
    FiShield,
    FiBell,
    FiSettings,
    FiBook,
    FiUsers,
    FiClipboard,
} from 'react-icons/fi';

export default function SelectRole() {
    const router = useRouter();
    const [roles, setRoles] = useState([]);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
    });

    const roleDetails = {
        ADMIN: { label: 'Admin', icon: <FiShield />, description: 'Manage platform settings and users' },
        MENTOR: { label: 'Mentor', icon: <FiBook />, description: 'Guide and assist students' },
        STUDENT: { label: 'Student', icon: <FiUser />, description: 'Access lectures and assignments' },
        IA: { label: 'Instructional Associate', icon: <FiSettings />, description: 'Monitor and review performance' },
        LEADERSHIP: { label: 'Leadership', icon: <FiBell />, description: 'Analyze reports and insights' },
        EC: { label: 'Experience Champion', icon: <FiClipboard />, description: 'Manage and organize events' },
        TEACHER: { label: 'Teacher', icon: <FiUsers />, description: 'Conduct and manage courses' },
    };

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Session expired. Please log in again.');
            router.push('/');
            return;
        }

        async function fetchUserData() {
            try {
                const response = await fetch('https://masai-connect-backend-w28f.vercel.app/api/get-user-status', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch user data');

                const data = await response.json();
                setUserData({ name: data.name, email: data.email });
                setRoles(data.roles);
            } catch (error) {
                console.error('Error fetching user data:', error);
                alert('Error fetching user data. Please log in again.');
                router.push('/');
            }
        }

        fetchUserData();
    }, [router]);

    // Handle role selection
    const handleRoleSelect = (role) => {
        // Set role in both localStorage and cookies
        localStorage.setItem('selectedRole', role);
        document.cookie = `selectedRole=${role}; path=/; SameSite=Lax`;

        redirectToDashboard(role);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white shadow-2xl rounded-xl p-8 max-w-3xl w-full space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 text-center">Select Your Role</h1>

                {/* User Info */}
                <div className="text-center space-y-1">
                    <p className="text-lg text-gray-900 font-semibold">{userData.name}</p>
                    <p className="text-gray-600">{userData.email}</p>
                </div>

                {/* Roles List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {roles.length > 0 ? (
                        roles.map((role) => {
                            const { label, icon, description } = roleDetails[role] || {};

                            return (
                                <button
                                    key={role}
                                    onClick={() => handleRoleSelect(role)}
                                    className="flex items-center space-x-4 p-4 bg-gray-50 border rounded-lg hover:bg-blue-50 transition duration-200"
                                >
                                    <div className="text-blue-600 text-2xl">{icon}</div>
                                    <div className="text-left">
                                        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
                                        <p className="text-sm text-gray-600">{description}</p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-600">No roles available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Redirect to the appropriate dashboard based on the role
function redirectToDashboard(role) {
    const dashboardRoutes = {
        ADMIN: '/admin/dashboard',
        MENTOR: '/mentor/dashboard',
        STUDENT: '/student/dashboard',
        IA: '/ia/dashboard',
        LEADERSHIP: '/leadership/dashboard',
        EC: '/ec/dashboard',
        TEACHER: '/teacher/dashboard',
    };

    window.location.href = dashboardRoutes[role] || '/dashboard';
}