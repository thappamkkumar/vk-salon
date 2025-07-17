'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaEnvelope, FaLock, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password.trim()) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/admin/posts',
      });

      setLoading(false);

      if (res?.ok && res.url) {
        router.push(res.url);
      } else if (res?.error) {
        setFormErrors({ general: 'Invalid email or password.' });
      } else {
        setFormErrors({ general: 'Something went wrong. Try again.' });
      }
    } catch (err) {
     // console.error(err);
      setLoading(false);
      setFormErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="bg-white lg:shadow-2xl p-8 rounded-xl w-full max-w-md"
    >
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Admin Login
      </h2>

      {formErrors.general && (
        <p className="text-red-600 text-center text-sm mb-4">{formErrors.general}</p>
      )}

      {/* Email Field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FaEnvelope className="text-base" />
          </span>
          <input
            type="email"
            className={`w-full border rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 transition-all ${
              formErrors.email
                ? 'border-red-500 focus:ring-black'
                : 'border-gray-300 focus:ring-black'
            }`}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
      </div>

      {/* Password Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FaLock className="text-base" />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            className={`w-full border rounded-md pl-10 pr-10 py-2 focus:outline-none focus:ring-2 transition-all ${
              formErrors.password
                ? 'border-red-500 focus:ring-black'
                : 'border-gray-300 focus:ring-black'
            }`}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {formErrors.password && (
          <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-md transition duration-300 ${
          loading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        disabled={loading}
      >
        {loading && <FaSpinner className="animate-spin" />}
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
