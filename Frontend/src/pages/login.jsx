import { useState, useEffect } from "react";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  Shield, CheckCircle2, AlertCircle, Feather
} from "lucide-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   REUSABLE RETRO COMPONENTS
───────────────────────────────────────────── */
function RetroButton({ children, variant = "primary", className = "", onClick, type = "button", disabled }) {
  const base = "inline-flex items-center justify-center gap-2 px-5 py-2.5 font-pixel text-sm tracking-wider uppercase border-2 transition-all duration-200 cursor-pointer select-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#E8E8C6] text-[#252525] border-[#E8E8C6] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#E2E2D5]",
    secondary: "bg-transparent text-[#E8E8C6] border-[#E8E8C6] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#E8E8C6]/10",
    ghost: "border-transparent text-[#E2E2D5]/70 hover:text-[#E8E8C6]",
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
      <div className={`relative flex items-center border-2 bg-retro-bg transition-colors duration-300 ${
        error
          ? "border-red-500/60 focus-within:border-red-400"
          : "border-retro-border focus-within:border-retro-accent"
      }`}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-retro-text placeholder-retro-text/20 focus:outline-none font-terminal"
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

export default function Login() {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [hints, setHints]         = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email)                          e.email    = "Email is required";
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) e.email   = "Enter a valid email";
    if (!password)                       e.password = "Password is required";
    else if (password.length < 6)       e.password = "At least 6 characters";
    return e;
  };

  // Debounced email check
  useEffect(() => {
    if (!email) {
      setErrors(er => ({ ...er, email: "" }));
      setHints(h => {
        const newH = { ...h };
        delete newH.email;
        return newH;
      });
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
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
        const res = await api.get(`/users/validate-email?email=${encodeURIComponent(email)}`);
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
  }, [email]);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const valRes = await api.get(`/users/validate-email?email=${encodeURIComponent(email)}`);
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

      const res = await api.post("/users/login", { email, password });

      if (res.data.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = "https://api.quillforge.unitedtechlab.com/api/v1/users/google";
  };

  return (
    <div className="min-h-screen bg-retro-bg flex flex-col items-center justify-center p-4">
      {/* Back to Home link */}
      <button 
        onClick={() => navigate("/")} 
        className="mb-8 font-pixel text-xs text-retro-text/50 hover:text-retro-accent uppercase tracking-widest"
      >
        ◀ BACK TO STUDIO
      </button>

      {/* Main retro window */}
      <div className="w-full max-w-md border-4 border-retro-accent bg-retro-surface shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Title bar */}
        <div className="border-b-2 border-retro-accent bg-[#E8E8C6] px-4 py-2 flex items-center justify-between text-xs font-pixel text-[#252525]">
          <span>USER_LOGIN.EXE</span>
          <span className="font-bold cursor-pointer" onClick={() => navigate("/")}>X</span>
        </div>

        {/* Form area */}
        <div className="p-6 sm:p-8">
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-heading text-retro-accent uppercase tracking-widest">
              SIGN IN
            </h2>
            <p className="text-xs font-pixel text-retro-text/40 mt-1">
              CONNECT TO THE PUBLISHING GATEWAY
            </p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-2.5 border-2 border-retro-accent bg-retro-bg text-retro-text hover:bg-retro-accent/10 font-pixel text-xs tracking-wider uppercase active:translate-x-[1px] active:translate-y-[1px]"
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
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-retro-border/40" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-retro-surface text-retro-text/30 text-xs font-pixel uppercase tracking-widest">
                or sign in with password
              </span>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email address"
              type="email"
              placeholder="user@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              hint={hints.email}
            />

            <InputField
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
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

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="accent-retro-accent w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-xs font-pixel text-retro-text/40">
                  Remember me
                </span>
              </label>
              <a href="#" className="text-xs font-pixel text-retro-accent/70 hover:text-retro-accent">
                Forgot pass?
              </a>
            </div>

            {/* Submit Button */}
            <RetroButton
              type="submit"
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? "AUTHENTICATING..." : "SUBMIT CREDENTIALS"}
            </RetroButton>
          </form>

          {/* Footnotes */}
          <p className="mt-6 text-center text-xs font-pixel text-retro-text/30">
            Need an account?{" "}
            <a href="/register" className="text-retro-accent hover:underline">
              Create card →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
