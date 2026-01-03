import React, { useState } from "react";

const Login = () => {
  const [formData, setFormData] = useState({ name: "", password: "" });

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "name") value = value.replace(/\s+/g, "");
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedName = formData.name.trim();
    if (!cleanedName || !formData.password) {
      alert("All fields are required");
      return;
    }

    try {
      // Simulated login for demo
      alert("Access Granted");
      setFormData({ name: "", password: "" });
    } catch (err) {
      alert(err.response?.status === 401 ? "Unauthorized Access" : "System Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 font-sans selection:bg-red-500/30 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      
      {/* Dynamic Red Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-600/15 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-red-500/10 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md bg-zinc-950/80 backdrop-blur-2xl border border-red-900/30 p-12 rounded-3xl shadow-[0_0_100px_rgba(220,38,38,0.15)] overflow-hidden group z-10">
        {/* Top Accent Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-red-500 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-red-500/40 rounded-tl-3xl" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-red-500/40 rounded-br-3xl" />

        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 bg-linear-to-br from-red-950/20 via-transparent to-orange-950/20 opacity-50" />

        <div className="relative mb-12 text-center">
          <div className="inline-block relative">
            <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]">
              Arena
            </h2>
            <div className="absolute -inset-1 bg-red-500/20 blur-xl -z-10" />
          </div>
          <p className="text-red-500 text-xs mt-3 font-bold tracking-[0.3em] uppercase">by Zeeshan</p>
          <div className="mt-6 h-px w-32 mx-auto bg-linear-to-r from-transparent via-red-500/50 to-transparent" />
          <p className="text-white text-xs mt-4 font-bold tracking-[0.25em] uppercase">LOGIN IN</p>
        </div>

        <div className="relative space-y-5">
          <div className="relative group/input">
            <div className="absolute inset-0 bg-linear-to-r from-red-600/0 via-red-600/5 to-red-600/0 rounded-xl opacity-0 group-hover/input:opacity-100 transition-opacity duration-300" />
            <input
              type="text"
              name="name"
              placeholder="username"
              value={formData.name}
              onChange={handleChange}
              required
              className="relative w-full bg-black/60 border border-zinc-800/80 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/60 transition-all placeholder:text-zinc-700 placeholder:text-xs placeholder:tracking-[0.2em] tracking-wider font-medium hover:border-zinc-700"
            />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 bg-red-500/40 rounded-full opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
          </div>

          <div className="relative group/input">
            <div className="absolute inset-0 bg-linear-to-r from-red-600/0 via-red-600/5 to-red-600/0 rounded-xl opacity-0 group-hover/input:opacity-100 transition-opacity duration-300" />
            <input
              type="password"
              name="password"
              placeholder="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="relative w-full bg-black/60 border border-zinc-800/80 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/60 transition-all placeholder:text-zinc-700 placeholder:text-xs placeholder:tracking-[0.2em] tracking-wider font-medium hover:border-zinc-700"
            />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 bg-red-500/40 rounded-full opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
          </div>

          <button 
            onClick={handleSubmit}
            className="relative w-full bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black py-4 rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] active:scale-95 uppercase tracking-[0.25em] text-sm mt-8 overflow-hidden group/btn"
          >
            <span className="relative z-10">LOGIN</span>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          </button>
        </div>

        <div className="relative mt-10 text-center border-t border-zinc-800/50 pt-6">
          <a 
            href="#" 
            className="text-xs text-zinc-600 hover:text-red-500 transition-colors uppercase tracking-[0.25em] font-semibold relative inline-block group/link"
          >
            forgot password?
            <span className="absolute bottom-0 left-0 w-0 h-px bg-red-500 group-hover/link:w-full transition-all duration-300" />
          </a>
        </div>

        {/* Bottom Corner Indicator */}
        <div className="absolute bottom-4 left-4 flex gap-1">
          <div className="w-1 h-1 bg-red-500/60 rounded-full animate-pulse" />
          <div className="w-1 h-1 bg-red-500/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-1 h-1 bg-red-500/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};

export default Login;