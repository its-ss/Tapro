import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaMicrosoft, FaApple } from 'react-icons/fa';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase';

const AuthForm = ({ type }) => {
  const navigate = useNavigate();
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
      setError("Please accept terms and conditions to continue.");
      setLoading(false);
      return;
    }

    try {
      const db = getFirestore();

      if (type === 'register') {
        // --- REGISTRATION LOGIC ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: fullName });

        // This part is still important to create the user's profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          fullName: fullName,
          email: user.email,
          profileImage: '',
          provider: user.providerData[0]?.providerId || 'password',
          createdAt: serverTimestamp(),
          userOnboard: [{ completed: false, step: '0' }]
        });
        
        // We no longer set localStorage. The AuthContext handles the session.
        navigate('/userOnboard');

      } else { 
        // --- LOGIN LOGIC ---
        await signInWithEmailAndPassword(auth, email, password);
        // We no longer set localStorage. The AuthContext handles the session.
        navigate('/explore');
      }
    } catch (error) {
      console.error('Authentication Error:', error.code, error.message);
      setError(`Authentication Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider) => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;

      const db = getFirestore();
      // This setDoc is still important to create/update their Firestore profile
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: user.displayName || '',
        email: user.email || '',
        profileImage: user.photoURL || '',
        provider: user.providerData[0]?.providerId || '',
        createdAt: serverTimestamp(),
        userOnboard: [{ completed: false, step: '0' }]
      }, { merge: true });

      // We no longer set localStorage. The AuthContext handles the session.

      if (isNewUser) {
        navigate('/userOnboard');
      } else {
        navigate('/explore');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // The rest of your JSX remains the same
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
                I accept the <Link to="/terms" className="text-blue-500 hover:underline">terms and conditions</Link>
              </label>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-black text-white py-2 rounded mb-4 hover:bg-gray-800 transition"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          {isLogin && (
            <div className="mt-4 text-center text-sm">
              <Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot password?</Link>
            </div>
          )}
        </form>

        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-xs text-gray-500">OR CONTINUE WITH</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleProviderLogin(new GoogleAuthProvider())}
            className="border rounded p-2 hover:bg-gray-100 transition"
            type="button"
            disabled={loading}
          >
            <FcGoogle size={24} />
          </button>
          <button
            onClick={() => handleProviderLogin(new OAuthProvider('microsoft.com'))}
            className="border rounded p-2 hover:bg-gray-100 transition"
            type="button"
            disabled={loading}
          >
            <FaMicrosoft size={24} className="text-[#0078D4]" />
          </button>
          <button
            onClick={() => handleProviderLogin(new OAuthProvider('apple.com'))}
            className="border rounded p-2 hover:bg-gray-100 transition"
            type="button"
            disabled={loading}
          >
            <FaApple size={24} className="text-black" />
          </button>
        </div>

        {!isLogin && (
          <div className="mt-6 text-center text-sm">
            Are you an investor?{' '}
            <a href="/Investor-register" className="text-blue-500 hover:underline">
              Register here
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;