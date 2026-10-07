import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  RotateCcw,
  Eye,
  EyeOff,
  AlertTriangle,
  Send,
  CheckCircle2,
  XCircle,
  Smartphone,
  LogIn,
  UserPlus,
  Shield,
  Users,
  Globe,
  ChevronDown,
  KeyRound,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setToken,
  recordFailedAttempt,
  resetFailedAttempts,
  clearLockoutIfExpired,
  selectFailedAttempts,
  selectIsLocked,
  selectLockoutUntil,
} from "../slice/authSlice";
import { IMAGES } from "@/assets/images";
import { routes } from "@/app/routes/routeConfig";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { LoginMode } from "../types";
import type { UserRole } from "@/features/shared-simulation/types";
import "../styles/login.css";

interface RoleOption {
  role: UserRole;
  label: string;
  badge: string;
  identifier: string;
  password: string;
  defaultRoute: string;
  description: string;
}

const DEMO_ROLES: RoleOption[] = [
  {
    role: "State Admin",
    label: "1. State Admin (CMDC / Directorate)",
    badge: "Super Admin",
    identifier: "admin@cmdc.cg.gov.in",
    password: "Admin@123",
    defaultRoute: "/dashboard",
    description: "Full system administration, RBAC, Masters & Audit logs",
  },
  {
    role: "District Officer",
    label: "2. District Officer (Collector / DMO)",
    badge: "District",
    identifier: "dmo.bilaspur",
    password: "District@123",
    defaultRoute: "/dashboard",
    description: "District mining oversight, permits, enforcement & MIS",
  },
  {
    role: "Mining Department / Monitoring Officer",
    label: "3. Mining Department / Monitoring Officer",
    badge: "Directorate",
    identifier: "monitoring.officer",
    password: "Mining@123",
    defaultRoute: "/enforcement",
    description: "Enforcement squad, checkposts, mobile inspections",
  },
  {
    role: "SRO – Sand Reach Officer",
    label: "4. SRO – Sand Reach Officer",
    badge: "Reach In-Charge",
    identifier: "sro.raipur",
    password: "Sro@123",
    defaultRoute: "/sro-portal",
    description: "Sand reach operations, excavation, stock & dispatch",
  },
  {
    role: "Sand Reach Operator",
    label: "5. Sand Reach Operator (Weighbridge / Gate)",
    badge: "Operator",
    identifier: "operator.reach01",
    password: "Operator@123",
    defaultRoute: "/weighbridge",
    description: "Gross/tare weighment, vehicle queue & gate dispatch",
  },
  {
    role: "Finance / Payment Officer",
    label: "6. Finance / Payment Officer",
    badge: "Finance",
    identifier: "finance.cmdc",
    password: "Finance@123",
    defaultRoute: "/revenue-reconciliation",
    description: "Payment reconciliation, bank ledger, refunds & invoices",
  },
  {
    role: "Call Centre Operator",
    label: "7. Call Centre Operator",
    badge: "Helpdesk",
    identifier: "callcentre.exec01",
    password: "CallCentre@123",
    defaultRoute: "/call-centre",
    description: "Customer grievance resolution & delivery status updation",
  },
  {
    role: "Vehicle Owner",
    label: "8. Vehicle Owner / Transporter",
    badge: "Transporter",
    identifier: "9826122341",
    password: "Owner@123",
    defaultRoute: "/vehicles",
    description: "Fleet registration, queue status & payment settlements",
  },
  {
    role: "Driver",
    label: "9. Driver / Commercial Operator",
    badge: "Driver",
    identifier: "9425188990",
    password: "Driver@123",
    defaultRoute: "/driver-dashboard",
    description: "Digital e-Pass, trip route, customer delivery OTP",
  },
  {
    role: "Citizen / Customer",
    label: "10. Citizen / Consumer / Builder",
    badge: "Citizen",
    identifier: "9876543210",
    password: "Citizen@123",
    defaultRoute: "/sand-booking",
    description: "Sand booking, payments, live GPS tracking & grievance",
  },
];

export const Login: React.FC = () => {
  const { setActiveRole } = useSandMining();
  const [selectedRole, setSelectedRole] = useState<UserRole>("State Admin");
  const [loginMode, setLoginMode] = useState<LoginMode>("password");
  const [identifier, setIdentifier] = useState("admin@cmdc.cg.gov.in");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Captcha state
  const [captchaCode, setCaptchaCode] = useState("7834");
  const [captchaInput, setCaptchaInput] = useState("7834");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpCountdown, setForgotOtpCountdown] = useState(0);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const failedAttempts = useSelector(selectFailedAttempts);
  const isLocked = useSelector(selectIsLocked);
  const lockoutUntil = useSelector(selectLockoutUntil);

  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState(0);

  // Handle role selection change and auto-fill credentials & captcha
  const handleRoleSelect = (roleName: UserRole) => {
    setSelectedRole(roleName);
    const roleConfig = DEMO_ROLES.find((r) => r.role === roleName);
    if (roleConfig) {
      setIdentifier(roleConfig.identifier);
      setPassword(roleConfig.password);
      setCaptchaInput(captchaCode);
      setError("");
    }
  };

  // Handle lockout countdown timer
  useEffect(() => {
    dispatch(clearLockoutIfExpired());
    if (isLocked && lockoutUntil) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
        setLockoutRemainingSeconds(remaining);
        if (remaining <= 0) {
          dispatch(clearLockoutIfExpired());
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setLockoutRemainingSeconds(0);
    }
  }, [isLocked, lockoutUntil, dispatch]);

  // Handle OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Handle Forgot Password OTP countdown timer
  useEffect(() => {
    if (forgotOtpCountdown > 0) {
      const timer = setTimeout(() => setForgotOtpCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotOtpCountdown]);

  // Generate 4-digit alphanumeric Captcha code & auto-fill input
  const generateCaptcha = useCallback(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput(code);
  }, []);

  // Send OTP handler for Login
  const handleSendLoginOtp = () => {
    if (!identifier.trim()) {
      setError("Please enter your Mobile Number or User ID to receive OTP.");
      return;
    }
    setError("");
    setOtpSent(true);
    setOtpCountdown(60);
    setOtpInput("849201"); // Pre-fill simulated OTP for demonstration
    setSuccessMsg("A 6-digit OTP has been sent to your registered mobile number (Simulated OTP: 849201).");
  };

  // Send OTP handler for Forgot Password
  const handleSendForgotOtp = () => {
    if (!forgotIdentifier.trim()) {
      setForgotError("Please enter your registered Mobile Number or User ID.");
      return;
    }
    setForgotError("");
    setForgotOtpSent(true);
    setForgotOtpCountdown(60);
    setForgotOtp("918234"); // Pre-fill simulated OTP for demonstration
  };

  // Reset Password Submit handler
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError("Please enter User ID or Mobile.");
      return;
    }
    if (!forgotOtp.trim() || forgotOtp.length < 6) {
      setForgotError("Please enter the 6-digit OTP.");
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError("New password must be at least 6 characters.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotError("");
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotOtpSent(false);
      setForgotIdentifier("");
      setForgotOtp("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
      setSuccessMsg("Password reset successfully! You can now sign in with your new password.");
    }, 1800);
  };

  // Form Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      setError(`Account is temporarily locked. Please wait ${lockoutRemainingSeconds}s before trying again.`);
      return;
    }

    if (!identifier.trim()) {
      setError("Please enter Username or Mobile Number");
      return;
    }

    // Verify Captcha
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError("Invalid Captcha code. Please try again.");
      dispatch(recordFailedAttempt());
      generateCaptcha();
      return;
    }

    if (loginMode === "password") {
      if (!password.trim()) {
        setError("Please enter Password");
        return;
      }
    } else {
      // OTP Mode Validation
      if (!otpInput.trim() || otpInput.length < 6) {
        setError("Please enter the 6-digit OTP sent to your registered mobile.");
        return;
      }
    }

    // Identify target role configuration
    const matchedRole =
      DEMO_ROLES.find(
        (r) =>
          r.identifier.toLowerCase() === identifier.trim().toLowerCase() ||
          r.role === selectedRole
      ) || DEMO_ROLES[0];

    const finalRole = selectedRole || matchedRole.role;
    const targetRoute = matchedRole.defaultRoute || "/dashboard";

    setError("");
    setSuccessMsg("");
    dispatch(resetFailedAttempts());

    localStorage.setItem("smms_user_role", finalRole);
    dispatch(setToken(`cg-smms-auth-token-${finalRole.toLowerCase().replace(/[^a-z0-9]/g, "-")}`));
    setActiveRole(finalRole);
    navigate(targetRoute, { replace: true });
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col justify-between bg-no-repeat relative font-sans select-none-text"
      style={{
        backgroundImage: `url(${IMAGES.LOGIN_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center calc(100% - 0px)",
      }}
    >
      {/* Top Header Bar */}
      {/* Top Header Bar */}
      <header className="w-full z-20 px-6 sm:px-10 lg:px-16 xl:px-20 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src={IMAGES.CHHATTISGARH_LOGO}
            alt="State Emblem of Chhattisgarh"
            className="h-11 w-11 sm:h-12 sm:w-12 object-contain drop-shadow-xs"
          />
          <img
            src={IMAGES.CMDC_LOGO}
            alt="Chhattisgarh Mineral Development Corporation"
            className="h-11 w-11 sm:h-12 sm:w-12 object-contain drop-shadow-xs"
          />
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight mb-0.5">
              Chhattisgarh Mineral Development Corporation Ltd. (CMDC)
            </h1>
            <p className="text-[11px] font-medium text-slate-600">
              Government of Chhattisgarh
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area: Responsive Layout */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 sm:px-10 lg:px-16 xl:px-20 py-1 z-10 overflow-y-auto gap-4">
        {/* Left Side: Website Name */}
        <div className="hidden lg:flex flex-col justify-center max-w-[640px] mb-auto pt-6 xl:pt-10">
          <div className="inline-block select-none">
            <h2 className="text-4xl xl:text-6xl 2xl:text-7xl font-bold tracking-tight leading-none">
              <span className="text-[#c2410c]">SAND </span>
              <span className="text-slate-950">MINING</span>
            </h2>
            <p className="text-xl xl:text-3xl 2xl:text-3xl font-light text-slate-900 tracking-[0.15em] uppercase mt-2 leading-tight">
              MANAGEMENT SYSTEM
            </p>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-[340px] sm:max-w-[350px] bg-white rounded-2xl shadow-2xl p-4 sm:p-4.5 border border-slate-100 transition-all my-auto shrink-0">
          {/* Welcome Heading */}
          <div className="mb-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Welcome</h2>
            <p className="text-[10.5px] text-slate-500 mt-0.5">
              Login to access the Sand Mining Management System.
            </p>
          </div>

          {/* Lockout Warning */}
          {isLocked && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[11px]">Account Temporarily Locked</p>
                <p className="mt-0.5 text-[10px] text-rose-700">
                  3 failed attempts detected. Access cooldown active for{" "}
                  <strong className="font-mono text-rose-900">{lockoutRemainingSeconds}s</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {successMsg && !isLocked && (
            <div className="mb-3 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <span className="text-[11px]">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Select User Role */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Select User Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <select
                  value={selectedRole}
                  disabled={isLocked}
                  onChange={(e) => handleRoleSelect(e.target.value as UserRole)}
                  className="w-full pl-9 pr-9 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] transition-colors disabled:opacity-60 shadow-2xs cursor-pointer appearance-none"
                  aria-label="Select role to login"
                >
                  {DEMO_ROLES.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* User ID / Mobile Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                User ID / Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  disabled={isLocked}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter User ID or Mobile Number"
                  className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] transition-colors disabled:opacity-60 shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Password Login Mode */}
            {loginMode === "password" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    disabled={isLocked}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-9 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] transition-colors disabled:opacity-60 shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* OTP Mode */}
            {loginMode === "otp" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  6-Digit OTP *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otpInput}
                    disabled={isLocked}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="flex-1 px-3 py-1.5 text-xs font-mono tracking-wider text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] disabled:opacity-60 shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    disabled={isLocked || otpCountdown > 0}
                    onClick={handleSendLoginOtp}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-orange-50 text-[#c2410c] border border-orange-200 hover:bg-orange-100 transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Send size={12} />
                    {otpCountdown > 0 ? `${otpCountdown}s` : otpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-[#c2410c] focus:ring-[#c2410c] accent-[#c2410c] cursor-pointer"
                />
                <span className="text-[11px] font-medium text-slate-700">Remember Me</span>
              </label>

              {loginMode === "password" && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#c2410c] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>

            {/* Captcha Box */}
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={captchaInput}
                  disabled={isLocked}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  placeholder="ENTER CAPTCHA"
                  maxLength={4}
                  className="flex-1 px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-slate-900 placeholder-slate-400 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] disabled:opacity-60 shadow-2xs"
                  required
                />

                <div className="captcha_box flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-xl border border-slate-300 shrink-0 min-w-[95px]">
                  <span className="font-mono font-black text-xs tracking-[0.2em] text-[#9a3412] select-none">
                    {captchaCode}
                  </span>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    disabled={isLocked}
                    className="text-[#c2410c] hover:text-[#9a3412] transition-transform active:rotate-180 p-0.5 cursor-pointer"
                    title="Refresh Captcha"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {error && !isLocked && (
              <div className="text-[11px] text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-xl p-2 text-center flex items-center justify-center gap-1.5">
                <XCircle size={13} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={isLocked}
              className="w-full bg-gradient-to-r from-[#b44607] to-[#c2410c] hover:from-[#9a3412] hover:to-[#b44607] text-white py-2 px-3 rounded-xl font-bold text-xs tracking-wide shadow-md transition-all duration-150 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <LogIn size={15} />
              <span>LOGIN</span>
            </button>

            {/* New User Registration Button */}
            <div className="pt-2 border-t border-slate-200 text-center space-y-1.5">
              <p className="text-[10px] text-slate-500">New citizen, builder or contractor?</p>
              <button
                type="button"
                onClick={() => navigate(routes.citizenRegistration.path)}
                className="w-full py-2 px-3 rounded-xl font-bold text-xs border border-[#c2410c] text-[#c2410c] bg-orange-50/50 hover:bg-orange-50 hover:border-[#9a3412] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <UserPlus size={14} />
                <span>New User Registration</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Full-width Footer Bar */}
      {/* <footer className="w-full z-20 px-6 sm:px-10 lg:px-16 xl:px-20 py-1.5 bg-white/90 backdrop-blur-xs border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-1 text-[11px] text-slate-600 shrink-0">
        <div className="text-center md:text-left">
          <p className="font-bold text-slate-800">Sand Mining Management System</p>
          <p className="text-[10px] text-slate-500">
            Chhattisgarh Mineral Development Corporation Ltd. (CMDC) | Government of Chhattisgarh
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium text-slate-600">
          <button type="button" className="hover:text-[#c2410c] hover:underline cursor-pointer">
            Privacy Policy
          </button>
          <span>|</span>
          <button type="button" className="hover:text-[#c2410c] hover:underline cursor-pointer">
            Terms of Use
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="hover:text-[#c2410c] hover:underline cursor-pointer"
          >
            Help & Support
          </button>
          <span>|</span>
          <button type="button" className="hover:text-[#c2410c] hover:underline cursor-pointer">
            Contact Us
          </button>
          <span className="hidden sm:inline">|</span>
          <span className="text-slate-500">© 2026. All Rights Reserved.</span>
        </div>

        <div className="flex items-center gap-1.5 text-right">
          <img
            src={IMAGES.CHHATTISGARH_LOGO}
            alt="Digital Chhattisgarh"
            className="h-6 w-6 object-contain"
          />
          <div>
            <p className="font-bold text-[#c2410c] leading-tight text-[10px]">Digital Chhattisgarh</p>
            <p className="text-[9px] text-slate-400">Building a Stronger Tomorrow</p>
          </div>
        </div>
      </footer> */}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-200 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#c2410c]">
                <KeyRound size={20} />
                <h3 className="font-bold text-base">Reset Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
                <p className="font-bold text-emerald-800 text-sm">
                  Password Updated Successfully!
                </p>
                <p className="text-xs text-emerald-700">
                  Redirecting back to login screen...
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">
                    Mobile Number / User ID *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="Enter registered mobile or ID"
                      className="flex-1 p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
                      required
                    />
                    <button
                      type="button"
                      disabled={forgotOtpCountdown > 0}
                      onClick={handleSendForgotOtp}
                      className="px-3 py-2 bg-orange-50 text-[#c2410c] border border-orange-200 rounded-lg font-bold hover:bg-orange-100 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {forgotOtpCountdown > 0 ? `${forgotOtpCountdown}s` : forgotOtpSent ? "Resend" : "Send OTP"}
                    </button>
                  </div>
                </div>

                {forgotOtpSent && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    OTP sent successfully (Simulated OTP: <strong>918234</strong>)
                  </p>
                )}

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">
                    6-Digit OTP Received *
                  </label>
                  <input
                    type="text"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
                    required
                  />
                </div>

                {forgotError && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] text-center">
                    {forgotError}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    Demo: <strong>admin@chhattisgarh.gov.in</strong> / <strong>Password@123</strong>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-xs shadow-2xs cursor-pointer"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;