import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiSettings,
  FiBell,
  FiBarChart2,
  FiHelpCircle,
  FiCalendar,
  FiLogOut,
  FiBook,
} from 'react-icons/fi';

// Define menu items based on user roles
const menuItemsByRole = {
  STUDENT: [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome className="text-blue-500" />, path: '/student/dashboard' },
    { id: 'lectures', label: 'Lectures', icon: <FiBook className="text-blue-500" />, path: '/student/lectures' },
    { id: 'assignments', label: 'Assignments', icon: <FiFileText className="text-blue-500" />, path: '/student/assignments' },
    // { id: 'notifications', label: 'Notifications', icon: <FiBell className="text-blue-500" />, path: '/student/notifications' },
    { id: 'slot-booking', label: 'Slot Booking', icon: <FiCalendar className="text-blue-500" />, path: '/student/slot-booking' },
  ],
  MENTOR: [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome />, path: '/mentor/dashboard' },
    { id: 'schedule', label: 'Schedule', icon: <FiBook />, path: '/mentor/schedule' },
    { id: 'manage-slots', label: 'Manage Slots', icon: <FiCalendar />, path: '/mentor/manage-slots' },
    // { id: 'tasks', label: 'Tasks', icon: <FiFileText />, path: '/mentor/tasks' },
    // { id: 'support', label: 'Support', icon: <FiHelpCircle />, path: '/mentor/support' },
  ],
  ADMIN: [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome />, path: '/admin/dashboard' },
    { id: 'manage-users', label: 'Manage Users', icon: <FiUsers />, path: '/admin/manage-users' },
    { id: 'reports', label: 'Reports', icon: <FiBarChart2 />, path: '/admin/reports' },
    { id: 'meetings', label: 'Meetings', icon: <FiCalendar />, path: '/admin/meetings' },
    { id: 'settings', label: 'Settings', icon: <FiSettings />, path: '/admin/settings' },
  ],
  // Additional roles (if needed) can be added here.
};

const roleBasedDashboards = {
  STUDENT: '/student/dashboard',
  MENTOR: '/mentor/dashboard',
  ADMIN: '/admin/dashboard',
  // Add other roles as needed...
};

export default function Sidebar() {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  // Store the user's roles from the API.
  const [userRoles, setUserRoles] = useState([]);
  // State to control the role-change dropdown.
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. Redirecting to login.');
      router.push('/');
      return;
    }

    // Helper: get a cookie by name.
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const selectedRole = getCookie('selectedRole');

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
        const { name, roles, status } = data;
        if (status !== 'ACTIVE') {
          router.push('/pending-approval');
          return;
        }
        setUserName(name);
        setUserRoles(roles);
        if (!selectedRole) {
          if (roles.length === 1) {
            const singleRole = roles[0];
            document.cookie = `selectedRole=${singleRole}; path=/; SameSite=Lax`;
            setRole(singleRole);
            setMenuItems(menuItemsByRole[singleRole] || []);
          } else {
            // If multiple roles exist and no role is selected, you could redirect to a role selection page.
            // For this example, we will just use the first role.
            document.cookie = `selectedRole=${roles[0]}; path=/; SameSite=Lax`;
            setRole(roles[0]);
            setMenuItems(menuItemsByRole[roles[0]] || []);
          }
        } else {
          setRole(selectedRole);
          setMenuItems(menuItemsByRole[selectedRole] || []);
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
        alert('Error fetching user status. Please log in again.');
        router.push('/');
      }
    }

    fetchUserStatus();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'selectedRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    router.push('/');
  };

  const handleRoleChange = (newRole) => {
    document.cookie = `selectedRole=${newRole}; path=/; SameSite=Lax`;
    setRole(newRole);
    setMenuItems(menuItemsByRole[newRole] || []);
    setShowRoleMenu(false);
    router.push(roleBasedDashboards[newRole]);
  };

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen flex flex-col justify-between transition-transform duration-300 ease-out overflow-hidden">
      <div>
        {/* User Info Section */}
        <div className="p-6 flex flex-col items-center border-b relative">
          <h1 className="text-lg font-bold text-gray-800">{userName || 'Loading...'}</h1>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-500">{role || 'Role not set'}</p>
            {userRoles.length > 1 && (
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="text-gray-600 hover:text-blue-600 focus:outline-none"
                title="Change Role"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            )}
          </div>
          {showRoleMenu && (
            <div className="absolute top-16 right-4 bg-white shadow-lg rounded-md py-2 z-50">
              {userRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`flex items-center space-x-4 py-3 px-6 text-lg font-medium w-full transition-all duration-300 ease-in-out ${
                router.pathname === item.path
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:translate-x-2'
              }`}
              onClick={() => router.push(item.path)}
            >
              <span className="transition-transform duration-300 ease-in-out transform group-hover:scale-110">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <button
        className="flex items-center space-x-4 py-3 px-6 text-lg font-medium w-full text-red-600 hover:bg-red-100 transition-all duration-300 ease-in-out"
        onClick={handleLogout}
      >
        <FiLogOut />
        <span>Logout</span>
      </button>
    </aside>
  );
}