# Éclore - Spécifications Techniques Complètes

## 📋 Vue d'ensemble

**Éclore** est une application web PWA de soutien post-partum avec :
- Onboarding conversationnel
- Chat IA empathique (API Anthropic Claude)
- Questionnaire de personnalisation
- Check-in quotidien d'humeur
- Exercices de bien-être guidés
- Suivi hydratation
- Articles éducatifs
- Suivi bébé (événements)

---

## 🏗️ Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **API IA**: Anthropic Claude API
- **Hosting**: Vercel
- **PWA**: next-pwa
- **Styling**: CSS-in-JS (inline styles, déjà en place)

---

## 📁 Structure du Projet

```
eclore/
├── app/
│   ├── layout.tsx              # Layout principal + PWA meta
│   ├── page.tsx                # Page principale (redirige vers /app ou /auth)
│   ├── globals.css             # Styles globaux minimaux
│   ├── manifest.json           # PWA manifest
│   ├── (auth)/
│   │   ├── login/page.tsx      # Page de connexion
│   │   ├── signup/page.tsx     # Page d'inscription
│   │   └── callback/page.tsx   # OAuth callback
│   ├── (app)/
│   │   ├── layout.tsx          # Layout app (vérifie auth)
│   │   └── page.tsx            # App principale Éclore
│   └── api/
│       ├── chat/route.ts       # API route pour Claude
│       └── webhooks/route.ts   # Webhooks Supabase (optionnel)
├── components/
│   ├── Eclore.tsx              # Composant principal (le code actuel)
│   ├── GlassOrb.tsx            # Composant orbe
│   ├── EcloreLogo.tsx          # Logo SVG
│   └── Icons.tsx               # Tous les icons SVG
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Client Supabase (browser)
│   │   ├── server.ts           # Client Supabase (server)
│   │   └── middleware.ts       # Middleware auth
│   ├── anthropic.ts            # Client Anthropic
│   └── utils.ts                # Fonctions utilitaires
├── hooks/
│   ├── useUser.ts              # Hook utilisateur
│   ├── useProfile.ts           # Hook profil
│   └── useChat.ts              # Hook chat avec IA
├── types/
│   └── database.ts             # Types TypeScript générés par Supabase
├── public/
│   ├── icons/                  # Icons PWA (192x192, 512x512)
│   └── splash/                 # Splash screens
├── .env.local                  # Variables d'environnement
├── next.config.js              # Config Next.js + PWA
├── middleware.ts               # Middleware auth global
└── package.json
```

---

## 🗄️ Schéma Base de Données Supabase

### Tables SQL à créer

```sql
-- ============================================
-- ÉCLORE - SCHÉMA DE BASE DE DONNÉES
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: profiles (profil utilisateur)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  baby_name TEXT,
  baby_date DATE,
  feeding TEXT CHECK (feeding IN ('breast', 'bottle', 'mixed', 'weaned')),
  initial_mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- TABLE: questionnaire_answers (réponses questionnaire)
-- ============================================
CREATE TABLE questionnaire_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  answer_value INTEGER NOT NULL,
  answer_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE questionnaire_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own answers" ON questionnaire_answers
  FOR ALL USING (auth.uid() = user_id);

-- Index pour performance
CREATE INDEX idx_questionnaire_user ON questionnaire_answers(user_id);

-- ============================================
-- TABLE: selected_axes (axes de travail sélectionnés)
-- ============================================
CREATE TABLE selected_axes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  primary_axis TEXT NOT NULL,
  secondary_axes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE selected_axes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own axes" ON selected_axes
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLE: check_ins (check-ins quotidiens humeur)
-- ============================================
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own check_ins" ON check_ins
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_checkins_user_date ON check_ins(user_id, date DESC);

-- ============================================
-- TABLE: exercises_completed (exercices faits)
-- ============================================
CREATE TABLE exercises_completed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE exercises_completed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exercises" ON exercises_completed
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_exercises_user ON exercises_completed(user_id);

-- ============================================
-- TABLE: articles_read (articles lus)
-- ============================================
CREATE TABLE articles_read (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

ALTER TABLE articles_read ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own articles" ON articles_read
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLE: water_intake (suivi hydratation)
-- ============================================
CREATE TABLE water_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own water_intake" ON water_intake
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_water_user_date ON water_intake(user_id, date);

-- Vue pour total journalier
CREATE VIEW daily_water AS
SELECT 
  user_id,
  date,
  SUM(amount_ml) as total_ml
FROM water_intake
GROUP BY user_id, date;

-- ============================================
-- TABLE: baby_events (événements bébé)
-- ============================================
CREATE TABLE baby_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE baby_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own baby_events" ON baby_events
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLE: chat_messages (historique chat pour contexte)
-- ============================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own messages" ON chat_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_chat_user ON chat_messages(user_id, created_at DESC);

-- ============================================
-- TABLE: completed_sections (sections questionnaire complétées)
-- ============================================
CREATE TABLE completed_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, section_id)
);

ALTER TABLE completed_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sections" ON completed_sections
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FONCTION: Créer profil automatiquement après signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer profil auto
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FONCTION: Update timestamp automatique
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_axes_updated_at
  BEFORE UPDATE ON selected_axes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 🔐 Variables d'Environnement

Créer un fichier `.env.local` :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx  # Seulement côté serveur

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxx

# App
NEXT_PUBLIC_APP_URL=https://eclore.vercel.app
```

---

## 🤖 Intégration API Anthropic

### Fichier: `lib/anthropic.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChatContext {
  userName: string;
  babyName?: string;
  babyAgeWeeks?: number;
  feeding?: string;
  primaryAxis?: string;
  secondaryAxes?: string[];
  recentMoods?: number[];
  lastCheckIn?: { mood: number; date: string };
}

export async function chat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context: ChatContext
) {
  const systemPrompt = buildSystemPrompt(context);
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: systemPrompt,
    messages: messages,
  });

  return response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';
}

function buildSystemPrompt(context: ChatContext): string {
  return `Tu es Éclore, une compagne bienveillante et empathique pour les mamans en post-partum.

## Ton identité
- Tu es douce, chaleureuse, jamais jugeante
- Tu utilises un langage simple et réconfortant
- Tu tutoies toujours
- Tu utilises occasionnellement des emojis (💜, 🌸) mais avec parcimonie
- Tu réponds en français

## Contexte de cette maman
- Prénom: ${context.userName}
${context.babyName ? `- Bébé: ${context.babyName}` : ''}
${context.babyAgeWeeks ? `- Âge du bébé: ${context.babyAgeWeeks} semaines` : ''}
${context.feeding ? `- Alimentation: ${context.feeding === 'breast' ? 'Allaitement' : context.feeding === 'bottle' ? 'Biberon' : context.feeding === 'mixed' ? 'Mixte' : 'Sevré'}` : ''}
${context.primaryAxis ? `- Axe de travail principal: ${context.primaryAxis}` : ''}
${context.lastCheckIn ? `- Dernier check-in: humeur ${context.lastCheckIn.mood}/5 le ${context.lastCheckIn.date}` : ''}

## Tes règles
1. TOUJOURS valider les émotions avant de proposer des solutions
2. Ne jamais minimiser ce qu'elle vit ("c'est normal" peut être invalidant)
3. Proposer des exercices de l'app quand c'est pertinent (respiration, ancrage, auto-compassion)
4. En cas de détresse sévère (pensées suicidaires, envie de faire du mal), orienter vers le 3114 immédiatement
5. Garder des réponses courtes (2-4 phrases max) sauf si elle demande plus de détails
6. Ne jamais donner de conseils médicaux, orienter vers des professionnels

## Sujets que tu peux aborder
- Émotions post-partum (baby blues, anxiété, colère, tristesse)
- Fatigue et sommeil
- Relation au corps
- Isolement
- Allaitement/alimentation (sans jugement)
- Idées de repas simples et rapides
- Exercices de bien-être disponibles dans l'app

## Format de réponse
- Réponds de manière conversationnelle, pas en liste
- Maximum 3-4 phrases par réponse
- Une question de suivi maximum par réponse`;
}

export default anthropic;
```

### Fichier: `app/api/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chat, ChatContext } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { messages } = await request.json();

    // Récupérer le contexte utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: axes } = await supabase
      .from('selected_axes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: lastCheckIn } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    // Calculer l'âge du bébé en semaines
    let babyAgeWeeks;
    if (profile?.baby_date) {
      const babyDate = new Date(profile.baby_date);
      const now = new Date();
      babyAgeWeeks = Math.floor((now.getTime() - babyDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    }

    const context: ChatContext = {
      userName: profile?.name || 'toi',
      babyName: profile?.baby_name,
      babyAgeWeeks,
      feeding: profile?.feeding,
      primaryAxis: axes?.primary_axis,
      secondaryAxes: axes?.secondary_axes,
      lastCheckIn: lastCheckIn ? {
        mood: lastCheckIn.mood,
        date: lastCheckIn.date
      } : undefined
    };

    // Appeler Claude
    const response = await chat(messages, context);

    // Sauvegarder les messages (optionnel, pour historique)
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user') {
      await supabase.from('chat_messages').insert([
        { user_id: user.id, role: 'user', content: lastUserMessage.content },
        { user_id: user.id, role: 'assistant', content: response }
      ]);
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

---

## 📱 Configuration PWA

### Fichier: `next.config.js`

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
```

### Fichier: `public/manifest.json`

```json
{
  "name": "Éclore",
  "short_name": "Éclore",
  "description": "Ton compagnon post-partum",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FDF8F6",
  "theme_color": "#BEAEE2",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Dans `app/layout.tsx`

```tsx
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Éclore',
  description: 'Ton compagnon post-partum',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Éclore',
  },
};

export const viewport: Viewport = {
  themeColor: '#BEAEE2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🔧 Setup Supabase Client

### Fichier: `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Fichier: `lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

### Fichier: `middleware.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Rediriger vers login si pas connecté et sur une route protégée
  if (!user && request.nextUrl.pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Rediriger vers app si connecté et sur login/signup
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/app/:path*', '/login', '/signup'],
};
```

---

## 📦 Packages à installer

```bash
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk next-pwa
```

---

## 🚀 Instructions de déploiement

### 1. Créer le projet Supabase
1. Aller sur https://supabase.com
2. Créer un nouveau projet
3. Copier l'URL et la clé anon dans `.env.local`
4. Aller dans SQL Editor et exécuter le schéma SQL ci-dessus

### 2. Configurer Anthropic
1. Aller sur https://console.anthropic.com
2. Créer une clé API
3. Ajouter dans `.env.local`

### 3. Déployer sur Vercel
1. Push le code sur GitHub
2. Connecter le repo à Vercel
3. Ajouter les variables d'environnement dans Vercel
4. Déployer

### 4. Configurer l'auth Supabase
1. Dans Supabase > Authentication > URL Configuration
2. Ajouter l'URL Vercel dans "Site URL"
3. Ajouter les redirect URLs pour OAuth

---

## 📄 Code source actuel

Le fichier `eclore-v13.jsx` contient tout le code React de l'interface.
Il faudra :
1. Le convertir en TypeScript
2. Séparer en composants
3. Connecter à Supabase pour la persistence
4. Remplacer les réponses chat hardcodées par l'API Anthropic

---

## ✅ Checklist de développement

- [ ] Initialiser projet Next.js
- [ ] Installer les dépendances
- [ ] Configurer Supabase (tables, RLS)
- [ ] Configurer variables d'environnement
- [ ] Créer les pages auth (login, signup)
- [ ] Intégrer le composant Éclore
- [ ] Connecter à Supabase (CRUD)
- [ ] Intégrer API Anthropic
- [ ] Configurer PWA
- [ ] Tester en local
- [ ] Déployer sur Vercel
- [ ] Tester en production
