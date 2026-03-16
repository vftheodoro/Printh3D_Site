"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Product, ProductVariation } from "@/lib/products";
import { getWhatsAppLink, productMessage } from "@/lib/whatsapp";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, MessageCircle, Info, Palette, Sparkles, ShoppingBag, ChevronRight, ChevronDown } from "lucide-react";

export default function ProductDetailClient({ product }: { product: Product | undefined }) {
  const router = useRouter();

  const [color, setColor] = useState(product?.colors?.[0] || "");
  const [finish, setFinish] = useState(product?.finishes?.[0] || "");
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const selectedVariation = useMemo(() => {
    if (!product?.variations || !selectedVariationId) return null;
    return product.variations.find(v => v.id === selectedVariationId);
  }, [product?.variations, selectedVariationId]);

  const currentProduct = selectedVariation || product;
  const currentPrice = currentProduct?.promotional_price ?? currentProduct?.price ?? 0;
  const originalPrice = currentProduct?.price ?? 0;

  // Collect all images from product and its variations
  const allImages = useMemo(() => {
    const images: { id: string; url: string; name: string }[] = [];
    
    if (product?.image) {
      images.push({ id: 'main', url: product.image, name: product.name });
    }

    if (product?.variations) {
      product.variations.forEach((v, idx) => {
        if (v.image && !images.some(img => img.url === v.image)) {
          images.push({ id: `var-${v.dbId}`, url: v.image, name: v.name });
        }
      });
    }

    return images.length > 0 ? images : [{ id: 'placeholder', url: '/assets/imagens/design_screen.png', name: 'Imagem' }];
  }, [product]);

  if (!product) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20">
          <h1 className="text-3xl font-bold mb-4">Produto não encontrado</h1>
          <button onClick={() => router.push("/produtos")} className="text-blue-500 font-bold hover:underline">
            Voltar ao catálogo
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  const handleBuy = () => {
    const message = productMessage({
      name: selectedVariation?.name || product.name,
      price: currentPrice,
      material: selectedVariation?.material || product.material,
      color,
      finish
    });
    window.open(getWhatsAppLink(message), "_blank");
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="relative aspect-square rounded-[2rem] bg-slate-900 border border-white/5 overflow-hidden flex items-center justify-center">
                {allImages[activeImageIndex]?.url ? (
                  <Image
                    src={allImages[activeImageIndex].url}
                    alt={allImages[activeImageIndex].name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center p-12">
                    <span className="text-9xl font-black text-white/5 block mb-4">3D</span>
                    <span className="text-slate-500 text-sm font-medium uppercase tracking-widest">Imagem Ilustrativa</span>
                  </div>
                )}
              </div>

              {/* Image Gallery Thumbnail */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-lg border-2 flex-shrink-0 overflow-hidden transition-all ${
                        activeImageIndex === idx
                          ? 'border-blue-500 ring-2 ring-blue-500/30'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.name}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  {product.category}
                </span>
                <span className="text-sm text-slate-400 flex items-center gap-1">
                  <Info className="w-4 h-4" /> {currentProduct?.material}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                {selectedVariation?.name || product.name}
              </h1>

              <div className="text-3xl font-black text-white mb-8 flex items-baseline gap-2">
                R$ {currentPrice.toFixed(2)}
                {product.promotional_price && (
                   <span className="text-sm text-slate-500 line-through ml-2">R$ {originalPrice.toFixed(2)}</span>
                )}
              </div>

              {product.variations && product.variations.length > 0 && (
                <div className="mb-8 p-6 bg-slate-900/40 rounded-2xl border border-white/5">
                  <label className="flex items-center gap-2 text-sm font-bold mb-4">
                    <ChevronDown className="w-4 h-4 text-blue-500" /> Variações Disponíveis
                  </label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {product.variations.map((variation) => (
                      <button
                        key={variation.id}
                        onClick={() => setSelectedVariationId(variation.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left ${
                          selectedVariationId === variation.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/5 bg-slate-800/40 hover:border-white/10'
                        }`}
                      >
                        <div className="flex-grow">
                          <div className="font-bold text-white">{variation.name}</div>
                          <div className="text-sm text-slate-400">{variation.material}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-white">R$ {(variation.promotional_price ?? variation.price).toFixed(2)}</div>
                          {variation.promotional_price && (
                            <div className="text-xs text-slate-500 line-through">R$ {variation.price.toFixed(2)}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-slate-400 leading-relaxed mb-10 text-lg font-medium">
                {product.fullDesc}
              </p>

              <div className="space-y-8 mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-3">
                      <Palette className="w-4 h-4 text-blue-500" /> Cor
                    </label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      {product.colors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-3">
                      <Sparkles className="w-4 h-4 text-blue-500" /> Acabamento
                    </label>
                    <select
                      value={finish}
                      onChange={(e) => setFinish(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      {product.finishes.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBuy}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
              >
                <MessageCircle className="w-6 h-6" />
                COMPRAR PELO WHATSAPP
              </button>

              <div className="mt-8 p-6 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-6 group hover:border-blue-500/30 transition-all">
                <div className="w-14 h-14 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white mb-1">Prefere a Shopee?</h4>
                  <p className="text-[11px] text-slate-400 font-medium mb-3">Comprou, chegou. Segurança total garantida!</p>
                  <a href="https://shopee.com.br/printh3d" target="_blank" rel="noopener noreferrer" className="text-xs font-black text-blue-500 hover:text-blue-400 decoration-blue-500/30 underline underline-offset-4">
                    Visitar Loja Shopee
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
