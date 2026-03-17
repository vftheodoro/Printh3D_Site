"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          
          {/* Brand & Social */}
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 group-hover:bg-blue-600/20 transition-all">
                <Image
                  src="/assets/logos/logo_printh_padrão.png"
                  alt="Printh3D"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">
                Printh<span className="text-blue-500">3D</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
              Manufatura aditiva e soluções personalizadas em Jacupiranga, SP. Enviamos para todo o Brasil.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Instagram className="w-5 h-5" />, href: "https://www.instagram.com/printh_3d/" },
                { icon: <Facebook className="w-5 h-5" />, href: "https://www.facebook.com/Printh3D" },
                { icon: <ShoppingBag className="w-5 h-5" />, href: "https://shopee.com.br/printh3d" },
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-blue-500 hover:bg-white/10 transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Group */}
          <div className="grid grid-cols-2 gap-8 md:gap-16 w-full md:w-auto">
            <div>
              <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6 opacity-30 text-center md:text-left">Site</h4>
              <ul className="space-y-3 text-center md:text-left">
                {["Início", "Produtos", "Como Funciona", "Contato"].map((item) => (
                  <li key={item}>
                    <Link 
                      href={item === "Início" ? "/" : `/${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "")}`} 
                      className="text-slate-500 hover:text-white text-xs font-bold transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6 opacity-30 text-center md:text-left">Legal</h4>
              <ul className="space-y-3 text-center md:text-left">
                <li><Link href="/termos" className="text-slate-500 hover:text-white text-xs font-bold transition-colors">Termos</Link></li>
                <li><Link href="/privacidade" className="text-slate-500 hover:text-white text-xs font-bold transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest text-center">
            © 2026 Printh3D — Jacupiranga, SP
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-[9px] font-black uppercase tracking-widest text-center">
            DESIGN & DEV BY 
            <a 
              href="https://vftheodoro.github.io/Portfolio/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:underline underline-offset-4"
            >
              VICTOR THEODORO
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
