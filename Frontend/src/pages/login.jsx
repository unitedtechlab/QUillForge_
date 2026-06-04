import { useState, useEffect } from "react";
import {
  Feather, Mail, Lock, Eye, EyeOff, ArrowRight,
  Sparkles, Chrome, BookOpen, Heart, Eye as EyeIcon,
  Shield, Zap, Star
} from "lucide-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────
   BACKGROUND — matches landing page exactly
───────────────────────────────────────── */
function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />
      {/* Glow orbs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[100px]" />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[400px] bg-pink-600/6 rounded-full blur-[100px]" />
      {/* Noise */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   LEFT PANEL — brand showcase
───────────────────────────────────────── */
function LeftPanel({ visible }) {
  const floatingCards = [
    { emoji: "⚡", title: "Building Scalable APIs", author: "Alex Chen", views: "12.4K", likes: 891, delay: 0 },
    { emoji: "🎨", title: "Designing for Dark Mode", author: "Sara Kim", views: "9.1K", likes: 723, delay: 150 },
    { emoji: "🚀", title: "Scaling to 1M Users", author: "Mike Torres", views: "31K", likes: 2100, delay: 300 },
  ];

  return (
    <div className="hidden lg:flex flex-col justify-between h-full p-12 relative">
      {/* Logo */}
      <div
        className={`flex items-center gap-3 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
        style={{ transitionDelay: "0ms" }}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <Feather size={16} className="text-white" />
        </div>
        <span className="text-white font-black text-xl tracking-tight" style={{ fontFamily: "'Oxanium',sans-serif" }}>
          Quill<span className="text-cyan-400">.</span>
        </span>
      </div>

      {/* Headline */}
      <div className="space-y-6">
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "150ms" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-xs font-medium tracking-wide mb-5">
            <Sparkles size={10} /> 5,000+ writers trust Quill
          </div>
          <h2
            className="text-4xl xl:text-5xl font-black text-white leading-[0.95] tracking-tight"
            style={{ fontFamily: "'Oxanium',sans-serif" }}
          >
            Your ideas deserve
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
              a better stage.
            </span>
          </h2>
          <p className="mt-4 text-white/40 text-sm leading-relaxed max-w-sm" style={{ fontFamily: "'Space Mono',monospace" }}>
            Write beautifully. Reach thousands. Build the audience you deserve — all from one elegant platform.
          </p>
        </div>

        {/* Floating blog cards */}
        <div className="space-y-3">
          {floatingCards.map((card, i) => (
            <div
              key={i}
              className={`transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
              style={{ transitionDelay: `${300 + card.delay}ms` }}
            >
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:border-cyan-400/20 hover:bg-white/[0.05] transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-xl flex-shrink-0 border border-white/[0.06]">
                  {card.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs font-medium truncate group-hover:text-white transition-colors" style={{ fontFamily: "'Oxanium',sans-serif" }}>
                    {card.title}
                  </p>
                  <p className="text-white/30 text-[10px] mt-0.5">by {card.author}</p>
                </div>
                <div className="flex items-center gap-2.5 text-[10px] text-white/25 flex-shrink-0">
                  <span className="flex items-center gap-1"><EyeIcon size={9} />{card.views}</span>
                  <span className="flex items-center gap-1"><Heart size={9} />{card.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "750ms" }}
        >
          <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={11} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-white/50 text-xs leading-relaxed italic">
              "Quill replaced Medium for me completely. The editor is silky smooth and the analytics actually tell me something useful."
            </p>
            <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-white/[0.06]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">A</div>
              <div>
                <p className="text-white/70 text-xs font-semibold" style={{ fontFamily: "'Oxanium',sans-serif" }}>Aisha Patel</p>
                <p className="text-white/25 text-[10px]">Full-Stack Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom trust badges */}
      <div
        className={`flex items-center gap-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        style={{ transitionDelay: "900ms" }}
      >
        {[
          { icon: <Shield size={11} />, label: "SOC 2 Certified" },
          { icon: <Zap size={11} />, label: "99.9% Uptime" },
          { icon: <BookOpen size={11} />, label: "GDPR Ready" },
        ].map((b, i) => (
          <div key={i} className="flex items-center gap-1.5 text-white/25 text-[10px]">
            {b.icon} {b.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   INPUT FIELD
───────────────────────────────────────── */
function InputField({ label, type = "text", placeholder, value, onChange, icon, rightElement, error }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-white/50 tracking-wide uppercase" style={{ fontFamily: "'Oxanium',sans-serif" }}>
        {label}
      </label>
      <div className={`relative flex items-center rounded-xl border transition-all duration-300 ${
        error
          ? "border-red-500/40 bg-red-500/5"
          : "border-white/[0.08] bg-white/[0.04] focus-within:border-cyan-400/50 focus-within:bg-white/[0.06]"
      }`}>
        <div className="absolute left-4 text-white/25">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none"
          style={{ fontFamily: "'Space Mono',monospace" }}
        />
        {rightElement && (
          <div className="absolute right-4">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-[10px] pl-1">{error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────
   LOGIN FORM
───────────────────────────────────────── */
function LoginForm({ visible }) {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});

  const validate = () => {
    const e = {};
    if (!email)                          e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email   = "Enter a valid email";
    if (!password)                       e.password = "Password is required";
    else if (password.length < 6)       e.password = "At least 6 characters";
    return e;
  };
const navigate = useNavigate();
const handleSubmit = async (ev) => {
  ev.preventDefault();

  const e = validate();

  if (Object.keys(e).length) {
    setErrors(e);
    return;
  }

  setErrors({});

  try {

    setLoading(true);

    const res = await api.post(
      "/users/login",
      {
        email,
        password
      }
    );

    console.log(res.data);

    navigate("/dashboard");

  } catch (error) {

    console.log(error.response?.data);

    alert(
      error.response?.data?.message ||
      "Login failed"
    );

  } finally {

    setLoading(false);

  }
};

const handleGoogle = () => {
  console.log("Google button clicked");
  window.location.href =
    "http://localhost:8000/api/v1/users/google";
};;

  return (
    <div className="flex flex-col justify-center h-full px-6 sm:px-12 lg:px-16 py-12">
      {/* Mobile logo */}
      <div
        className={`flex lg:hidden items-center gap-2.5 mb-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
          <Feather size={14} className="text-white" />
        </div>
        <span className="text-white font-black text-xl" style={{ fontFamily: "'Oxanium',sans-serif" }}>
          Quill<span className="text-cyan-400">.</span>
        </span>
      </div>

      {/* Header */}
      <div
        className={`mb-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ transitionDelay: "100ms" }}
      >
        <h1
          className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight"
          style={{ fontFamily: "'Oxanium',sans-serif" }}
        >
          Welcome back
          <span className="text-cyan-400">.</span>
        </h1>
        <p className="mt-2 text-white/35 text-sm" style={{ fontFamily: "'Space Mono',monospace" }}>
          Sign in to continue writing your story.
        </p>
      </div>

      {/* Google button */}
      <div
        className={`mb-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ transitionDelay: "200ms" }}
      >
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08] text-white/70 hover:text-white text-sm font-medium transition-all duration-300 group"
        >
          {/* Google SVG */}
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Divider */}
      <div
        className={`relative mb-6 transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "280ms" }}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.06]" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-[#080b14] text-white/20 text-xs tracking-widest uppercase" style={{ fontFamily: "'Space Mono',monospace" }}>
            or sign in with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className={`space-y-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ transitionDelay: "360ms" }}
      >
        <InputField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          icon={<Mail size={15} />}
          error={errors.email}
        />

        <InputField
          label="Password"
          type={showPass ? "text" : "password"}
          placeholder="••••••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          icon={<Lock size={15} />}
          error={errors.password}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-white/25 hover:text-white/60 transition-colors p-0.5"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div
              onClick={() => setRemember(!remember)}
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-200 ${
                remember
                  ? "bg-gradient-to-br from-cyan-400 to-violet-500 border-transparent"
                  : "border-white/20 bg-white/[0.04] group-hover:border-white/30"
              }`}
            >
              {remember && (
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-white/40 text-xs hover:text-white/60 transition-colors" style={{ fontFamily: "'Space Mono',monospace" }}>
              Remember me
            </span>
          </label>
          <a href="#" className="text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors" style={{ fontFamily: "'Space Mono',monospace" }}>
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full relative flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 mt-2 overflow-hidden ${
            loading
              ? "opacity-70 cursor-not-allowed"
              : "hover:shadow-[0_0_32px_rgba(34,211,238,0.3)] hover:scale-[1.01] active:scale-[0.99]"
          }`}
          style={{
            background: "linear-gradient(135deg, #22d3ee 0%, #7c3aed 100%)",
            fontFamily: "'Oxanium',sans-serif",
          }}
        >
          {/* Shimmer */}
          {!loading && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out" />
          )}

          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Signing in...
            </>
          ) : (
            <>Sign In <ArrowRight size={15} /></>
          )}
        </button>
      </form>

      {/* Register link */}
      <p
        className={`mt-6 text-center text-xs text-white/30 transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "500ms", fontFamily: "'Space Mono',monospace" }}
      >
        Don't have an account?{" "}
        <a
          href="/register"
          className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          style={{ fontFamily: "'Oxanium',sans-serif" }}
        >
          Create one free →
        </a>
      </p>

      {/* Terms */}
      <p
        className={`mt-4 text-center text-[10px] text-white/15 leading-relaxed transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "600ms", fontFamily: "'Space Mono',monospace" }}
      >
        By signing in, you agree to our{" "}
        <a href="#" className="underline underline-offset-2 hover:text-white/30 transition-colors">Terms of Service</a>
        {" "}and{" "}
        <a href="#" className="underline underline-offset-2 hover:text-white/30 transition-colors">Privacy Policy</a>.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function Login() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen w-full relative" style={{ backgroundColor: "#080b14" }}>
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0d1220 inset !important;
          -webkit-text-fill-color: white !important;
          caret-color: white;
        }
      `}</style>

      <Background />

      {/* Top hairline gradient */}
      <div className="fixed top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent z-10" />

      {/* Main grid */}
      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px]">
        {/* ── LEFT PANEL ── */}
        <div className="relative hidden lg:block border-r border-white/[0.05]">
          {/* Vertical gradient fade on right edge */}
          <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-r from-transparent to-[#080b14]/60 z-10 pointer-events-none" />
          <LeftPanel visible={visible} />
        </div>

        {/* ── RIGHT PANEL (form) ── */}
        <div className="relative flex flex-col">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-violet-500/[0.03] pointer-events-none" />
          <LoginForm visible={visible} />
        </div>
      </div>

      {/* Bottom hairline */}
      <div className="fixed bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent z-10" />
    </div>
  );
}
