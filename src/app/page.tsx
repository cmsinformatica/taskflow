"use client";

import Link from "next/link";
import { LayoutGrid, CheckCircle2, Users, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F7F8]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E0E0E0]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#264653] flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-[#264653]">Boardzen</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-[#2B2B2B] hover:text-[#2A9D8F] transition-colors">
              Recursos
            </a>
            <Link
              href="/login"
              className="text-[#2B2B2B] hover:text-[#2A9D8F] transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl bg-[#264653] text-white hover:bg-[#1d3640] transition-colors"
            >
              Começar agora
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#264653] leading-tight mb-6">
            Organize suas ideias
            <br />
            <span className="text-[#2A9D8F]">com tranquilidade</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto mb-10 leading-relaxed">
            Boardzen é o seu espaço para organizar projetos sem pressa.
            Quadros claros, cartões simples e foco no que importa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-[#264653] text-white hover:bg-[#1d3640] transition-all text-lg font-medium"
            >
              Criar meu primeiro quadro
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl border-2 border-[#E0E0E0] text-[#2B2B2B] hover:border-[#2A9D8F] hover:text-[#2A9D8F] transition-all text-lg"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#264653] mb-4">
              Simples por natureza
            </h2>
            <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
              Sem complicações, sem excesso. Apenas o necessário para você fluir.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#F5F7F8] border border-[#E0E0E0] transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#2A9D8F]/10 flex items-center justify-center mb-6">
                <LayoutGrid className="w-6 h-6 text-[#2A9D8F]" />
              </div>
              <h3 className="text-xl font-semibold text-[#264653] mb-3">
                Quadros visuais
              </h3>
              <p className="text-[#6B7280] leading-relaxed">
                Organize tarefas em colunas. Arraste, solte e veja seu progresso fluir naturalmente.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F5F7F8] border border-[#E0E0E0] transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#2A9D8F]/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-[#2A9D8F]" />
              </div>
              <h3 className="text-xl font-semibold text-[#264653] mb-3">
                Checklists claros
              </h3>
              <p className="text-[#6B7280] leading-relaxed">
                Divida tarefas maiores em passos menores. Marque o progresso sem ansiedade.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F5F7F8] border border-[#E0E0E0] transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#2A9D8F]/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-[#2A9D8F]" />
              </div>
              <h3 className="text-xl font-semibold text-[#264653] mb-3">
                Sem distrações
              </h3>
              <p className="text-[#6B7280] leading-relaxed">
                Interface limpa e calma. Nada piscando, nada gritando por atenção.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#264653] mb-4">
            Tudo começa com um quadro
          </h2>
          <p className="text-[#6B7280] text-lg mb-8">
            Crie seu primeiro quadro e organize suas ideias com tranquilidade.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#2A9D8F] text-white hover:bg-[#238b80] transition-all text-lg font-medium"
          >
            Começar gratuitamente
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#E0E0E0]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#264653] flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-white" />
            </div>
            <span className="text-[#264653] font-medium">Boardzen</span>
          </div>
          <p className="text-[#6B7280] text-sm">
            Organize com clareza. Viva com tranquilidade.
          </p>
        </div>
      </footer>
    </div>
  );
}
