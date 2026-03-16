"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Tag } from "lucide-react";
import { type Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const initials = product.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group rounded-[2rem] bg-slate-900/80 border border-white/5 overflow-hidden flex flex-col h-full hover:border-blue-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10"
    >
      <Link href={`/produtos/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-950">
        {product.image ? (
          <Image
            src={
              product.image.startsWith('http://') || product.image.startsWith('https://')
                ? product.image
                : product.image.startsWith('/')
                  ? product.image
                  : `/assets/imagens/${product.image}`
            }
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/50">
            <span className="text-7xl font-black text-blue-500/10 mb-4">{initials}</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Tag className="w-3 h-3" /> Model 3D
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
          <span className="text-white text-sm font-black flex items-center gap-3 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-out uppercase tracking-wider">
            Explorar detalhes <ArrowRight className="w-5 h-5 text-blue-500 animate-pulse" />
          </span>
        </div>
      </Link>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest">
            {product.category}
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">{product.material}</span>
        </div>

        <h3 className="text-2xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors tracking-tight">
          {product.name}
        </h3>
        <p className="text-sm text-slate-400 mb-8 line-clamp-2 leading-relaxed font-medium">
          {product.shortDesc}
        </p>

        <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Budget Base</span>
            {product.variations && product.variations.length > 0 ? (
              <div className="flex flex-col">
                {product.priceMin !== product.priceMax ? (
                  <>
                    <span className="text-2xl font-black text-white tracking-tighter">
                      R$ {(product.priceMin || 0).toFixed(2)} - R$ {(product.priceMax || 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-blue-400 font-bold">+{product.variations.length} variações</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-black text-white tracking-tighter">R$ {(product.priceMin || 0).toFixed(2)}</span>
                    <span className="text-xs text-blue-400 font-bold">{product.variations.length} {product.variations.length === 1 ? 'variação' : 'variações'}</span>
                  </>
                )}
              </div>
            ) : (
              <>
                <span className="text-2xl font-black text-white tracking-tighter">R$ {(product.promotional_price ?? product.price).toFixed(2)}</span>
                {product.promotional_price && (
                  <span className="text-xs text-slate-500 line-through">R$ {product.price.toFixed(2)}</span>
                )}
              </>
            )}
          </div>
          <a
            href="https://wa.me/5513997553465"
            onClick={(e) => e.stopPropagation()}
            className="w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            title="Solicitar agora"
          >
            <MessageCircle className="w-6 h-6" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
