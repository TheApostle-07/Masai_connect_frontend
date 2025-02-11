import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import * as JwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';

export default function AuthPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error' | 'success', text: string }
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT', // Default role
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions

    setLoading(true);
    setMessage(null); // Clear previous messages

    try {
      console.log('Password input in frontend:', formData.password);
      const endpoint = isSignIn
        ? 'https://masai-connect-backend-w28f.vercel.app/api/auth/signin'
        : 'https://masai-connect-backend-w28f.vercel.app/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include', // Include credentials (cookies, etc.)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `${isSignIn ? 'Sign In' : 'Sign Up'} successful! Redirecting...`,
        });

        // Store the token
        localStorage.setItem('token', result.token);
        Cookies.set('token', result.token, {
          expires: 1, // 1 day expiration
          path: '/', // Accessible site-wide
          sameSite: 'strict', // Helps prevent CSRF
          secure: process.env.NODE_ENV === 'production', // Only secure in production
        });

        // Decode the token to get user details
        const { status, role, exp } = JwtDecode.jwtDecode(result.token);
        console.log('Decoded Token:', JwtDecode.jwtDecode(result.token));
        console.log('Status:', status);
        console.log('Role:', role);
        console.log('Exp:', exp);

        // Check for token expiration
        if (Date.now() >= exp * 1000) {
          setMessage({
            type: 'error',
            text: 'Session expired. Please sign in again.',
          });
          localStorage.removeItem('token');
          window.location.href = '/auth';
          return;
        }

        // Redirect based on user status/role
        if (status === 'PENDING') {
          window.location.href = '/pending-approval';
        } else {
          switch (role) {
            case 'ADMIN':
              window.location.href = '/admin/dashboard';
              break;
            case 'MENTOR':
              window.location.href = '/mentor/dashboard';
              break;
            case 'IA':
              window.location.href = '/ia/dashboard';
              break;
            case 'LEADERSHIP':
              window.location.href = '/leadership/dashboard';
              break;
            case 'EC':
              window.location.href = '/ec/dashboard';
              break;
            case 'STUDENT':
              window.location.href = '/student/dashboard';
              break;
            default:
              window.location.href = '/dashboard';
          }
        }
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to authenticate.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.message && error.message.includes('Failed to fetch')) {
        setMessage({
          type: 'error',
          text:
            'CORS error: Unable to connect to the server. Please check your connection or API server.',
        });
      } else {
        setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-lg w-full text-center mt-10 mb-10">
        <div className="mb-8">
          <img src="/images/masai-logo.svg" alt="Masai Logo" className="mx-auto h-14" />
        </div>

        <div className="flex justify-center items-center mb-8 space-x-2">
          <button
            onClick={() => {
              setIsSignIn(true);
              setMessage(null);
            }}
            disabled={loading}
            className={`px-4 py-2 rounded-full text-lg font-medium transition-colors ${
              isSignIn ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsSignIn(false);
              setMessage(null);
            }}
            disabled={loading}
            className={`px-4 py-2 rounded-full text-lg font-medium transition-colors ${
              !isSignIn ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 text-gray-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8">{isSignIn ? 'Sign In' : 'Sign Up'}</h1>

        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded ${
              message.type === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isSignIn && (
            <>
              <div>
                <label className="block text-left text-gray-700 text-lg mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-left text-gray-700 text-lg mb-2">Select Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="STUDENT">Student</option>
                  <option value="MENTOR">Mentor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-left text-gray-700 text-lg mb-2">Your email</label>
            <input
              type="email"
              name="email"
              placeholder="name@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="relative">
            <label className="block text-left text-gray-700 text-lg mb-2">Your password</label>
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-4 top-16 transform -translate-y-1/2 text-gray-500"
            >
              {passwordVisible ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>

          {isSignIn && (
            <div className="flex items-center justify-between text-base">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-blue-500 hover:underline">
                Forgot your password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 flex items-center justify-center"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            ) : (
              isSignIn ? 'SIGN IN' : 'SIGN UP'
            )}
          </button>
        </form>

        <div className="mt-8 text-gray-700 text-base">
          {isSignIn ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setIsSignIn(false);
                  setMessage(null);
                }}
                className="text-blue-500 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsSignIn(true);
                  setMessage(null);
                }}
                className="text-blue-500 font-semibold hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </div>

        <div className="mt-10 text-gray-500 text-base space-x-6">
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:underline">
            Terms and Conditions
          </Link>
        </div>

        <div className="mt-4 text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} by Masai School
        </div>
      </div>
    </div>
  );
}