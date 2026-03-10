"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      router.push("/");
      router.refresh();
    } else {
      alert(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-20">
        {/* Logo Section */}
        <div className="mb-12 flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 mb-6">
             <span className="text-white text-3xl font-black lowercase tracking-tighter">sw.</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Swaply</h1>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Connexion à votre compte</h2>
            <p className="text-sm text-slate-400 font-medium tracking-tight">Ravi de vous revoir ! Entrez vos accès.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300 font-medium" 
                  placeholder="Email" 
                  type="email"
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  required
                />
              </div>
              <div className="relative">
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300 font-medium" 
                  type="password" 
                  placeholder="Mot de passe" 
                  value={password} 
                  onChange={(e)=>setPassword(e.target.value)} 
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? "Chargement..." : "Se connecter"}
            </button>
          </form>

          <div className="relative py-4">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
             <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-300 bg-white px-4 italic">- Ou continuer avec -</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center text-[10px] font-black text-indigo-600">G</div>
             </button>
             <button className="flex items-center justify-center py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center text-[10px] font-black text-indigo-600">f</div>
             </button>
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
            <p className="text-sm text-slate-400 font-medium">
              Pas encore de compte ?
            </p>
            <Link 
              href="/signup" 
              className="w-full text-center border-2 border-slate-100 text-slate-900 font-black py-4 rounded-2xl hover:bg-slate-50 active:scale-[0.98] transition-all text-sm"
            >
              Créer un compte (Inscription)
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
