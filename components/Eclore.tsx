'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Types
interface Profile {
  name?: string;
  babyName?: string;
  babyDate?: string;
  feeding?: 'breast' | 'bottle' | 'mixed' | 'weaned';
  initialMood?: number;
}

interface CheckIn {
  mood: number;
  date: string;
  note?: string;
}

interface Exercise {
  id: string;
}

interface BabyEvent {
  id: number | string;
  type: string;
  icon?: string;
  date: string;
  label?: string;
}

interface ChatMessage {
  role: 'user' | 'ai' | 'assistant';
  text: string;
  isQ?: boolean;
  qId?: string;
  opts?: { v: number; l: string }[];
  showStart?: boolean;
  showContinue?: boolean;
  nextSection?: QuestionSection;
  showAxes?: boolean;
  axes?: AxisAnalysis[];
  showSecondary?: boolean;
  primaryId?: string;
  showFoodPrompts?: boolean;
  foodPrompts?: { label: string; value: string }[];
  showSOS?: boolean;
  suggest?: string;
  showChoice?: boolean;
}

interface OnboardMessage {
  role: 'user' | 'ai';
  text: string;
  step?: string;
  showChoice?: boolean;
  isDone?: boolean;
}

interface Axis {
  id: string;
  icon: string;
  label: string;
  desc: string;
  color: string;
  exercises: string[];
  linkedTo?: string[];
  linkExplain?: string;
  startQ: string;
  followUp?: string[];
  tips?: string[];
}

interface AxisAnalysis extends Axis {
  score: number;
}

interface QuestionSection {
  id: string;
  title: string;
  intro: string;
  questions: Question[];
  summary: (answers: Record<string, number>) => string;
}

interface Question {
  id: string;
  q: string;
  opts: { v: number; l: string }[];
  axis?: string;
  critical?: boolean;
}

interface ExerciseData {
  id: string;
  icon: string;
  title: string;
  duration: string;
  color: string;
  desc?: string;
  steps?: string[];
  isKegel?: boolean;
  levels?: { name: string; hold: number; rest: number; reps: number }[];
}

interface MoodResponse {
  text: string;
  actions: { label: string; act: string; id?: string }[];
}

interface Theme {
  bg: string;
  card: string;
  text: string;
  soft: string;
  accent: string;
  accent2: string;
  mint: string;
  turquoise: string;
  border: string;
  success: string;
  danger: string;
}

// Props
interface EcloreProps {
  user: User;
  initialProfile?: Profile;
  onSignOut: () => void;
}

// Logo Éclore
const EcloreLogo = ({ size = 60, color = '#BEAEE2' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <circle cx="30" cy="30" r="8" fill={color} opacity="0.9"/>
    <circle cx="30" cy="14" r="8" fill={color} opacity="0.6"/>
    <circle cx="43.9" cy="22" r="8" fill={color} opacity="0.5"/>
    <circle cx="43.9" cy="38" r="8" fill={color} opacity="0.4"/>
    <circle cx="30" cy="46" r="8" fill={color} opacity="0.5"/>
    <circle cx="16.1" cy="38" r="8" fill={color} opacity="0.6"/>
    <circle cx="16.1" cy="22" r="8" fill={color} opacity="0.7"/>
  </svg>
);

// GlassOrb
const GlassOrb = ({ size = 120, onClick, notification }: { size?: number; onClick?: () => void; notification?: boolean }) => (
  <div
    onClick={onClick}
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `
        radial-gradient(ellipse at 30% 20%, rgba(247,219,240,0.8) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 60%, rgba(205,240,234,0.6) 0%, transparent 40%),
        radial-gradient(ellipse at 50% 50%, rgba(190,174,226,0.5) 0%, transparent 60%),
        linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(247,219,240,0.3) 100%)
      `,
      backdropFilter: 'blur(16px)',
      boxShadow: `
        0 20px 60px rgba(190,174,226,0.25),
        0 8px 24px rgba(247,219,240,0.2),
        inset 0 1px 1px rgba(255,255,255,0.6),
        inset 0 -1px 1px rgba(190,174,226,0.1)
      `,
      cursor: onClick ? 'pointer' : 'default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(255,255,255,0.5)',
      position: 'relative',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    }}
  >
    <div style={{
      width: size * 0.55,
      height: size * 0.55,
      borderRadius: '50%',
      background: `
        radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.8) 0%, transparent 50%),
        radial-gradient(circle, rgba(190,174,226,0.4) 0%, rgba(247,219,240,0.3) 100%)
      `,
      boxShadow: 'inset 0 2px 12px rgba(255,255,255,0.5)'
    }} />
    {notification && (
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #E8A5A5, #D4918F)',
        color: '#fff',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(232,165,165,0.4)',
        border: '2px solid #fff'
      }}>!</div>
    )}
  </div>
);

// Icons
const Icons = {
  home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  chat: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  book: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  lotus: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="14" rx="3" ry="4"/><path d="M12 10c-2-3-5-5-5-8 0 4 2 6 5 8"/><path d="M12 10c2-3 5-5 5-8 0 4-2 6-5 8"/><path d="M7 14c-3-1-5-3-7-3 3 1 5 3 7 3"/><path d="M17 14c3-1 5-3 7-3-3 1-5 3-7 3"/></svg>,
  baby: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/></svg>,
  chart: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  send: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill={c}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  back: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  search: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  plus: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
  sun: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>,
  moon: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  fire: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  calendar: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  phone: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  star: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
  target: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  water: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
};

// Data constants
const MOODS = [
  { v: 1, e: '😢', l: 'Très mal' },
  { v: 2, e: '😔', l: 'Difficile' },
  { v: 3, e: '😐', l: 'Bof' },
  { v: 4, e: '🙂', l: 'Ça va' },
  { v: 5, e: '😊', l: 'Bien' }
];

const AXES: Axis[] = [
  { id: 'anxiety', icon: '😰', label: 'Anxiété / Stress', desc: 'Peurs, angoisses', color: '#e8d5f2', exercises: ['breath', 'ground'], linkedTo: ['sleep', 'body'], linkExplain: 'Le stress augmente le cortisol, perturbe le sommeil et empêche la perte de poids.', startQ: 'Qu\'est-ce qui te fait le plus peur ou t\'inquiète en ce moment ?', followUp: ['À quel moment de la journée ton anxiété est-elle la plus forte ?', 'Est-ce que tu arrives à identifier ce qui déclenche ces moments ?'], tips: ['Quand l\'anxiété monte, ton corps se prépare au danger. La respiration 4-7-8 envoie un signal de sécurité.', 'L\'ancrage 5-4-3-2-1 te ramène dans l\'instant présent.'] },
  { id: 'sadness', icon: '😔', label: 'Tristesse / Blues', desc: 'Moral bas, vide', color: '#d5d5f2', exercises: ['compassion'], linkedTo: ['isolation'], linkExplain: 'Tristesse et isolement se renforcent.', startQ: 'Qu\'est-ce qui te rend triste en ce moment ?', followUp: ['Est-ce que tu pleures souvent ?', 'Y a-t-il des moments où tu te sens mieux ?'], tips: ['La tristesse post-partum est réelle et valide.', 'L\'auto-compassion t\'aide à te traiter comme tu traiterais ta meilleure amie.'] },
  { id: 'sleep', icon: '😴', label: 'Fatigue / Sommeil', desc: 'Épuisement', color: '#d5e5f2', exercises: ['sleep', 'bodyscan'], linkedTo: ['anxiety', 'anger'], linkExplain: 'Le manque de sommeil amplifie tout.', startQ: 'Comment se passent tes nuits en ce moment ?', followUp: ['Combien de fois te réveilles-tu par nuit ?', 'Quelqu\'un peut prendre le relais ?'], tips: ['La privation de sommeil est une forme de torture.', 'Même 20 min de micro-sieste peuvent faire une vraie différence.'] },
  { id: 'anger', icon: '😤', label: 'Colère / Irritabilité', desc: 'Rage, nerfs', color: '#f2d5d5', exercises: ['breath', 'ground'], linkedTo: ['sleep'], linkExplain: 'La fatigue = émotions difficiles.', startQ: 'Qu\'est-ce qui te met en colère en ce moment ?', followUp: ['Est-ce que tu as des moments où tu sens que tu vas exploser ?', 'Est-ce que cette colère te fait peur ?'], tips: ['La rage post-partum existe. Ce n\'est PAS qui tu es.', 'Quand ça monte : pose bébé en sécurité, sors de la pièce.'] },
  { id: 'isolation', icon: '🤝', label: 'Isolement', desc: 'Solitude', color: '#d5f2e8', exercises: ['compassion'], linkedTo: ['sadness'], linkExplain: 'L\'isolement favorise la dépression.', startQ: 'Est-ce que tu te sens seule dans cette aventure ?', followUp: ['À qui tu peux parler de ce que tu vis vraiment ?', 'Qu\'est-ce qui t\'empêche de demander de l\'aide ?'], tips: ['Demander de l\'aide n\'est pas un échec.', 'Même une sortie de 10 min peut changer ta journée.'] },
  { id: 'body', icon: '🌸', label: 'Corps / Acceptation', desc: 'Image, poids', color: '#f2ead5', exercises: ['compassion', 'bodyscan'], linkedTo: ['anxiety'], linkExplain: 'Stress = cortisol = blocage perte poids.', startQ: 'Qu\'est-ce qui est le plus difficile avec ton corps en ce moment ?', followUp: ['Est-ce que tu te compares à ton corps d\'avant ?', 'Ton corps a fait quelque chose d\'extraordinaire.'], tips: ['9 mois pour changer, au moins 9 pour récupérer.', 'Le stress bloque la perte de poids.'] }
];

const EXERCISES: ExerciseData[] = [
  { id: 'breath', icon: '🌬️', title: 'Respiration 4-7-8', duration: '2 min', color: '#e8d5f2', desc: 'Technique de respiration apaisante.', steps: ['Trouve une position confortable', 'Expire complètement par la bouche', 'Inspire par le nez en comptant jusqu\'à 4', 'Retiens ta respiration en comptant jusqu\'à 7', 'Expire lentement par la bouche en comptant jusqu\'à 8', 'Répète ce cycle 4 fois'] },
  { id: 'ground', icon: '🌳', title: 'Ancrage 5-4-3-2-1', duration: '3 min', color: '#d5e5f2', desc: 'Technique de retour au présent.', steps: ['Nomme 5 choses que tu VOIS', 'Nomme 4 choses que tu peux TOUCHER', 'Nomme 3 choses que tu ENTENDS', 'Nomme 2 choses que tu SENS', 'Nomme 1 chose que tu peux GOÛTER', 'Respire profondément.'] },
  { id: 'compassion', icon: '💜', title: 'Auto-compassion', duration: '4 min', color: '#f2d5e8', desc: 'Apprends à te parler avec douceur.', steps: ['Pose tes mains sur ton cœur', 'Reconnais ce moment difficile', 'Rappelle-toi que tu n\'es pas seule', 'Dis-toi : "Je mérite de la douceur"', 'Reste un moment avec cette chaleur'] },
  { id: 'bodyscan', icon: '🧘', title: 'Scan corporel', duration: '5 min', color: '#d5f2e8', desc: 'Reconnecte-toi à ton corps.', steps: ['Allonge-toi confortablement', 'Ferme les yeux et respire', 'Porte ton attention sur tes pieds', 'Remonte doucement vers le haut', 'Continue vers le visage', 'Ressens ton corps entier'] },
  { id: 'kegel', icon: '🌸', title: 'Exercices du périnée', duration: '5 min', color: '#f2ead5', isKegel: true, desc: 'Renforce ton plancher pelvien.', levels: [{ name: 'Doux', hold: 3, rest: 6, reps: 8 }] },
  { id: 'sleep', icon: '😴', title: 'Micro-sieste guidée', duration: '10 min', color: '#e5d5f2', desc: 'Récupère rapidement.', steps: ['Allonge-toi dans un endroit calme', 'Mets un timer de 10 minutes', 'Ferme les yeux, respire lentement', 'Relâche chaque muscle', 'Laisse tes pensées passer', 'Juste te reposer'] }
];

const CATEGORIES = [
  { id: 'body', icon: '🌸', label: 'Corps', color: '#e8d5f2', desc: 'Récupération physique' },
  { id: 'mind', icon: '💜', label: 'Mental', color: '#d5d5f2', desc: 'Émotions, baby blues' },
  { id: 'baby', icon: '👶', label: 'Bébé', color: '#d5e5f2', desc: 'Soins, développement' }
];

const ARTICLES = [
  { id: 'blues', cat: 'mind', title: 'Baby blues ou dépression ?', readTime: '3 min', content: '**Le baby blues**\nC\'est normal et très fréquent (50-80% des mamans).\n\n**La dépression post-partum**\nC\'est différent et plus sérieux.\n\n**Important** : La dépression post-partum se soigne très bien.' },
  { id: 'rage', cat: 'mind', title: 'La rage maternelle', readTime: '2 min', content: '**C\'est quoi ?**\nDes montées de colère intenses.\n\n**Ce n\'est PAS qui tu es.**' },
  { id: 'corps', cat: 'body', title: 'Ton corps après bébé', readTime: '3 min', content: '**Sois patiente avec toi**\n9 mois pour changer, donne-toi au moins autant.' },
  { id: 'sommeil', cat: 'body', title: 'Survivre au manque de sommeil', readTime: '2 min', content: '**C\'est VRAIMENT dur**\nLa privation de sommeil est difficile.' },
  { id: 'allaitement', cat: 'baby', title: 'Allaitement sans pression', readTime: '3 min', content: '**Peu importe ton choix**\nSein, biberon, mixte... Le meilleur choix est celui qui fonctionne pour TOI.' }
];

const SOS = [{ name: '3114', number: '3114', desc: '24h/24', urgent: true }];
const BABY_EVENTS = [{ id: 'birth', icon: '🎂', label: 'Naissance' }, { id: 'smile', icon: '😊', label: 'Sourire' }];

const Q_SECTIONS: QuestionSection[] = [
  { id: 'emotions', title: 'Tes émotions', intro: 'Parlons un peu de ce que tu ressens. 💜', questions: [
    { id: 'e1', q: 'Est-ce qu\'il t\'arrive de te sentir triste ou vide ?', opts: [{ v: 0, l: 'Non, pas vraiment' }, { v: 1, l: 'De temps en temps' }, { v: 2, l: 'Assez souvent' }, { v: 3, l: 'Presque tout le temps' }], axis: 'sadness' },
    { id: 'e2', q: 'Est-ce que tu ressens parfois de l\'anxiété ?', opts: [{ v: 0, l: 'Non, ça va' }, { v: 1, l: 'Ça m\'arrive' }, { v: 2, l: 'Assez souvent' }, { v: 3, l: 'C\'est très présent' }], axis: 'anxiety' },
    { id: 'e3', q: 'Et la colère ? Des montées de rage ?', opts: [{ v: 0, l: 'Rarement' }, { v: 1, l: 'Parfois' }, { v: 2, l: 'Souvent' }, { v: 3, l: 'Très souvent' }], axis: 'anger' },
    { id: 'e4', q: 'Est-ce qu\'il t\'arrive d\'avoir des pensées de te faire du mal ?', opts: [{ v: 0, l: 'Non, jamais' }, { v: 1, l: 'Ça m\'a traversé l\'esprit' }, { v: 2, l: 'Parfois' }, { v: 3, l: 'Souvent' }], critical: true }
  ], summary: (a) => Object.values(a).reduce((x, y) => x + y, 0) >= 5 ? 'Période émotionnellement chargée. C\'est courageux d\'en parler. 💜' : 'Merci pour ta confiance. 💜' },
  { id: 'sleep', title: 'Ton sommeil', intro: 'Le sommeil, c\'est souvent compliqué...', questions: [
    { id: 's1', q: 'Combien d\'heures dors-tu par nuit ?', opts: [{ v: 3, l: 'Moins de 3h 😴' }, { v: 2, l: 'Entre 3 et 4h' }, { v: 1, l: 'Entre 4 et 6h' }, { v: 0, l: 'Plus de 6h' }], axis: 'sleep' },
    { id: 's2', q: 'Ton niveau de fatigue ?', opts: [{ v: 0, l: 'Ça va' }, { v: 1, l: 'Fatiguée mais ça va' }, { v: 2, l: 'Vraiment fatiguée' }, { v: 3, l: 'Épuisée' }], axis: 'sleep' }
  ], summary: (a) => Object.values(a).reduce((x, y) => x + y, 0) >= 3 ? 'La fatigue est réelle et difficile. Tu mérites du repos. 💜' : 'Tu arrives à récupérer un peu ! 💜' },
  { id: 'body', title: 'Ton corps', intro: 'Ton corps a traversé quelque chose d\'immense.', questions: [
    { id: 'b1', q: 'Comment te sens-tu dans ton corps ?', opts: [{ v: 0, l: 'Plutôt en paix' }, { v: 1, l: 'J\'apprends à l\'accepter' }, { v: 2, l: 'C\'est difficile' }, { v: 3, l: 'Je ne me reconnais plus' }], axis: 'body' },
    { id: 'b2', q: 'La question du poids te pèse ?', opts: [{ v: 0, l: 'Non, pas trop' }, { v: 1, l: 'Un peu' }, { v: 2, l: 'Oui, beaucoup' }, { v: 3, l: 'Source de stress' }], axis: 'body' }
  ], summary: (a) => (a.b1 ?? 0) >= 2 || (a.b2 ?? 0) >= 2 ? 'Relation avec ton corps compliquée. On peut travailler dessus. 💜' : 'Tu prends soin de toi ! 💜' },
  { id: 'support', title: 'Ton entourage', intro: 'Être bien entourée, ça change tout.', questions: [
    { id: 'd1', q: 'Est-ce que tu te sens soutenue ?', opts: [{ v: 0, l: 'Oui, bien entourée' }, { v: 1, l: 'Un peu, mais pas assez' }, { v: 2, l: 'Pas vraiment' }, { v: 3, l: 'Je me sens seule' }], axis: 'isolation' }
  ], summary: (a) => (a.d1 ?? 0) >= 2 ? 'Se sentir isolée, c\'est difficile. Tu n\'es pas seule. 💜' : 'C\'est bien d\'avoir du soutien ! 💜' }
];

const ONBOARDING = [
  { id: 'welcome', type: 'message', text: 'Salut ! Je suis Éclore 🌸\n\nOn fait connaissance ?' },
  { id: 'name', type: 'input', text: 'Ton prénom ?', placeholder: 'Prénom', field: 'name' },
  { id: 'babyName', type: 'input', text: 'Et ton bébé ?', placeholder: 'Prénom', field: 'babyName' },
  { id: 'babyDate', type: 'date', text: 'Date de naissance ?', field: 'babyDate' },
  { id: 'feeding', type: 'choice', text: 'Alimentation ?', field: 'feeding', options: [{ value: 'breast', label: '🤱 Allaitement' }, { value: 'bottle', label: '🍼 Biberon' }, { value: 'mixed', label: '🤱🍼 Mixte' }, { value: 'weaned', label: '✓ Sevré' }] },
  { id: 'feel', type: 'choice', text: 'Comment tu te sens ?', field: 'initialMood', options: [{ value: 1, label: '😢 Difficile' }, { value: 2, label: '😐 Ça va' }, { value: 3, label: '🙂 Bien' }] },
  { id: 'end', type: 'done' }
];

const getWeek = (d?: string) => d ? Math.max(0, Math.floor((new Date().getTime() - new Date(d).getTime()) / 604800000)) : 0;

const analyzeAxes = (answers: Record<string, number>): AxisAnalysis[] => {
  const scores: Record<string, number> = { anxiety: 0, sadness: 0, sleep: 0, anger: 0, isolation: 0, body: 0 };
  Q_SECTIONS.forEach(s => s.questions.forEach(q => { if (q.axis && answers[q.id] !== undefined) scores[q.axis] += answers[q.id]; }));
  return Object.entries(scores).map(([axisId, score]) => {
    const axis = AXES.find(a => a.id === axisId)!;
    return { ...axis, id: axisId, score };
  }).sort((a, b) => b.score - a.score);
};

// Secondary Selector Component
function SecondarySelector({ axes, onSelect, onSkip, S, t }: { axes: AxisAnalysis[]; onSelect: (ids: string[]) => void; onSkip: () => void; S: Record<string, unknown>; t: Theme }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => {
    if (selected.includes(id)) setSelected(selected.filter(x => x !== id));
    else if (selected.length < 2) setSelected([...selected, id]);
  };
  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {axes.map(a => <button className="btn-option" key={a.id} onClick={() => toggle(a.id)} style={{ ...(S.card as React.CSSProperties), padding: '14px', textAlign: 'left', cursor: 'pointer', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '12px', border: selected.includes(a.id) ? `2px solid ${t.accent}` : 'none', background: selected.includes(a.id) ? `${t.accent}10` : t.card }}><span style={{ fontSize: '24px' }}>{a.icon}</span><div style={{ flex: 1 }}><p style={{ fontWeight: '500' }}>{a.label}</p></div>{selected.includes(a.id) && <span style={{ color: t.accent }}>✓</span>}</button>)}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-primary" onClick={() => onSelect(selected)} style={{ ...(S.btn as (f: boolean) => React.CSSProperties)(true), flex: 1 }}>{selected.length > 0 ? `Valider (${selected.length})` : 'Valider'}</button>
        <button className="btn-sm" onClick={onSkip} style={S.btnSm as React.CSSProperties}>Passer</button>
      </div>
    </div>
  );
}

// Main Component
export default function Eclore({ user, initialProfile, onSignOut }: EcloreProps) {
  const supabase = createClient();

  const [dark, setDark] = useState(false);
  const [screen, setScreen] = useState<'welcome' | 'onboarding' | 'main'>(initialProfile?.name ? 'main' : 'welcome');
  const [tab, setTab] = useState('home');
  const [modal, setModal] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>(initialProfile || {});
  const [profileComplete, setProfileComplete] = useState(false);
  const [qAnswers, setQAnswers] = useState<Record<string, number>>({});
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [axesAnalysis, setAxesAnalysis] = useState<AxisAnalysis[] | null>(null);
  const [selectedAxes, setSelectedAxes] = useState<{ primary: string | null; secondary: string[] }>({ primary: null, secondary: [] });
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [exercisesDone, setExercisesDone] = useState<Exercise[]>([]);
  const [babyEvents, setBabyEvents] = useState<BabyEvent[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [onboardStep, setOnboardStep] = useState(0);
  const [onboardMessages, setOnboardMessages] = useState<OnboardMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [moodResponse, setMoodResponse] = useState<MoodResponse | null>(null);
  const [currentExercise, setCurrentExercise] = useState<ExerciseData | null>(null);
  const [exerciseStep, setExerciseStep] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<typeof ARTICLES[0] | null>(null);
  const [newEventType, setNewEventType] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [currentSection, setCurrentSection] = useState<QuestionSection | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [isLoading, setIsLoading] = useState(false);
  const [sectionAnswers, setSectionAnswers] = useState<Record<string, number>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);
  const onboardEndRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const week = getWeek(profile.babyDate);
  const streak = checkIns.length;
  const profileCompletion = Math.round((completedSections.length / Q_SECTIONS.length) * 100);
  const waterPercent = Math.min((waterIntake / waterGoal) * 100, 100);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      // Load check-ins
      const { data: checkInsData } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (checkInsData) {
        setCheckIns(checkInsData.map(c => ({ mood: c.mood, date: c.date, note: c.note })));
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCI = checkInsData.find(c => c.date === todayStr);
        if (todayCI) setTodayCheckIn({ mood: todayCI.mood, date: todayCI.date });
      }

      // Load exercises completed
      const { data: exercisesData } = await supabase
        .from('exercises_completed')
        .select('exercise_id')
        .eq('user_id', user.id);
      if (exercisesData) setExercisesDone(exercisesData.map(e => ({ id: e.exercise_id })));

      // Load water intake for today
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: waterData } = await supabase
        .from('water_intake')
        .select('amount_ml')
        .eq('user_id', user.id)
        .eq('date', todayStr);
      if (waterData) {
        const total = waterData.reduce((sum, w) => sum + w.amount_ml, 0);
        setWaterIntake(total);
      }

      // Load selected axes
      const { data: axesData } = await supabase
        .from('selected_axes')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (axesData) {
        setSelectedAxes({ primary: axesData.primary_axis, secondary: axesData.secondary_axes || [] });
        setProfileComplete(true);
      }

      // Load chat messages
      const { data: messagesData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);
      if (messagesData && messagesData.length > 0) {
        setChatHistory(messagesData.map(m => ({ role: m.role as 'user' | 'ai', text: m.content })));
      }
    };
    loadData();
  }, [user.id, supabase]);

  // Water goal based on feeding
  useEffect(() => {
    if (profile.feeding === 'breast' || profile.feeding === 'mixed') {
      setWaterGoal(2500);
    } else {
      setWaterGoal(2000);
    }
  }, [profile.feeding]);

  // Auto-scroll
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (onboardEndRef.current) onboardEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [onboardMessages]);

  // Onboarding messages
  useEffect(() => {
    if (screen !== 'onboarding') return;
    const step = ONBOARDING[onboardStep];
    if (!step || onboardMessages.some(m => m.step === step.id)) return;
    const text = step.text?.replace('{babyName}', profile.babyName || 'bébé');
    if (text) setOnboardMessages(m => [...m, { role: 'ai', text, step: step.id }]);
  }, [screen, onboardStep, profile, onboardMessages]);

  useEffect(() => {
    setInputValue('');
  }, [onboardStep]);

  const t: Theme = dark
    ? { bg: '#1a1a2e', card: 'rgba(255,255,255,0.06)', text: '#f5f5f5', soft: 'rgba(255,255,255,0.5)', accent: '#BEAEE2', accent2: '#F7DBF0', mint: '#CBEBCE', turquoise: '#CDF0EA', border: 'rgba(255,255,255,0.08)', success: '#CBEBCE', danger: '#e8a5a5' }
    : { bg: '#FAFBFC', card: '#FFFFFF', text: '#2D2D3A', soft: '#9D9DAF', accent: '#BEAEE2', accent2: '#F7DBF0', mint: '#CBEBCE', turquoise: '#CDF0EA', border: 'rgba(0,0,0,0.04)', success: '#9BCFB0', danger: '#E8A5A5' };

  const S = {
    page: { minHeight: '100vh', background: dark ? '#1a1a2e' : '#FDF8F6', fontFamily: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: t.text, fontWeight: '300', letterSpacing: '0.2px' },
    card: { background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)', borderRadius: '24px', padding: '24px', boxShadow: dark ? 'none' : '0 2px 16px rgba(190, 174, 226, 0.06)', marginBottom: '16px', backdropFilter: 'blur(10px)', border: 'none' },
    btn: (f: boolean) => ({ padding: '18px 36px', borderRadius: '60px', border: 'none', background: f ? `linear-gradient(135deg, ${t.accent} 0%, ${t.accent2} 100%)` : 'rgba(255,255,255,0.8)', color: f ? '#fff' : t.text, cursor: 'pointer', fontSize: '15px', fontWeight: '400', width: '100%', letterSpacing: '0.5px', boxShadow: f ? '0 12px 32px rgba(190, 174, 226, 0.35)' : 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }),
    btnSm: { padding: '14px 24px', borderRadius: '50px', border: 'none', background: 'rgba(255,255,255,0.6)', color: t.text, cursor: 'pointer', fontSize: '14px', fontWeight: '400', letterSpacing: '0.3px', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease' },
    input: { width: '100%', padding: '18px 24px', borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.7)', color: t.text, fontSize: '16px', outline: 'none', boxSizing: 'border-box' as const, backdropFilter: 'blur(8px)', fontWeight: '300', letterSpacing: '0.2px', transition: 'all 0.2s ease' },
    full: { position: 'fixed' as const, inset: 0, background: dark ? '#1a1a2e' : '#FDF8F6', zIndex: 100, overflow: 'auto' }
  };

  const up = useCallback((k: string, v: string | number) => setProfile(p => ({ ...p, [k]: v })), []);

  // Save profile to Supabase
  const saveProfile = async (newProfile: Profile) => {
    await supabase.from('profiles').upsert({
      id: user.id,
      name: newProfile.name,
      baby_name: newProfile.babyName,
      baby_date: newProfile.babyDate,
      feeding: newProfile.feeding,
      initial_mood: newProfile.initialMood?.toString()
    });
  };

  // Add water and save
  const addWater = async (ml: number) => {
    const newIntake = Math.min(waterIntake + ml, 5000);
    setWaterIntake(newIntake);
    await supabase.from('water_intake').insert({
      user_id: user.id,
      amount_ml: ml,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const respond = (value: string | number) => {
    const step = ONBOARDING[onboardStep] as { field?: string; options?: { value: string | number; label: string }[]; type: string };
    if (step.field) up(step.field, value);
    const display = step.options?.find(o => o.value === value)?.label || (step.type === 'date' ? new Date(value as string).toLocaleDateString('fr-FR') : String(value));
    setOnboardMessages(m => [...m, { role: 'user', text: display }]);
    setTimeout(() => {
      const next = onboardStep + 1;
      if (ONBOARDING[next]?.type === 'done') {
        setOnboardMessages(m => [...m, { role: 'ai', text: `Parfait ${profile.name || ''} ! 🌸\n\nJ'ai encore quelques questions pour mieux comprendre comment tu te sens.\n\nTu préfères continuer maintenant ou découvrir ton espace d'abord ?`, showChoice: true }]);
      } else {
        setOnboardStep(next);
      }
    }, 400);
    setInputValue('');
  };

  const finishOnboarding = async (continueQ: boolean) => {
    const finalProfile = { ...profile };
    await saveProfile(finalProfile);

    if (profile.babyDate) setBabyEvents([{ id: Date.now(), type: 'birth', date: profile.babyDate, label: 'Naissance', icon: '🎂' }]);
    setScreen('main');

    if (continueQ) {
      setChatHistory([{ role: 'ai', text: `C'est parti ! Ces questions vont m'aider à personnaliser ton accompagnement. 💜` }]);
      setTimeout(() => {
        setTab('chat');
        const first = Q_SECTIONS.find(s => !completedSections.includes(s.id));
        if (first) startSection(first);
      }, 500);
    } else {
      setChatHistory([{ role: 'ai', text: `Coucou ${profile.name} ! 💜\n\nQuand tu voudras, on pourra continuer le questionnaire.\n\nEn attendant, explore ton espace !`, showStart: !profileComplete }]);
    }
  };

  const startQ = () => { setTab('chat'); const first = Q_SECTIONS.find(s => !completedSections.includes(s.id)); if (first) startSection(first); };

  const startSection = (section: QuestionSection) => {
    setCurrentSection(section); setCurrentQIndex(0); setSectionAnswers({});
    setChatHistory(h => [...h, { role: 'ai', text: `📝 **${section.title}** (${completedSections.length + 1}/${Q_SECTIONS.length})\n\n${section.intro}` }]);
    setTimeout(() => { const q = section.questions[0]; setChatHistory(h => [...h, { role: 'ai', text: q.q, isQ: true, qId: q.id, opts: q.opts }]); }, 600);
  };

  const answerQ = async (qId: string, value: number, label: string) => {
    const newA = { ...sectionAnswers, [qId]: value }; setSectionAnswers(newA); setQAnswers(a => ({ ...a, [qId]: value }));
    setChatHistory(h => [...h, { role: 'user', text: label }]);

    // Save to Supabase
    if (currentSection) {
      await supabase.from('questionnaire_answers').insert({
        user_id: user.id,
        question_id: qId,
        section_id: currentSection.id,
        answer_value: value,
        answer_label: label
      });
    }

    const q = currentSection?.questions.find(x => x.id === qId);
    if (q?.critical && value >= 2) setTimeout(() => setChatHistory(h => [...h, { role: 'ai', text: 'Tu n\'es pas seule. 3114 dispo 24h/24.', showSOS: true }]), 500);
    setTimeout(() => {
      const nextI = currentQIndex + 1;
      if (currentSection && nextI < currentSection.questions.length) {
        setCurrentQIndex(nextI);
        const nextQ = currentSection.questions[nextI];
        setChatHistory(h => [...h, { role: 'ai', text: nextQ.q, isQ: true, qId: nextQ.id, opts: nextQ.opts }]);
      } else {
        finishSection(newA);
      }
    }, q?.critical && value >= 2 ? 2000 : 600);
  };

  const finishSection = async (answers: Record<string, number>) => {
    if (!currentSection) return;
    setChatHistory(h => [...h, { role: 'ai', text: currentSection.summary(answers) }]);
    const newCompleted = [...completedSections, currentSection.id];
    setCompletedSections(newCompleted);
    setCurrentSection(null);

    // Save completed section
    await supabase.from('completed_sections').insert({
      user_id: user.id,
      section_id: currentSection.id
    });

    setTimeout(() => {
      const next = Q_SECTIONS.find(s => !newCompleted.includes(s.id));
      if (next) setChatHistory(h => [...h, { role: 'ai', text: 'On continue ?', showContinue: true, nextSection: next }]);
      else finishQ();
    }, 800);
  };

  const finishQ = () => {
    const analysis = analyzeAxes(qAnswers); setAxesAnalysis(analysis);
    const relevant = analysis.filter(a => a.score > 0).slice(0, 4);
    setChatHistory(h => [...h, { role: 'ai', text: `Merci ${profile.name} 💜\n\nVoici ce que j'ai remarqué:\n\n${relevant.map(a => `• ${a.icon} **${a.label}**`).join('\n')}\n\nPriorité ?`, showAxes: true, axes: relevant }]);
  };

  const selectPrimary = (id: string) => {
    setSelectedAxes(s => ({ ...s, primary: id }));
    const axis = AXES.find(a => a.id === id);
    setChatHistory(h => [...h, { role: 'user', text: `${axis?.icon} ${axis?.label}` }, { role: 'ai', text: `On travaille sur ça ! Tu peux choisir 2 axes secondaires.`, showSecondary: true, primaryId: id }]);
  };

  const selectSecondary = async (ids: string[]) => {
    setSelectedAxes(s => ({ ...s, secondary: ids }));
    const primary = AXES.find(a => a.id === selectedAxes.primary);

    // Save to Supabase
    await supabase.from('selected_axes').upsert({
      user_id: user.id,
      primary_axis: selectedAxes.primary,
      secondary_axes: ids
    });

    let txt = `🎯 **Priorité:** ${primary?.icon} ${primary?.label}\n`;
    if (ids.length) txt += `📌 **Aussi:** ${ids.map(id => AXES.find(a => a.id === id)).map(a => `${a?.icon} ${a?.label}`).join(', ')}\n`;

    setChatHistory(h => [...h, { role: 'ai', text: txt }]);
    setProfileComplete(true);

    setTimeout(() => {
      const exerciseNames = primary?.exercises.map(id => EXERCISES.find(e => e.id === id)?.title).join(', ');
      setChatHistory(h => [...h, { role: 'ai', text: `📅 **TON PROGRAMME**\n\n• Check-in quotidien\n• Exercices recommandés : ${exerciseNames}\n\n💜 Je suis là pour t'accompagner.` }]);
      setTimeout(() => {
        setChatHistory(h => [...h, { role: 'ai', text: `💬 **Commençons...**\n\n${primary?.startQ}` }]);
      }, 1000);
    }, 800);
  };

  const skipSecondary = async () => {
    const primary = AXES.find(a => a.id === selectedAxes.primary);

    await supabase.from('selected_axes').upsert({
      user_id: user.id,
      primary_axis: selectedAxes.primary,
      secondary_axes: []
    });

    setChatHistory(h => [...h, { role: 'ai', text: `Focus sur ${primary?.icon} ${primary?.label} !` }]);
    setProfileComplete(true);

    setTimeout(() => {
      setChatHistory(h => [...h, { role: 'ai', text: `💬 **Commençons...**\n\n${primary?.startQ}` }]);
    }, 800);
  };

  const checkIn = async (mood: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setTodayCheckIn({ mood, date: todayStr });
    setCheckIns([...checkIns, { mood, date: todayStr }]);

    // Save to Supabase
    await supabase.from('check_ins').upsert({
      user_id: user.id,
      mood,
      date: todayStr
    });

    const axis = AXES.find(a => a.id === selectedAxes.primary);
    const text = mood <= 2 ? 'Journée difficile. Pas seule.' : mood === 3 ? '"Bof" c\'est honnête.' : 'Super ! 💜';
    const actions = mood <= 2 ? [{ label: 'Parler', act: 'chat' }, { label: '🌬️', act: 'ex', id: axis?.exercises[0] || 'breath' }] : [{ label: 'Ok', act: 'close' }];
    setMoodResponse({ text, actions });
  };

  const openChat = () => {
    if (!chatHistory.length) setChatHistory([{ role: 'ai', text: `Coucou ${profile.name} ! 💜`, showStart: !profileComplete }]);
    setTab('chat');
  };

  const sendChat = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMessage = chatInput;
    setChatHistory(h => [...h, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
            role: m.role === 'ai' ? 'assistant' : m.role,
            content: m.text
          })), { role: 'user', content: userMessage }]
        })
      });

      const data = await response.json();
      if (data.response) {
        setChatHistory(h => [...h, { role: 'ai', text: data.response }]);
      }
    } catch {
      setChatHistory(h => [...h, { role: 'ai', text: 'Désolée, je n\'ai pas pu répondre. Réessaie. 💜' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const openEx = (ex: ExerciseData) => { setCurrentExercise(ex); setExerciseStep(0); setModal('exercise'); };

  const doneEx = async () => {
    if (currentExercise) {
      setExercisesDone([...exercisesDone, { id: currentExercise.id }]);
      setExerciseStep(currentExercise.steps?.length || 0);

      await supabase.from('exercises_completed').insert({
        user_id: user.id,
        exercise_id: currentExercise.id
      });
    }
  };

  const addEvent = async () => {
    if (!newEventType || !newEventDate) return;
    const def = BABY_EVENTS.find(e => e.id === newEventType);
    setBabyEvents([...babyEvents, { id: Date.now(), type: newEventType, icon: def?.icon, date: newEventDate, label: def?.label }]);

    await supabase.from('baby_events').insert({
      user_id: user.id,
      event_type: newEventType,
      event_date: newEventDate
    });

    setNewEventType('');
    setNewEventDate('');
    setModal(null);
  };

  // WELCOME SCREEN
  if (screen === 'welcome') return (
    <div style={{
      ...S.page,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px 32px',
      textAlign: 'center',
      background: `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(247,219,240,0.5) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(205,240,234,0.4) 0%, transparent 50%), #FDF8F6`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ marginBottom: '48px', position: 'relative', zIndex: 1 }}><GlassOrb size={140} /></div>
      <h1 style={{ fontSize: '48px', fontWeight: '200', marginBottom: '16px', color: t.text, letterSpacing: '2px', position: 'relative', zIndex: 1 }}>éclore</h1>
      <p style={{ color: t.soft, fontSize: '16px', marginBottom: '80px', fontWeight: '300', letterSpacing: '1.5px', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>ton compagnon post-partum</p>
      <button className="btn-primary" style={{ ...S.btn(true), maxWidth: '260px', fontSize: '15px', letterSpacing: '1px', position: 'relative', zIndex: 1 }} onClick={() => { setScreen('onboarding'); setOnboardStep(0); }}>Commencer</button>
    </div>
  );

  // ONBOARDING SCREEN
  if (screen === 'onboarding') {
    const step = ONBOARDING[onboardStep] as { id: string; type: string; text?: string; placeholder?: string; field?: string; options?: { value: string | number; label: string }[] };
    const last = onboardMessages[onboardMessages.length - 1];
    const wait = last?.role === 'ai' && !last?.isDone && step;

    return (
      <div style={{ ...S.page, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: `radial-gradient(ellipse 60% 30% at 80% 10%, rgba(247,219,240,0.3) 0%, transparent 50%), #FDF8F6` }}>
        <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <EcloreLogo size={32} color={t.accent} />
          <span style={{ fontWeight: '300', fontSize: '18px', color: t.text, letterSpacing: '1px' }}>éclore</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px' }}>
          {onboardMessages.map((m, i) => (
            <div key={i} style={{ marginBottom: '16px', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '82%', padding: '18px 24px', borderRadius: m.role === 'user' ? '24px 24px 8px 24px' : '24px 24px 24px 8px', background: m.role === 'user' ? `linear-gradient(135deg, ${t.accent}, ${t.accent2})` : 'rgba(255,255,255,0.7)', color: m.role === 'user' ? '#fff' : t.text, fontSize: '15px', lineHeight: 1.8, whiteSpace: 'pre-line', fontWeight: '300', letterSpacing: '0.2px', boxShadow: m.role === 'user' ? '0 8px 24px rgba(190,174,226,0.3)' : '0 2px 12px rgba(0,0,0,0.03)', backdropFilter: 'blur(8px)' }}>{m.text}</div>
            </div>
          ))}
          <div ref={onboardEndRef} />
        </div>
        <div style={{ padding: '20px 24px 36px' }}>
          {last?.showChoice ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn-primary" style={S.btn(true)} onClick={() => finishOnboarding(true)}>Continuer le questionnaire</button>
              <button className="btn-sm" style={{ ...S.btnSm, background: 'rgba(255,255,255,0.5)', border: 'none' }} onClick={() => finishOnboarding(false)}>Découvrir mon espace d&apos;abord</button>
            </div>
          ) : wait && step.type === 'input' ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' && inputValue && respond(inputValue)} placeholder={step.placeholder} style={S.input} autoFocus />
              <button className="btn-send" onClick={() => inputValue && respond(inputValue)} style={{ ...S.btn(true), width: '56px' }}>{Icons.send(dark ? t.bg : '#fff')}</button>
            </div>
          ) : wait && step.type === 'date' ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <input type="date" value={inputValue} onChange={e => setInputValue(e.target.value)} style={{ ...S.input, colorScheme: dark ? 'dark' : 'light' }} />
              <button className="btn-send" onClick={() => inputValue && respond(inputValue)} style={{ ...S.btn(true), width: '56px', opacity: inputValue ? 1 : 0.5 }}>{Icons.send(dark ? t.bg : '#fff')}</button>
            </div>
          ) : wait && step.type === 'choice' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {step.options?.map(o => <button className="btn-option" key={String(o.value)} onClick={() => respond(o.value)} style={{ ...S.card, padding: '16px', textAlign: 'left', cursor: 'pointer', marginBottom: 0 }}>{o.label}</button>)}
            </div>
          ) : wait && step.type === 'message' ? (
            <button className="btn-primary" style={S.btn(true)} onClick={() => setOnboardStep(s => s + 1)}>Continuer</button>
          ) : null}
        </div>
      </div>
    );
  }

  // MAIN SCREEN
  if (screen === 'main') {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
    const primary = AXES.find(a => a.id === selectedAxes.primary);

    const getDailyMsg = () => {
      if (!primary) return `Nouvelle journée, ${profile.name}. Je suis là. 💜`;
      const messages: Record<string, string[]> = {
        anxiety: [`Une journée à la fois, ${profile.name}.`, `Respire. Tu es en sécurité. 💜`],
        sadness: [`La tristesse est passagère, ${profile.name}.`, `Sois douce avec toi aujourd'hui.`],
        sleep: [`Repose-toi dès que tu peux, ${profile.name}.`, `Même une micro-sieste compte. 💜`],
        anger: [`Tes émotions sont valides, ${profile.name}.`, `Tu fais de ton mieux.`],
        isolation: [`Tu n'es pas seule, ${profile.name}.`, `Une petite sortie aujourd'hui ? 💜`],
        body: [`Ton corps a fait quelque chose d'extraordinaire, ${profile.name}.`, `Sois patiente avec toi. 💜`]
      };
      const axisMessages = messages[selectedAxes.primary || ''] || [];
      return axisMessages[Math.floor(Math.random() * axisMessages.length)] || `Focus: ${primary.label.toLowerCase()}. 💜`;
    };

    return (
      <div style={{ ...S.page, background: `radial-gradient(ellipse 70% 35% at 90% 5%, rgba(247,219,240,0.35) 0%, transparent 50%), #FDF8F6` }}>
        <header style={{ padding: '28px 28px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '12px', color: t.soft, marginBottom: '6px', fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>{days[today.getDay()]} {today.getDate()} {months[today.getMonth()]}</p>
            <h1 style={{ fontSize: '26px', fontWeight: '200', letterSpacing: '0.5px' }}>Hello <span style={{ fontWeight: '400' }}>{profile.name}</span></h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-icon" onClick={() => setDark(!dark)} style={{ background: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              {dark ? Icons.sun(t.text) : Icons.moon(t.soft)}
            </button>
            <button className="btn-icon" onClick={onSignOut} style={{ background: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', fontSize: '12px' }}>
              👋
            </button>
          </div>
        </header>

        <main style={{ padding: '0 24px 140px' }}>
          {tab === 'home' && (
            <>
              {/* Message du jour */}
              <div style={{ ...S.card, background: 'rgba(255,255,255,0.5)', padding: '28px', position: 'relative', overflow: 'hidden' }}>
                <p style={{ fontSize: '17px', lineHeight: 1.8, fontWeight: '300', position: 'relative', zIndex: 1 }}>{getDailyMsg()}</p>
              </div>

              {/* Chat Orb */}
              <div className="card-clickable" style={{ ...S.card, cursor: 'pointer', padding: '40px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.5)' }} onClick={openChat}>
                <div style={{ margin: '0 auto 24px', position: 'relative', display: 'inline-block' }}><GlassOrb size={120} notification={!profileComplete} /></div>
                <p style={{ fontSize: '20px', fontWeight: '300', marginBottom: '8px', color: t.text, letterSpacing: '0.5px' }}>Parler à Éclore</p>
                <p style={{ fontSize: '14px', color: t.soft, fontWeight: '300', letterSpacing: '0.3px' }}>Je suis là pour t&apos;écouter</p>
              </div>

              {/* Complete Profile */}
              {!profileComplete && (
                <div className="card-clickable" style={{ ...S.card, cursor: 'pointer', background: 'rgba(255,255,255,0.5)', border: 'none' }} onClick={startQ}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: `linear-gradient(135deg, ${t.accent}40, ${t.accent2}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.target(t.accent)}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '400', fontSize: '15px', letterSpacing: '0.2px' }}>Compléter mon profil</p>
                      <p style={{ fontSize: '13px', color: t.soft, fontWeight: '300' }}>Pour un accompagnement personnalisé</p>
                    </div>
                    <p style={{ fontSize: '18px', fontWeight: '300', color: t.accent }}>{profileCompletion}%</p>
                  </div>
                </div>
              )}

              {/* Check-in */}
              <div style={{ ...S.card, background: 'rgba(255,255,255,0.5)' }}>
                <p style={{ fontSize: '11px', color: t.soft, marginBottom: '8px', fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>Check-in du jour</p>
                {!todayCheckIn ? (
                  <>
                    <p style={{ fontSize: '17px', marginBottom: '20px', fontWeight: '300' }}>Comment tu te sens ?</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {MOODS.map(m => (
                        <button className="btn-mood" key={m.v} onClick={() => checkIn(m.v)} style={{ flex: 1, padding: '16px 8px', borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s ease', backdropFilter: 'blur(8px)' }}>
                          <span style={{ fontSize: '28px', display: 'block' }}>{m.e}</span>
                          <span style={{ fontSize: '10px', color: t.soft, fontWeight: '300', marginTop: '4px', display: 'block' }}>{m.l}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : moodResponse ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px', marginBottom: '20px', padding: '16px', borderRadius: '20px', background: 'rgba(255,255,255,0.6)' }}>
                      <span style={{ fontSize: '40px' }}>{MOODS.find(m => m.v === todayCheckIn.mood)?.e}</span>
                      <div>
                        <p style={{ fontWeight: '400', fontSize: '16px' }}>{MOODS.find(m => m.v === todayCheckIn.mood)?.l}</p>
                        <p style={{ fontSize: '12px', color: t.success, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '300' }}>{Icons.check(t.success)} Enregistré</p>
                      </div>
                    </div>
                    <p style={{ fontSize: '15px', marginBottom: '20px', lineHeight: 1.7, fontWeight: '300' }}>{moodResponse.text}</p>
                    <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                      <p style={{ fontSize: '11px', color: t.soft, marginBottom: '14px', fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>Comment t&apos;aider ?</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {moodResponse.actions.map((a, i) => (
                          <button className={i === 0 ? 'btn-primary' : 'btn-option'} key={i} onClick={() => { if (a.act === 'chat') openChat(); else if (a.act === 'ex') openEx(EXERCISES.find(e => e.id === a.id)!); else setMoodResponse(null); }} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '16px', border: 'none', background: i === 0 ? `linear-gradient(135deg, ${t.accent}, ${t.accent2})` : 'rgba(255,255,255,0.6)', color: i === 0 ? '#fff' : t.text, cursor: 'pointer', textAlign: 'left', boxShadow: i === 0 ? '0 6px 20px rgba(190,174,226,0.3)' : 'none' }}>
                            <span style={{ fontSize: '20px' }}>{a.act === 'chat' ? '💬' : a.act === 'ex' ? EXERCISES.find(e => e.id === a.id)?.icon : '✓'}</span>
                            <span style={{ fontWeight: '400', letterSpacing: '0.2px' }}>{a.act === 'chat' ? 'Parler à Éclore' : a.act === 'ex' ? EXERCISES.find(e => e.id === a.id)?.title : 'C\'est noté'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px', padding: '16px', borderRadius: '20px', background: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ fontSize: '36px' }}>{MOODS.find(m => m.v === todayCheckIn.mood)?.e}</span>
                    <div>
                      <p style={{ fontWeight: '500' }}>{MOODS.find(m => m.v === todayCheckIn.mood)?.l}</p>
                      <p style={{ fontSize: '12px', color: t.success, display: 'flex', alignItems: 'center', gap: '4px' }}>{Icons.check(t.success)} Check-in fait</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div style={S.card}>
                <p style={{ fontSize: '12px', color: t.soft, marginBottom: '16px', fontWeight: '500' }}>✨ Ta progression</p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${t.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{Icons.fire(t.accent)}</div>
                    <p style={{ fontSize: '20px', fontWeight: '600', color: t.accent }}>{streak}</p>
                    <p style={{ fontSize: '11px', color: t.soft }}>jours de suite</p>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${t.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{Icons.lotus(t.accent)}</div>
                    <p style={{ fontSize: '20px', fontWeight: '600', color: t.accent }}>{exercisesDone.length}</p>
                    <p style={{ fontSize: '11px', color: t.soft }}>exercices faits</p>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${t.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{Icons.calendar(t.accent)}</div>
                    <p style={{ fontSize: '20px', fontWeight: '600', color: t.accent }}>{week}</p>
                    <p style={{ fontSize: '11px', color: t.soft }}>{week <= 1 ? 'semaine' : 'semaines'} avec {profile.babyName || 'bébé'}</p>
                  </div>
                </div>
              </div>

              {/* Water */}
              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <p style={{ fontSize: '12px', color: t.soft, fontWeight: '500', letterSpacing: '0.3px' }}>💧 Hydratation</p>
                  <p style={{ fontSize: '12px', color: t.soft, fontWeight: '300' }}>Objectif : {(waterGoal / 1000).toFixed(1)}L</p>
                </div>
                <div style={{ height: '10px', background: `${t.turquoise}40`, borderRadius: '5px', marginBottom: '14px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${waterPercent}%`, background: `linear-gradient(90deg, ${t.turquoise}, ${t.mint})`, borderRadius: '5px', transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontSize: '26px', fontWeight: '400' }}>
                    <span style={{ color: waterPercent >= 100 ? t.success : t.text }}>{(waterIntake / 1000).toFixed(1)}</span>
                    <span style={{ fontSize: '16px', color: t.soft, fontWeight: '300' }}> / {(waterGoal / 1000).toFixed(1)}L</span>
                  </p>
                  {waterPercent >= 100 && <span style={{ color: t.success, fontSize: '13px', fontWeight: '500' }}>✓ Bravo !</span>}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-water" onClick={() => addWater(250)} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: `1px solid ${t.turquoise}40`, background: `${t.turquoise}15`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span>{Icons.water(t.turquoise)}</span>
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>+250ml</span>
                  </button>
                  <button className="btn-water-primary" onClick={() => addWater(500)} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', background: `linear-gradient(135deg, ${t.turquoise}, ${t.mint})`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#2D2D3A', fontWeight: '500', fontSize: '14px' }}>+500ml</button>
                  {waterIntake > 0 && <button className="btn-sm" onClick={() => setWaterIntake(0)} style={{ padding: '14px 16px', borderRadius: '16px', border: `1px solid ${t.border}`, background: 'transparent', cursor: 'pointer', fontSize: '12px', color: t.soft }}>Reset</button>}
                </div>
              </div>

              {/* Toolbox */}
              <div style={S.card}>
                <p style={{ fontSize: '12px', color: t.soft, marginBottom: '14px', fontWeight: '500' }}>🧰 Boîte à outils</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="btn-sos" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '16px', background: `${t.danger}08`, cursor: 'pointer' }} onClick={() => setModal('sos')}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${t.danger}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.phone(t.danger)}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '500', fontSize: '14px', color: t.danger }}>Besoin d&apos;aide urgente</p>
                      <p style={{ fontSize: '12px', color: t.soft }}>Numéros d&apos;écoute 24h/24</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
              <div style={{ flex: 1, overflow: 'auto', paddingBottom: '16px' }}>
                {chatHistory.map((m, i) => {
                  const isLastQuestion = m.isQ && m.opts && i === chatHistory.length - 1;
                  return (
                    <div key={i} style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '85%' }}>
                          <div style={{ padding: '16px 20px', borderRadius: m.role === 'user' ? '24px 24px 6px 24px' : '24px 24px 24px 6px', background: m.role === 'user' ? t.text : t.card, color: m.role === 'user' ? (dark ? t.bg : '#fff') : t.text, fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                            {m.text.split('**').map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
                          </div>
                          {isLastQuestion && (
                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {m.opts?.map(o => <button className="btn-option" key={o.v} onClick={() => answerQ(m.qId!, o.v, o.l)} style={{ ...S.card, padding: '14px', textAlign: 'left', cursor: 'pointer', marginBottom: 0 }}>{o.l}</button>)}
                            </div>
                          )}
                          {m.showStart && !profileComplete && <button className="btn-primary" onClick={startQ} style={{ ...S.btn(true), marginTop: '12px' }}>Commencer</button>}
                          {m.showContinue && m.nextSection && (
                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                              <button className="btn-primary" onClick={() => startSection(m.nextSection!)} style={S.btn(true)}>Continuer</button>
                              <button className="btn-sm" onClick={() => setChatHistory(h => [...h, { role: 'ai', text: 'OK !' }])} style={S.btnSm}>Plus tard</button>
                            </div>
                          )}
                          {m.showAxes && m.axes && (
                            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {m.axes.map(a => <button className="btn-option" key={a.id} onClick={() => selectPrimary(a.id)} style={{ ...S.card, padding: '14px', textAlign: 'left', cursor: 'pointer', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '24px' }}>{a.icon}</span><div><p style={{ fontWeight: '500' }}>{a.label}</p></div></button>)}
                            </div>
                          )}
                          {m.showSecondary && <SecondarySelector axes={axesAnalysis?.filter(a => a.id !== m.primaryId && a.score > 0).slice(0, 4) || []} onSelect={selectSecondary} onSkip={skipSecondary} S={S} t={t} />}
                          {m.showSOS && <button className="btn-sm" onClick={() => setModal('sos')} style={{ ...S.btnSm, marginTop: '10px', background: `${t.danger}20`, color: t.danger }}>📞 Aide</button>}
                          {m.suggest && <button className="btn-sm" onClick={() => openEx(EXERCISES.find(e => e.id === m.suggest)!)} style={{ ...S.btnSm, marginTop: '10px' }}>{EXERCISES.find(e => e.id === m.suggest)?.icon} Exercice</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isLoading && <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '14px' }}><div style={{ padding: '16px 20px', borderRadius: '24px 24px 24px 6px', background: t.card }}>...</div></div>}
                <div ref={chatEndRef} />
              </div>
              {!chatHistory.some(m => m.isQ && m.opts && chatHistory.indexOf(m) === chatHistory.length - 1) && (
                <div style={{ display: 'flex', gap: '12px', paddingTop: '12px' }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChat()} placeholder="Écris..." style={S.input} disabled={isLoading} />
                  <button className="btn-send" onClick={sendChat} disabled={isLoading}>{Icons.send('#2D2D3A')}</button>
                </div>
              )}
            </div>
          )}

          {tab === 'learn' && (
            <>
              <h2 style={{ fontSize: '26px', fontWeight: '300', marginBottom: '8px' }}>Apprendre</h2>
              <p style={{ fontSize: '14px', color: t.soft, marginBottom: '20px' }}>Des ressources pour mieux comprendre</p>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }}>{Icons.search(t.soft)}</div>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher un article..." style={{ ...S.input, paddingLeft: '50px' }} />
              </div>
              {searchQuery ? (
                <>
                  {ARTICLES.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).map(a => (
                    <div className="card-clickable" key={a.id} style={{ ...S.card, cursor: 'pointer' }} onClick={() => setSelectedArticle(a)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: CATEGORIES.find(c => c.id === a.cat)?.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{CATEGORIES.find(c => c.id === a.cat)?.icon}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '500' }}>{a.title}</p>
                          <p style={{ fontSize: '12px', color: t.soft }}>{a.readTime}</p>
                        </div>
                        {readArticles.includes(a.id) && <span style={{ color: t.success }}>{Icons.check(t.success)}</span>}
                      </div>
                    </div>
                  ))}
                </>
              ) : selectedCategory ? (
                <>
                  <button className="btn-back" onClick={() => setSelectedCategory(null)} style={{ ...S.btnSm, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>{Icons.back(t.text)} Retour</button>
                  {ARTICLES.filter(a => a.cat === selectedCategory).map(a => (
                    <div className="card-clickable" key={a.id} style={{ ...S.card, cursor: 'pointer' }} onClick={() => setSelectedArticle(a)}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontWeight: '500', marginBottom: '4px' }}>{a.title}</p>
                          <p style={{ fontSize: '12px', color: t.soft }}>{a.readTime}</p>
                        </div>
                        {readArticles.includes(a.id) && <span style={{ color: t.success }}>{Icons.check(t.success)}</span>}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {CATEGORIES.map(c => (
                    <div className="card-clickable" key={c.id} style={{ ...S.card, cursor: 'pointer', padding: '20px', marginBottom: 0 }} onClick={() => setSelectedCategory(c.id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `linear-gradient(135deg, ${c.color}40, ${c.color}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{c.icon}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '500', fontSize: '16px', marginBottom: '4px' }}>{c.label}</p>
                          <p style={{ fontSize: '13px', color: t.soft }}>{c.desc}</p>
                        </div>
                        <p style={{ fontSize: '13px', color: t.soft }}>{ARTICLES.filter(a => a.cat === c.id).length} →</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'exercises' && (
            <>
              <h2 style={{ fontSize: '26px', fontWeight: '300', marginBottom: '8px' }}>Exercices</h2>
              <p style={{ fontSize: '14px', color: t.soft, marginBottom: '20px' }}>Des moments de bien-être</p>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }}>{Icons.search(t.soft)}</div>
                <input type="text" value={exerciseSearch} onChange={e => setExerciseSearch(e.target.value)} placeholder="Rechercher..." style={{ ...S.input, paddingLeft: '50px' }} />
              </div>
              {EXERCISES.filter(ex => !exerciseSearch || ex.title.toLowerCase().includes(exerciseSearch.toLowerCase())).map(ex => (
                <div className="card-clickable" key={ex.id} style={{ ...S.card, cursor: 'pointer' }} onClick={() => openEx(ex)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: ex.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>{ex.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontWeight: '500' }}>{ex.title}</p>
                        {primary?.exercises.includes(ex.id) && <span style={{ padding: '2px 8px', borderRadius: '50px', background: `${t.accent}20`, color: t.accent, fontSize: '10px' }}>Recommandé</span>}
                      </div>
                      <p style={{ fontSize: '12px', color: t.soft, marginBottom: '6px' }}>{ex.duration}</p>
                      <p style={{ fontSize: '13px', color: t.soft, lineHeight: 1.4 }}>{ex.desc?.substring(0, 80)}...</p>
                    </div>
                    {exercisesDone.some(e => e.id === ex.id) && <span style={{ color: t.success, flexShrink: 0 }}>{Icons.check(t.success)}</span>}
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'baby' && (
            <>
              <div style={{ ...S.card, textAlign: 'center', padding: '32px' }}>
                <span style={{ fontSize: '56px' }}>👶</span>
                <h2 style={{ fontSize: '28px', fontWeight: '300', marginTop: '16px' }}>{profile.babyName}</h2>
                <p style={{ color: t.soft, marginTop: '8px' }}>{week} sem</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', color: t.soft, textTransform: 'uppercase' }}>Événements</p>
                <button className="btn-sm" onClick={() => setModal('addEvent')} style={S.btnSm}>{Icons.plus(t.text)} Ajouter</button>
              </div>
              {babyEvents.map(e => (
                <div key={e.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '28px' }}>{e.icon}</span>
                  <div>
                    <p style={{ fontWeight: '500' }}>{e.label}</p>
                    <p style={{ fontSize: '13px', color: t.soft }}>{new Date(e.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'evolution' && (
            <>
              <h2 style={{ fontSize: '26px', fontWeight: '300', marginBottom: '20px' }}>Parcours</h2>
              <div style={S.card}>
                <p style={{ fontSize: '11px', color: t.soft, marginBottom: '16px', textTransform: 'uppercase' }}>Humeur</p>
                {checkIns.length > 0 ? (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '100px' }}>
                    {checkIns.slice(-7).map((c, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100%', height: `${c.mood * 18}px`, background: t.accent, borderRadius: '8px 8px 0 0' }} />
                        <span style={{ fontSize: '16px', marginTop: '8px' }}>{MOODS.find(m => m.v === c.mood)?.e}</span>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: t.soft, textAlign: 'center' }}>Premier check-in ?</p>}
              </div>
              <div style={S.card}>
                <p style={{ fontSize: '11px', color: t.soft, marginBottom: '16px', textTransform: 'uppercase' }}>Victoires</p>
                {streak >= 1 && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>{Icons.fire(t.accent)}<span>{streak} check-ins</span></div>}
                {exercisesDone.length >= 1 && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>{Icons.lotus(t.accent)}<span>{exercisesDone.length} exercices</span></div>}
                {profileComplete && <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>{Icons.target(t.accent)}<span>Profil OK</span></div>}
              </div>
            </>
          )}
        </main>

        {/* Nav Bar */}
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: dark ? 'rgba(26,26,46,0.98)' : 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${t.border}`, padding: '10px 0 30px', display: 'flex', justifyContent: 'space-around', zIndex: 50 }}>
          {[
            { id: 'home', icon: Icons.home, l: 'Accueil' },
            { id: 'chat', icon: Icons.chat, l: 'Chat' },
            { id: 'learn', icon: Icons.book, l: 'Apprendre' },
            { id: 'exercises', icon: Icons.lotus, l: 'Exercices' },
            { id: 'baby', icon: Icons.baby, l: 'Bébé' },
            { id: 'evolution', icon: Icons.chart, l: 'Évolution' }
          ].map(n => (
            <div className="nav-tab" key={n.id} onClick={() => n.id === 'chat' ? openChat() : setTab(n.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '6px 8px', cursor: 'pointer', position: 'relative', transition: 'all 0.2s ease' }}>
              <div style={{ padding: '8px', borderRadius: '12px', background: tab === n.id ? `${t.accent}15` : 'transparent', transition: 'all 0.2s ease' }}>{n.icon(tab === n.id ? t.accent : t.soft)}</div>
              <span style={{ fontSize: '10px', fontWeight: tab === n.id ? '500' : '400', color: tab === n.id ? t.accent : t.soft }}>{n.l}</span>
              {n.id === 'chat' && !profileComplete && <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', borderRadius: '50%', background: t.danger, boxShadow: '0 2px 4px rgba(232,165,165,0.4)' }} />}
            </div>
          ))}
        </nav>

        {/* Exercise Modal */}
        {modal === 'exercise' && currentExercise && (
          <div style={S.full}>
            <div style={{ padding: '24px', maxWidth: '440px', margin: '0 auto' }}>
              <button className="btn-back" onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: t.soft }}>{Icons.back(t.soft)} <span>Retour</span></button>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: currentExercise.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 16px' }}>{currentExercise.icon}</div>
                <h2 style={{ fontSize: '24px', fontWeight: '400' }}>{currentExercise.title}</h2>
                <p style={{ fontSize: '14px', color: t.soft, marginTop: '4px' }}>{currentExercise.duration}</p>
              </div>
              {currentExercise.isKegel ? (
                <>
                  <div style={{ ...S.card, marginBottom: '16px' }}><p style={{ fontSize: '14px', lineHeight: 1.6, color: t.soft }}>{currentExercise.desc}</p></div>
                  <div style={{ ...S.card, textAlign: 'center', padding: '24px' }}>
                    <p style={{ fontSize: '16px', marginBottom: '8px' }}>Contracte : <strong>3 secondes</strong></p>
                    <p style={{ fontSize: '16px', marginBottom: '8px' }}>Relâche : <strong>6 secondes</strong></p>
                    <p style={{ fontSize: '16px' }}>Répète : <strong>8 fois</strong></p>
                  </div>
                  <button className="btn-primary" onClick={() => { doneEx(); setModal(null); }} style={{ ...S.btn(true), marginTop: '24px' }}>J&apos;ai fait ! ✓</button>
                </>
              ) : exerciseStep < (currentExercise.steps?.length || 0) ? (
                <>
                  <div style={{ height: '4px', background: t.border, borderRadius: '2px', marginBottom: '24px' }}><div style={{ height: '100%', width: `${(exerciseStep + 1) / (currentExercise.steps?.length || 1) * 100}%`, background: t.accent, borderRadius: '2px', transition: 'width 0.3s' }} /></div>
                  <p style={{ fontSize: '12px', color: t.soft, textAlign: 'center', marginBottom: '16px' }}>Étape {exerciseStep + 1} sur {currentExercise.steps?.length}</p>
                  <div style={{ ...S.card, padding: '32px 24px', textAlign: 'center', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ fontSize: '18px', lineHeight: 1.6 }}>{currentExercise.steps?.[exerciseStep]}</p></div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    {exerciseStep > 0 && <button className="btn-sm" onClick={() => setExerciseStep(s => s - 1)} style={S.btnSm}>← Précédent</button>}
                    <button className="btn-primary" onClick={() => exerciseStep === (currentExercise.steps?.length || 1) - 1 ? doneEx() : setExerciseStep(s => s + 1)} style={{ ...S.btn(true), flex: 1 }}>{exerciseStep === (currentExercise.steps?.length || 1) - 1 ? 'Terminer ✓' : 'Suivant →'}</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ ...S.card, background: `${t.success}15`, textAlign: 'center', padding: '32px' }}>
                    <span style={{ fontSize: '56px' }}>✓</span>
                    <p style={{ fontSize: '20px', fontWeight: '500', marginTop: '16px' }}>Bravo !</p>
                    <p style={{ color: t.soft, marginTop: '8px' }}>Tu as pris soin de toi 💜</p>
                  </div>
                  <button className="btn-primary" onClick={() => setModal(null)} style={{ ...S.btn(true), marginTop: '24px' }}>Fermer</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* SOS Modal */}
        {modal === 'sos' && (
          <div style={S.full}>
            <div style={{ padding: '24px', maxWidth: '440px', margin: '0 auto' }}>
              <button className="btn-back" onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px' }}>{Icons.back(t.soft)}</button>
              <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: '24px' }}>Aide urgente</h2>
              {SOS.map(s => (
                <div key={s.number} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: '500' }}>{s.name}</p>
                    <p style={{ fontSize: '13px', color: t.soft }}>{s.desc}</p>
                  </div>
                  <a href={`tel:${s.number}`} style={{ padding: '10px 18px', background: t.danger, color: '#fff', borderRadius: '50px', textDecoration: 'none' }}>{s.number}</a>
                </div>
              ))}
              <p style={{ textAlign: 'center', marginTop: '24px', color: t.soft }}>Demander aide = force 💜</p>
            </div>
          </div>
        )}

        {/* Add Event Modal */}
        {modal === 'addEvent' && (
          <div style={S.full}>
            <div style={{ padding: '24px', maxWidth: '440px', margin: '0 auto' }}>
              <button className="btn-back" onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px' }}>{Icons.back(t.soft)}</button>
              <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: '20px' }}>Ajouter événement</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {BABY_EVENTS.map(e => (
                  <button className={`btn-event-type ${newEventType === e.id ? 'selected' : ''}`} key={e.id} onClick={() => setNewEventType(e.id)} style={{ padding: '10px 14px', borderRadius: '50px', border: newEventType === e.id ? `2px solid ${t.accent}` : `1px solid ${t.border}`, background: newEventType === e.id ? `${t.accent}15` : 'transparent', cursor: 'pointer' }}>{e.icon} {e.label}</button>
                ))}
              </div>
              <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} style={{ ...S.input, marginBottom: '20px' }} />
              <button className="btn-primary" onClick={addEvent} style={{ ...S.btn(true), opacity: newEventType && newEventDate ? 1 : 0.4 }}>Ajouter</button>
            </div>
          </div>
        )}

        {/* Article Modal */}
        {selectedArticle && (
          <div style={S.full}>
            <div style={{ padding: '24px', maxWidth: '500px', margin: '0 auto' }}>
              <button className="btn-back" onClick={() => { if (!readArticles.includes(selectedArticle.id)) setReadArticles([...readArticles, selectedArticle.id]); setSelectedArticle(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: t.soft }}>{Icons.back(t.soft)} <span>Retour</span></button>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '50px', background: `${CATEGORIES.find(c => c.id === selectedArticle.cat)?.color}30`, fontSize: '12px' }}>{CATEGORIES.find(c => c.id === selectedArticle.cat)?.label}</span>
                  <span style={{ fontSize: '12px', color: t.soft }}>{selectedArticle.readTime}</span>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '400', lineHeight: 1.3 }}>{selectedArticle.title}</h2>
              </div>
              <div style={{ ...S.card, padding: '24px' }}>
                <div style={{ fontSize: '15px', lineHeight: 1.8 }}>
                  {selectedArticle.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <h3 key={i} style={{ fontWeight: '600', fontSize: '16px', marginTop: i > 0 ? '24px' : 0, marginBottom: '12px', color: t.accent }}>{line.replace(/\*\*/g, '')}</h3>;
                    } else if (line.startsWith('•')) {
                      return <p key={i} style={{ paddingLeft: '16px', marginBottom: '8px' }}>{line}</p>;
                    } else if (line.trim() === '') {
                      return <div key={i} style={{ height: '12px' }} />;
                    } else {
                      return <p key={i} style={{ marginBottom: '8px' }}>{line}</p>;
                    }
                  })}
                </div>
              </div>
              <button className="btn-primary" onClick={() => { if (!readArticles.includes(selectedArticle.id)) setReadArticles([...readArticles, selectedArticle.id]); setSelectedArticle(null); }} style={{ ...S.btn(true), marginTop: '24px' }}>J&apos;ai compris 💜</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
