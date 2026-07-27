"use client";

import React, {
  useState,
  useEffect,
  useTransition,
  useRef
} from "react";
import {
  stateDistrictsData,
  qualificationOptions,
  preferredLanguages
} from "@/lib/locationData";
import { RegistrationData } from "@/lib/types";
import { submitRegistration } from "@/lib/firestoreService";
import {
  CheckCircle2,
  FileText,
  Send,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Smartphone,
  Home,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Award,
  Clock,
  Lock,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Info,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function RegistrationPage() {
  // Navigation State: Landing Page vs Registration Form
  const [showLandingPage, setShowLandingPage] = useState(true);

  // Form State
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: "",
    fatherName: "",

    dob: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",

    age: 0,

    gender: "Male",

    mobileNumber: "",

    state: "",
    district: "",
    villageTown: "",
    pinCode: "",

    qualification: qualificationOptions[0] || "",

    occupation: "",

    schoolCollege: "",
    companyName: "",
    businessDetails: "",

    preferredLanguage: "Hindi",

    declarationAccepted: false,
  });

  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorField, setErrorField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Field Refs
  const fullNameRef = useRef<HTMLInputElement>(null);
  const fatherNameRef = useRef<HTMLInputElement>(null);
  const dobDayRef = useRef<HTMLSelectElement>(null);
  const mobileNumberRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLSelectElement>(null);
  const districtRef = useRef<HTMLSelectElement>(null);
  const villageTownRef = useRef<HTMLInputElement>(null);
  const pinCodeRef = useRef<HTMLInputElement>(null);
  const qualificationRef = useRef<HTMLSelectElement>(null);
  const occupationRef = useRef<HTMLSelectElement>(null);
  const schoolCollegeRef = useRef<HTMLInputElement>(null);
  const companyNameRef = useRef<HTMLInputElement>(null);
  const businessDetailsRef =
  useRef<HTMLTextAreaElement>(null);
  const declarationAcceptedRef = useRef<HTMLInputElement>(null);

  // Scroll to top when view switches
  const handleStartRegistration = () => {
    setShowLandingPage(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToLanding = () => {
    setShowLandingPage(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto calculate age when DOB changes
  useEffect(() => {
    if (
      formData.dobDay &&
      formData.dobMonth &&
      formData.dobYear
    ) {
      const today = new Date();

      const birthDate = new Date(
        Number(formData.dobYear),
        Number(formData.dobMonth) - 1,
        Number(formData.dobDay)
      );

      let age = today.getFullYear() - birthDate.getFullYear();

      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 &&
          today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      setFormData((prev) => ({
        ...prev,
        age,
        dob: `${formData.dobDay}-${formData.dobMonth}-${formData.dobYear}`,
      }));
    }
  }, [
    formData.dobDay,
    formData.dobMonth,
    formData.dobYear,
  ]);

  // Helper to trigger field error with Scroll & Focus
  const triggerFieldError = (
    fieldName: string,
    message: string,
    ref: React.RefObject<HTMLElement | null>
  ) => {
    setErrorMessage(message);
    setErrorField(fieldName);
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      ref.current.focus();
    }
  };

  const clearErrorIfMatches = (fieldName: string) => {
    if (errorField === fieldName) {
      setErrorField(null);
      setErrorMessage("");
    }
  };

  // Dynamic district update when state changes
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    clearErrorIfMatches("state");
    clearErrorIfMatches("district");

    const selectedState = e.target.value;
    const districts = (stateDistrictsData as Record<string, string[]>)[selectedState] || [];
    setAvailableDistricts(districts);
    setFormData((prev) => ({
      ...prev,
      state: selectedState,
      district: districts.length > 0 ? districts[0] : "",
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    clearErrorIfMatches(name);

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setErrorField(null);

    // Validation with Scroll & Focus
    if (!formData.fullName.trim()) {
      triggerFieldError("fullName", "Kripya apna Full Name bharein.", fullNameRef);
      return;
    }
    if (!formData.fatherName.trim()) {
      triggerFieldError("fatherName", "Kripya Father's Name bharein.", fatherNameRef);
      return;
    }
    if (!formData.dobDay || !formData.dobMonth || !formData.dobYear || !formData.dob) {
      triggerFieldError("dob", "Kripya Date of Birth chunein.", dobDayRef);
      return;
    }
    if (formData.age < 17) {
      triggerFieldError("dob", "Minimum age should be 17 years.", dobDayRef);
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      triggerFieldError(
        "mobileNumber",
        "Mobile Number 6, 7, 8 ya 9 se start hona chahiye aur 10 digits ka hona chahiye.",
        mobileNumberRef
      );
      return;
    }
    if (!formData.state) {
      triggerFieldError("state", "Kripya State chunein.", stateRef);
      return;
    }
    if (!formData.district) {
      triggerFieldError("district", "Kripya District chunein.", districtRef);
      return;
    }
    if (!formData.villageTown.trim()) {
      triggerFieldError("villageTown", "Kripya Village/Town bharein.", villageTownRef);
      return;
    }
    if (!formData.pinCode.trim() || formData.pinCode.replace(/\D/g, "").length !== 6) {
      triggerFieldError("pinCode", "Kripya 6-digit PIN Code bharein.", pinCodeRef);
      return;
    }
    if (!formData.qualification) {
      triggerFieldError("qualification", "Kripya Qualification chunein.", qualificationRef);
      return;
    }
    if (!formData.occupation.trim()) {
      triggerFieldError("occupation", "Kripya Occupation bharein.", occupationRef);
      return;
    }
    if (formData.occupation === "Student" && !formData.schoolCollege.trim()) {
      triggerFieldError("schoolCollege", "Kripya School / College Name bharein.", schoolCollegeRef);
      return;
    }
    if (formData.occupation === "Job" && !formData.companyName.trim()) {
      triggerFieldError("companyName", "Kripya Company Name bharein.", companyNameRef);
      return;
    }
    if (
      (formData.occupation === "Business" || formData.occupation === "Other") &&
      !formData.businessDetails.trim()
    ) {
      triggerFieldError("businessDetails", "Kripya Occupation Details bharein.", businessDetailsRef);
      return;
    }
    if (!formData.declarationAccepted) {
      triggerFieldError("declarationAccepted", "Kripya Declaration Checkbox ko accept karein.", declarationAcceptedRef);
      return;
    }

    startTransition(async () => {
      try {
        const res = await submitRegistration(formData);
        if (res.success) {
          setIsSubmitted(true);
        } else {
          setErrorMessage("Form submit karne me samasya aayi. Kripya punah prayas karein.");
        }
      } catch (err) {
        setErrorMessage("Server error. Kripya punah prayas karein.");
      }
    });
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setShowLandingPage(true);
    setErrorField(null);
    setErrorMessage("");
    setAvailableDistricts([]);

    setFormData({
      fullName: "",
      fatherName: "",
      dob: "",
      dobDay: "",
      dobMonth: "",
      dobYear: "",
      age: 0,
      gender: "Male",
      mobileNumber: "",
      state: "",
      district: "",
      villageTown: "",
      pinCode: "",
      qualification: qualificationOptions[0] || "",
      occupation: "",
      schoolCollege: "",
      companyName: "",
      businessDetails: "",
      preferredLanguage: "Hindi",
      declarationAccepted: false,
    });
  };

  const getFieldClasses = (fieldName: string, extraClasses = "bg-white") => {
    const isError = errorField === fieldName;
    const borderBg = isError
      ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
      : `border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${extraClasses}`;
    return `w-full px-3.5 py-2.5 rounded-lg border text-slate-900 text-sm outline-none transition ${borderBg}`;
  };

  // Benefits checklist list
  const benefits = [
    { title: "Study ke saath Part-Time", icon: GraduationCap, color: "text-blue-600 bg-blue-50" },
    { title: "Job ke saath Part-Time", icon: Briefcase, color: "text-indigo-600 bg-indigo-50" },
    { title: "Mobile se Work", icon: Smartphone, color: "text-purple-600 bg-purple-50" },
    { title: "Home se Work", icon: Home, color: "text-emerald-600 bg-emerald-50" },
    { title: "Official Work Opportunity", icon: ShieldCheck, color: "text-amber-600 bg-amber-50" },
    { title: "Extra Income Opportunity", icon: TrendingUp, color: "text-teal-600 bg-teal-50" },
    { title: "Career Growth", icon: Sparkles, color: "text-sky-600 bg-sky-50" },
    { title: "Full-Time Opportunity (Optional)", icon: Award, color: "text-rose-600 bg-rose-50" },
  ];

  // Timeline items
  const timelineSteps = [
    { num: "01", title: "Apply Now", subtitle: "Start your journey", icon: ArrowRight },
    { num: "02", title: "Registration Form Fill Karein", subtitle: "Sirf 2–3 Minutes lagte hain", icon: FileText },
    { num: "03", title: "Submit Registration", subtitle: "Aapki jankari hum tak pahunch jayegi", icon: CheckCircle },
    { num: "04", title: "Team 24 Hours ke andar Contact Karegi", subtitle: "Official verification & scheduling", icon: Clock },
    { num: "05", title: "Official Presentation", subtitle: "Detailed live session attend karein", icon: UserCheck },
    { num: "06", title: "Complete Information Samjhein", subtitle: "Sector & income system janiye", icon: Info },
    { num: "07", title: "Apna Decision Khud Lein", subtitle: "Zero pressure, full clarity", icon: Award },
  ];

  // Safety cards
  const safetyCards = [
    { title: "Information Secure Rahegi", desc: "Aapka data 100% confidential aur safe hai.", icon: Lock, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { title: "Registration Sirf 2–3 Minutes", desc: "Quick & straightforward registration form.", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { title: "Easy & User Friendly Process", desc: "Mobile se aasaani se poora karein.", icon: UserCheck, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { title: "Pehle Complete Information, Uske Baad Decision", desc: "Pehle poora samjhein, fir start karein.", icon: FileText, color: "text-purple-600 bg-purple-50 border-purple-100" },
  ];

  return (
    <main className="min-h-screen bg-slate-50/70 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">
      <div className="max-w-3xl mx-auto">
        
        {/* ======================================================== */}
        {/* LANDING PAGE VIEW */}
        {/* ======================================================== */}
        {showLandingPage ? (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            
            {/* 1. TOP HERO CARD */}
            <section className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-10 transition-all">
              <div className="text-center max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4 text-blue-600" /> New Opportunity {new Date().getFullYear()}
                </span>

                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
                  🚀 Build Your Future With Us
                </h1>

                <p className="mt-3 text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Aaj Ek Chhota Step, Kal Ek Better Future!
                </p>
              </div>

              {/* Motivational Paragraphs */}
              <div className="mt-6 sm:mt-8 bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/60 space-y-3.5 text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                <p>
                  Agar aap <strong className="text-slate-900 font-semibold">Student</strong> hain, <strong className="text-slate-900 font-semibold">Job</strong> karte hain, <strong className="text-slate-900 font-semibold">Business</strong> karte hain, <strong className="text-slate-900 font-semibold">Housewife</strong> hain ya apne liye <strong className="text-blue-600 font-semibold">Extra Income</strong> aur <strong className="text-indigo-600 font-semibold">Career Growth</strong> ka ek naya opportunity explore karna chahte hain, to ye platform aapke liye ho sakta hai.
                </p>
                <p>
                  Aap apni Padhai ke saath, Regular Job ke saath ya Part-Time bhi is opportunity ko explore kar sakte hain.
                </p>
                <p className="flex items-center gap-2 text-slate-900 font-semibold bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                  <Smartphone className="w-5 h-5 text-blue-600 shrink-0" />
                  Sirf apne Mobile Phone se roz 2–4 ghante ka time dekar aap kaam kar sakte hain.
                </p>
              </div>

              {/* Checklist Grid */}
              <div className="mt-8">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Key Benefits & Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefits.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
                      >
                        <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-800">
                          {item.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 2. SECOND CARD */}
            <section className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  📋
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Registration Karne Se Pehle
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Agar aap is opportunity ke baare me aur jaanna chahte hain, to sabse pehle aapko apna Registration complete karna hoga. Registration complete hone ke baad hamari team ki taraf se ek <strong className="text-slate-900">Official Presentation</strong> organize ki jaati hai.
              </p>

              <div className="bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-100 mb-6">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Presentation me kya bataya jayega:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  {[
                    "Sector ka Background",
                    "Kaam kaise hota hai",
                    "Step-by-Step Working Process",
                    "Training & Support",
                    "Career Growth Opportunities",
                    "Income Opportunity ka process kaise explain kiya jayega.",
                    "Aapke sabhi Questions ke Answers",
                  ].map((pt, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-xl border border-slate-200/60 shadow-2xs">
                      <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Note Card */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
                  💡
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-amber-900 mb-0.5">Important Note:</h5>
                  <p className="text-xs sm:text-sm text-amber-800 font-medium leading-relaxed">
                    Presentation attend karne ke baad hi aap poori information samajhkar apna decision le sakte hain.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. THIRD CARD - TIMELINE */}
            <section className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Simple Registration Process
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">7 easy steps to start your process</p>
                </div>
              </div>

              <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200/80 space-y-6 my-4">
                {timelineSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={index} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        {step.num}
                      </div>

                      <div className="bg-slate-50/80 hover:bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900">
                            {step.title}
                          </h4>
                          <StepIcon className="w-4 h-4 text-blue-500 shrink-0" />
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. FOURTH CARD - SAFE & SIMPLE */}
            <section className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  🔒
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Safe & Simple Process
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {safetyCards.map((sc, index) => {
                  const IconComp = sc.icon;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border ${sc.color} shadow-2xs transition-all hover:scale-[1.01]`}
                    >
                      <div className="flex items-center gap-3 mb-1.5">
                        <IconComp className="w-5 h-5 shrink-0" />
                        <h4 className="text-sm font-bold text-slate-900">
                          {sc.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 font-medium pl-8">
                        {sc.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 5. LAST CARD - CTA */}
            <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-[24px] shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden">
              {/* Background ambient lighting */}
              <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-xl mx-auto space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-sm border border-white/10">
                  ⚡ Take Action Today
                </span>

                <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                  🚀 Ready to Get Started?
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto">
                  Apna Registration Start karne ke liye neeche diye gaye button par click karein.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleStartRegistration}
                    className="w-full h-[60px] rounded-[18px] bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-lg tracking-wide shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 border border-white/20"
                  >
                    <span>🚀 APPLY NOW</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-[11px] sm:text-xs text-slate-400 font-medium pt-1 flex items-center justify-center gap-1.5">
                  <span>📌</span> Apply Now par click karte hi Registration Form open ho jayega.
                </p>
              </div>
            </section>

          </div>
        ) : (
          /* ======================================================== */
          /* REGISTRATION FORM VIEW (UNTOUCHED LOGIC) */
          /* ======================================================== */
          <div className="space-y-4 animate-fadeIn">
            {/* Navigation back button */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToLanding}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-2xs transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Overview
              </button>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                Fill the form below to register
              </span>
            </div>

            {/* Header Branding - Hidden on Success View */}
            {!isSubmitted && (
              <header className="text-center my-6">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Registration Form
                </h1>

                <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
                  Kripya apni sahi jankari niche diye gaye form me bharein.
                </p>
              </header>
            )}

            {isSubmitted ? (
              /* THANK YOU VIEW */
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 text-center transition-all animate-fadeIn">
                <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6 shadow-inner">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div className="space-y-5 max-w-lg mx-auto">
                  <h2 className="text-4xl font-extrabold text-emerald-600">
                    🎉 Congratulations!
                  </h2>

                  <p className="text-lg text-slate-700 font-medium">
                    Registration Successfully Submitted.
                  </p>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                    <p className="font-semibold text-emerald-800">
                      Our Team Will Contact You Soon.
                    </p>

                    <p className="mt-2 text-sm text-emerald-700">
                      Please Keep Your Mobile Number Active.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={resetForm}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg transition-all"
                  >
                    <RefreshCw className="w-5 h-5" />
                    New Registration
                  </button>
                  <button
                    onClick={handleBackToLanding}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all"
                  >
                    Go to Home Page
                  </button>
                </div>
              </div>
            ) : (
              /* FORM VIEW */
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-lg">
                    <FileText className="w-5 h-5" /> Registration Details
                  </div>
                  <span className="text-xs bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md font-mono">
                    All fields required
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                  {errorMessage && (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-medium">
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        ref={fullNameRef}
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Apna pura naam bharein"
                        className={getFieldClasses("fullName")}
                      />
                    </div>

                    {/* Father's Name */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Father&apos;s Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        ref={fatherNameRef}
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        placeholder="Pita ka naam bharein"
                        className={getFieldClasses("fatherName")}
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Date of Birth <span className="text-rose-500">*</span>
                      </label>

                      <div className="grid grid-cols-3 gap-2">
                        <select
                          ref={dobDayRef}
                          value={formData.dobDay}
                          onChange={(e) => {
                            clearErrorIfMatches("dob");
                            setFormData((prev) => ({ ...prev, dobDay: e.target.value }));
                          }}
                          className={`w-full px-3 py-2.5 rounded-lg border text-slate-900 text-sm outline-none transition ${
                            errorField === "dob"
                              ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500"
                              : "border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                          }`}
                        >
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1)}>
                              {i + 1}
                            </option>
                          ))}
                        </select>

                        <select
                          value={formData.dobMonth}
                          onChange={(e) => {
                            clearErrorIfMatches("dob");
                            setFormData((prev) => ({ ...prev, dobMonth: e.target.value }));
                          }}
                          className={`w-full px-3 py-2.5 rounded-lg border text-slate-900 text-sm outline-none transition ${
                            errorField === "dob"
                              ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500"
                              : "border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                          }`}
                        >
                          <option value="">Month</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1)}>
                              {i + 1}
                            </option>
                          ))}
                        </select>

                        <select
                          value={formData.dobYear}
                          onChange={(e) => {
                            clearErrorIfMatches("dob");
                            setFormData((prev) => ({ ...prev, dobYear: e.target.value }));
                          }}
                          className={`w-full px-3 py-2.5 rounded-lg border text-slate-900 text-sm outline-none transition ${
                            errorField === "dob"
                              ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500"
                              : "border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                          }`}
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 70 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <option key={year} value={String(year)}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    {/* Age */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Age
                      </label>

                      <input
                        type="text"
                        readOnly
                        value={formData.age ? `${formData.age} Years` : ""}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-100 font-semibold text-slate-900 text-sm outline-none"
                      />

                      {formData.age > 0 && formData.age < 17 && (
                        <p className="mt-2 text-sm font-semibold text-red-600">
                          Minimum age should be 17 years.
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Gender <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={getFieldClasses("gender", "bg-white")}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Mobile Number */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-sm text-slate-500 font-medium">+91</span>
                        <input
                          ref={mobileNumberRef}
                          type="tel"
                          name="mobileNumber"
                          maxLength={10}
                          value={formData.mobileNumber}
                          onChange={(e) => {
                            clearErrorIfMatches("mobileNumber");
                            let val = e.target.value.replace(/\D/g, "");

                            if (val.length > 10) {
                              val = val.slice(0, 10);
                            }

                            setFormData((prev) => ({
                              ...prev,
                              mobileNumber: val,
                            }));
                          }}
                          placeholder="10 digit mobile number"
                          className={`w-full pl-12 pr-3.5 py-2.5 rounded-lg border text-slate-900 text-sm outline-none transition ${
                            errorField === "mobileNumber"
                              ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500"
                              : "border-slate-300 focus:ring-2 focus:ring-blue-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* State */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <select
                        ref={stateRef}
                        name="state"
                        value={formData.state}
                        onChange={handleStateChange}
                        className={getFieldClasses("state", "bg-white")}
                      >
                        <option value="">-- State Chunein --</option>
                        {Object.keys(stateDistrictsData).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District (Dynamic) */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        District <span className="text-xs text-blue-600 font-normal">(Dynamic)</span>{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <select
                        ref={districtRef}
                        name="district"
                        disabled={!formData.state}
                        value={formData.district}
                        onChange={handleInputChange}
                        className={getFieldClasses("district", "bg-white disabled:bg-slate-100 disabled:cursor-not-allowed")}
                      >
                        {!formData.state ? (
                          <option value="">Pehle State chunein</option>
                        ) : availableDistricts.length > 0 ? (
                          availableDistricts.map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))
                        ) : (
                          <option value="">No districts available</option>
                        )}
                      </select>
                    </div>

                    {/* Village/Town */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Village/Town <span className="text-rose-500">*</span>
                      </label>
                      <input
                        ref={villageTownRef}
                        type="text"
                        name="villageTown"
                        value={formData.villageTown}
                        onChange={handleInputChange}
                        placeholder="Village ya Town ka naam"
                        className={getFieldClasses("villageTown")}
                      />
                    </div>

                    {/* PIN Code */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        PIN Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        ref={pinCodeRef}
                        type="text"
                        name="pinCode"
                        maxLength={6}
                        value={formData.pinCode}
                        onChange={(e) => {
                          clearErrorIfMatches("pinCode");
                          const val = e.target.value.replace(/\D/g, "");
                          setFormData((prev) => ({ ...prev, pinCode: val }));
                        }}
                        placeholder="6 digit PIN Code"
                        className={getFieldClasses("pinCode")}
                      />
                    </div>

                    {/* Qualification */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Qualification <span className="text-rose-500">*</span>
                      </label>
                      <select
                        ref={qualificationRef}
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className={getFieldClasses("qualification", "bg-white")}
                      >
                        {qualificationOptions.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Occupation */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Occupation <span className="text-rose-500">*</span>
                      </label>

                      <select
                        ref={occupationRef}
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        className={getFieldClasses("occupation", "bg-white")}
                      >
                        <option value="">Select Occupation</option>
                        <option value="Student">Student</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Normal Work">Normal Work</option>
                        <option value="Job">Job</option>
                        <option value="Business">Business</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Dynamic Occupation Fields */}
                    {formData.occupation === "Student" && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          School / College Name <span className="text-rose-500">*</span>
                        </label>

                        <input
                          ref={schoolCollegeRef}
                          type="text"
                          name="schoolCollege"
                          value={formData.schoolCollege || ""}
                          onChange={handleInputChange}
                          placeholder="Enter School / College Name"
                          className={getFieldClasses("schoolCollege")}
                        />
                      </div>
                    )}

                    {formData.occupation === "Job" && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Company Name <span className="text-rose-500">*</span>
                        </label>

                        <input
                          ref={companyNameRef}
                          type="text"
                          name="companyName"
                          value={formData.companyName || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Company Name"
                          className={getFieldClasses("companyName")}
                        />
                      </div>
                    )}

                    {formData.occupation === "Business" && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Business Details <span className="text-rose-500">*</span>
                        </label>

                        <textarea
                          ref={businessDetailsRef}
                          name="businessDetails"
                          value={formData.businessDetails || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Business Details"
                          rows={3}
                          className={getFieldClasses("businessDetails")}
                        />
                      </div>
                    )}

                    {formData.occupation === "Other" && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Occupation Details <span className="text-rose-500">*</span>
                        </label>

                        <textarea
                          ref={businessDetailsRef}
                          name="businessDetails"
                          value={formData.businessDetails || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Occupation Details"
                          className={getFieldClasses("businessDetails")}
                        ></textarea>
                      </div>
                    )}

                    {/* Preferred Language */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Preferred Language <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {preferredLanguages.map((lang) => (
                          <label
                            key={lang}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium cursor-pointer transition ${
                              formData.preferredLanguage === lang
                                ? "bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-sm"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="preferredLanguage"
                              value={lang}
                              checked={formData.preferredLanguage === lang}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            {lang}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Declaration Checkbox */}
                    <div
                      className={`sm:col-span-2 border p-4 rounded-xl transition ${
                        errorField === "declarationAccepted"
                          ? "bg-red-50 border-red-500"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          ref={declarationAcceptedRef}
                          type="checkbox"
                          name="declarationAccepted"
                          checked={formData.declarationAccepted}
                          onChange={handleInputChange}
                          className={`mt-1 w-4 h-4 text-blue-600 rounded shrink-0 transition ${
                            errorField === "declarationAccepted"
                              ? "border-red-500 focus:ring-red-500"
                              : "border-slate-300 focus:ring-blue-500"
                          }`}
                        />
                        <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          Main ghoshna karta/karti hoon ki mere dwara di gayi uparukta sabhi jankari satya aur sahi hai.
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="sm:col-span-2 pt-4">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPending ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" /> Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" /> Submit Registration
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} SV Connect Pro. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
