import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default async function FeaturedProducts() {
  // Pegamos os 3 primeiros produtos para destaque
  const allProducts = await getAllProducts();
  const featured = allProducts.slice(0, 3);

  return (
    <section className="py-32 px-6 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-3 h-3" /> Destaques do Mês
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
              Peças em <span className="text-gradient">Evidência</span>
            </h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed">
              Confira alguns dos nossos projetos mais populares e descubra as infinitas possibilidades da manufatura aditiva.
            </p>
          </div>
          
          <Link 
            href="/produtos" 
            className="group flex items-center gap-3 text-white font-black text-sm uppercase tracking-widest hover:text-blue-500 transition-colors"
          >
            Ver Catálogo Completo
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
