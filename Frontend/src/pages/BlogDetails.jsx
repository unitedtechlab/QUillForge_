import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Eye, Heart, Share2, ArrowLeft, Clock, Calendar, 
  User, Check, Copy, ChevronRight, BookOpen, AlertCircle,
  Volume2, Pause, Square, Maximize2, Minimize2
} from "lucide-react";
import DOMPurify from "dompurify";
import api from "../api/axios";

/* ─────────────────────────────────────────────
   DESIGN CONSTANTS & SUB-COMPONENTS
   ───────────────────────────────────────────── */

function RetroCard({ children, className = "" }) {
  return (
    <div className={`
      border-2 border-retro-border bg-retro-surface p-5 rounded-2xl
      shadow-[4px_4px_0px_0px_#1C1D2E]
      ${className}
    `}>
      {children}
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-retro-accent text-retro-accent bg-[#13141f] text-xs font-pixel uppercase tracking-wider rounded-xl">
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────
   BACKGROUND ACCENTS
   ───────────────────────────────────────────── */
function Background() {
  return null; // Global background is handled in index.css body style
}

/* ─────────────────────────────────────────────
   LOADING SKELETON
   ───────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 space-y-8 animate-pulse relative z-10 font-terminal">
      <div className="space-y-4">
        <div className="h-6 w-24 bg-retro-border/20 rounded" />
        <div className="h-12 w-3/4 bg-retro-border/20 rounded" />
        <div className="flex items-center gap-4 pt-2">
          <div className="w-10 h-10 bg-retro-border/20 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-retro-border/20 rounded" />
            <div className="h-3 w-24 bg-retro-border/20 rounded" />
          </div>
        </div>
      </div>
      
      <div className="h-[400px] w-full bg-retro-surface border-2 border-retro-border rounded-2xl" />

      <div className="space-y-6 max-w-3xl mx-auto pt-6">
        <div className="h-4 w-full bg-retro-border/20 rounded" />
        <div className="h-4 w-full bg-retro-border/20 rounded" />
        <div className="h-4 w-5/6 bg-retro-border/20 rounded" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
export default function BlogDetails() {
  const { id } = useParams();

  console.log("Current Blog ID:", id);
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  // Local interaction state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  // Focus Mode & Audio Narrator (TTS) States
  const [focusMode, setFocusMode] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [synth, setSynth] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setFocusMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakContent = () => {
    if (!synth || !blog) return;

    if (isPausedAudio) {
      synth.resume();
      setIsPausedAudio(false);
      setIsPlayingAudio(true);
      return;
    }

    if (isPlayingAudio) {
      synth.pause();
      setIsPausedAudio(true);
      setIsPlayingAudio(false);
      return;
    }

    // Strip HTML tags for clean reading text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = blog.content || "";
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    
    const textToRead = `${blog.title}. Written by ${blog.author?.username || "Anonymous"}. ${plainText}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    synth.cancel();
    synth.speak(utterance);
    setIsPlayingAudio(true);
  };

  const stopSpeech = () => {
    if (!synth) return;
    synth.cancel();
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
  };

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(false);
      console.log("fetchBlog started for ID:", id);

      try {
        const [blogRes, userRes] = await Promise.allSettled([
          api.get(`/blogs/${id}`),
          api.get("/users/current-user")
        ]);

        if (blogRes.status === "fulfilled") {
          const blogData = blogRes.value.data.data;
          setBlog(blogData);
          const likesArr = blogData.likes || [];
          setLikeCount(likesArr.length);

          if (userRes.status === "fulfilled") {
            const user = userRes.value.data.data;
            setCurrentUser(user);
            const isLiked = likesArr.some(uid => {
              const idStr = (uid && typeof uid === "object" && uid._id) ? uid._id.toString() : (uid ? uid.toString() : "");
              return idStr === user._id.toString();
            });
            setLiked(isLiked);
          }

          // Fetch related blogs from backend list
          try {
            const listRes = await api.get("/blogs");
            const allBlogs = listRes.data?.data || [];
            
            // Filter out current blog and keep published only
            const filtered = allBlogs
              .filter(b => b._id !== blogData._id)
              .filter(b => b.isPublished);
            
            const categoryMatch = filtered.filter(b => b.category === blogData.category);
            const remaining = filtered.filter(b => b.category !== blogData.category);
            
            const related = [...categoryMatch, ...remaining].slice(0, 3);
            setRelatedBlogs(related);
          } catch (err) {
            console.error("Error fetching related blogs:", err);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("fetchBlog caught error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
    // Increment view count
    api.patch(`/blogs/${id}/view`).catch(() => {});
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = async () => {
    if (!currentUser) return;
    if (likeLoading) return;
    setLikeLoading(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    try {
      const res = await api.patch(`/blogs/${id}/like`);
      setLikeCount(res.data.data.likes);
      setLiked(res.data.data.liked);
    } catch (err) {
      console.error("Like failed:", err);
      setLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-retro-bg text-retro-text relative overflow-hidden">
        <Background />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-retro-bg text-retro-text flex flex-col items-center justify-center relative p-6">
        <Background />
        <RetroCard className="max-w-md w-full p-8 text-center border-red-500 bg-retro-surface relative z-10 shadow-[4px_4px_0px_0px_#1C1D2E] rounded-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-black mb-2 uppercase text-retro-accent font-heading">DOCUMENT NOT FOUND</h2>
          <p className="text-retro-text/40 mb-6 text-sm font-terminal uppercase">
            The document you are looking for might have been archived or deleted.
          </p>
          <button 
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-retro-border bg-retro-accent text-[#1C1D2E] text-xs font-pixel rounded-xl uppercase tracking-widest hover:bg-retro-accent/80 transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px]"
          >
            <ArrowLeft size={14} /> RETURN TO TERMINAL
          </button>
        </RetroCard>
      </div>
    );
  }

  const coverImage = blog.featuredImage || blog.coverImage;

  const readTime = Math.max(
    1,
    Math.ceil(
      String(blog.content || "")
        .replace(/<[^>]*>/g, "")
        .split(/\s+/).length / 200
    )
  );

  return (
    <div className={`min-h-screen relative selection:bg-retro-accent/30 transition-colors duration-300 ${focusMode ? "blog-focus-mode bg-retro-surface" : "bg-retro-bg text-retro-text"}`}>
      {/* Scroll Progress Indicator */}
      <div 
        className="fixed top-0 left-0 h-1.5 bg-retro-accent z-50 transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      <style>{`
        .blog-focus-mode {
          background-color: #171825 !important;
          color: #E2E2F5 !important;
        }
        .blog-focus-mode .blog-content p {
          color: #E2E2F5 !important;
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.15rem !important;
          line-height: 1.85;
          max-width: 760px;
          margin-left: auto;
          margin-right: auto;
        }
        .blog-focus-mode .blog-content h1,
        .blog-focus-mode .blog-content h2,
        .blog-focus-mode .blog-content h3 {
          color: #8F72FF !important;
        }

        .blog-content h1, .blog-content h2, .blog-content h3 {
          color: #8F72FF;
          margin-top: 1.8em;
          margin-bottom: 0.6em;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .blog-content h1 { font-size: 2.5rem; line-height: 1.2; }
        .blog-content h2 { font-size: 2rem; line-height: 1.3; }
        .blog-content h3 { font-size: 1.5rem; line-height: 1.4; }
        
        .blog-content p {
          color: #E2E2F5;
          margin-bottom: 1.6em;
          line-height: 1.8;
          font-size: 1.1rem;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .blog-content blockquote {
          border-left: 4px solid #8F72FF;
          background: rgba(143, 114, 255, 0.05);
          padding: 1.25rem 1.75rem;
          margin: 2rem 0;
          font-style: italic;
          color: #8F72FF;
          font-family: 'JetBrains Mono', monospace;
          border-radius: 0 12px 12px 0;
        }
        
        .blog-content pre {
          background: #13141f;
          border: 2px solid #1C1D2E;
          padding: 1.25rem;
          overflow-x: auto;
          margin: 2rem 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          color: #E2E2F5;
          border-radius: 12px;
        }
        
        .blog-content code {
          background: #13141f;
          border: 1px solid #1C1D2E;
          padding: 0.2rem 0.45rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
          color: #8F72FF;
          border-radius: 6px;
        }
        
        .blog-content pre code {
          background: transparent;
          border: none;
          padding: 0;
        }
        
        .blog-content ul, .blog-content ol {
          margin-bottom: 1.6em;
          padding-left: 1.75rem;
          color: #E2E2F5;
          line-height: 1.8;
          font-size: 1.1rem;
          font-family: 'JetBrains Mono', monospace;
        }
        .blog-content ul { list-style-type: square; }
        .blog-content ol { list-style-type: decimal; }
        .blog-content li { margin-bottom: 0.6em; }
      `}</style>

      {!focusMode && <Background />}

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Navigation & Header Actions */}
        <div className="flex justify-between items-center mb-8" style={focusMode ? { display: "none" } : {}}>
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-retro-border hover:text-retro-accent transition-colors py-2 font-pixel text-xs cursor-pointer bg-retro-surface px-4 py-2 border border-retro-border rounded-xl shadow-[2px_2px_0px_#1C1D2E]"
          >
            <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
            <span>BACK TO DESK</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12">
          
          {/* Main Column */}
          <article className="min-w-0">
            {/* Focus Mode Banner */}
            {focusMode && (
              <div className="flex items-center justify-between px-6 py-3.5 mb-8 border-2 border-retro-accent bg-retro-surface rounded-2xl text-xs text-retro-text/50 font-terminal">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-retro-accent animate-pulse rounded-full" />
                  <span>DISTRACTION-FREE READ MODE ACTIVE.</span>
                </div>
                <button 
                  onClick={() => setFocusMode(false)}
                  className="px-3 py-1 border border-retro-border rounded-xl bg-[#13141f] hover:text-retro-accent hover:border-retro-accent transition-all cursor-pointer font-pixel"
                >
                  EXIT MODE (ESC)
                </button>
              </div>
            )}

            <RetroCard className="p-6 sm:p-10 space-y-6">
              {/* Category badge */}
              <div className="mb-4" style={focusMode ? { display: "none" } : {}}>
                <Badge>
                  {blog.category || "General"}
                </Badge>
              </div>

              {/* Blog Title */}
              <h1 
                className={`font-black tracking-tight leading-[1.1] mb-6 transition-all duration-300 uppercase font-heading ${focusMode ? 'text-3xl sm:text-4xl text-center text-retro-accent border-b-2 border-retro-border pb-6' : 'text-4xl sm:text-5xl md:text-6xl text-retro-accent'}`}
              >
                {blog.title}
              </h1>

              {/* Author / Date / Stats Meta row */}
              <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-retro-border/20 mb-8" style={focusMode ? { display: "none" } : {}}>
                <div className="flex items-center gap-3">
                  {/* Author Avatar */}
                  <div className="w-10 h-10 border border-retro-border bg-[#13141f] rounded-xl flex items-center justify-center text-sm font-black text-retro-accent shadow-[2px_2px_0px_#1C1D2E]">
                    {blog.author?.username?.slice(0, 2).toUpperCase() || <User size={14} />}
                  </div>
                  <div>
                    <p className="text-base font-bold text-retro-accent uppercase font-heading">
                      {blog.author?.username || "Anonymous Author"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-retro-text/30 uppercase font-terminal">
                      <Calendar size={12} />
                      <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "June 2026"}</span>
                      <span>•</span>
                      <Clock size={12} />
                      <span>{readTime} MIN READ</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-retro-text/30 font-terminal uppercase">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 border border-retro-border rounded-xl bg-[#13141f]">
                    <Eye size={13} className="text-retro-accent" />
                    <span>{blog.views >= 1000 ? `${(blog.views / 1000).toFixed(1)}k` : blog.views || 0} VIEWS</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 border border-retro-border rounded-xl bg-[#13141f]">
                    <Heart size={13} className="text-orange-400" />
                    <span>{likeCount} LIKES</span>
                  </span>
                </div>
              </div>

              {/* Dynamic Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start mt-6 mb-12">
                {/* Content Column */}
                <div className="blog-content min-w-0 order-2 lg:order-1 max-w-[800px] w-full">
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content || "") }} />
                </div>

                {/* Image Column */}
                {coverImage && (
                  <div className="order-1 lg:order-2 w-full lg:sticky lg:top-28" style={focusMode ? { display: "none" } : {}}>
                    <div className="relative w-full border border-retro-border bg-[#13141f] rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#1C1D2E]">
                      <img 
                        src={coverImage} 
                        alt={blog.title} 
                        className="w-full h-auto max-h-[500px] object-contain mx-auto block"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Engagement buttons bottom */}
              <div className="flex items-center justify-center gap-4 py-8 border-y border-retro-border/20 my-12 max-w-[800px] mx-auto" style={focusMode ? { display: "none" } : {}}>
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-6 py-3 border-2 text-sm font-pixel rounded-xl uppercase tracking-widest transition-all cursor-pointer shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px] ${
                    liked 
                      ? "border-orange-400 bg-orange-400 text-[#1C1D2E]" 
                      : "border-retro-border bg-[#13141f] text-retro-text/75 hover:border-retro-accent hover:text-retro-accent"
                  }`}
                >
                  <Heart size={14} className={liked ? "fill-[#1C1D2E]" : ""} />
                  <span>{liked ? "LIKED" : "LIKE"}</span>
                </button>

                <button 
                  onClick={handleCopyUrl}
                  className={`flex items-center gap-2 px-6 py-3 border-2 text-sm font-pixel rounded-xl uppercase tracking-widest transition-all cursor-pointer shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px] ${
                    copied 
                      ? "border-emerald-400 bg-[#13141f] text-emerald-400" 
                      : "border-retro-border bg-[#13141f] text-retro-text/75 hover:border-retro-accent hover:text-retro-accent"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Share2 size={14} />}
                  <span>{copied ? "COPIED" : "SHARE"}</span>
                </button>
              </div>

              {/* Author Bio Card */}
              <div className="max-w-[800px] mx-auto mt-12 mb-16" style={focusMode ? { display: "none" } : {}}>
                <h3 className="text-xs font-bold text-retro-text/30 uppercase tracking-widest mb-4 font-terminal">
                  WRITTEN BY
                </h3>
                <div className="flex flex-col sm:flex-row gap-6 items-start p-5 bg-[#13141f] border border-retro-border rounded-2xl shadow-[2px_2px_0px_#1C1D2E]">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border border-retro-border bg-retro-surface rounded-2xl flex items-center justify-center text-2xl font-black text-retro-accent flex-shrink-0">
                    {blog.author?.username?.slice(0, 2).toUpperCase() || <User size={24} />}
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="text-2xl font-bold text-retro-accent uppercase font-heading">
                        {blog.author?.username || "Anonymous Author"}
                      </h4>
                      <span className="text-[10px] text-retro-accent font-bold uppercase tracking-wider bg-retro-surface px-2.5 py-0.5 border border-retro-accent rounded-lg">
                        {blog.author?.role || "Publisher"}
                      </span>
                    </div>
                    <p className="text-xs text-retro-text/50 font-terminal uppercase leading-relaxed">
                      Author on QuillForge
                    </p>
                    <div className="flex items-center gap-2 text-xs text-retro-text/30 font-terminal uppercase">
                      <BookOpen size={12} className="text-retro-accent" />
                      <span>QuillForge Contributor</span>
                    </div>
                  </div>
                </div>
              </div>
            </RetroCard>

          </article>

          {/* Sticky Side Share Actions (Desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-28 flex flex-col gap-3 p-2.5 border-2 border-retro-border bg-retro-surface rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E]">
              {/* Audio Narrator */}
              <button 
                onClick={speakContent}
                title={isPlayingAudio ? "Pause Narrator" : "Listen to Article"}
                className={`w-11 h-11 border-2 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                  isPlayingAudio 
                    ? "border-retro-accent bg-[#13141f] text-retro-accent" 
                    : "border-transparent text-retro-text/40 hover:text-retro-accent hover:border-retro-border hover:bg-[#13141f]"
                }`}
              >
                {isPlayingAudio ? <Pause size={18} /> : <Volume2 size={18} />}
                <div className="absolute right-full mr-3 px-2 py-1 bg-[#13141f] border border-retro-border text-[10px] text-retro-text whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 uppercase font-terminal rounded-lg">
                  {isPlayingAudio ? "Pause listening" : "Listen to article"}
                </div>
              </button>

              {/* Stop Audio */}
              {(isPlayingAudio || isPausedAudio) && (
                <button 
                  onClick={stopSpeech}
                  title="Stop Narrator"
                  className="w-11 h-11 border-2 border-transparent text-red-400 hover:text-red-400 hover:border-red-500 hover:bg-[#13141f] flex items-center justify-center transition-all cursor-pointer relative group rounded-xl"
                >
                  <Square size={16} />
                  <div className="absolute right-full mr-3 px-2 py-1 bg-[#13141f] border border-retro-border text-[10px] text-retro-text whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 uppercase font-terminal rounded-lg">
                    Stop Listening
                  </div>
                </button>
              )}

              {/* Distraction-Free Focus Mode */}
              <button 
                onClick={() => setFocusMode(prev => !prev)}
                title="Toggle Focus Mode"
                className={`w-11 h-11 border-2 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                  focusMode 
                    ? "border-retro-accent bg-[#13141f] text-retro-accent" 
                    : "border-transparent text-retro-text/40 hover:text-retro-accent hover:border-retro-border hover:bg-[#13141f]"
                }`}
              >
                {focusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                <div className="absolute right-full mr-3 px-2 py-1 bg-[#13141f] border border-retro-border text-[10px] text-retro-text whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 uppercase font-terminal rounded-lg">
                  {focusMode ? "Exit Focus Mode" : "Focus Mode"}
                </div>
              </button>

              <div className="w-full h-0.5 bg-retro-border/20 my-1" />

              {/* Copy Link */}
              <button 
                onClick={handleCopyUrl}
                title="Copy URL"
                className={`w-11 h-11 border-2 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                  copied 
                    ? "border-emerald-400 bg-[#13141f] text-emerald-400" 
                    : "border-transparent text-retro-text/40 hover:text-retro-accent hover:border-retro-border hover:bg-[#13141f]"
                }`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                <div className="absolute right-full mr-3 px-2 py-1 bg-[#13141f] border border-retro-border text-[10px] text-retro-text whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 uppercase font-terminal rounded-lg">
                  {copied ? "Copied!" : "Copy Link"}
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Related Blogs Section */}
        {relatedBlogs.length > 0 && !focusMode && (
          <div className="mt-16 pt-16 border-t-2 border-retro-border/20">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-xs font-bold text-retro-accent uppercase tracking-widest font-terminal">
                  READ MORE
                </span>
                <h3 className="text-3xl font-black text-retro-accent mt-1 uppercase font-heading">
                  RELATED ARTICLES
                </h3>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((item, idx) => {
                const itemCover = item.featuredImage || item.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";
                
                return (
                  <Link 
                    key={item._id || idx} 
                    to={`/blog/${item._id}`}
                    className="flex flex-col h-full group"
                  >
                    <RetroCard className="overflow-hidden h-full flex flex-col cursor-pointer border-retro-border hover:border-retro-accent transition-all p-0 rounded-2xl">
                      {/* Cover Thumbnail */}
                      <div className="h-40 relative overflow-hidden bg-[#13141f] flex-shrink-0 border-b border-retro-border">
                        <img 
                          src={itemCover} 
                          alt={item.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      {/* Content details */}
                      <div className="p-5 flex flex-col flex-1 bg-retro-surface">
                        <div className="mb-2">
                          <Badge>
                            {item.category || "General"}
                          </Badge>
                        </div>
                        
                        <h4 className="text-lg font-bold text-retro-accent leading-snug group-hover:text-retro-accent/80 transition-colors mb-4 line-clamp-2 uppercase font-heading">
                          {item.title}
                        </h4>

                        <div className="mt-auto pt-4 border-t border-retro-border/20 flex items-center justify-between text-[11px] text-retro-text/30 font-terminal uppercase">
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            <span>{item.views || 0}</span>
                          </span>
                          <span className="flex items-center gap-1 hover:text-retro-accent transition-colors font-pixel">
                            <span>READ ARTICLE</span>
                            <ChevronRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </RetroCard>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
