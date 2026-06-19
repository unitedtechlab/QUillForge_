import { useState, useEffect } from "react";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  User, CheckCircle2, AlertCircle
} from "lucide-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   PASSWORD STRENGTH
───────────────────────────────────────────── */
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
    { label: "",         color: "bg-retro-border/20", textColor: "text-retro-text/30" },
    { label: "Weak",     color: "bg-red-500",         textColor: "text-red-400" },
    { label: "Fair",     color: "bg-orange-400",      textColor: "text-orange-400" },
    { label: "Good",     color: "bg-yellow-400",      textColor: "text-yellow-400" },
    { label: "Strong",   color: "bg-[#E8E8C6]",       textColor: "text-retro-accent" },
    { label: "Perfect",  color: "bg-emerald-400",     textColor: "text-emerald-400" },
  ];
  return { score, level: levels[score] };
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const { score, level } = getStrength(password);

  return (
    <div className="mt-2 flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <div
          key={i}
          className={`h-1 flex-1 transition-all duration-300 ${
            i <= score ? level.color : "bg-retro-bg"
          }`}
        />
      ))}
      {level.label && (
        <span className="text-[11px] font-pixel ml-1 transition-all duration-300 ${level.textColor}">
          {level.label}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   REUSABLE RETRO COMPONENTS
───────────────────────────────────────────── */
function RetroButton({ children, variant = "primary", className = "", onClick, type = "button", disabled }) {
  const base = "aesthetic-btn select-none justify-center";
  const variants = {
    primary: "aesthetic-btn-primary",
    secondary: "aesthetic-btn-secondary",
    ghost: "border-transparent text-retro-text hover:text-retro-accent",
  };
  return (
    <button type={type} disabled={disabled} className={`${base} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function InputField({ label, type = "text", placeholder, value, onChange, error, hint, rightElement }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-pixel text-retro-accent tracking-wide uppercase">
        {label}
      </label>
      <div className={`relative flex items-center border-2 bg-[#13141f] rounded-xl transition-all duration-300 ${
        error
          ? "border-red-500/60 focus-within:border-red-400"
          : "border-retro-border focus-within:border-retro-accent focus-within:ring-2 focus-within:ring-retro-accent/20"
      }`}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-retro-text placeholder-retro-text/30 focus:outline-none font-terminal"
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-red-400 text-xs font-terminal">
          <AlertCircle size={11} />{error}
        </p>
      )}
      {hint && !error && (
        <p className="flex items-center gap-1 text-emerald-400 text-xs font-terminal">
          <CheckCircle2 size={11} />{hint}
        </p>
      )}
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]           = useState({});
  const [hints, setHints]             = useState({});
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const navigate = useNavigate();

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(er => ({ ...er, [key]: "" }));
  };

  // Inline hints
  useEffect(() => {
    const h = {};
    if (form.username.length >= 3) h.username = "Username looks good!";
    if (form.confirm && form.confirm === form.password && form.password.length >= 6)
      h.confirm = "Passwords match!";
    setHints(prev => {
      const updated = { ...prev };
      if (h.username) updated.username = h.username; else delete updated.username;
      if (h.confirm) updated.confirm = h.confirm; else delete updated.confirm;
      return updated;
    });
  }, [form.username, form.confirm, form.password]);

  // Debounced email check
  useEffect(() => {
    if (!form.email) {
      setErrors(er => ({ ...er, email: "" }));
      setHints(h => {
        const newH = { ...h };
        delete newH.email;
        return newH;
      });
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      setErrors(er => ({ ...er, email: "Enter a valid email address" }));
      setHints(h => {
        const newH = { ...h };
        delete newH.email;
        return newH;
      });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/users/validate-email?email=${encodeURIComponent(form.email)}`);
        const data = res.data.data;

        if (!data.isValid) {
          setErrors(er => ({ ...er, email: data.reason || "Invalid email format" }));
          setHints(h => {
            const newH = { ...h };
            delete newH.email;
            return newH;
          });
        } else if (!data.isGoogle) {
          setErrors(er => ({ ...er, email: "Only Google/Gmail accounts are supported" }));
          setHints(h => {
            const newH = { ...h };
            delete newH.email;
            return newH;
          });
        } else if (data.exists === false) {
          setErrors(er => ({ ...er, email: "This Google account does not exist" }));
          setHints(h => {
            const newH = { ...h };
            delete newH.email;
            return newH;
          });
        } else {
          setErrors(er => ({ ...er, email: "" }));
          setHints(h => ({ ...h, email: "Verified Google/Gmail account!" }));
        }
      } catch (err) {
        console.error("Email verification error:", err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [form.email]);

  const validate = () => {
    const e = {};
    if (!form.username)             e.username = "Username is required";
    else if (form.username.length < 3) e.username = "At least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = "Only letters, numbers & underscores";

    if (!form.email)                e.email = "Email is required";
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) e.email = "Enter a valid email";

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

    if (!termsChecked) {
      alert("Please accept the Terms of Service to register.");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const valRes = await api.get(`/users/validate-email?email=${encodeURIComponent(form.email)}`);
      const valData = valRes.data.data;

      if (!valData.isValid) {
        setErrors({ email: valData.reason || "Invalid email" });
        setLoading(false);
        return;
      }

      if (!valData.isGoogle) {
        setErrors({ email: "Only Google/Gmail accounts are allowed" });
        setLoading(false);
        return;
      }

      if (valData.exists === false) {
        setErrors({ email: "This Google email address does not exist" });
        setLoading(false);
        return;
      }

      await api.post("/users/register", {
        username: form.username,
        email: form.email,
        password: form.password
      });

      setDone(true);
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = "https://api.quillforge.unitedtechlab.com/api/v1/users/google";
  };

  return (
    <div className="min-h-screen bg-retro-bg flex flex-col items-center justify-center p-4">
      {/* Back link */}
      <button 
        onClick={() => navigate("/")} 
        className="mb-8 font-pixel text-[10px] text-retro-text/50 hover:text-retro-accent uppercase tracking-widest"
      >
        ◀ BACK TO STUDIO
      </button>

      {/* Main retro window */}
      <div className="w-full max-w-md border-2 border-retro-border bg-retro-surface rounded-2xl shadow-[6px_6px_0px_0px_#1C1D2E] overflow-hidden">
        
        {/* Title bar */}
        <div className="border-b border-retro-border bg-retro-accent px-4 py-2 flex items-center justify-between text-xs font-pixel text-[#1C1D2E]">
          <span>USER_REGISTRATION.EXE</span>
          <span className="font-bold cursor-pointer" onClick={() => navigate("/")}>X</span>
        </div>

        {/* Done State */}
        {done ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-retro-accent flex items-center justify-center text-retro-accent font-pixel text-xl mb-4 rounded-xl">
              ✔
            </div>
            <h3 className="text-2xl font-heading text-retro-accent uppercase tracking-wider mb-2">
              YOU'RE REGISTERED
            </h3>
            <p className="text-xs text-retro-text/60 font-terminal mb-6 max-w-xs leading-relaxed">
              Welcome to QuillForge, <span className="text-retro-accent">@{form.username}</span>! Check your inbox to verify your email.
            </p>
            <RetroButton variant="primary" className="w-full" onClick={() => navigate("/login")}>
              Go to Login <ArrowRight size={10} />
            </RetroButton>
          </div>
        ) : (
          /* Form Area */
          <div className="p-6 sm:p-8">
            
            <div className="text-center mb-6">
              <h2 className="text-3xl font-heading text-retro-accent uppercase tracking-widest">
                CREATE PROFILE
              </h2>
              <p className="text-xs font-pixel text-retro-text/40 mt-1">
                REGISTER AN AUTHOR IDENTITY CARD
              </p>
            </div>

            {/* Google Gateway */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-2.5 border-2 border-retro-border bg-[#13141f] text-retro-text hover:bg-[#1C1D2E] font-pixel text-xs tracking-wider uppercase rounded-xl transition-all duration-200 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_#1C1D2E]"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google Gateway</span>
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-retro-border/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-retro-surface text-retro-text/30 text-xs font-pixel uppercase tracking-widest">
                  or fill credentials
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Username"
                type="text"
                placeholder="author_handle"
                value={form.username}
                onChange={set("username")}
                error={errors.username}
                hint={hints.username}
              />

              <InputField
                label="Email address"
                type="email"
                placeholder="user@gmail.com"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
                hint={hints.email}
              />

              <div>
                <InputField
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
                  error={errors.password}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="text-retro-text/30 hover:text-retro-accent p-0.5"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                />
                <PasswordStrength password={form.password} />
              </div>

              <InputField
                label="Confirm password"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirm}
                onChange={set("confirm")}
                error={errors.confirm}
                hint={hints.confirm}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-retro-text/30 hover:text-retro-accent p-0.5"
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />

              {/* Terms checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer mt-2 select-none">
                <input
                  type="checkbox"
                  checked={termsChecked}
                  onChange={() => setTermsChecked(!termsChecked)}
                  className="accent-retro-accent w-3.5 h-3.5 mt-0.5 cursor-pointer"
                />
                <span className="text-xs font-terminal text-retro-text/40 leading-tight">
                  I agree to the <a href="#" className="text-retro-accent hover:underline">Terms of Service</a> & <a href="#" className="text-retro-accent hover:underline">Privacy Policy</a>
                </span>
              </label>

              {/* Submit Button */}
              <RetroButton
                type="submit"
                disabled={loading}
                className="w-full mt-2"
              >
                {loading ? "CREATING PROFILE..." : "REGISTER ACCOUNT"}
              </RetroButton>
            </form>

            {/* Footnotes */}
            <p className="mt-6 text-center text-xs font-pixel text-retro-text/30">
              Already have an card?{" "}
              <a href="/login" className="text-retro-accent hover:underline">
                Sign in →
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
