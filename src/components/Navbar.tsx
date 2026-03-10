import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-indigo-100/50 px-4 py-3 flex justify-between items-center transition-all">
      <Link href="/" className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
        Swaply
      </Link>
      <div className="flex gap-3 items-center">
        <div className="flex bg-white/60 backdrop-blur-md shadow-sm border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-bold tracking-wide">
          <span className="opacity-80 font-medium mr-1">Crédits:</span> 100
        </div>
        <Link 
          href="/publish" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
        >
          Publier
        </Link>
      </div>
    </nav>
  );
}
