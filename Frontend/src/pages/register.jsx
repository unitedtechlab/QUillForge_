import { useState, useEffect } from "react";
import {
  Feather, Mail, Lock, Eye, EyeOff, ArrowRight,
  User, Check, X, Sparkles, Star, Zap, Shield,
  BookOpen, Heart, Eye as EyeIcon, TrendingUp,
  CheckCircle2, AlertCircle
} from "lucide-react";
import api from "../api/axios";

/* ─────────────────────────────────────────
   BACKGROUND
───────────────────────────────────────── */
function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
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
      <div className="absolute -top-40 right-0 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[130px]" />
      <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[110px]" />
      <div className="absolute -bottom-40 right-1/3 w-[600px] h-[400px] bg-pink-600/6 rounded-full blur-[110px]" />
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
   PASSWORD STRENGTH
───────────────────────────────────────── */
function getStrength(pw) {
  let score = 0;
  const checks = {
    length:   pw.length >= 8,
    upper:    /[A-Z]/.test(pw),
    lower:    /[a-z]/.test(pw),
    number:   /[0-9]/.test(pw),
    special:  /[^A-Za-z0-9]/.test(pw),
  };
  Object.values(checks).forEach(v => v && score++);
  const levels = [
    { label: "",         color: "bg-white/10",       textColor: "text-white/20",   bars: 0 },
    { label: "Weak",     color: "bg-red-500",         textColor: "text-red-400",    bars: 1 },
    { label: "Fair",     color: "bg-orange-400",      textColor: "text-orange-400", bars: 2 },
    { label: "Good",     color: "bg-yellow-400",      textColor: "text-yellow-400", bars: 3 },
    { label: "Strong",   color: "bg-cyan-400",        textColor: "text-cyan-400",   bars: 4 },
    { label: "Perfect",  color: "bg-emerald-400",     textColor: "text-emerald-400",bars: 5 },
  ];
  return { score, level: levels[score], checks };
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const { score, level, checks } = getStrength(password);
  const rules = [
    { key: "length",  label: "At least 8 characters" },
    { key: "upper",   label: "One uppercase letter" },
    { key: "lower",   label: "One lowercase letter" },
    { key: "number",  label: "One number" },
    { key: "special", label: "One special character" },
  ];

  return (
    <div className="mt-2.5 space-y-2.5">
      {/* Bars */}
      <div className="flex items-center gap-1.5">
        {[1,2,3,4,5].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-400 ${
              i <= score ? level.color : "bg-white/[0.06]"
            }`}
          />
        ))}
        {level.label && (
          <span className={`text-[10px] font-semibold ml-1 transition-all duration-300 ${level.textColor}`}
            style={{ fontFamily: "'Oxanium',sans-serif" }}>
            {level.label}
          </span>
        )}
      </div>
      {/* Rule checklist */}
      <div className="grid grid-cols-2 gap-1">
        {rules.map(r => (
          <div key={r.key} className={`flex items-center gap-1.5 text-[10px] transition-all duration-200 ${checks[r.key] ? "text-emerald-400" : "text-white/20"}`}>
            {checks[r.key]
              ? <CheckCircle2 size={9} className="flex-shrink-0" />
              : <div className="w-2 h-2 rounded-full border border-white/15 flex-shrink-0" />
            }
            {r.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   INPUT FIELD
───────────────────────────────────────── */
function InputField({ label, type = "text", placeholder, value, onChange, icon, rightElement, error, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-white/40 tracking-widest uppercase"
        style={{ fontFamily: "'Oxanium',sans-serif" }}>
        {label}
      </label>
      <div className={`relative flex items-center rounded-xl border transition-all duration-300 ${
        error
          ? "border-red-500/40 bg-red-500/[0.04] focus-within:border-red-400/60"
          : hint
          ? "border-emerald-500/40 bg-emerald-500/[0.03] focus-within:border-emerald-400/50"
          : "border-white/[0.07] bg-white/[0.03] focus-within:border-cyan-400/50 focus-within:bg-white/[0.05]"
      }`}>
        <div className={`absolute left-4 transition-colors duration-300 ${
          error ? "text-red-400/60" : hint ? "text-emerald-400/60" : "text-white/20"
        }`}>
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/15 focus:outline-none"
          style={{ fontFamily: "'Space Mono',monospace" }}
        />
        {rightElement && (
          <div className="absolute right-4">{rightElement}</div>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-red-400 text-[10px] pl-0.5">
          <AlertCircle size={9} />{error}
        </p>
      )}
      {hint && !error && (
        <p className="flex items-center gap-1.5 text-emerald-400 text-[10px] pl-0.5">
          <CheckCircle2 size={9} />{hint}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   RIGHT PANEL — brand showcase
───────────────────────────────────────── */
function RightPanel({ visible }) {
  const stats = [
    { icon: <EyeIcon size={13}/>, label: "Monthly reads", value: "2.4M+", color: "text-cyan-400" },
    { icon: <Heart size={13}/>,   label: "Likes given",   value: "890K+", color: "text-pink-400" },
    { icon: <TrendingUp size={13}/>, label: "Blogs published", value: "48K+", color: "text-violet-400" },
  ];

  const perks = [
    { icon: <Zap size={13}/>,      label: "Distraction-free editor",         color: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/20" },
    { icon: <TrendingUp size={13}/>,label: "Real-time analytics dashboard",   color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20" },
    { icon: <Shield size={13}/>,   label: "Role-based access control",       color: "text-pink-400",    bg: "bg-pink-400/10",    border: "border-pink-400/20" },
    { icon: <BookOpen size={13}/>, label: "SEO & custom domain support",     color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  ];

  return (
    <div className="hidden lg:flex flex-col justify-between h-full p-12 relative">
      {/* Top logo */}
      <div
        className={`flex items-center gap-3 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
        style={{ transitionDelay: "0ms" }}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Feather size={16} className="text-white" />
        </div>
        <span className="text-white font-black text-xl tracking-tight" style={{ fontFamily: "'Oxanium',sans-serif" }}>
          Quill<span className="text-cyan-400">.</span>
        </span>
      </div>

      {/* Middle — headline + perks */}
      <div className="space-y-8">
        {/* Headline */}
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "150ms" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 text-violet-300 text-xs font-medium tracking-wide mb-5">
            <Sparkles size={10} /> Free forever · No credit card
          </div>
          <h2
            className="text-4xl xl:text-5xl font-black text-white leading-[0.95] tracking-tight"
            style={{ fontFamily: "'Oxanium',sans-serif" }}
          >
            Join a community
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
              of real writers.
            </span>
          </h2>
          <p className="mt-4 text-white/35 text-sm leading-relaxed max-w-xs" style={{ fontFamily: "'Space Mono',monospace" }}>
            5,000+ developers, designers and thinkers already publish on Quill. Your turn.
          </p>
        </div>

        {/* Platform stats */}
        <div
          className={`grid grid-cols-3 gap-3 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "300ms" }}
        >
          {stats.map((s, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.03] text-center">
              <div className={`flex justify-center mb-1.5 ${s.color}`}>{s.icon}</div>
              <div className={`font-black text-lg leading-none ${s.color}`} style={{ fontFamily: "'Oxanium',sans-serif" }}>{s.value}</div>
              <div className="text-white/25 text-[9px] mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Perks list */}
        <div className="space-y-2.5">
          {perks.map((p, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
              style={{ transitionDelay: `${420 + i * 90}ms` }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${p.bg} border ${p.border} ${p.color} flex-shrink-0`}>
                {p.icon}
              </div>
              <span className="text-white/50 text-xs" style={{ fontFamily: "'Space Mono',monospace" }}>
                {p.label}
              </span>
              <Check size={11} className={`ml-auto flex-shrink-0 ${p.color}`} />
            </div>
          ))}
        </div>

        {/* Social proof avatars */}
        <div
          className={`flex items-center gap-3 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "800ms" }}
        >
          <div className="flex -space-x-2.5">
            {[
              "from-cyan-400 to-blue-500",
              "from-violet-400 to-pink-500",
              "from-emerald-400 to-cyan-500",
              "from-orange-400 to-pink-500",
              "from-pink-400 to-rose-500",
            ].map((g, i) => (
              <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-[#080b14] flex items-center justify-center text-[10px] font-bold text-white`}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div>
            <div className="flex gap-0.5 mb-0.5">
              {[1,2,3,4,5].map(s => <Star key={s} size={9} className="text-amber-400 fill-amber-400"/>)}
            </div>
            <p className="text-white/25 text-[10px]" style={{ fontFamily: "'Space Mono',monospace" }}>
              Loved by 5,000+ writers
            </p>
          </div>
        </div>
      </div>

      {/* Bottom trust */}
      <div
        className={`flex items-center gap-5 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        style={{ transitionDelay: "950ms" }}
      >
        {[
          { icon: <Shield size={10} />, label: "SOC 2 Certified" },
          { icon: <Zap size={10} />,    label: "99.9% Uptime" },
          { icon: <BookOpen size={10} />, label: "GDPR Ready" },
        ].map((b, i) => (
          <div key={i} className="flex items-center gap-1.5 text-white/20 text-[10px]">
            {b.icon} {b.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   REGISTER FORM
───────────────────────────────────────── */
function RegisterForm({ visible }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]           = useState({});
  const [hints, setHints]             = useState({});
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(er => ({ ...er, [key]: "" }));
  };

  // Inline hints
  useEffect(() => {
    const h = {};
    if (form.username.length >= 3) h.username = "Username looks good!";
    if (form.email && /\S+@\S+\.\S+/.test(form.email)) h.email = "Valid email address";
    if (form.confirm && form.confirm === form.password && form.password.length >= 6)
      h.confirm = "Passwords match!";
    setHints(h);
  }, [form]);

  const validate = () => {
    const e = {};
    if (!form.username)             e.username = "Username is required";
    else if (form.username.length < 3) e.username = "At least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = "Only letters, numbers & underscores";

    if (!form.email)                e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";

    if (!form.password)             e.password = "Password is required";
    else if (getStrength(form.password).score < 2) e.password = "Password is too weak";

    if (!form.confirm)              e.confirm = "Please confirm your password";
    else if (form.confirm !== form.password) e.confirm = "Passwords do not match";

    return e;
  };

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
      "/users/register",
      {
        username: form.username,
        email: form.email,
        password: form.password
      }
    );

    console.log(res.data);

    setDone(true);

  } 
catch (error) {

  console.log("FULL ERROR:", error);

  console.log("RESPONSE:", error.response);

  alert(
    error.response?.data?.message ||
    error.message ||
    "Registration failed"
  );

}
};
const handleGoogle = () => {
  window.location.href =
    "http://localhost:8000/api/v1/users/google";
};

  /* ── Success state ── */
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 sm:px-12 lg:px-16 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/30 animate-bounce">
          <CheckCircle2 size={28} className="text-white" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: "'Oxanium',sans-serif" }}>
          You're in<span className="text-cyan-400">.</span>
        </h2>
        <p className="text-white/40 text-sm max-w-xs leading-relaxed mb-8" style={{ fontFamily: "'Space Mono',monospace" }}>
          Welcome to Quill, <span className="text-white/70">@{form.username}</span>! Check your inbox to verify your email.
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 hover:shadow-[0_0_28px_rgba(34,211,238,0.3)] hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg,#22d3ee 0%,#7c3aed 100%)", fontFamily: "'Oxanium',sans-serif" }}
        >
          Go to Login <ArrowRight size={15}/>
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center h-full px-6 sm:px-12 lg:px-16 py-10 overflow-y-auto">

      {/* Mobile logo */}
      <div
        className={`flex lg:hidden items-center gap-2.5 mb-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
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
        className={`mb-7 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ transitionDelay: "100ms" }}
      >
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight"
          style={{ fontFamily: "'Oxanium',sans-serif" }}>
          Create your account<span className="text-cyan-400">.</span>
        </h1>
        <p className="mt-2 text-white/30 text-sm" style={{ fontFamily: "'Space Mono',monospace" }}>
          Free forever. No credit card required.
        </p>
      </div>

      {/* Google */}
      <div
        className={`mb-5 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ transitionDelay: "180ms" }}
      >
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-medium transition-all duration-300"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      {/* Divider */}
      <div
        className={`relative mb-5 transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "260ms" }}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.06]" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-[#080b14] text-white/20 text-xs tracking-widest uppercase"
            style={{ fontFamily: "'Space Mono',monospace" }}>
            or fill in your details
          </span>
        </div>
      </div>

      {/* Form fields */}
      <form
        onSubmit={handleSubmit}
        className={`space-y-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ transitionDelay: "340ms" }}
      >

        {/* Username */}
        <InputField
          label="Username"
          type="text"
          placeholder="your_handle"
          value={form.username}
          onChange={set("username")}
          icon={<User size={15} />}
          error={errors.username}
          hint={hints.username}
        />

        {/* Email */}
        <InputField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set("email")}
          icon={<Mail size={15} />}
          error={errors.email}
          hint={hints.email}
        />

        {/* Password */}
        <div>
          <InputField
            label="Password"
            type={showPass ? "text" : "password"}
            placeholder="Create a strong password"
            value={form.password}
            onChange={set("password")}
            icon={<Lock size={15} />}
            error={errors.password}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-white/20 hover:text-white/50 transition-colors p-0.5"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          <PasswordStrength password={form.password} />
        </div>

        {/* Confirm Password */}
        <InputField
          label="Confirm password"
          type={showConfirm ? "text" : "password"}
          placeholder="Repeat your password"
          value={form.confirm}
          onChange={set("confirm")}
          icon={<Lock size={15} />}
          error={errors.confirm}
          hint={hints.confirm}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-white/20 hover:text-white/50 transition-colors p-0.5"
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        {/* Terms checkbox */}
        <TermsCheckbox />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full relative flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 mt-1 overflow-hidden ${
            loading
              ? "opacity-70 cursor-not-allowed"
              : "hover:shadow-[0_0_32px_rgba(34,211,238,0.28)] hover:scale-[1.01] active:scale-[0.99]"
          }`}
          style={{
            background: "linear-gradient(135deg, #22d3ee 0%, #7c3aed 100%)",
            fontFamily: "'Oxanium',sans-serif",
          }}
        >
          {!loading && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
          )}
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Creating your account...
            </>
          ) : (
            <>Create Account <ArrowRight size={15}/></>
          )}
        </button>
      </form>

      {/* Login link */}
      <p
        className={`mt-5 text-center text-xs text-white/25 transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "500ms", fontFamily: "'Space Mono',monospace" }}
      >
        Already have an account?{" "}
        <a href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          style={{ fontFamily: "'Oxanium',sans-serif" }}>
          Sign in →
        </a>
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────
   TERMS CHECKBOX
───────────────────────────────────────── */
function TermsCheckbox() {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex items-start gap-3 cursor-pointer group mt-1">
      <div
        onClick={() => setChecked(!checked)}
        className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border transition-all duration-200 flex-shrink-0 ${
          checked
            ? "bg-gradient-to-br from-cyan-400 to-violet-500 border-transparent"
            : "border-white/20 bg-white/[0.04] group-hover:border-white/30"
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className="text-white/30 text-[11px] leading-relaxed" style={{ fontFamily: "'Space Mono',monospace" }}>
        I agree to the{" "}
        <a href="#" className="text-cyan-400/70 hover:text-cyan-400 underline underline-offset-2 transition-colors">Terms of Service</a>
        {" "}and{" "}
        <a href="#" className="text-cyan-400/70 hover:text-cyan-400 underline underline-offset-2 transition-colors">Privacy Policy</a>
      </span>
    </label>
  );
}

/* ─────────────────────────────────────────
   PAGE ROOT
───────────────────────────────────────── */
export default function Register() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen w-full relative" style={{ backgroundColor: "#080b14" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0d1220 inset !important;
          -webkit-text-fill-color: white !important;
          caret-color: white;
        }
        @keyframes shimmer {
          from { transform: translateX(-100%) }
          to   { transform: translateX(200%)  }
        }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
      `}</style>

      <Background />

      {/* Top hairline */}
      <div className="fixed top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent z-10" />

      {/* Layout — form LEFT, brand RIGHT (flipped vs Login) */}
      <div className="relative z-10 min-h-screen grid lg:grid-cols-[480px_1fr] xl:grid-cols-[520px_1fr]">

        {/* ── LEFT — Form ── */}
        <div className="relative flex flex-col border-r border-white/[0.05]">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-cyan-500/[0.02] pointer-events-none" />
          <RegisterForm visible={visible} />
        </div>

        {/* ── RIGHT — Brand ── */}
        <div className="relative hidden lg:block">
          <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-l from-transparent to-[#080b14]/50 z-10 pointer-events-none" />
          <RightPanel visible={visible} />
        </div>
      </div>

      {/* Bottom hairline */}
      <div className="fixed bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent z-10" />
    </div>
  );
}
