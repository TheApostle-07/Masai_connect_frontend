import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PendingApprovalDynamic() {
    const router = useRouter();
    const { slug } = router.query;
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        status: '',
    });

    // Redirect to base route if slug exists
    useEffect(() => {
        if (slug && slug.length > 0) {
            console.log('Dynamic path detected. Redirecting to /pending-approval');
            router.replace('/pending-approval');
            return;
        }

        // Fetch user details if on the base route
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Session expired. Please log in again.');
            router.push('/auth');
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
                const { name, email, status, role } = data;

                if (status === 'ACTIVE') {
                    redirectToDashboard(role);
                } else {
                    setUserData({ name, email, status });
                }
            } catch (error) {
                console.error('Error fetching user status:', error);
                alert('Error fetching user status. Please log in again.');
                router.push('/auth');
            }
        }

        fetchUserStatus();
    }, [router, slug]);

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
                    <div className="relative bg-blue-200 text-blue-600 rounded-full h-24 w-24 flex items-center justify-center text-4xl font-extrabold">
                        {getInitials(userData.name || 'User')}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Account Pending Approval</h1>
                </div>

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

                <p className="text-gray-700 leading-relaxed text-center">
                    Your account is currently pending approval. You will be notified once it has been approved.
                </p>

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