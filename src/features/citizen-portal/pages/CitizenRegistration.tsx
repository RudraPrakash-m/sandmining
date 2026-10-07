import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  Info,
  LogIn,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  Home,
  Landmark,
  Phone,
  Mail,
  Lock,
  ShoppingCart,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import type { CustomerCategory } from "@/features/shared-simulation/types";

// Official Chhattisgarh Districts & Tehsils Map
const DISTRICT_TEHSILS: Record<string, string[]> = {
  Raipur: ["Raipur Urban", "Arang", "Abhanpur", "Dharsiwa", "Tilda Neora"],
  Durg: ["Durg Urban", "Bhilai", "Patan", "Dhamdha"],
  Bilaspur: ["Bilaspur Urban", "Bilha", "Masturi", "Kota", "Takhatpur"],
  Rajnandgaon: ["Rajnandgaon Urban", "Dongargaon", "Dongargarh", "Khairagarh", "Chhuikhadan"],
  Korba: ["Korba Urban", "Katghora", "Pali", "Kartala", "Poundi Uproda"],
  Raigarh: ["Raigarh Urban", "Kharsia", "Gharghoda", "Tamnar", "Sarangarh"],
  Dhamtari: ["Dhamtari Urban", "Kurud", "Nagari", "Magarlod"],
  Mahasamund: ["Mahasamund Urban", "Saraipali", "Basna", "Pithora", "Bagbahara"],
  Bastar: ["Jagdalpur Urban", "Bastar", "Bastanar", "Tokapal", "Lohandiguda"],
  Surguja: ["Ambikapur Urban", "Sitapur", "Lundra", "Batoli", "Mainpat"],
  "Janjgir-Champa": ["Janjgir", "Champa", "Akaltara", "Nawagarh", "Pamgarh"],
  Balod: ["Balod", "Gunderdehi", "Dondi Luhara", "Gurur", "Sanod"],
  Bemetara: ["Bemetara", "Berla", "Saja", "Nawagarh", "Thanakhamria"],
};

export const CitizenRegistration: React.FC = () => {
  const { registerCitizen, setActiveRole } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if redirected from sand booking
  const queryParams = new URLSearchParams(location.search);
  const redirectReason = queryParams.get("from");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    customerType: "Domestic" as "Domestic" | "Commercial" | "Government / Institutional",
    identityType: "Aadhaar Card (UIDAI)",
    aadhaarNumber: "",
    idKycRef: "",
    deliveryAddress: "",
    district: "Raipur",
    tehsilMandal: "Arang",
    villageCity: "Mahanadi Sector 3",
    preferredDeliveryLocation: "Near Site Gate 1, Main Road Access Point",
    pincode: "493441",
    otp: "",
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [hasConsent, setHasConsent] = useState(true);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredData, setRegisteredData] = useState<{
    id: string;
    name: string;
    username: string;
    mobile: string;
    customerType: string;
    deliveryAddress: string;
    district: string;
  } | null>(null);

  // OTP Countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Update Tehsil default when District changes
  const handleDistrictChange = (district: string) => {
    const defaultTehsil = DISTRICT_TEHSILS[district]?.[0] || "";
    setFormData((prev) => ({
      ...prev,
      district,
      tehsilMandal: defaultTehsil,
    }));
  };

  // Auto-sync username with mobile if username is empty or was mobile
  const handleMobileChange = (mobile: string) => {
    const cleanMobile = mobile.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      mobile: cleanMobile,
      username: prev.username === "" || prev.username === prev.mobile ? cleanMobile : prev.username,
    }));
    if (isOtpVerified) {
      setIsOtpVerified(false); // Reset verification on mobile edit
    }
  };

  // Dynamic Identity Type options & label
  const getIdentityConfig = () => {
    switch (formData.customerType) {
      case "Commercial":
        return {
          label: "Commercial Tax / Identity Registration Details *",
          types: ["GSTIN (Goods and Services Tax ID)", "Company PAN Card", "RERA Project Registration #", "CIN / Corporate ID"],
          placeholder: "e.g. 22AAAAA0000A1Z5 / CGRERA2025001",
          helperText: "Mandatory for commercial sand allotments, tax invoicing & input credit.",
        };
      case "Government / Institutional":
        return {
          label: "Government Department / Sanction / PWD License *",
          types: ["PWD Contractor License #", "CPWD / NHAI Work Order #", "Department Sanction ID", "Municipal Authority Reg #"],
          placeholder: "e.g. CG-PWD-A-CLASS-2024-8891 / NHAI-PKG-4",
          helperText: "Mandatory for subsidized public infrastructure & government project quota.",
        };
      default:
        return {
          label: "Aadhaar / Identity Proof Details *",
          types: ["Aadhaar Card (UIDAI)", "Voter ID Card", "PAN Card", "Driving License"],
          placeholder: "e.g. AADHAAR: 4819 2831 9901 / VID 9182...",
          helperText: "Required under State Minor Mineral Concession Rules 2026 for domestic quota allocation.",
        };
    }
  };

  const currentIdConfig = getIdentityConfig();

  // Send OTP handler
  const handleSendOtp = () => {
    if (!formData.mobile || formData.mobile.length < 10) {
      showError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setIsOtpSent(true);
    setOtpCountdown(60);
    setFormData((prev) => ({ ...prev, otp: "7834" })); // Demo pre-fill OTP
    showSuccess("A 4-digit OTP has been sent to your mobile (Demo OTP: 7834).");
  };

  // Verify OTP handler
  const handleVerifyOtp = () => {
    if (formData.otp.trim() === "7834" || (formData.otp.trim().length === 4 && formData.otp.trim() !== "")) {
      setIsOtpVerified(true);
      showSuccess("Mobile number successfully verified via OTP!");
    } else {
      showError("Invalid OTP. Please enter the 4-digit OTP received (Demo OTP: 7834).");
    }
  };

  // Password Strength Calculation
  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score += 1;
    if (/[A-Z]/.test(p) || /[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p) && p.length >= 8) score += 1;
    return score;
  };
  const passwordStrength = getPasswordStrength();

  // Register Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showError("Please enter Customer / Entity Full Name.");
      return;
    }

    if (!formData.mobile.trim() || formData.mobile.length !== 10) {
      showError("Please enter a valid 10-digit Mobile Number.");
      return;
    }

    if (!isOtpVerified && formData.otp !== "7834") {
      showError("Mobile verification required! Please click 'Verify OTP' before submitting.");
      return;
    }

    if (!formData.username.trim()) {
      showError("Please specify a Login Username / User ID.");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      showError("Please set a secure login password (minimum 6 characters).");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match! Please check password confirmation.");
      return;
    }

    if (!formData.deliveryAddress.trim()) {
      showError("Please enter complete construction site delivery address.");
      return;
    }

    if (!formData.district.trim()) {
      showError("Please select delivery District.");
      return;
    }

    if (!formData.tehsilMandal.trim()) {
      showError("Please enter Tehsil / Mandal.");
      return;
    }

    if (!formData.villageCity.trim()) {
      showError("Please enter Village / City.");
      return;
    }

    if (!formData.preferredDeliveryLocation.trim()) {
      showError("Please specify Preferred Delivery Location / Landmark.");
      return;
    }

    if (!formData.idKycRef.trim() && !formData.aadhaarNumber.trim()) {
      showError(`Please provide valid ${currentIdConfig.label}`);
      return;
    }

    if (!hasConsent) {
      showError("Please accept the statutory declaration for sand allotment verification.");
      return;
    }

    const finalKycRef = formData.idKycRef.trim() || formData.aadhaarNumber.trim();

    // Map Category
    let mappedCategory: CustomerCategory = "Domestic";
    if (formData.customerType === "Commercial") mappedCategory = "Commercial";
    else if (formData.customerType === "Government / Institutional") mappedCategory = "Government / Institutional";

    // Register into shared sandbox store
    const newId = registerCitizen({
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email || `${formData.username}@sandportal.cg.gov.in`,
      username: formData.username,
      password: formData.password,
      district: formData.district,
      mandal: formData.tehsilMandal,
      tehsilMandal: formData.tehsilMandal,
      village: formData.villageCity,
      villageCity: formData.villageCity,
      address: `${formData.deliveryAddress}, Landmark: ${formData.preferredDeliveryLocation}, Pincode: ${formData.pincode}`,
      deliveryAddress: formData.deliveryAddress,
      preferredDeliveryLocation: formData.preferredDeliveryLocation,
      pincode: formData.pincode,
      customerType: mappedCategory,
      identityType: formData.identityType,
      aadhaarNumber: formData.aadhaarNumber || finalKycRef,
      idKycRef: finalKycRef,
      isKycVerified: true,
      isOtpVerified: true,
      registeredDate: new Date().toISOString().replace("T", " ").substring(0, 10),
    });

    setRegisteredData({
      id: newId,
      name: formData.name,
      username: formData.username,
      mobile: formData.mobile,
      customerType: formData.customerType,
      deliveryAddress: formData.deliveryAddress,
      district: formData.district,
    });

    setActiveRole("Citizen");
    setShowSuccessModal(true);
  };

  // Quick Sample Profiles
  const handleFillSample = (type: "Domestic" | "Commercial" | "Government / Institutional") => {
    if (type === "Domestic") {
      setFormData({
        name: "Rajesh Kumar Sahu",
        mobile: "9827188401",
        email: "rajesh.sahu@example.com",
        username: "rajesh_sahu",
        password: "Password@123",
        confirmPassword: "Password@123",
        customerType: "Domestic",
        identityType: "Aadhaar Card (UIDAI)",
        aadhaarNumber: "4819-2831-9901",
        idKycRef: "AADHAAR: **** **** 4819",
        deliveryAddress: "House No 42, Ward 8, Near High School",
        district: "Raipur",
        tehsilMandal: "Arang",
        villageCity: "Mahanadi Sector 3",
        preferredDeliveryLocation: "Plot 42, North Gate Approach Road",
        pincode: "493441",
        otp: "7834",
      });
    } else if (type === "Commercial") {
      setFormData({
        name: "M/s Raipur Infra & Builders Pvt Ltd",
        mobile: "9826012345",
        email: "projects@raipurinfra.com",
        username: "raipur_infra",
        password: "Password@123",
        confirmPassword: "Password@123",
        customerType: "Commercial",
        identityType: "GSTIN (Goods and Services Tax ID)",
        aadhaarNumber: "22AAAAA0000A1Z5",
        idKycRef: "GSTIN: 22AAAAA0000A1Z5 / CGRERA-2025-09",
        deliveryAddress: "Commercial Project Site, Block B, Ring Road No. 3",
        district: "Raipur",
        tehsilMandal: "Dharsiwa",
        villageCity: "Bhirgaon Industrial Area",
        preferredDeliveryLocation: "Heavy Tipper Unloading Bay Gate 2",
        pincode: "492003",
        otp: "7834",
      });
    } else {
      setFormData({
        name: "Executive Engineer, PWD Division Raipur",
        mobile: "9425088231",
        email: "ee.pwd.raipur@cg.gov.in",
        username: "pwd_raipur_div",
        password: "Password@123",
        confirmPassword: "Password@123",
        customerType: "Government / Institutional",
        identityType: "PWD Contractor License #",
        aadhaarNumber: "CG-PWD-DIV1-2026-441",
        idKycRef: "PWD-SANCTION-ORDER-2026/8912",
        deliveryAddress: "State Highway 5 Expansion Project, Mile Post 14",
        district: "Raipur",
        tehsilMandal: "Abhanpur",
        villageCity: "Kenduwa Junction",
        preferredDeliveryLocation: "Culvert Construction Base Camp near River Bridge",
        pincode: "493661",
        otp: "7834",
      });
    }
    setIsOtpSent(true);
    setIsOtpVerified(true);
    showSuccess(`Demo ${type} customer profile populated & OTP pre-verified!`);
  };

  // Direct Navigation to Sand Booking with registered customer pre-filled
  const handleProceedToSandBooking = () => {
    setShowSuccessModal(false);
    navigate(routes.createBooking.path);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-200">
        
        {/* Registration Requirement Notice Banner (if coming from booking) */}
        {redirectReason === "booking" && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold">Customer Registration Required:</span> Under State Mineral Governance Policy 2026, registration and OTP verification must be completed before placing a sand booking. Please register your profile below to proceed with order booking.
            </div>
          </div>
        )}

        {/* Top Header & Navigation Ribbon */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border-color p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              icon={<ArrowLeft size={15} />}
              onClick={() => navigate(routes.login.path)}
            >
              Back to Sign In
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Customer Portal
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Customer Registration & Verification
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mandatory customer onboarding module for Domestic, Commercial & Institutional sand allocation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<LogIn size={14} />}
              onClick={() => navigate(routes.login.path)}
            >
              Already Registered? Sign In
            </Button>
          </div>
        </div>

        {/* Main Registration Form Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 text-slate-900 dark:text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#c2410c] dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800/60 shadow-2xs shrink-0">
                <ShieldCheck size={26} />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  State Sand Mining Customer Registration
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                  Register with verified mobile OTP, statutory ID & delivery address to book subsidized sand directly from state mining reaches & authorized stockyards.
                </p>
              </div>
            </div>
            <div className="shrink-0 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-right self-start sm:self-auto shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Statutory Compliance</span>
              <span className="font-mono font-bold text-xs text-[#c2410c] dark:text-orange-400">Minor Mineral Rules 2026</span>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-7 text-xs">
            
            {/* ── Section 1: Customer Type ──────────────────────────────── */}
            <div className="space-y-3">
              <div className="border-b border-border-color pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-primary" />
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    1. Customer Category Selection *
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Select type to configure quota & statutory KYC</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Domestic */}
                <div
                  onClick={() => setFormData((prev) => ({ ...prev, customerType: "Domestic", identityType: "Aadhaar Card (UIDAI)" }))}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.customerType === "Domestic"
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                      : "border-border-color bg-slate-50/50 dark:bg-gray-800/40 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Home size={18} />
                    </div>
                    <input
                      type="radio"
                      name="customerType"
                      checked={formData.customerType === "Domestic"}
                      onChange={() => setFormData((prev) => ({ ...prev, customerType: "Domestic" }))}
                      className="mt-1 text-primary focus:ring-primary accent-[#c2410c]"
                    />
                  </div>
                  <div className="mt-2.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Domestic</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Individual citizens, private house construction & Rural Awas beneficiaries.
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                      Quota: Up to 50 MT
                    </span>
                  </div>
                </div>

                {/* Commercial */}
                <div
                  onClick={() => setFormData((prev) => ({ ...prev, customerType: "Commercial", identityType: "GSTIN (Goods and Services Tax ID)" }))}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.customerType === "Commercial"
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                      : "border-border-color bg-slate-50/50 dark:bg-gray-800/40 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                      <Building2 size={18} />
                    </div>
                    <input
                      type="radio"
                      name="customerType"
                      checked={formData.customerType === "Commercial"}
                      onChange={() => setFormData((prev) => ({ ...prev, customerType: "Commercial" }))}
                      className="mt-1 text-primary focus:ring-primary accent-[#c2410c]"
                    />
                  </div>
                  <div className="mt-2.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Commercial</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Commercial builders, real estate developers, RMC plants & private contractors.
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                      Bulk Quota Available
                    </span>
                  </div>
                </div>

                {/* Government / Institutional */}
                <div
                  onClick={() => setFormData((prev) => ({ ...prev, customerType: "Government / Institutional", identityType: "PWD Contractor License #" }))}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.customerType === "Government / Institutional"
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                      : "border-border-color bg-slate-50/50 dark:bg-gray-800/40 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                      <Landmark size={18} />
                    </div>
                    <input
                      type="radio"
                      name="customerType"
                      checked={formData.customerType === "Government / Institutional"}
                      onChange={() => setFormData((prev) => ({ ...prev, customerType: "Government / Institutional" }))}
                      className="mt-1 text-primary focus:ring-primary accent-[#c2410c]"
                    />
                  </div>
                  <div className="mt-2.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Government / Institutional</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      PWD, CPWD, NHAI, Irrigation, Municipal Corporations & Public Sector Projects.
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                      Subsidized Govt Tariffs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 2: Personal & Contact Information + Mobile OTP ──── */}
            <div className="space-y-4">
              <div className="border-b border-border-color pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-primary" />
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    2. Customer Profile & Mobile OTP Verification
                  </h3>
                </div>
                {isOtpVerified ? (
                  <Badge variant="success" className="text-[10px] flex items-center gap-1">
                    <CheckCircle2 size={12} /> Mobile Verified
                  </Badge>
                ) : (
                  <Badge variant="warning" className="text-[10px]">
                    OTP Verification Pending
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                    Customer / Entity Name (as per Govt ID) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={
                        formData.customerType === "Domestic"
                          ? "e.g. Rajesh Kumar Sahu"
                          : formData.customerType === "Commercial"
                          ? "e.g. M/s Raipur Infra & Builders Pvt Ltd"
                          : "e.g. Executive Engineer, PWD Division Raipur"
                      }
                      className={`${inputBase} ${inputNormal} pl-8.5 font-semibold`}
                      required
                    />
                    <User size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                    Email Address (for Digital e-Pass & Tax Receipts) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. customer@example.com"
                      className={`${inputBase} ${inputNormal} pl-8.5`}
                      required
                    />
                    <Mail size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Mobile Number & OTP Verification Row */}
              <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-800/60 space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Column 1: Mobile Number with Integrated Action */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                      Mobile Number (10 Digits) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-stretch rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden focus-within:border-[#c2410c] focus-within:ring-1 focus-within:ring-[#c2410c] transition-all h-10">
                      <div className="px-3 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-600 dark:text-slate-300 select-none shrink-0">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => handleMobileChange(e.target.value)}
                        placeholder="9827188401"
                        maxLength={10}
                        className="flex-1 min-w-0 px-3 py-2 text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none focus:ring-0"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpCountdown > 0 || formData.mobile.length !== 10}
                        className={`px-3.5 text-xs font-bold transition-colors border-l border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center ${
                          otpCountdown > 0
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            : isOtpSent
                            ? "bg-orange-50 dark:bg-orange-950/50 text-[#c2410c] hover:bg-orange-100 dark:hover:bg-orange-900/50 cursor-pointer"
                            : "bg-[#c2410c] hover:bg-[#9a3412] text-white cursor-pointer"
                        }`}
                      >
                        {otpCountdown > 0 ? `${otpCountdown}s Resend` : isOtpSent ? "Resend OTP" : "Send OTP"}
                      </button>
                    </div>
                  </div>

                  {/* Column 2: OTP-based Mobile Verification */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                      OTP-based Mobile Verification <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex items-stretch rounded-xl border shadow-2xs overflow-hidden transition-all h-10 ${
                      isOtpVerified
                        ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:border-[#c2410c] focus-within:ring-1 focus-within:ring-[#c2410c]"
                    }`}>
                      <input
                        type="text"
                        value={formData.otp}
                        disabled={isOtpVerified}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value.slice(0, 4) })}
                        placeholder="Enter 4-digit OTP"
                        maxLength={4}
                        className={`flex-1 min-w-0 px-3 py-2 text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none focus:ring-0 ${
                          isOtpVerified ? "text-emerald-700 dark:text-emerald-300 font-black" : ""
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isOtpVerified || formData.otp.length < 4}
                        className={`px-4 text-xs font-bold transition-colors border-l shrink-0 flex items-center gap-1.5 justify-center ${
                          isOtpVerified
                            ? "bg-emerald-500 text-white border-emerald-600 cursor-default"
                            : formData.otp.length === 4
                            ? "bg-[#c2410c] hover:bg-[#9a3412] text-white border-slate-200 dark:border-slate-700 cursor-pointer"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                        }`}
                      >
                        {isOtpVerified ? "✓ Verified" : "Verify OTP"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="text-blue-500 font-bold">ℹ️</span> OTP verification links your mobile for computerized weighbridge slips & SMS e-Pass transit dispatch.
                  </span>
                  {isOtpSent && !isOtpVerified && (
                    <span className="font-mono font-bold text-[#c2410c] dark:text-orange-400 bg-orange-100/80 dark:bg-orange-950/60 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-800 self-start sm:self-auto">
                      Demo OTP: 7834
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Section 3: Aadhaar / Statutory Identity Details ────────── */}
            <div className="space-y-4">
              <div className="border-b border-border-color pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 size={16} className="text-primary" />
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    3. Aadhaar / Identity Details (Mandatory Department Requirement)
                  </h3>
                </div>
                <span className="text-[10px] text-primary font-bold">Quota Anti-Hoarding Check</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                    Identity Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.identityType}
                    onChange={(e) => setFormData({ ...formData, identityType: e.target.value })}
                    className={`${inputBase} ${inputNormal} font-semibold`}
                  >
                    {currentIdConfig.types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                    {formData.identityType.includes("Aadhaar")
                      ? "Aadhaar Number (UIDAI / VID) *"
                      : "Identification / Registration Number *"}
                  </label>
                  <input
                    type="text"
                    value={formData.idKycRef}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        idKycRef: e.target.value,
                        aadhaarNumber: formData.identityType.includes("Aadhaar") ? e.target.value : formData.aadhaarNumber,
                      })
                    }
                    placeholder={currentIdConfig.placeholder}
                    className={`${inputBase} ${inputNormal} font-mono font-bold uppercase`}
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-800/60 rounded-xl border border-border-color flex items-start gap-2.5">
                <Info size={16} className="text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold">Department Note:</span> {currentIdConfig.helperText} Quota limits are verified automatically against state land registries and mineral concessions to prevent illegal re-selling.
                </p>
              </div>
            </div>

            {/* ── Section 4: Login Credentials Setup ─────────────────────── */}
            <div className="space-y-4">
              <div className="border-b border-border-color pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound size={16} className="text-primary" />
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    4. Portal Login Credentials
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500">For direct sign-in to Citizen Sand Portal</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                    Username / Login User ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g. rajesh_sahu"
                      className={`${inputBase} ${inputNormal} font-mono pl-8.5`}
                      required
                    />
                    <User size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Can be your mobile, email, or unique handle</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                    Create Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className={`${inputBase} ${inputNormal} pl-8.5 pr-8.5`}
                      required
                    />
                    <Lock size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {/* Password strength meter */}
                  {formData.password ? (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="h-1 flex-1 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            passwordStrength === 1
                              ? "w-1/3 bg-rose-500"
                              : passwordStrength === 2
                              ? "w-2/3 bg-amber-500"
                              : "w-full bg-emerald-500"
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {passwordStrength === 1 ? "Weak" : passwordStrength === 2 ? "Medium" : "Strong"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 block mt-1">Minimum 6 secure alphanumeric characters</span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className={`${inputBase} ${inputNormal} pl-8.5 pr-8.5 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? "border-rose-500 focus:ring-rose-500"
                          : ""
                      }`}
                      required
                    />
                    <Lock size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {formData.confirmPassword ? (
                    <span
                      className={`text-[10px] block mt-1 ${
                        formData.password === formData.confirmPassword ? "text-emerald-600 font-bold" : "text-rose-500"
                      }`}
                    >
                      {formData.password === formData.confirmPassword ? "✓ Passwords Match" : "✗ Passwords do not match"}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 block mt-1">Re-enter password to verify</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Section 5: Delivery Address Hierarchy & Preferred Location ── */}
            <div className="space-y-4">
              <div className="border-b border-border-color pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    5. Delivery Address & Location Hierarchy
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500">Site location for tipper transit & geotagging</span>
              </div>

              {/* District, Tehsil/Mandal, Village/City, Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    District *
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className={`${inputBase} ${inputNormal} font-semibold`}
                  >
                    {Object.keys(DISTRICT_TEHSILS).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tehsil / Mandal *
                  </label>
                  <input
                    type="text"
                    value={formData.tehsilMandal}
                    onChange={(e) => setFormData({ ...formData, tehsilMandal: e.target.value })}
                    placeholder="e.g. Arang / Patan"
                    className={`${inputBase} ${inputNormal} font-semibold`}
                    list="tehsils-list"
                    required
                  />
                  <datalist id="tehsils-list">
                    {(DISTRICT_TEHSILS[formData.district] || []).map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Village / City / Ward *
                  </label>
                  <input
                    type="text"
                    value={formData.villageCity}
                    onChange={(e) => setFormData({ ...formData, villageCity: e.target.value })}
                    placeholder="e.g. Mahanadi Sector 3 / Ward 14"
                    className={`${inputBase} ${inputNormal} font-semibold`}
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="493441"
                    maxLength={6}
                    className={`${inputBase} ${inputNormal} font-mono`}
                    required
                  />
                </div>
              </div>

              {/* Delivery Address Details */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Complete Delivery / Construction Site Address *
                </label>
                <textarea
                  rows={2}
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="Plot / House No., Street, Construction Project Name, Building Site..."
                  className={`${inputBase} ${inputNormal}`}
                  required
                />
              </div>

              {/* Preferred Delivery Location / Landmark */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Delivery Location / Landmark & Unloading Point *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.preferredDeliveryLocation}
                    onChange={(e) => setFormData({ ...formData, preferredDeliveryLocation: e.target.value })}
                    placeholder="e.g. North Gate Approach Road, Near Water Tank, Heavy Tipper accessible"
                    className={`${inputBase} ${inputNormal} pl-8`}
                    required
                  />
                  <MapPin size={15} className="absolute left-2.5 top-2.5 text-primary" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Driver and dispatch team use this landmark for direct GPS transit navigation and tipping.
                </span>
              </div>
            </div>

            {/* ── Section 6: Statutory Declaration & Consent ─────────────── */}
            <div className="p-4 bg-slate-50 dark:bg-gray-800/60 rounded-2xl border border-border-color space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasConsent}
                  onChange={(e) => setHasConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary accent-[#c2410c] cursor-pointer"
                />
                <span className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-relaxed">
                  I hereby declare that all information, identity proofs, and delivery site addresses provided are true and accurate. I undertake that all mineral sand purchased through this portal will be utilized solely for lawful construction at the designated delivery address in compliance with Chhattisgarh Minor Mineral Rules 2026.
                </span>
              </label>
            </div>

            {/* ── Form Actions ───────────────────────────────────────────── */}
            <div className="pt-4 border-t border-border-color flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                icon={<ArrowLeft size={14} />}
                onClick={() => navigate(routes.login.path)}
              >
                Cancel / Back to Sign In
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<CheckCircle2 size={16} />}
                >
                  Complete Customer Registration
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── Success Confirmation Modal (With Direct Sand Booking CTA) ── */}
      {showSuccessModal && registeredData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-7 max-w-lg w-full border border-border-color text-slate-800 dark:text-white space-y-5 text-center">
            
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Registration & OTP Verified
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                Welcome, {registeredData.name}!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your customer account is now active on the State Sand Mining System. You are authorized to place sand purchase orders.
              </p>
            </div>

            {/* Generated Credentials & Profile Card */}
            <div className="p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-orange-200 dark:border-orange-800 pb-2">
                <span className="text-slate-500">Customer Reg ID:</span>
                <span className="font-mono font-bold text-orange-700 dark:text-orange-300">{registeredData.id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-orange-200 dark:border-orange-800 pb-2">
                <span className="text-slate-500">Customer Category:</span>
                <span className="font-bold text-slate-900 dark:text-white">{registeredData.customerType}</span>
              </div>
              <div className="flex justify-between items-center border-b border-orange-200 dark:border-orange-800 pb-2">
                <span className="text-slate-500">Login Username:</span>
                <span className="font-mono font-black text-slate-900 dark:text-white">{registeredData.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Delivery District:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{registeredData.district}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-left flex items-center gap-2.5">
              <Check size={16} className="text-emerald-600 shrink-0" />
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                Requirement fulfilled: You may now immediately proceed to place your sand booking order.
              </p>
            </div>

            {/* Direct Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(routes.citizenMyOrders.path);
                }}
              >
                Go to My Orders
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<ShoppingCart size={15} />}
                className="flex-1"
                onClick={handleProceedToSandBooking}
              >
                Proceed to Book Sand
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenRegistration;
