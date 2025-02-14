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

// Available suggestions for roles, permissions, and courses:
const availableRoles = ["ADMIN", "MENTOR", "STUDENT"];
const availablePermissions = [
  "create_meeting",
  "edit_meeting",
  "delete_meeting",
  "view_meeting",
  "manage_users",
];
const availableCourses = ["WEB", "DSA", "MERN", "React", "Node", "UI/UX"];

/** A reusable TagInput component for roles, permissions, or courses. */
function TagInput({ tags, setTags, placeholder }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    // Pressing Enter or comma will add the typed tag
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-wrap gap-2 border p-2 rounded-lg">
      {tags.map((tag, index) => (
        <div
          key={index}
          className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:shadow"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-1 text-red-500 hover:text-red-700"
          >
            &times;
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 outline-none"
      />
    </div>
  );
}

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

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

  // Search handler (checks name, email, status, roles)
  const handleSearch = (term) => {
    const lowerTerm = term.toLowerCase();
    setFilteredUsers(
      users.filter((user) =>
        user.name.toLowerCase().includes(lowerTerm) ||
        user.email.toLowerCase().includes(lowerTerm) ||
        (user.status && user.status.toLowerCase().includes(lowerTerm)) ||
        (user.roles && user.roles.join(' ').toLowerCase().includes(lowerTerm))
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
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );
      setFilteredUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );

      // Toast styling based on status
      let toastStyle = {};
      if (newStatus === 'ACTIVE') {
        toastStyle = { backgroundColor: '#38a169', color: '#fff' };
      } else if (newStatus === 'REJECTED') {
        toastStyle = { backgroundColor: '#ed8936', color: '#fff' };
      } else if (newStatus === 'VERIFIED') {
        toastStyle = { backgroundColor: '#4299e1', color: '#fff' };
      } else if (newStatus === 'BANNED') {
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
      // Update local state
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
                        <th className="py-4 px-4 lg:px-6 text-left font-medium text-gray-700">
                          Name
                        </th>
                        <th className="py-4 px-4 lg:px-6 text-left font-medium text-gray-700">
                          Email
                        </th>
                        <th className="py-4 px-4 lg:px-6 text-left font-medium text-gray-700">
                          Status
                        </th>
                        <th className="py-4 px-4 lg:px-6 text-left font-medium text-gray-700">
                          Roles
                        </th>
                        <th className="py-4 px-4 lg:px-6 text-left font-medium text-gray-700">
                          Courses
                        </th>
                        <th className="py-4 px-4 lg:px-6 text-center font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="py-4 px-4 lg:px-6 text-gray-800">
                            {user.name}
                          </td>
                          <td className="py-4 px-4 lg:px-6 text-gray-600">
                            {user.email}
                          </td>
                          <td className="py-4 px-4 lg:px-6 text-gray-600">
                            {user.status}
                          </td>
                          <td className="py-4 px-4 lg:px-6 text-gray-600">
                            {user.roles ? user.roles.join(', ') : ''}
                          </td>
                          <td className="py-4 px-4 lg:px-6 text-gray-600">
                            {user.courses ? user.courses.join(', ') : ''}
                          </td>
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
              <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                {/* Close button in top-right corner */}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  &times;
                </button>

                <h2 className="text-xl font-bold mb-4">Edit User</h2>
                <div className="space-y-4">
                  {/* Name */}
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
                  {/* Email */}
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
                  {/* Status */}
                  <div>
                    <label className="block text-gray-700">Status</label>
                    <select
                      value={selectedUser.status}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, status: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="BANNED">BANNED</option>
                    </select>
                  </div>
                  {/* Is Verified */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUser.isVerified}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, isVerified: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <label className="text-gray-700">Is Verified</label>
                  </div>
                  {/* Roles as Tags */}
                  <div>
                    <label className="block text-gray-700 mb-1">Roles</label>
                    <TagInput
                      tags={selectedUser.roles || []}
                      setTags={(newTags) =>
                        setSelectedUser({ ...selectedUser, roles: newTags })
                      }
                      placeholder="Add a role..."
                    />
                    <div className="mt-2">
                      <span className="text-gray-600 mr-2">Available Roles:</span>
                      {availableRoles.map((role, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (!selectedUser.roles?.includes(role)) {
                              const newRoles = [...(selectedUser.roles || []), role];
                              setSelectedUser({ ...selectedUser, roles: newRoles });
                            }
                          }}
                          className="inline-block bg-gray-200 text-gray-700 px-2 py-1 mr-2 mb-2 rounded hover:bg-gray-300"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Permissions as Tags */}
                  <div>
                    <label className="block text-gray-700 mb-1">Permissions</label>
                    <TagInput
                      tags={selectedUser.permissions || []}
                      setTags={(newTags) =>
                        setSelectedUser({ ...selectedUser, permissions: newTags })
                      }
                      placeholder="Add a permission..."
                    />
                    <div className="mt-2">
                      <span className="text-gray-600 mr-2">Available Permissions:</span>
                      {availablePermissions.map((perm, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (!selectedUser.permissions?.includes(perm)) {
                              const newPermissions = [
                                ...(selectedUser.permissions || []),
                                perm,
                              ];
                              setSelectedUser({
                                ...selectedUser,
                                permissions: newPermissions,
                              });
                            }
                          }}
                          className="inline-block bg-gray-200 text-gray-700 px-2 py-1 mr-2 mb-2 rounded hover:bg-gray-300"
                        >
                          {perm}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Courses as Tags */}
                  <div>
                    <label className="block text-gray-700 mb-1">Courses</label>
                    <TagInput
                      tags={selectedUser.courses || []}
                      setTags={(newTags) =>
                        setSelectedUser({ ...selectedUser, courses: newTags })
                      }
                      placeholder="Add a course..."
                    />
                    <div className="mt-2">
                      <span className="text-gray-600 mr-2">Available Courses:</span>
                      {availableCourses.map((course, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (!selectedUser.courses?.includes(course)) {
                              const newCourses = [...(selectedUser.courses || []), course];
                              setSelectedUser({ ...selectedUser, courses: newCourses });
                            }
                          }}
                          className="inline-block bg-gray-200 text-gray-700 px-2 py-1 mr-2 mb-2 rounded hover:bg-gray-300"
                        >
                          {course}
                        </button>
                      ))}
                    </div>
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
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
