import { useEffect, useState } from 'react';
import Sidebar from '../shared-components/Sidebar';
import Header from '../shared-components/Header';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'https://masai-connect-backend-w28f.vercel.app/api';

const userActions = [
  { name: "Approve", color: "bg-green-100 text-green-600 hover:bg-green-200" },
  { name: "Reject", color: "bg-orange-100 text-orange-600 hover:bg-orange-200" },
  { name: "Verify", color: "bg-blue-100 text-blue-600 hover:bg-blue-200" },
  { name: "Ban", color: "bg-red-100 text-red-600 hover:bg-red-200" },
  { name: "Edit", color: "bg-purple-100 text-purple-600 hover:bg-purple-200" },
  { name: "Delete", color: "bg-red-100 text-red-600 hover:bg-red-200" },
];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null); // For delete confirmation

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch realtime users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users`);
        if (!res.ok) throw new Error('Failed to load users.');
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Search handler
  const handleSearch = (term) => {
    const lowerTerm = term.toLowerCase();
    setFilteredUsers(
      users.filter((user) =>
        user.name.toLowerCase().includes(lowerTerm) ||
        user.email.toLowerCase().includes(lowerTerm) ||
        user.role.toLowerCase().includes(lowerTerm) ||
        (user.status && user.status.toLowerCase().includes(lowerTerm))
      )
    );
    setCurrentPage(1);
  };

  // Update user status via API
  const updateUserStatus = async (user, newStatus, successMessage) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update user.');
      const updatedUser = await res.json();

      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );
      setFilteredUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );

      // Custom toast style based on status
      let toastStyle = {};
      if (newStatus === 'Active') {
        toastStyle = { backgroundColor: '#38a169', color: '#fff' };
      } else if (newStatus === 'Rejected') {
        toastStyle = { backgroundColor: '#ed8936', color: '#fff' };
      } else if (newStatus === 'Verified') {
        toastStyle = { backgroundColor: '#4299e1', color: '#fff' };
      } else if (newStatus === 'Banned') {
        toastStyle = { backgroundColor: '#e53e3e', color: '#fff' };
      }
      toast(successMessage, {
        position: "top-right",
        autoClose: 3000,
        style: toastStyle,
      });
    } catch (err) {
      toast.error('Error updating user status.');
    }
  };

  // Handle different user actions
  const handleAction = (action, user) => {
    switch (action) {
      case 'Edit':
        setSelectedUser(user);
        break;
      case 'Delete':
        setUserToDelete(user);
        break;
      case 'Approve':
        updateUserStatus(user, 'ACTIVE', 'User approved successfully.');
        break;
      case 'Reject':
        updateUserStatus(user, 'REJECTED', 'User rejected successfully.');
        break;
      case 'Verify':
        updateUserStatus(user, 'VERIFIED', 'User verified successfully.');
        break;
      case 'Ban':
        updateUserStatus(user, 'BANNED', 'User banned successfully.');
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  // Save edited user details via API
  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser),
      });
      if (!res.ok) throw new Error('Failed to update user.');
      const updatedUser = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );
      setFilteredUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );
      setSelectedUser(null);
      toast('User details updated successfully.', {
        position: "top-right",
        autoClose: 3000,
        style: { backgroundColor: '#38a169', color: '#fff' },
      });
    } catch (err) {
      toast.error('Error updating user details.');
    }
  };

  // Confirm deletion via API
  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${userToDelete._id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete user.');
        setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
        setFilteredUsers((prev) =>
          prev.filter((u) => u._id !== userToDelete._id)
        );
        toast('User deleted successfully.', {
          position: "top-right",
          autoClose: 3000,
          style: { backgroundColor: '#e53e3e', color: '#fff' },
        });
        setUserToDelete(null);
      } catch (err) {
        toast.error('Error deleting user.');
      }
    }
  };

  const cancelDelete = () => {
    setUserToDelete(null);
  };

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onSearch={handleSearch} />
      <div className="flex flex-1 flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 px-4 lg:px-6 py-6 bg-gray-100">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-gray-300"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="max-w-full lg:max-w-8xl mx-auto overflow-x-auto">
              <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center lg:text-left">
                Manage Users
              </h1>

              {currentUsers.length > 0 ? (
                <>
                  <table className="w-full bg-white shadow rounded-lg">
                    <thead>
                      <tr className="border-b bg-gray-100">
                        <th className="py-4 px-4 lg:px-6 text-left font-medium text-gray-700">Name</th>
                        <th className="py-4 px-4 lg:px-6 text-left font-medium text-gray-700">Email</th>
                        <th className="py-4 px-4 lg:px-6 text-left font-medium text-gray-700">Role</th>
                        <th className="py-4 px-4 lg:px-6 text-left font-medium text-gray-700">Status</th>
                        <th className="py-4 px-4 lg:px-6 text-center font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user) => (
                        <tr key={user._id} className="border-b hover:bg-gray-50 transition">
                          <td className="py-4 px-4 lg:px-6 text-gray-800">{user.name}</td>
                          <td className="py-4 px-4 lg:px-6 text-gray-600">{user.email}</td>
                          <td className="py-4 px-4 lg:px-6 text-gray-600">{user.role}</td>
                          <td className="py-4 px-4 lg:px-6 text-gray-600">{user.status}</td>
                          <td className="py-4 px-4 lg:px-6 text-right flex justify-end gap-2 flex-wrap">
                            {userActions.map((action) => (
                              <button
                                key={action.name}
                                className={`px-3 py-1 text-sm rounded ${action.color} mb-2`}
                                onClick={() => handleAction(action.name, user)}
                              >
                                {action.name}
                              </button>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center space-x-4 mt-6 flex-wrap">
                    <button
                      className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                        currentPage === 1
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600 shadow hover:shadow-lg'
                      }`}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                    >
                      First
                    </button>

                    <button
                      className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                        currentPage === 1
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600 shadow hover:shadow-lg'
                      }`}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </button>

                    <span className="text-gray-700 font-semibold text-sm">
                      Page <span className="text-blue-600">{currentPage}</span> of{' '}
                      <span className="text-blue-600">{totalPages}</span>
                    </span>

                    <button
                      className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600 shadow hover:shadow-lg'
                      }`}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </button>

                    <button
                      className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600 shadow hover:shadow-lg'
                      }`}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      Last
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 text-center">No users available.</p>
              )}
            </div>
          )}

          {/* Edit User Modal */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h2 className="text-xl font-bold mb-4">Edit User</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700">Name</label>
                    <input
                      type="text"
                      value={selectedUser.name}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Email</label>
                    <input
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Role</label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, role: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="Student">Student</option>
                      <option value="Mentor">Mentor</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700">Status</label>
                    <select
                      value={selectedUser.status}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, status: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="PENDING">Pending</option>
                      <option value="BANNED">Banned</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                    onClick={() => setSelectedUser(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {userToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Deletion</h2>
                <p className="mb-6">
                  Are you sure you want to delete <strong>{userToDelete.name}</strong>?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    onClick={confirmDeleteUser}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          <ToastContainer />
        </main>
      </div>
    </div>
  );
}
