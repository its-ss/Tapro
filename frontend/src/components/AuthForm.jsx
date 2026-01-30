import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthForm = ({ type }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const isLogin = type === 'login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!isLogin && !acceptedTerms) {
      setError('Please accept terms and conditions to continue.');
      setLoading(false);
      return;
    }

    try {
      if (type === 'register') {
        const data = await register(email, password, fullName);
        // Check if user needs onboarding
        if (!data.user.isOnboarded) {
          navigate('/userOnboard');
        } else {
          navigate('/explore');
        }
      } else {
        const data = await login(email, password);
        // Check if user needs onboarding
        if (!data.user.isOnboarded) {
          navigate('/userOnboard');
        } else {
          navigate('/explore');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#F5F5EE]">
      <div className="text-center mb-6">
        <img src="/assets/tapro_logo.png" alt="Tapro Logo" className="mx-auto w-16" />
        <h2 className="mt-4 text-lg font-medium">Where ideas take flight...</h2>
      </div>

      <div className="bg-white p-8 rounded-md shadow-md w-[400px]">
        <div className="flex justify-between mb-4">
          <Link
            to="/login"
            className={`flex-1 text-center py-2 ${isLogin ? 'bg-black text-white' : 'bg-gray-200'}`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`flex-1 text-center py-2 ${!isLogin ? 'bg-black text-white' : 'bg-gray-200'}`}
          >
            Register
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-sm mb-1">Full Name</label>
              <input
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Password</label>
            <input
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="terms" className="text-sm">
                I accept the{' '}
                <Link to="/terms" className="text-blue-500 hover:underline">
                  terms and conditions
                </Link>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded mb-4 hover:bg-gray-800 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          {isLogin && (
            <div className="mt-4 text-center text-sm">
              <Link to="/forgot-password" className="text-blue-500 hover:underline">
                Forgot password?
              </Link>
            </div>
          )}
        </form>

        {!isLogin && (
          <div className="mt-6 text-center text-sm">
            Are you an investor?{' '}
            <Link to="/Investor-register" className="text-blue-500 hover:underline">
              Register here
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
