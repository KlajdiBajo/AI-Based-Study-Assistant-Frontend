import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, RotateCcw } from "lucide-react";
import { toast } from "../hooks/use-toast.jsx";

import { verifyRegistration, verifyOtp, forgotPassword } from "../services/authService";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState(""); // ✅ Added error state
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const flow = location.state?.flow || "signup";

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError(""); // ✅ Clear previous errors
    
    try {
      const otpData = {
        email: email,
        otp: otp
      };

      if (flow === "signup") {
        // Use the registration verification endpoint
        const response = await verifyRegistration(otpData);
        console.log("Registration verified:", response.data);
        
        // ✅ Show success toast
        toast({
          title: "Email Verified Successfully!",
          description: "Your account has been verified. You can now log in to access your account.",
          variant: "success",
        });
        
        // Navigate after a short delay to let user see the toast
        setTimeout(() => {
          navigate("/login", {
            state: {
              message: "Email verified successfully! You can now log in.",
            },
          });
        }, 1500);
      } else if (flow === "forgot-password") {
        // Use the forgot password OTP verification endpoint
        const response = await verifyOtp(otpData);
        console.log("OTP verified for password reset:", response.data);
        
        // ✅ Show success toast for password reset
        toast({
          title: "OTP Verified Successfully!",
          description: "You can now reset your password.",
          variant: "success",
        });
        
        setTimeout(() => {
          navigate("/reset-password", {
            state: { email, verified: true },
          });
        }, 1500);
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      
      // ✅ Enhanced error handling to show backend errors
      let errorMessage = "OTP verification failed. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setError(""); // ✅ Clear errors when resending

    try {
      setResendCooldown(60);
      
      if (flow === "signup") {
        console.log("Resending registration OTP to:", email);
        await forgotPassword(email);
        
        // ✅ Show success toast for resend
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email.",
          variant: "success",
        });
      } else if (flow === "forgot-password") {
        await forgotPassword(email);
        console.log("Resending forgot password OTP to:", email);
        
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email.",
          variant: "success",
        });
      }

      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      setResendCooldown(0);
      
      // ✅ Show resend error toast
      let errorMessage = "Failed to resend OTP. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Resend Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const title = flow === "signup" ? "Verify Your Email" : "Verify Your Identity";
  const subtitle = flow === "signup"
    ? "We sent a verification code to your email address"
    : "We sent a verification code to reset your password";

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

          {/* ✅ Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-4 text-center">
                Enter 6-digit verification code
              </label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    // ✅ Clear error when user starts typing new OTP
                    if (error && value !== otp) {
                      setError("");
                    }
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <InputOTPSlot
                      index={1}
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <InputOTPSlot
                      index={2}
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <InputOTPSlot
                      index={3}
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <InputOTPSlot
                      index={4}
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <InputOTPSlot
                      index={5}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <button
              type="submit"
              disabled={otp.length !== 6 || isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
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
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Code"}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate(flow === "signup" ? "/signup" : "/login")}
              className="text-slate-300 hover:text-white transition-colors"
            >
              ← Back to {flow === "signup" ? "Sign Up" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;