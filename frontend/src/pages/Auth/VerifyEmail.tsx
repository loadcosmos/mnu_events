import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const email = location.state?.email || '';

  const handleVerify = async () => {
    if (!code || !email) return;
    setLoading(true);
    try {
      const data = await authService.verifyEmail(email, code);
      setAuthData(data);
      toast.success('Email verified successfully!');
      navigate('/events');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendCode(email);
      toast.success('New code sent!');
    } catch (error: any) {
      toast.error('Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-gray-600">Enter the 6-digit code sent to {email}</p>
        </div>
        <div className="space-y-4">
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" maxLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-2xl tracking-widest" />
          <button onClick={handleVerify} disabled={loading || code.length !== 6} className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
          <button onClick={handleResend} className="w-full text-primary-600 hover:text-primary-700">
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
}
