import Link from "next/link";
import { LayoutGrid, ArrowRight, CheckCircle, Zap, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">TaskFlow</span>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="px-6 py-2.5 text-white/80 hover:text-white font-medium transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
          >
            Criar Conta
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/80 mb-8">
          <Zap className="w-4 h-4 text-yellow-400" />
          Organize seus projetos de forma inteligente
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Gerencie tarefas com
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            simplicidade e poder
          </span>
        </h1>

        <p className="text-xl text-white/60 max-w-2xl mb-12">
          TaskFlow é a ferramenta perfeita para organizar projetos, gerenciar
          tarefas e colaborar com sua equipe. Comece gratuitamente hoje.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-xl shadow-blue-500/25"
          >
            Começar Gratuitamente
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 text-white/80 hover:text-white font-medium transition-colors"
          >
            Ver recursos →
          </Link>
        </div>

        {/* Features */}
        <div
          id="features"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full max-w-5xl"
        >
          <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-left hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Quadros Kanban
            </h3>
            <p className="text-white/60">
              Organize tarefas em listas e mova cards com arrastar e soltar
              intuitivo.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-left hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Colaboração
            </h3>
            <p className="text-white/60">
              Trabalhe em equipe com atualizações em tempo real e comentários.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-left hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Produtividade
            </h3>
            <p className="text-white/60">
              Checklists, etiquetas, datas de entrega e muito mais para sua
              organização.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-white/40 text-sm">
        <p>© 2024 TaskFlow. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
