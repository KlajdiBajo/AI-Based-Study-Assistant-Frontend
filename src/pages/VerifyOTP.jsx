import React, { useState } from 'react';
import { Book, Mail, RotateCcw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';
  const flow = location.state?.flow || 'signup';

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);

    setTimeout(() => {
      console.log('Verifying OTP:', { otp, email, flow });
      setIsLoading(false);

      if (flow === 'signup') {
        navigate('/login', {
          state: { message: 'Email verified successfully! You can now log in.' }
        });
      } else if (flow === 'forgot-password') {
        navigate('/reset-password', {
          state: { email, verified: true }
        });
      }
    }, 2000);
  };

  const handleResendOTP = () => {
    if (resendCooldown > 0) return;

    console.log('Resending OTP to:', email);
    setResendCooldown(60);

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const title = flow === 'signup' ? 'Verify Your Email' : 'Verify Your Identity';
  const subtitle =
    flow === 'signup'
      ? 'We sent a verification code to your email address'
      : 'We sent a verification code to reset your password';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-slate-300 mb-4">{subtitle}</p>
            <p className="text-blue-300 font-medium">{email}</p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-4 text-center">
                Enter 6-digit verification code
              </label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="bg-white/10 border-white/20 text-white" />
                    <InputOTPSlot index={1} className="bg-white/10 border-white/20 text-white" />
                    <InputOTPSlot index={2} className="bg-white/10 border-white/20 text-white" />
                    <InputOTPSlot index={3} className="bg-white/10 border-white/20 text-white" />
                    <InputOTPSlot index={4} className="bg-white/10 border-white/20 text-white" />
                    <InputOTPSlot index={5} className="bg-white/10 border-white/20 text-white" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <button
              type="submit"
              disabled={otp.length !== 6 || isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div className="text-center">
              <p className="text-slate-300 mb-2">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate(flow === 'signup' ? '/signup' : '/login')}
              className="text-slate-300 hover:text-white transition-colors"
            >
              ← Back to {flow === 'signup' ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
