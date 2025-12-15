# TaskFlow

Um portal de gerenciamento de tarefas no estilo Trello, construído com Next.js, TypeScript, Tailwind CSS e Supabase.

![TaskFlow](https://via.placeholder.com/800x400?text=TaskFlow+-+Trello+Clone)

## ✨ Funcionalidades

- 📋 **Quadros Kanban** - Organize projetos em quadros visuais
- 🎯 **Drag & Drop** - Arraste e solte cards entre listas
- 🎨 **Backgrounds** - Personalize seus quadros com gradientes e cores
- 🏷️ **Etiquetas** - Categorize cards com etiquetas coloridas
- ✅ **Checklists** - Acompanhe sub-tarefas dentro dos cards
- 💬 **Comentários** - Colabore com sua equipe
- 🔒 **Autenticação** - Login seguro com Supabase Auth

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no [Supabase](https://supabase.com) (gratuito)

### Instalação

1. **Clone o repositório**
   ```bash
   cd trello-clone
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
   ```

4. **Configure o banco de dados**

   Acesse o SQL Editor no Supabase e execute o arquivo `supabase/schema.sql`

5. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

6. **Acesse a aplicação**
   
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── (auth)/            # Rotas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── boards/[id]/       # Página do quadro
│   ├── dashboard/         # Dashboard principal
│   └── page.tsx           # Landing page
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   ├── board/            # Componentes de Board
│   ├── list/             # Componentes de List
│   └── card/             # Componentes de Card
├── lib/                   # Utilitários
│   └── supabase/         # Cliente Supabase
├── store/                # Zustand store
└── types/                # TypeScript types
```

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|-----------|-----|
| [Next.js 15](https://nextjs.org/) | Framework React |
| [TypeScript](https://typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização |
| [Supabase](https://supabase.com/) | Backend/Auth |
| [@dnd-kit](https://dndkit.com/) | Drag & Drop |
| [Zustand](https://zustand-demo.pmnd.rs/) | State Management |
| [Lucide React](https://lucide.dev/) | Ícones |

## 📦 Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Iniciar build de produção
npm run lint     # Verificar linting
```

## 🗄️ Banco de Dados

O esquema do banco de dados está em `supabase/schema.sql` e inclui:

- **profiles** - Dados dos usuários
- **workspaces** - Espaços de trabalho
- **boards** - Quadros
- **lists** - Listas
- **cards** - Cards/Tarefas
- **labels** - Etiquetas
- **checklists** - Checklists
- **comments** - Comentários
- **activities** - Log de atividades

## 🔐 Modo Demo

Se as variáveis de ambiente do Supabase não estiverem configuradas, a aplicação funcionará em modo demo:

- Autenticação simulada
- Dados salvos no localStorage
- Todas as funcionalidades de UI disponíveis

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Feito com ❤️ usando Next.js e Supabase
