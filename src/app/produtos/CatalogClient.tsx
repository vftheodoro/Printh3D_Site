'use client';

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import ShopeeBanner from "@/components/common/ShopeeBanner";
import { Product } from "@/lib/products";
import { motion, AnimatePresence } from "framer-motion";
import { Search, PackageOpen, LayoutGrid, X, Filter, Sparkles } from "lucide-react";

export default function CatalogClient({ initialProducts, initialCategories }: { initialProducts: Product[], initialCategories: string[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = initialProducts.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || 
                        p.shortDesc.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-white selection:bg-blue-500/30">
      <Navbar />

      <div className="pt-32">
        <ShopeeBanner />
      </div>

      <section className="pb-32 px-6 pt-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12 mb-12 lg:mb-20">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/5 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 lg:mb-6 border border-blue-500/10 shadow-inner">
                <Sparkles className="w-3 h-3" /> Explore nosso acervo
              </div>
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-black mb-4 lg:mb-6 tracking-tighter leading-[0.9]">
                Catálogo <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Premium</span>
              </h1>
              <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
                Uma seleção criteriosa de modelos esculpidos detalhadamente e otimizados para a máxima fidelidade na impressão 3D.
              </p>
            </div>

            <div className="flex flex-col gap-8 w-full lg:w-[480px]">
              <div className="relative group/search">
                <div className="absolute inset-0 bg-blue-600/5 blur-xl group-focus-within/search:bg-blue-600/10 transition-colors" />
                <div className="relative flex items-center bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-2 hover:border-white/10 focus-within:border-blue-500/50 transition-all shadow-2xl">
                  <div className="flex items-center justify-center w-12 h-12 text-slate-500 group-focus-within/search:text-blue-500 transition-colors">
                    <Search className="w-5 h-5 transition-transform group-focus-within/search:scale-110" />
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar modelos, temas..."
                    className="flex-grow bg-transparent border-none focus:ring-0 text-base font-bold placeholder:text-slate-600 placeholder:font-medium outline-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <AnimatePresence>
                    {query && (
                      <motion.button 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setQuery("")} 
                        className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all mr-1"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">
                  <Filter className="w-3 h-3" /> Filtrar por categoria
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategory("all")}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all tracking-widest border ${
                      category === "all"
                        ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20 ring-4 ring-blue-500/10 scale-105"
                        : "bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    TUDO
                  </button>
                  {initialCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all tracking-widest border ${
                        category === cat
                          ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20 ring-4 ring-blue-500/10 scale-105"
                          : "bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-200 hover:bg-slate-800/60"
                      }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
             {filtered.length > 0 ? (
                filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
             ) : (
                <div className="col-span-full py-32 flex flex-col items-center text-center">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-8 group">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-500" />
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-900 flex items-center justify-center border border-white/5 shadow-2xl relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                      <PackageOpen className="w-10 h-10 text-slate-600 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">Nenhum tesouro encontrado</h3>
                  <p className="text-lg text-slate-500 max-w-md mx-auto mb-10 leading-relaxed font-medium">
                    Não encontramos nenhum modelo com estes filtros. Tente usar termos mais abrangentes ou limpe os filtros.
                  </p>
                  <button
                    onClick={() => { setQuery(""); setCategory("all"); }}
                    className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-950/50 border border-white/5 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-blue-500 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative z-10 group-hover:text-white transition-colors duration-300">LIMPAR FILTROS</span>
                  </button>
                </div>
             )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
