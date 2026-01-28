import React, { useState, useCallback, useEffect, useRef } from 'react';

// Logo Éclore - Fleur stylisée minimaliste
const EcloreLogo = ({ size = 60, color = '#BEAEE2' }) => (
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

// Orbe glassmorphism premium
const GlassOrb = ({ size = 120, onClick, notification }) => (
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
    {/* Inner glow */}
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

const Icons = {
  home: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  chat: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  book: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  lotus: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="14" rx="3" ry="4"/><path d="M12 10c-2-3-5-5-5-8 0 4 2 6 5 8"/><path d="M12 10c2-3 5-5 5-8 0 4-2 6-5 8"/><path d="M7 14c-3-1-5-3-7-3 3 1 5 3 7 3"/><path d="M17 14c3-1 5-3 7-3-3 1-5 3-7 3"/></svg>,
  baby: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/></svg>,
  chart: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  send: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill={c}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  back: (c) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  search: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  plus: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
  sun: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>,
  moon: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  fire: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  calendar: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  phone: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  star: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
  target: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  water: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
};

const MOODS = [{ v: 1, e: '😢', l: 'Très mal' }, { v: 2, e: '😔', l: 'Difficile' }, { v: 3, e: '😐', l: 'Bof' }, { v: 4, e: '🙂', l: 'Ça va' }, { v: 5, e: '😊', l: 'Bien' }];

const AXES = [
  { id: 'anxiety', icon: '😰', label: 'Anxiété / Stress', desc: 'Peurs, angoisses', color: '#e8d5f2', exercises: ['breath', 'ground'], linkedTo: ['sleep', 'body'], linkExplain: 'Le stress augmente le cortisol, perturbe le sommeil et empêche la perte de poids.',
    startQ: 'Qu\'est-ce qui te fait le plus peur ou t\'inquiète en ce moment ?',
    followUp: ['À quel moment de la journée ton anxiété est-elle la plus forte ?', 'Est-ce que tu arrives à identifier ce qui déclenche ces moments ?', 'Comment ton corps réagit quand tu es anxieuse ?'],
    tips: ['Quand l\'anxiété monte, ton corps se prépare au danger. La respiration 4-7-8 envoie un signal de sécurité.', 'L\'ancrage 5-4-3-2-1 te ramène dans l\'instant présent, loin des "et si...".']
  },
  { id: 'sadness', icon: '😔', label: 'Tristesse / Blues', desc: 'Moral bas, vide', color: '#d5d5f2', exercises: ['compassion'], linkedTo: ['isolation'], linkExplain: 'Tristesse et isolement se renforcent.',
    startQ: 'Qu\'est-ce qui te rend triste en ce moment ?',
    followUp: ['Est-ce que tu pleures souvent ? Dans quelles situations ?', 'Y a-t-il des moments où tu te sens mieux ?', 'Est-ce que tu arrives à ressentir de la joie parfois ?'],
    tips: ['La tristesse post-partum est réelle et valide. Tu n\'es pas "faible".', 'L\'auto-compassion t\'aide à te traiter comme tu traiterais ta meilleure amie.']
  },
  { id: 'sleep', icon: '😴', label: 'Fatigue / Sommeil', desc: 'Épuisement', color: '#d5e5f2', exercises: ['sleep', 'bodyscan'], linkedTo: ['anxiety', 'anger'], linkExplain: 'Le manque de sommeil amplifie tout.',
    startQ: 'Comment se passent tes nuits en ce moment ?',
    followUp: ['Combien de fois te réveilles-tu par nuit ?', 'Est-ce que tu arrives à te rendormir après ?', 'Quelqu\'un peut prendre le relais pour que tu dormes ?'],
    tips: ['La privation de sommeil est une forme de torture. Sois indulgente avec toi.', 'Même 20 min de micro-sieste peuvent faire une vraie différence.']
  },
  { id: 'anger', icon: '😤', label: 'Colère / Irritabilité', desc: 'Rage, nerfs', color: '#f2d5d5', exercises: ['breath', 'ground'], linkedTo: ['sleep'], linkExplain: 'La fatigue = émotions difficiles.',
    startQ: 'Qu\'est-ce qui te met en colère en ce moment ?',
    followUp: ['Est-ce que tu as des moments où tu sens que tu vas exploser ?', 'Comment tu réagis quand ça arrive ?', 'Est-ce que cette colère te fait peur ?'],
    tips: ['La rage post-partum existe. Ce n\'est PAS qui tu es.', 'Quand ça monte : pose bébé en sécurité, sors de la pièce, respire 30 secondes.']
  },
  { id: 'isolation', icon: '🤝', label: 'Isolement', desc: 'Solitude', color: '#d5f2e8', exercises: ['compassion'], linkedTo: ['sadness'], linkExplain: 'L\'isolement favorise la dépression.',
    startQ: 'Est-ce que tu te sens seule dans cette aventure ?',
    followUp: ['À qui tu peux parler de ce que tu vis vraiment ?', 'Est-ce que tu arrives à sortir de chez toi ?', 'Qu\'est-ce qui t\'empêche de demander de l\'aide ?'],
    tips: ['Demander de l\'aide n\'est pas un échec, c\'est du courage.', 'Même une sortie de 10 min peut changer ta journée.']
  },
  { id: 'body', icon: '🌸', label: 'Corps / Acceptation', desc: 'Image, poids', color: '#f2ead5', exercises: ['compassion', 'bodyscan'], linkedTo: ['anxiety'], linkExplain: 'Stress = cortisol = blocage perte poids.',
    startQ: 'Qu\'est-ce qui est le plus difficile avec ton corps en ce moment ?',
    followUp: ['Est-ce que tu te compares à ton corps d\'avant ?', 'Qu\'est-ce que tu dirais à une amie qui vivrait la même chose ?', 'Ton corps a fait quelque chose d\'extraordinaire. Tu arrives à le voir ?'],
    tips: ['9 mois pour changer, au moins 9 pour récupérer.', 'Le stress bloque la perte de poids (cortisol). Prendre soin de ton mental aide aussi ton corps.']
  }
];

const EXERCISES = [
  { id: 'breath', icon: '🌬️', title: 'Respiration 4-7-8', duration: '2 min', color: '#e8d5f2', 
    desc: 'Technique de respiration apaisante qui active ton système nerveux parasympathique. Idéale pour calmer l\'anxiété rapidement.',
    steps: ['Trouve une position confortable, assise ou allongée', 'Expire complètement par la bouche', 'Inspire par le nez en comptant jusqu\'à 4', 'Retiens ta respiration en comptant jusqu\'à 7', 'Expire lentement par la bouche en comptant jusqu\'à 8', 'Répète ce cycle 4 fois'] },
  { id: 'ground', icon: '🌳', title: 'Ancrage 5-4-3-2-1', duration: '3 min', color: '#d5e5f2',
    desc: 'Technique de retour au présent quand l\'anxiété t\'envahit. Utilise tes 5 sens pour te reconnecter à l\'instant.',
    steps: ['Nomme 5 choses que tu VOIS autour de toi', 'Nomme 4 choses que tu peux TOUCHER', 'Nomme 3 choses que tu ENTENDS', 'Nomme 2 choses que tu SENS (odeurs)', 'Nomme 1 chose que tu peux GOÛTER', 'Respire profondément. Tu es ici, maintenant.'] },
  { id: 'compassion', icon: '💜', title: 'Auto-compassion', duration: '4 min', color: '#f2d5e8',
    desc: 'Apprends à te parler comme tu parlerais à ta meilleure amie. Tu mérites la même douceur que tu donnes aux autres.',
    steps: ['Pose tes mains sur ton cœur', 'Reconnais ce moment difficile : "C\'est dur en ce moment"', 'Rappelle-toi que tu n\'es pas seule : d\'autres mamans vivent ça aussi', 'Dis-toi : "Je mérite de la douceur et de la patience"', 'Reste un moment avec cette chaleur dans ton cœur'] },
  { id: 'bodyscan', icon: '🧘', title: 'Scan corporel', duration: '5 min', color: '#d5f2e8',
    desc: 'Reconnecte-toi à ton corps en douceur. Relâche les tensions accumulées zone par zone.',
    steps: ['Allonge-toi confortablement', 'Ferme les yeux et respire profondément', 'Porte ton attention sur tes pieds, relâche-les', 'Remonte doucement : mollets, cuisses, bassin...', 'Continue : ventre, poitrine, épaules, bras, mains...', 'Termine par le cou, le visage, le crâne', 'Ressens ton corps entier, détendu'] },
  { id: 'kegel', icon: '🌸', title: 'Exercices du périnée', duration: '5 min', color: '#f2ead5', isKegel: true,
    desc: 'Renforce ton plancher pelvien après l\'accouchement. Essentiel pour ta récupération physique.',
    levels: [{ name: 'Doux', hold: 3, rest: 6, reps: 8 }] },
  { id: 'sleep', icon: '😴', title: 'Micro-sieste guidée', duration: '10 min', color: '#e5d5f2',
    desc: 'Même 10 minutes de repos peuvent faire une différence. Cette technique t\'aide à récupérer rapidement.',
    steps: ['Allonge-toi dans un endroit calme', 'Mets un timer de 10-15 minutes', 'Ferme les yeux, respire lentement', 'Relâche chaque muscle de ton corps', 'Laisse tes pensées passer comme des nuages', 'Ne cherche pas à dormir, juste à te reposer'] }
];

const CATEGORIES = [
  { id: 'body', icon: '🌸', label: 'Corps', color: '#e8d5f2', desc: 'Récupération physique, périnée, sommeil' },
  { id: 'mind', icon: '💜', label: 'Mental', color: '#d5d5f2', desc: 'Émotions, baby blues, anxiété' },
  { id: 'baby', icon: '👶', label: 'Bébé', color: '#d5e5f2', desc: 'Soins, développement, lien' }
];

const ARTICLES = [
  { id: 'blues', cat: 'mind', title: 'Baby blues ou dépression ?', readTime: '3 min',
    content: `**Le baby blues**
C'est normal et très fréquent (50-80% des mamans). Il apparaît entre le 3ème et 5ème jour après l'accouchement.

Tu peux ressentir :
• Des sautes d'humeur
• Des pleurs sans raison
• De l'irritabilité
• De l'anxiété

**Bonne nouvelle** : ça passe généralement en 10-15 jours.

**La dépression post-partum**
C'est différent et plus sérieux. Elle peut apparaître jusqu'à un an après l'accouchement.

Signes d'alerte :
• Tristesse persistante (plus de 2 semaines)
• Perte d'intérêt pour le bébé
• Culpabilité excessive
• Pensées sombres

**Important** : La dépression post-partum se soigne très bien. N'hésite pas à en parler à un professionnel. Ce n'est pas un échec, c'est prendre soin de toi et de ton bébé.` },
  
  { id: 'rage', cat: 'mind', title: 'La rage maternelle', readTime: '2 min',
    content: `**C'est quoi ?**
Des montées de colère intenses, parfois violentes, qui peuvent te surprendre et te faire peur. Tu n'es pas seule : beaucoup de mamans vivent ça.

**Pourquoi ça arrive ?**
• Épuisement extrême
• Bouleversement hormonal
• Surcharge mentale
• Manque de soutien

**Que faire quand ça monte ?**
1. Pose bébé en sécurité (lit, parc)
2. Sors de la pièce
3. Respire 30 secondes
4. Reviens quand tu es plus calme

**Ce n'est PAS qui tu es.**
La rage ne fait pas de toi une mauvaise mère. C'est ton corps qui dit "j'ai besoin d'aide".

Si ça arrive souvent, parles-en à un professionnel. Il existe des solutions.` },
  
  { id: 'corps', cat: 'body', title: 'Ton corps après bébé', readTime: '3 min',
    content: `**Sois patiente avec toi**
9 mois pour changer, donne-toi au moins autant pour récupérer. Et c'est OK si ça prend plus longtemps.

**Ce qui est normal**
• Ventre encore rond (l'utérus met 6-8 semaines à retrouver sa taille)
• Cheveux qui tombent (pic vers 3-4 mois, ça repousse !)
• Vergetures qui s'estompent lentement
• Hanches plus larges (elles peuvent rester ainsi)

**Le poids**
Oublie les "J'ai perdu mes kilos en 2 semaines" des magazines. La vraie vie, c'est :
• Perte progressive sur 6-12 mois
• Parfois le corps garde quelques kilos
• Le stress bloque la perte de poids (cortisol)

**Ce que tu peux faire**
• Bouger doucement quand tu te sens prête
• Manger équilibré (pas de régime !)
• Boire beaucoup d'eau
• Dormir dès que possible

**Ton corps a fait quelque chose d'extraordinaire.** Il mérite du respect et de la patience.` },
  
  { id: 'sommeil', cat: 'body', title: 'Survivre au manque de sommeil', readTime: '2 min',
    content: `**C'est VRAIMENT dur**
La privation de sommeil est utilisée comme méthode de torture. Ce que tu vis est difficile, et c'est normal de galérer.

**Stratégies de survie**
• Dors quand bébé dort (oui, vraiment)
• Accepte l'aide pour les nuits
• Siestes de 10-20 min = récupération réelle
• Limite les écrans le soir

**Demande de l'aide**
Si possible, organise un "relais" :
• Ton/ta partenaire prend une tétée/biberon
• Quelqu'un garde bébé 2h pour que tu dormes
• Même une nuit par semaine peut tout changer

**Ça va s'améliorer**
Les nuits s'allongent progressivement. Tiens bon. 💜` },

  { id: 'allaitement', cat: 'baby', title: 'Allaitement sans pression', readTime: '3 min',
    content: `**Peu importe ton choix**
Sein, biberon, mixte... Le meilleur choix est celui qui fonctionne pour TOI et ton bébé.

**Si tu allaites**
• Les premières semaines sont souvent difficiles
• Douleur persistante = demande de l'aide (consultante en lactation)
• Bois beaucoup d'eau
• Les pics de croissance sont épuisants mais temporaires

**Si tu donnes le biberon**
• Zéro culpabilité
• Le lien se crée aussi par le regard, la voix, le contact

**Si tu mélanges**
• C'est une option valide
• Ça permet de souffler

**L'essentiel** : Un bébé nourri et une maman qui va bien. Point.` }
];
const SOS = [{ name: '3114', number: '3114', desc: '24h/24', urgent: true }];
const BABY_EVENTS = [{ id: 'birth', icon: '🎂', label: 'Naissance' }, { id: 'smile', icon: '😊', label: 'Sourire' }];

const Q_SECTIONS = [
  { id: 'emotions', title: 'Tes émotions', intro: 'Parlons un peu de ce que tu ressens ces derniers temps. Il n\'y a pas de bonne ou mauvaise réponse. 💜', questions: [
    { id: 'e1', q: 'Est-ce qu\'il t\'arrive de te sentir triste ou vide, sans vraiment savoir pourquoi ?', opts: [{ v: 0, l: 'Non, pas vraiment' }, { v: 1, l: 'De temps en temps' }, { v: 2, l: 'Assez souvent' }, { v: 3, l: 'Presque tout le temps' }], axis: 'sadness' },
    { id: 'e2', q: 'Est-ce que tu ressens parfois de l\'anxiété ou des inquiétudes qui semblent surgir de nulle part ?', opts: [{ v: 0, l: 'Non, ça va' }, { v: 1, l: 'Ça m\'arrive' }, { v: 2, l: 'Assez souvent' }, { v: 3, l: 'C\'est très présent' }], axis: 'anxiety' },
    { id: 'e3', q: 'Et la colère ? Est-ce qu\'il t\'arrive d\'avoir des montées de rage ou d\'irritabilité ?', opts: [{ v: 0, l: 'Rarement' }, { v: 1, l: 'Parfois' }, { v: 2, l: 'Souvent' }, { v: 3, l: 'Très souvent' }], axis: 'anger' },
    { id: 'e4', q: 'Je dois te poser cette question importante : est-ce qu\'il t\'arrive d\'avoir des pensées de te faire du mal ?', opts: [{ v: 0, l: 'Non, jamais' }, { v: 1, l: 'Ça m\'a traversé l\'esprit' }, { v: 2, l: 'Parfois' }, { v: 3, l: 'Souvent' }], critical: true }
  ], summary: (a) => Object.values(a).reduce((x,y)=>x+y,0) >= 5 ? 'Je sens que c\'est une période émotionnellement chargée pour toi. C\'est courageux d\'en parler. 💜' : 'Merci pour ta confiance. Tu sembles tenir le coup émotionnellement. 💜' },
  { id: 'sleep', title: 'Ton sommeil', intro: 'Le sommeil, c\'est souvent compliqué avec un bébé. Voyons où tu en es...', questions: [
    { id: 's1', q: 'En cumulé, combien d\'heures arrives-tu à dormir par nuit environ ?', opts: [{ v: 3, l: 'Moins de 3h 😴' }, { v: 2, l: 'Entre 3 et 4h' }, { v: 1, l: 'Entre 4 et 6h' }, { v: 0, l: 'Plus de 6h' }], axis: 'sleep' },
    { id: 's2', q: 'Comment décrirais-tu ton niveau de fatigue au quotidien ?', opts: [{ v: 0, l: 'Ça va, je gère' }, { v: 1, l: 'Fatiguée mais ça va' }, { v: 2, l: 'Vraiment fatiguée' }, { v: 3, l: 'Épuisée, je tiens à peine' }], axis: 'sleep' }
  ], summary: (a) => Object.values(a).reduce((x,y)=>x+y,0) >= 3 ? 'La fatigue que tu décris est réelle et difficile. Tu mérites du repos. 💜' : 'Tu arrives à récupérer un peu, c\'est précieux ! 💜' },
  { id: 'body', title: 'Ton corps', intro: 'Ton corps a traversé quelque chose d\'immense. Comment tu te sens avec lui ?', questions: [
    { id: 'b1', q: 'Comment te sens-tu dans ton corps depuis l\'accouchement ?', opts: [{ v: 0, l: 'Plutôt en paix' }, { v: 1, l: 'J\'apprends à l\'accepter' }, { v: 2, l: 'C\'est difficile' }, { v: 3, l: 'Je ne me reconnais plus' }], axis: 'body' },
    { id: 'b2', q: 'Est-ce que la question du poids te pèse ?', opts: [{ v: 0, l: 'Non, pas trop' }, { v: 1, l: 'Un peu' }, { v: 2, l: 'Oui, beaucoup' }, { v: 3, l: 'C\'est une vraie source de stress' }], axis: 'body' }
  ], summary: (a) => a.b1 >= 2 || a.b2 >= 2 ? 'La relation avec ton corps semble compliquée en ce moment. C\'est normal et on peut travailler dessus ensemble. 💜' : 'Tu prends soin de toi, c\'est important. Continue ! 💜' },
  { id: 'support', title: 'Ton entourage', intro: 'Être bien entourée, ça change tout. Comment c\'est pour toi ?', questions: [
    { id: 'd1', q: 'Est-ce que tu te sens soutenue au quotidien ?', opts: [{ v: 0, l: 'Oui, bien entourée' }, { v: 1, l: 'Un peu, mais pas assez' }, { v: 2, l: 'Pas vraiment' }, { v: 3, l: 'Je me sens seule' }], axis: 'isolation' }
  ], summary: (a) => a.d1 >= 2 ? 'Se sentir isolée avec un bébé, c\'est vraiment difficile. Tu n\'es pas seule, je suis là. 💜' : 'C\'est bien d\'avoir du soutien autour de toi ! 💜' }
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

const getWeek = (d) => d ? Math.max(0, Math.floor((new Date() - new Date(d)) / 604800000)) : 0;
const analyzeAxes = (answers) => {
  const scores = { anxiety: 0, sadness: 0, sleep: 0, anger: 0, isolation: 0, body: 0 };
  Q_SECTIONS.forEach(s => s.questions.forEach(q => { if (q.axis && answers[q.id] !== undefined) scores[q.axis] += answers[q.id]; }));
  return Object.entries(scores).map(([id, score]) => ({ id, score, ...AXES.find(a => a.id === id) })).sort((a, b) => b.score - a.score);
};

export default function Eclore() {
  const [dark, setDark] = useState(false);
  const [screen, setScreen] = useState('welcome');
  const [tab, setTab] = useState('home');
  const [modal, setModal] = useState(null);
  const [profile, setProfile] = useState({});
  const [profileComplete, setProfileComplete] = useState(false);
  const [qAnswers, setQAnswers] = useState({});
  const [completedSections, setCompletedSections] = useState([]);
  const [axesAnalysis, setAxesAnalysis] = useState(null);
  const [selectedAxes, setSelectedAxes] = useState({ primary: null, secondary: [] });
  const [checkIns, setCheckIns] = useState([]);
  const [exercisesDone, setExercisesDone] = useState([]);
  const [babyEvents, setBabyEvents] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [readArticles, setReadArticles] = useState([]);
  const [onboardStep, setOnboardStep] = useState(0);
  const [onboardMessages, setOnboardMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [moodResponse, setMoodResponse] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseStep, setExerciseStep] = useState(0);
  const [kegelLevel, setKegelLevel] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [newEventType, setNewEventType] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [currentSection, setCurrentSection] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0); // en ml
  const [waterGoal, setWaterGoal] = useState(2000); // 2L par défaut, 2.5L si allaitement
  
  // Refs for auto-scroll
  const chatEndRef = useRef(null);
  const onboardEndRef = useRef(null);
  const [sectionAnswers, setSectionAnswers] = useState({});

  const today = new Date();
  const week = getWeek(profile.babyDate);
  const streak = checkIns.length;
  const profileCompletion = Math.round((completedSections.length / Q_SECTIONS.length) * 100);
  
  // Adapter l'objectif d'hydratation selon l'allaitement
  useEffect(() => {
    if (profile.feeding === 'breast' || profile.feeding === 'mixed') {
      setWaterGoal(2500); // 2.5L si allaitement
    } else {
      setWaterGoal(2000); // 2L sinon
    }
  }, [profile.feeding]);
  
  const addWater = (ml) => {
    setWaterIntake(prev => Math.min(prev + ml, 5000)); // max 5L
  };
  
  const waterPercent = Math.min((waterIntake / waterGoal) * 100, 100);

  const t = dark 
    ? { 
        bg: '#1a1a2e', 
        card: 'rgba(255,255,255,0.06)', 
        text: '#f5f5f5', 
        soft: 'rgba(255,255,255,0.5)', 
        accent: '#BEAEE2', // Lavande
        accent2: '#F7DBF0', // Rose pâle
        mint: '#CBEBCE', // Vert menthe
        turquoise: '#CDF0EA', // Turquoise
        border: 'rgba(255,255,255,0.08)', 
        success: '#CBEBCE', 
        danger: '#e8a5a5' 
      }
    : { 
        bg: '#FAFBFC', // Fond très clair
        card: '#FFFFFF', 
        text: '#2D2D3A', // Texte foncé doux
        soft: '#9D9DAF', // Gris doux
        accent: '#BEAEE2', // Lavande - couleur principale
        accent2: '#F7DBF0', // Rose pâle
        mint: '#CBEBCE', // Vert menthe
        turquoise: '#CDF0EA', // Turquoise
        border: 'rgba(0,0,0,0.04)', 
        success: '#9BCFB0', // Vert doux
        danger: '#E8A5A5' // Rouge doux
      };

  const S = {
    page: { 
      minHeight: '100vh', 
      background: dark ? '#1a1a2e' : '#FDF8F6',
      fontFamily: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
      color: t.text,
      fontWeight: '300',
      letterSpacing: '0.2px'
    },
    card: { 
      background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)', 
      borderRadius: '24px', 
      padding: '24px', 
      boxShadow: dark ? 'none' : '0 2px 16px rgba(190, 174, 226, 0.06)', 
      marginBottom: '16px',
      backdropFilter: 'blur(10px)',
      border: 'none'
    },
    btn: (f) => ({ 
      padding: '18px 36px', 
      borderRadius: '60px', 
      border: 'none', 
      background: f ? `linear-gradient(135deg, ${t.accent} 0%, ${t.accent2} 100%)` : 'rgba(255,255,255,0.8)', 
      color: f ? '#fff' : t.text, 
      cursor: 'pointer', 
      fontSize: '15px', 
      fontWeight: '400', 
      width: '100%',
      letterSpacing: '0.5px',
      boxShadow: f ? '0 12px 32px rgba(190, 174, 226, 0.35)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }),
    btnSm: { 
      padding: '14px 24px', 
      borderRadius: '50px', 
      border: 'none', 
      background: 'rgba(255,255,255,0.6)', 
      color: t.text, 
      cursor: 'pointer', 
      fontSize: '14px',
      fontWeight: '400',
      letterSpacing: '0.3px',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.2s ease'
    },
    input: { 
      width: '100%', 
      padding: '18px 24px', 
      borderRadius: '20px', 
      border: 'none', 
      background: 'rgba(255,255,255,0.7)', 
      color: t.text, 
      fontSize: '16px', 
      outline: 'none', 
      boxSizing: 'border-box',
      backdropFilter: 'blur(8px)',
      fontWeight: '300',
      letterSpacing: '0.2px',
      transition: 'all 0.2s ease'
    },
    full: { 
      position: 'fixed', 
      inset: 0, 
      background: dark ? '#1a1a2e' : '#FDF8F6', 
      zIndex: 100, 
      overflow: 'auto' 
    }
  };

  const up = useCallback((k, v) => setProfile(p => ({ ...p, [k]: v })), []);

  useEffect(() => {
    if (screen !== 'onboarding') return;
    const step = ONBOARDING[onboardStep];
    if (!step || onboardMessages.some(m => m.step === step.id)) return;
    let text = step.text?.replace('{babyName}', profile.babyName || 'bébé');
    if (text) setOnboardMessages(m => [...m, { role: 'ai', text, step: step.id }]);
  }, [screen, onboardStep, profile, onboardMessages]);

  // Reset inputValue when step changes
  useEffect(() => {
    setInputValue('');
  }, [onboardStep]);

  // Auto-scroll chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Auto-scroll onboarding when messages change
  useEffect(() => {
    if (onboardEndRef.current) {
      onboardEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [onboardMessages]);

  const respond = (value) => {
    const step = ONBOARDING[onboardStep];
    if (step.field) up(step.field, value);
    let display = step.options?.find(o => o.value === value)?.label || (step.type === 'date' ? new Date(value).toLocaleDateString('fr-FR') : value);
    setOnboardMessages(m => [...m, { role: 'user', text: display }]);
    setTimeout(() => {
      const next = onboardStep + 1;
      if (ONBOARDING[next]?.type === 'done') setOnboardMessages(m => [...m, { role: 'ai', text: `Parfait ${profile.name || ''} ! 🌸\n\nJ'ai encore quelques questions pour mieux comprendre comment tu te sens. Plus je te connais, mieux je peux t'accompagner.\n\nTu préfères continuer maintenant ou découvrir ton espace d'abord ?`, showChoice: true }]);
      else setOnboardStep(next);
    }, 400);
    setInputValue('');
  };

  const finishOnboarding = (continueQ) => {
    if (profile.babyDate) setBabyEvents([{ id: Date.now(), type: 'birth', date: profile.babyDate, label: 'Naissance', icon: '🎂' }]);
    setScreen('main');
    
    if (continueQ) {
      // Continue avec le questionnaire dans le chat
      setChatHistory([{ role: 'ai', text: `C'est parti ! Ces questions vont m'aider à personnaliser ton accompagnement. 💜` }]);
      setTimeout(() => {
        setTab('chat');
        const first = Q_SECTIONS.find(s => !completedSections.includes(s.id));
        if (first) startSection(first);
      }, 500);
    } else {
      // Juste aller au dashboard
      setChatHistory([{ role: 'ai', text: `Coucou ${profile.name} ! 💜\n\nQuand tu voudras, on pourra continuer le questionnaire pour que je puisse mieux t'accompagner.\n\nEn attendant, explore ton espace !`, showStart: true }]);
    }
  };

  const finish = () => finishOnboarding(false);

  const startQ = () => { setTab('chat'); const first = Q_SECTIONS.find(s => !completedSections.includes(s.id)); if (first) startSection(first); };

  const startSection = (section) => {
    setCurrentSection(section); setCurrentQIndex(0); setSectionAnswers({});
    setChatHistory(h => [...h, { role: 'ai', text: `📝 **${section.title}** (${completedSections.length + 1}/${Q_SECTIONS.length})\n\n${section.intro}` }]);
    setTimeout(() => { const q = section.questions[0]; setChatHistory(h => [...h, { role: 'ai', text: q.q, isQ: true, qId: q.id, opts: q.opts }]); }, 600);
  };

  const answerQ = (qId, value, label) => {
    const newA = { ...sectionAnswers, [qId]: value }; setSectionAnswers(newA); setQAnswers(a => ({ ...a, [qId]: value }));
    setChatHistory(h => [...h, { role: 'user', text: label }]);
    const q = currentSection.questions.find(x => x.id === qId);
    if (q?.critical && value >= 2) setTimeout(() => setChatHistory(h => [...h, { role: 'ai', text: 'Tu n\'es pas seule. 3114 dispo 24h/24.', showSOS: true }]), 500);
    setTimeout(() => {
      const nextI = currentQIndex + 1;
      if (nextI < currentSection.questions.length) { setCurrentQIndex(nextI); const nextQ = currentSection.questions[nextI]; setChatHistory(h => [...h, { role: 'ai', text: nextQ.q, isQ: true, qId: nextQ.id, opts: nextQ.opts }]); }
      else finishSection(newA);
    }, q?.critical && value >= 2 ? 2000 : 600);
  };

  const finishSection = (answers) => {
    setChatHistory(h => [...h, { role: 'ai', text: currentSection.summary(answers) }]);
    const newCompleted = [...completedSections, currentSection.id]; setCompletedSections(newCompleted); setCurrentSection(null);
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

  const selectPrimary = (id) => {
    setSelectedAxes(s => ({ ...s, primary: id }));
    const axis = AXES.find(a => a.id === id);
    setChatHistory(h => [...h, { role: 'user', text: `${axis.icon} ${axis.label}` }, { role: 'ai', text: `On travaille sur ça ! Tu peux choisir 2 axes secondaires.`, showSecondary: true, primaryId: id }]);
  };

  const selectSecondary = (ids) => {
    setSelectedAxes(s => ({ ...s, secondary: ids }));
    const primary = AXES.find(a => a.id === selectedAxes.primary);
    const links = []; if (primary.linkedTo) ids.forEach(id => { if (primary.linkedTo.includes(id)) links.push(primary.linkExplain); });
    
    // Message récapitulatif
    let txt = `🎯 **Priorité:** ${primary.icon} ${primary.label}\n`;
    if (ids.length) txt += `📌 **Aussi:** ${ids.map(id => AXES.find(a => a.id === id)).map(a => `${a.icon} ${a.label}`).join(', ')}\n`;
    if (links.length) txt += `\n💡 ${links[0]}\n`;
    
    setChatHistory(h => [...h, { role: 'ai', text: txt }]);
    setProfileComplete(true);
    
    // Après un délai, afficher le plan et lancer la première question
    setTimeout(() => {
      const exerciseNames = primary.exercises.map(id => EXERCISES.find(e => e.id === id)?.title).join(', ');
      const planMsg = `📅 **TON PROGRAMME**\n\n• Check-in quotidien pour suivre ton ${primary.label.toLowerCase()}\n• Exercices recommandés : ${exerciseNames}\n• Conseils personnalisés\n\n💜 Je suis là pour t'accompagner à ton rythme.`;
      setChatHistory(h => [...h, { role: 'ai', text: planMsg }]);
      
      // Première question d'accompagnement
      setTimeout(() => {
        setChatHistory(h => [...h, { role: 'ai', text: `💬 **Commençons...**\n\n${primary.startQ}` }]);
      }, 1000);
    }, 800);
  };

  const skipSecondary = () => { 
    const primary = AXES.find(a => a.id === selectedAxes.primary); 
    setChatHistory(h => [...h, { role: 'ai', text: `Focus sur ${primary.icon} ${primary.label} !` }]); 
    setProfileComplete(true);
    
    // Après un délai, afficher le plan et lancer la première question
    setTimeout(() => {
      const exerciseNames = primary.exercises.map(id => EXERCISES.find(e => e.id === id)?.title).join(', ');
      const planMsg = `📅 **TON PROGRAMME**\n\n• Check-in quotidien pour suivre ton ${primary.label.toLowerCase()}\n• Exercices recommandés : ${exerciseNames}\n• Conseils personnalisés\n\n💜 Je suis là pour t'accompagner à ton rythme.`;
      setChatHistory(h => [...h, { role: 'ai', text: planMsg }]);
      
      // Première question d'accompagnement
      setTimeout(() => {
        setChatHistory(h => [...h, { role: 'ai', text: `💬 **Commençons...**\n\n${primary.startQ}` }]);
      }, 1000);
    }, 800);
  };

  const checkIn = (mood) => {
    setTodayCheckIn({ mood, date: today.toISOString() }); setCheckIns([...checkIns, { mood, date: today.toISOString() }]);
    const axis = AXES.find(a => a.id === selectedAxes.primary);
    let text = mood <= 2 ? 'Journée difficile. Pas seule.' : mood === 3 ? '"Bof" c\'est honnête.' : 'Super ! 💜';
    let actions = mood <= 2 ? [{ label: 'Parler', act: 'chat' }, { label: '🌬️', act: 'ex', id: axis?.exercises[0] || 'breath' }] : [{ label: 'Ok', act: 'close' }];
    setMoodResponse({ text, actions });
  };

  const openChat = () => { if (!chatHistory.length) setChatHistory([{ role: 'ai', text: `Coucou ${profile.name} ! 💜`, showStart: !profileComplete }]); setTab('chat'); };

  const openChatFood = () => {
    const foodPrompts = [
      { label: "J'ai faim mais je suis épuisée...", value: "faim épuisée" },
      { label: "Idée repas rapide ?", value: "repas rapide" },
      { label: "Qu'est-ce qui est bon pour la lactation ?", value: "lactation" },
      { label: "Idée avec ce que j'ai dans le frigo", value: "frigo" }
    ];
    setChatHistory([
      { role: 'ai', text: `🍽️ **Que manger aujourd'hui ?**\n\nJe peux t'aider à trouver des idées simples et nourrissantes. Qu'est-ce qui te parlerait ?`, showFoodPrompts: true, foodPrompts }
    ]);
    setTab('chat');
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.toLowerCase();
    const primary = AXES.find(a => a.id === selectedAxes.primary);
    
    let response = { text: '', suggest: null };
    
    // Réponses d'urgence
    if (msg.includes('mourir') || msg.includes('suicide') || msg.includes('fin')) {
      response.text = `${profile.name}, ce que tu ressens est important. Tu n'es pas seule.\n\nLe 3114 est disponible 24h/24. Appelle-les, ils sont là pour ça. 💜`;
      response.showSOS = true;
    }
    // Réponses par mots-clés émotionnels
    else if (msg.includes('peur') || msg.includes('angoisse') || msg.includes('panique')) {
      response.text = `L'anxiété, c'est ton cerveau qui essaie de te protéger... mais il s'emballe.\n\n${primary?.tips?.[0] || 'La respiration peut t\'aider à te calmer.'}\n\nTu veux essayer un exercice ?`;
      response.suggest = 'ground';
    }
    else if (msg.includes('triste') || msg.includes('pleure') || msg.includes('vide')) {
      response.text = `C'est ok de pleurer, ${profile.name}. Tes émotions sont valides.\n\n${AXES.find(a => a.id === 'sadness')?.tips?.[0] || ''}\n\nTu veux m'en dire plus ?`;
      response.suggest = 'compassion';
    }
    else if (msg.includes('fatigue') || msg.includes('épuisée') || msg.includes('dors')) {
      response.text = `La privation de sommeil, c'est de la torture. Littéralement.\n\n${AXES.find(a => a.id === 'sleep')?.tips?.[0] || ''}\n\nQuelqu'un peut prendre le relais pour que tu te reposes ?`;
      response.suggest = 'sleep';
    }
    else if (msg.includes('colère') || msg.includes('rage') || msg.includes('énerve') || msg.includes('exploser')) {
      response.text = `La rage post-partum est RÉELLE. Ce n'est pas qui tu es.\n\nQuand ça monte : pose bébé en sécurité, sors de la pièce, respire 30 secondes.\n\nTu veux qu'on fasse un exercice ensemble ?`;
      response.suggest = 'breath';
    }
    else if (msg.includes('seule') || msg.includes('personne') || msg.includes('aide')) {
      response.text = `Se sentir seule avec un bébé, c'est une des choses les plus dures.\n\n${AXES.find(a => a.id === 'isolation')?.tips?.[0] || ''}\n\nÀ qui tu pourrais demander un coup de main ?`;
    }
    else if (msg.includes('corps') || msg.includes('poids') || msg.includes('grosse') || msg.includes('moche')) {
      response.text = `Ton corps a créé la vie, ${profile.name}. Il a fait quelque chose d'extraordinaire.\n\n${AXES.find(a => a.id === 'body')?.tips?.[0] || ''}\n\nQu'est-ce que tu dirais à une amie qui parlerait d'elle comme ça ?`;
    }
    // RÉPONSES NUTRITION
    else if (msg.includes('faim') && msg.includes('épuisée') || msg.includes('faim') && msg.includes('fatiguée')) {
      response.text = `Quand on est épuisée, on a besoin d'énergie rapide mais durable. Voici des idées :\n\n• **Tartine avocat + œuf** (5 min)\n• **Yaourt + banane + miel + noix** (2 min)\n• **Fromage + pain complet + tomates** (2 min)\n• **Smoothie banane-lait-flocons d'avoine** (3 min)\n\nL'important c'est de manger, pas de faire compliqué. 💜`;
    }
    else if (msg.includes('repas rapide') || msg.includes('vite fait') || msg.includes('rapide')) {
      response.text = `Idées repas rapides (<15 min) :\n\n🍳 **Petit-déj à toute heure** : œufs brouillés + pain\n🥗 **Salade express** : salade en sachet + thon + maïs + huile d'olive\n🍝 **Pâtes magiques** : pâtes + beurre + parmesan\n🥪 **Wrap** : tortilla + ce qu'il y a (fromage, jambon, crudités)\n\nTu as quoi dans ton frigo là ?`;
    }
    else if (msg.includes('lactation') || msg.includes('allaitement') || msg.includes('lait maternel')) {
      response.text = `Pour soutenir la lactation :\n\n💧 **Hydratation** : bois beaucoup (eau, tisanes)\n🥣 **Flocons d'avoine** : le matin, en porridge ou smoothie\n🥜 **Amandes, noix** : en snack\n🍌 **Bananes** : énergie + potassium\n🐟 **Poisson, œufs** : protéines de qualité\n\nEt surtout : mange à ta faim ! Ton corps a besoin de ~500 calories de plus par jour. 💜`;
    }
    else if (msg.includes('frigo') || msg.includes('ce que j\'ai')) {
      response.text = `Dis-moi ce que tu as ! Genre :\n\n"J'ai des œufs, du fromage et des tomates"\n\nEt je te propose une idée avec ça. 🍳`;
    }
    else if (msg.includes('œuf') || msg.includes('oeuf')) {
      response.text = `Avec des œufs, plein de possibilités :\n\n• **Omelette** : 3 œufs + ce que tu as (fromage, jambon, légumes)\n• **Œufs brouillés** crémeux sur du pain\n• **Œuf au plat** sur du riz ou des légumes\n• **Salade** avec œuf dur\n\nC'est rapide, nourrissant et plein de protéines ! 💪`;
    }
    else if (msg.includes('merci')) {
      response.text = `Je suis là pour toi, ${profile.name}. 💜\n\nN'hésite jamais à revenir me parler.`;
    }
    else if (msg.includes('mieux') || msg.includes('bien') || msg.includes('ça va')) {
      response.text = `Ça fait plaisir à entendre ! 💜\n\nContinue à prendre soin de toi. Tu fais un travail incroyable.`;
    }
    // Réponse contextuelle basée sur l'axe prioritaire
    else if (primary) {
      const followUp = primary.followUp?.[Math.floor(Math.random() * primary.followUp.length)];
      const tip = primary.tips?.[Math.floor(Math.random() * primary.tips.length)];
      response.text = `Je t'écoute, ${profile.name}.\n\n${tip || ''}\n\n${followUp || 'Comment tu te sens là, maintenant ?'}`;
      if (Math.random() > 0.5) response.suggest = primary.exercises[0];
    }
    // Réponse par défaut
    else {
      response.text = `Je t'écoute, ${profile.name}. Continue, dis-moi ce qui te traverse.`;
    }
    
    setChatHistory([...chatHistory, { role: 'user', text: chatInput }, { role: 'ai', ...response }]); 
    setChatInput('');
  };

  const openEx = (ex) => { setCurrentExercise(ex); setExerciseStep(0); setModal('exercise'); };
  const doneEx = () => { setExercisesDone([...exercisesDone, { id: currentExercise.id }]); setExerciseStep(currentExercise.steps?.length || 0); };
  const addEvent = () => { if (!newEventType || !newEventDate) return; const def = BABY_EVENTS.find(e => e.id === newEventType); setBabyEvents([...babyEvents, { id: Date.now(), type: newEventType, icon: def?.icon, date: newEventDate, label: def?.label }]); setNewEventType(''); setNewEventDate(''); setModal(null); };

  // WELCOME
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
      background: `
        radial-gradient(ellipse 80% 50% at 50% 0%, rgba(247,219,240,0.5) 0%, transparent 50%),
        radial-gradient(ellipse 60% 40% at 80% 60%, rgba(205,240,234,0.4) 0%, transparent 50%),
        radial-gradient(ellipse 50% 30% at 20% 80%, rgba(190,174,226,0.3) 0%, transparent 50%),
        #FDF8F6
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-20%',
        width: '60%',
        height: '40%',
        background: 'radial-gradient(ellipse, rgba(247,219,240,0.4) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '-10%',
        width: '50%',
        height: '35%',
        background: 'radial-gradient(ellipse, rgba(205,240,234,0.5) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />
      
      {/* Logo Éclore - Orbe style */}
      <div style={{ marginBottom: '48px', position: 'relative', zIndex: 1 }}>
        <GlassOrb size={140} />
      </div>
      
      {/* Titre */}
      <h1 style={{ 
        fontSize: '48px', 
        fontWeight: '200', 
        marginBottom: '16px',
        color: t.text,
        letterSpacing: '2px',
        position: 'relative',
        zIndex: 1
      }}>éclore</h1>
      
      {/* Sous-titre */}
      <p style={{ 
        color: t.soft, 
        fontSize: '16px', 
        marginBottom: '80px',
        fontWeight: '300',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        position: 'relative',
        zIndex: 1
      }}>ton compagnon post-partum</p>
      
      {/* Bouton */}
      <button 
        style={{
          ...S.btn(true),
          maxWidth: '260px',
          fontSize: '15px',
          letterSpacing: '1px',
          position: 'relative',
          zIndex: 1
        }} 
        onClick={() => { setScreen('onboarding'); setOnboardStep(0); }}
      >
        Commencer
      </button>
    </div>
  );

  // ONBOARDING
  if (screen === 'onboarding') {
    const step = ONBOARDING[onboardStep]; const last = onboardMessages[onboardMessages.length - 1];
    const wait = last?.role === 'ai' && !last?.isDone && step;
    return (
      <div style={{ 
        ...S.page, 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 60% 30% at 80% 10%, rgba(247,219,240,0.3) 0%, transparent 50%),
          radial-gradient(ellipse 40% 25% at 10% 90%, rgba(205,240,234,0.3) 0%, transparent 50%),
          #FDF8F6
        `
      }}>
        {/* Header avec logo */}
        <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <EcloreLogo size={32} color={t.accent} />
          <span style={{ fontWeight: '300', fontSize: '18px', color: t.text, letterSpacing: '1px' }}>éclore</span>
        </div>
        
        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px' }}>
          {onboardMessages.map((m, i) => (
            <div key={i} style={{ marginBottom: '16px', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                maxWidth: '82%', 
                padding: '18px 24px', 
                borderRadius: m.role === 'user' ? '24px 24px 8px 24px' : '24px 24px 24px 8px', 
                background: m.role === 'user' ? `linear-gradient(135deg, ${t.accent}, ${t.accent2})` : 'rgba(255,255,255,0.7)', 
                color: m.role === 'user' ? '#fff' : t.text, 
                fontSize: '15px', 
                lineHeight: 1.8, 
                whiteSpace: 'pre-line',
                fontWeight: '300',
                letterSpacing: '0.2px',
                boxShadow: m.role === 'user' ? '0 8px 24px rgba(190,174,226,0.3)' : '0 2px 12px rgba(0,0,0,0.03)',
                backdropFilter: 'blur(8px)'
              }}>{m.text}</div>
            </div>
          ))}
          <div ref={onboardEndRef} />
        </div>
        
        {/* Input area */}
        <div style={{ padding: '20px 24px 36px' }}>
          {last?.showChoice ? <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button style={S.btn(true)} onClick={() => finishOnboarding(true)}>Continuer le questionnaire</button>
            <button style={{ ...S.btnSm, background: 'rgba(255,255,255,0.5)', border: 'none' }} onClick={() => finishOnboarding(false)}>Découvrir mon espace d'abord</button>
          </div>
          : wait && step.type === 'input' ? <div style={{ display: 'flex', gap: '12px' }}><input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' && inputValue && respond(inputValue)} placeholder={step.placeholder} style={S.input} autoFocus /><button onClick={() => inputValue && respond(inputValue)} style={{ ...S.btn(true), width: '56px' }}>{Icons.send(dark ? t.bg : '#fff')}</button></div>
          : wait && step.type === 'date' ? <div style={{ display: 'flex', gap: '12px' }}><input type="date" value={inputValue} onChange={e => { console.log('date changed:', e.target.value); setInputValue(e.target.value); }} style={{ ...S.input, colorScheme: dark ? 'dark' : 'light' }} /><button onClick={() => { console.log('click, inputValue:', inputValue); if (inputValue) respond(inputValue); }} style={{ ...S.btn(true), width: '56px', opacity: inputValue ? 1 : 0.5, cursor: inputValue ? 'pointer' : 'not-allowed' }}>{Icons.send(dark ? t.bg : '#fff')}</button></div>
          : wait && step.type === 'choice' ? <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{step.options.map(o => <button key={o.value} onClick={() => respond(o.value)} style={{ ...S.card, padding: '16px', textAlign: 'left', cursor: 'pointer', marginBottom: 0 }}>{o.label}</button>)}</div>
          : wait && step.type === 'message' ? <button style={S.btn(true)} onClick={() => setOnboardStep(s => s + 1)}>Continuer</button> : null}
        </div>
      </div>
    );
  }

  // MAIN
  if (screen === 'main') {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
    const primary = AXES.find(a => a.id === selectedAxes.primary);
    
    // Message quotidien personnalisé selon l'axe et l'humeur
    const getDailyMsg = () => {
      const lastMood = checkIns[checkIns.length - 1]?.mood;
      if (!primary) return `Nouvelle journée, ${profile.name}. Je suis là. 💜`;
      
      if (lastMood && lastMood <= 2) {
        return `Hier était difficile. Mais tu es encore là, ${profile.name}. C'est ça le courage. 💜`;
      }
      
      const messages = {
        anxiety: [`Une journée à la fois, ${profile.name}. L'anxiété ne définit pas qui tu es.`, `Respire. Tu es en sécurité. 💜`, `Aujourd'hui, concentre-toi sur ce que tu peux contrôler.`],
        sadness: [`La tristesse est passagère, ${profile.name}. Je suis là.`, `Tu as le droit de ne pas aller bien. 💜`, `Sois douce avec toi aujourd'hui.`],
        sleep: [`Repose-toi dès que tu peux, ${profile.name}. Ton corps en a besoin.`, `Même une micro-sieste compte. 💜`, `La fatigue passera. Tu tiens bon.`],
        anger: [`Tes émotions sont valides, ${profile.name}. Même la colère.`, `Si ça monte aujourd'hui : pause, respire. 💜`, `Tu fais de ton mieux.`],
        isolation: [`Tu n'es pas seule, ${profile.name}. Je suis là.`, `Une petite sortie aujourd'hui ? 💜`, `Même 5 min dehors peuvent aider.`],
        body: [`Ton corps a fait quelque chose d'extraordinaire, ${profile.name}.`, `Sois patiente avec toi. 💜`, `9 mois pour changer, donne-toi au moins autant.`]
      };
      
      const axisMessages = messages[selectedAxes.primary] || [];
      return axisMessages[Math.floor(Math.random() * axisMessages.length)] || `Focus: ${primary.label.toLowerCase()}. 💜`;
    };
    
    const dailyMsg = getDailyMsg();

    return (
      <div style={{
        ...S.page,
        background: `
          radial-gradient(ellipse 70% 35% at 90% 5%, rgba(247,219,240,0.35) 0%, transparent 50%),
          radial-gradient(ellipse 50% 25% at 5% 85%, rgba(205,240,234,0.3) 0%, transparent 50%),
          radial-gradient(ellipse 40% 20% at 50% 50%, rgba(190,174,226,0.15) 0%, transparent 50%),
          #FDF8F6
        `
      }}>
        {/* Header premium */}
        <header style={{ padding: '28px 28px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '12px', color: t.soft, marginBottom: '6px', fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>{days[today.getDay()]} {today.getDate()} {months[today.getMonth()]}</p>
            <h1 style={{ fontSize: '26px', fontWeight: '200', letterSpacing: '0.5px' }}>
              Hello <span style={{ fontWeight: '400' }}>{profile.name}</span>
            </h1>
          </div>
          <button 
            onClick={() => setDark(!dark)} 
            style={{ 
              background: 'rgba(255,255,255,0.6)', 
              border: 'none', 
              borderRadius: '50%', 
              width: '44px', 
              height: '44px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backdropFilter: 'blur(8px)'
            }}
          >
            {dark ? Icons.sun(t.text) : Icons.moon(t.soft)}
          </button>
        </header>

        <main style={{ padding: '0 24px 140px' }}>
          {tab === 'home' && <>
            {/* MESSAGE DU JOUR */}
            <div style={{ 
              ...S.card, 
              background: 'rgba(255,255,255,0.5)', 
              padding: '28px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '50%',
                height: '80%',
                background: 'radial-gradient(ellipse, rgba(247,219,240,0.4) 0%, transparent 70%)',
                filter: 'blur(20px)',
                pointerEvents: 'none'
              }} />
              <p style={{ fontSize: '17px', lineHeight: 1.8, fontWeight: '300', position: 'relative', zIndex: 1 }}>{dailyMsg}</p>
            </div>

            {/* CHAT - ÉLÉMENT PRINCIPAL avec GlassOrb */}
            <div style={{ 
              ...S.card, 
              cursor: 'pointer', 
              padding: '40px 24px', 
              textAlign: 'center',
              background: 'rgba(255,255,255,0.5)'
            }} onClick={openChat}>
              <div style={{ margin: '0 auto 24px', position: 'relative', display: 'inline-block' }}>
                <GlassOrb size={120} notification={!profileComplete} />
              </div>
              <p style={{ fontSize: '20px', fontWeight: '300', marginBottom: '8px', color: t.text, letterSpacing: '0.5px' }}>Parler à Éclore</p>
              <p style={{ fontSize: '14px', color: t.soft, fontWeight: '300', letterSpacing: '0.3px' }}>Je suis là pour t'écouter</p>
            </div>

            {/* COMPLÉTER PROFIL (si pas fait) */}
            {!profileComplete && <div style={{ 
              ...S.card, 
              cursor: 'pointer', 
              background: 'rgba(255,255,255,0.5)',
              border: 'none'
            }} onClick={startQ}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '16px', 
                  background: `linear-gradient(135deg, ${t.accent}40, ${t.accent2}30)`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>{Icons.target(t.accent)}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '400', fontSize: '15px', letterSpacing: '0.2px' }}>Compléter mon profil</p>
                  <p style={{ fontSize: '13px', color: t.soft, fontWeight: '300' }}>Pour un accompagnement personnalisé</p>
                </div>
                <p style={{ fontSize: '18px', fontWeight: '300', color: t.accent }}>{profileCompletion}%</p>
              </div>
            </div>}

            {/* AXES DE TRAVAIL (si complété) */}
            {profileComplete && primary && <div style={{ ...S.card, background: 'rgba(255,255,255,0.5)' }}>
              <p style={{ fontSize: '11px', color: t.soft, marginBottom: '14px', fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>Ton focus</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ padding: '12px 20px', borderRadius: '50px', background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, color: '#fff', fontSize: '14px', fontWeight: '400', letterSpacing: '0.3px', boxShadow: '0 6px 20px rgba(190,174,226,0.35)' }}>{primary.icon} {primary.label}</span>
                {selectedAxes.secondary.map(id => { const a = AXES.find(x => x.id === id); return <span key={id} style={{ padding: '12px 20px', borderRadius: '50px', background: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: '300' }}>{a.icon} {a.label}</span>; })}
              </div>
            </div>}

            {/* CHECK-IN QUOTIDIEN */}
            <div style={{ ...S.card, background: 'rgba(255,255,255,0.5)' }}>
              <p style={{ fontSize: '11px', color: t.soft, marginBottom: '8px', fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>Check-in du jour</p>
              {!todayCheckIn ? <>
                <p style={{ fontSize: '17px', marginBottom: '20px', fontWeight: '300' }}>Comment tu te sens ?</p>
                <div style={{ display: 'flex', gap: '10px' }}>{MOODS.map(m => <button key={m.v} onClick={() => checkIn(m.v)} style={{ flex: 1, padding: '16px 8px', borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s ease', backdropFilter: 'blur(8px)' }}><span style={{ fontSize: '28px', display: 'block' }}>{m.e}</span><span style={{ fontSize: '10px', color: t.soft, fontWeight: '300', marginTop: '4px', display: 'block' }}>{m.l}</span></button>)}</div>
              </> : moodResponse ? <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px', marginBottom: '20px', padding: '16px', borderRadius: '20px', background: 'rgba(255,255,255,0.6)' }}>
                  <span style={{ fontSize: '40px' }}>{MOODS.find(m => m.v === todayCheckIn.mood)?.e}</span>
                  <div>
                    <p style={{ fontWeight: '400', fontSize: '16px' }}>{MOODS.find(m => m.v === todayCheckIn.mood)?.l}</p>
                    <p style={{ fontSize: '12px', color: t.success, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '300' }}>{Icons.check(t.success)} Enregistré</p>
                  </div>
                </div>
                <p style={{ fontSize: '15px', marginBottom: '20px', lineHeight: 1.7, fontWeight: '300' }}>{moodResponse.text}</p>
                
                {/* Actions structurées */}
                <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                  <p style={{ fontSize: '11px', color: t.soft, marginBottom: '14px', fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>Comment t'aider ?</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {moodResponse.actions.map((a, i) => (
                      <button key={i} onClick={() => { if (a.act === 'chat') openChat(); else if (a.act === 'ex') openEx(EXERCISES.find(e => e.id === a.id)); else setMoodResponse(null); }} 
                        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '16px', border: 'none', background: i === 0 ? `linear-gradient(135deg, ${t.accent}, ${t.accent2})` : 'rgba(255,255,255,0.6)', color: i === 0 ? '#fff' : t.text, cursor: 'pointer', textAlign: 'left', boxShadow: i === 0 ? '0 6px 20px rgba(190,174,226,0.3)' : 'none' }}>
                        <span style={{ fontSize: '20px' }}>{a.act === 'chat' ? '💬' : a.act === 'ex' ? EXERCISES.find(e => e.id === a.id)?.icon : '✓'}</span>
                        <span style={{ fontWeight: '400', letterSpacing: '0.2px' }}>{a.act === 'chat' ? 'Parler à Éclore' : a.act === 'ex' ? `${EXERCISES.find(e => e.id === a.id)?.title}` : 'C\'est noté'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </> : <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px', padding: '16px', borderRadius: '20px', background: 'rgba(255,255,255,0.6)' }}>
                <span style={{ fontSize: '36px' }}>{MOODS.find(m => m.v === todayCheckIn.mood)?.e}</span>
                <div>
                  <p style={{ fontWeight: '500' }}>{MOODS.find(m => m.v === todayCheckIn.mood)?.l}</p>
                  <p style={{ fontSize: '12px', color: t.success, display: 'flex', alignItems: 'center', gap: '4px' }}>{Icons.check(t.success)} Check-in fait</p>
                </div>
              </div>}
            </div>

            {/* PROGRESSION */}
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

            {/* HYDRATATION */}
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <p style={{ fontSize: '12px', color: t.soft, fontWeight: '500', letterSpacing: '0.3px' }}>Hydratation</p>
                <p style={{ fontSize: '12px', color: t.soft, fontWeight: '300' }}>Objectif : {(waterGoal / 1000).toFixed(1)}L {profile.feeding === 'breast' || profile.feeding === 'mixed' ? '(allaitement)' : ''}</p>
              </div>
              
              {/* Barre de progression */}
              <div style={{ height: '10px', background: dark ? 'rgba(255,255,255,0.05)' : `${t.turquoise}40`, borderRadius: '5px', marginBottom: '14px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${waterPercent}%`, background: `linear-gradient(90deg, ${t.turquoise}, ${t.mint})`, borderRadius: '5px', transition: 'width 0.3s' }} />
              </div>
              
              {/* Compteur */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '26px', fontWeight: '400' }}>
                  <span style={{ color: waterPercent >= 100 ? t.success : t.text }}>{(waterIntake / 1000).toFixed(1)}</span>
                  <span style={{ fontSize: '16px', color: t.soft, fontWeight: '300' }}> / {(waterGoal / 1000).toFixed(1)}L</span>
                </p>
                {waterPercent >= 100 && <span style={{ color: t.success, fontSize: '13px', fontWeight: '500' }}>✓ Bravo !</span>}
              </div>
              
              {/* Boutons rapides */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => addWater(250)} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: `1px solid ${t.turquoise}40`, background: `${t.turquoise}15`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                  <span>{Icons.water(t.turquoise)}</span>
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>+250ml</span>
                </button>
                <button onClick={() => addWater(500)} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', background: `linear-gradient(135deg, ${t.turquoise}, ${t.mint})`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#2D2D3A', fontWeight: '500', fontSize: '14px', boxShadow: '0 4px 12px rgba(205,240,234,0.4)' }}>
                  +500ml
                </button>
                {waterIntake > 0 && <button onClick={() => setWaterIntake(0)} style={{ padding: '14px 16px', borderRadius: '16px', border: `1px solid ${t.border}`, background: 'transparent', cursor: 'pointer', fontSize: '12px', color: t.soft }}>Reset</button>}
              </div>
            </div>

            {/* BOÎTE À OUTILS */}
            <div style={S.card}>
              <p style={{ fontSize: '12px', color: t.soft, marginBottom: '14px', fontWeight: '500' }}>🧰 Boîte à outils</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '16px', background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', cursor: 'pointer' }} onClick={openChatFood}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🍽️</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '500', fontSize: '14px' }}>Que manger aujourd'hui ?</p>
                    <p style={{ fontSize: '12px', color: t.soft }}>Idées repas simples et rapides</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '16px', background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', cursor: 'pointer' }} onClick={() => setModal('symptoms')}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${t.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.book(t.accent)}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '500', fontSize: '14px' }}>C'est normal ?</p>
                    <p style={{ fontSize: '12px', color: t.soft }}>Symptômes post-partum expliqués</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '16px', background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', cursor: 'pointer' }} onClick={() => setModal('weekly')}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${t.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.star(t.accent)}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '500', fontSize: '14px' }}>Semaine {week}</p>
                    <p style={{ fontSize: '12px', color: t.soft }}>Ce qui t'attend cette semaine</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '16px', background: `${t.danger}08`, cursor: 'pointer' }} onClick={() => setModal('sos')}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${t.danger}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.phone(t.danger)}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '500', fontSize: '14px', color: t.danger }}>Besoin d'aide urgente</p>
                    <p style={{ fontSize: '12px', color: t.soft }}>Numéros d'écoute 24h/24</p>
                  </div>
                </div>
              </div>
            </div>
          </>}

          {tab === 'chat' && <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
            <div style={{ flex: 1, overflow: 'auto', paddingBottom: '16px' }}>
              {chatHistory.map((m, i) => {
                const isLastQuestion = m.isQ && m.opts && i === chatHistory.length - 1;
                return <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '85%' }}>
                    <div style={{ padding: '16px 20px', borderRadius: m.role === 'user' ? '24px 24px 6px 24px' : '24px 24px 24px 6px', background: m.role === 'user' ? t.text : t.card, color: m.role === 'user' ? (dark ? t.bg : '#fff') : t.text, fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{m.text.split('**').map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</div>
                    {isLastQuestion && <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>{m.opts.map(o => <button key={o.v} onClick={() => answerQ(m.qId, o.v, o.l)} style={{ ...S.card, padding: '14px', textAlign: 'left', cursor: 'pointer', marginBottom: 0 }}>{o.l}</button>)}</div>}
                    {m.showStart && !profileComplete && <button onClick={startQ} style={{ ...S.btn(true), marginTop: '12px' }}>Commencer</button>}
                    {m.showContinue && m.nextSection && <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}><button onClick={() => startSection(m.nextSection)} style={S.btn(true)}>Continuer</button><button onClick={() => setChatHistory(h => [...h, { role: 'ai', text: 'OK !' }])} style={S.btnSm}>Plus tard</button></div>}
                    {m.showAxes && m.axes && <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>{m.axes.map(a => <button key={a.id} onClick={() => selectPrimary(a.id)} style={{ ...S.card, padding: '14px', textAlign: 'left', cursor: 'pointer', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '24px' }}>{a.icon}</span><div><p style={{ fontWeight: '500' }}>{a.label}</p></div></button>)}</div>}
                    {m.showSecondary && <SecondarySelector axes={axesAnalysis?.filter(a => a.id !== m.primaryId && a.score > 0).slice(0, 4) || []} onSelect={selectSecondary} onSkip={skipSecondary} S={S} t={t} />}
                    {m.showFoodPrompts && m.foodPrompts && <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>{m.foodPrompts.map((fp, idx) => <button key={idx} onClick={() => { setChatHistory(h => [...h, { role: 'user', text: fp.label }]); setChatInput(fp.value); setTimeout(() => { const fakeEvent = { target: { value: fp.value } }; setChatInput(fp.value); }, 50); setTimeout(() => { 
                      // Simuler l'envoi du message food
                      let response = { text: '' };
                      if (fp.value.includes('épuisée')) response.text = `Quand on est épuisée, on a besoin d'énergie rapide mais durable. Voici des idées :\n\n• **Tartine avocat + œuf** (5 min)\n• **Yaourt + banane + miel + noix** (2 min)\n• **Fromage + pain complet + tomates** (2 min)\n• **Smoothie banane-lait-flocons d'avoine** (3 min)\n\nL'important c'est de manger, pas de faire compliqué. 💜`;
                      else if (fp.value.includes('rapide')) response.text = `Idées repas rapides (<15 min) :\n\n🍳 **Petit-déj à toute heure** : œufs brouillés + pain\n🥗 **Salade express** : salade en sachet + thon + maïs + huile d'olive\n🍝 **Pâtes magiques** : pâtes + beurre + parmesan\n🥪 **Wrap** : tortilla + ce qu'il y a (fromage, jambon, crudités)\n\nTu as quoi dans ton frigo là ?`;
                      else if (fp.value.includes('lactation')) response.text = `Pour soutenir la lactation :\n\n💧 **Hydratation** : bois beaucoup (eau, tisanes)\n🥣 **Flocons d'avoine** : le matin, en porridge ou smoothie\n🥜 **Amandes, noix** : en snack\n🍌 **Bananes** : énergie + potassium\n🐟 **Poisson, œufs** : protéines de qualité\n\nEt surtout : mange à ta faim ! Ton corps a besoin de ~500 calories de plus par jour. 💜`;
                      else if (fp.value.includes('frigo')) response.text = `Dis-moi ce que tu as ! Genre :\n\n"J'ai des œufs, du fromage et des tomates"\n\nEt je te propose une idée avec ça. 🍳`;
                      setChatHistory(h => [...h, { role: 'ai', ...response }]);
                      setChatInput('');
                    }, 300); }} style={{ ...S.card, padding: '14px', textAlign: 'left', cursor: 'pointer', marginBottom: 0 }}>{fp.label}</button>)}</div>}
                    {m.showSOS && <button onClick={() => setModal('sos')} style={{ ...S.btnSm, marginTop: '10px', background: `${t.danger}20`, color: t.danger }}>📞 Aide</button>}
                    {m.suggest && <button onClick={() => openEx(EXERCISES.find(e => e.id === m.suggest))} style={{ ...S.btnSm, marginTop: '10px' }}>{EXERCISES.find(e => e.id === m.suggest)?.icon} Exercice</button>}
                  </div>
                </div>
              </div>})}
              <div ref={chatEndRef} />
            </div>
            {!chatHistory.some(m => m.isQ && m.opts && chatHistory.indexOf(m) === chatHistory.length - 1) && <div style={{ display: 'flex', gap: '12px', paddingTop: '12px' }}><input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChat()} placeholder="Écris..." style={S.input} /><button onClick={sendChat} style={{ ...S.btn(true), width: '56px' }}>{Icons.send(dark ? t.bg : '#fff')}</button></div>}
          </div>}

          {tab === 'learn' && <>
            <h2 style={{ fontSize: '26px', fontWeight: '300', marginBottom: '8px' }}>Apprendre</h2>
            <p style={{ fontSize: '14px', color: t.soft, marginBottom: '20px' }}>Des ressources pour mieux comprendre ce que tu traverses</p>
            
            {/* Barre de recherche */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }}>{Icons.search(t.soft)}</div>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher un article..." style={{ ...S.input, paddingLeft: '50px' }} />
            </div>
            
            {searchQuery ? <>
              {/* Résultats de recherche */}
              <p style={{ fontSize: '12px', color: t.soft, marginBottom: '12px' }}>{ARTICLES.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).length} résultat(s)</p>
              {ARTICLES.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).map(a => (
                <div key={a.id} style={{ ...S.card, cursor: 'pointer' }} onClick={() => setSelectedArticle(a)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: CATEGORIES.find(c => c.id === a.cat)?.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{CATEGORIES.find(c => c.id === a.cat)?.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '500' }}>{a.title}</p>
                      <p style={{ fontSize: '12px', color: t.soft }}>{a.readTime || '2 min'} de lecture</p>
                    </div>
                    {readArticles.includes(a.id) && <span style={{ color: t.success }}>{Icons.check(t.success)}</span>}
                  </div>
                </div>
              ))}
              {ARTICLES.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && 
                <p style={{ textAlign: 'center', color: t.soft, padding: '20px' }}>Aucun article trouvé</p>}
            </> : selectedCategory ? <>
              {/* Liste des articles d'une catégorie */}
              <button onClick={() => setSelectedCategory(null)} style={{ ...S.btnSm, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>{Icons.back(t.text)} Retour aux catégories</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: CATEGORIES.find(c => c.id === selectedCategory)?.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{CATEGORIES.find(c => c.id === selectedCategory)?.icon}</div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '500' }}>{CATEGORIES.find(c => c.id === selectedCategory)?.label}</h3>
                  <p style={{ fontSize: '13px', color: t.soft }}>{ARTICLES.filter(a => a.cat === selectedCategory).length} articles</p>
                </div>
              </div>
              {ARTICLES.filter(a => a.cat === selectedCategory).map(a => (
                <div key={a.id} style={{ ...S.card, cursor: 'pointer' }} onClick={() => setSelectedArticle(a)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: '500', marginBottom: '4px' }}>{a.title}</p>
                      <p style={{ fontSize: '12px', color: t.soft }}>{a.readTime || '2 min'} de lecture</p>
                    </div>
                    {readArticles.includes(a.id) && <span style={{ color: t.success }}>{Icons.check(t.success)}</span>}
                  </div>
                </div>
              ))}
            </> : <>
              {/* Catégories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {CATEGORIES.map(c => (
                  <div key={c.id} style={{ ...S.card, cursor: 'pointer', padding: '20px', marginBottom: 0 }} onClick={() => setSelectedCategory(c.id)}>
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
            </>}
          </>}

          {tab === 'exercises' && <>
            <h2 style={{ fontSize: '26px', fontWeight: '300', marginBottom: '8px' }}>Exercices</h2>
            <p style={{ fontSize: '14px', color: t.soft, marginBottom: '20px' }}>Des moments de bien-être adaptés à tes besoins</p>
            
            {/* Barre de recherche */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }}>{Icons.search(t.soft)}</div>
              <input type="text" value={exerciseSearch} onChange={e => setExerciseSearch(e.target.value)} placeholder="Rechercher un exercice..." style={{ ...S.input, paddingLeft: '50px' }} />
            </div>
            
            {EXERCISES.filter(ex => !exerciseSearch || ex.title.toLowerCase().includes(exerciseSearch.toLowerCase()) || ex.desc?.toLowerCase().includes(exerciseSearch.toLowerCase())).map(ex => (
              <div key={ex.id} style={{ ...S.card, cursor: 'pointer' }} onClick={() => openEx(ex)}>
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
            {EXERCISES.filter(ex => !exerciseSearch || ex.title.toLowerCase().includes(exerciseSearch.toLowerCase())).length === 0 && 
              <p style={{ textAlign: 'center', color: t.soft, padding: '20px' }}>Aucun exercice trouvé</p>}
          </>}

          {tab === 'baby' && <>
            <div style={{ ...S.card, textAlign: 'center', padding: '32px' }}><span style={{ fontSize: '56px' }}>👶</span><h2 style={{ fontSize: '28px', fontWeight: '300', marginTop: '16px' }}>{profile.babyName}</h2><p style={{ color: t.soft, marginTop: '8px' }}>{week} sem</p></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', marginBottom: '14px' }}><p style={{ fontSize: '11px', color: t.soft, textTransform: 'uppercase' }}>Événements</p><button onClick={() => setModal('addEvent')} style={S.btnSm}>{Icons.plus(t.text)} Ajouter</button></div>
            {babyEvents.map(e => <div key={e.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '14px' }}><span style={{ fontSize: '28px' }}>{e.icon}</span><div><p style={{ fontWeight: '500' }}>{e.label}</p><p style={{ fontSize: '13px', color: t.soft }}>{new Date(e.date).toLocaleDateString('fr-FR')}</p></div></div>)}
          </>}

          {tab === 'evolution' && <>
            <h2 style={{ fontSize: '26px', fontWeight: '300', marginBottom: '20px' }}>Parcours</h2>
            <div style={S.card}>
              <p style={{ fontSize: '11px', color: t.soft, marginBottom: '16px', textTransform: 'uppercase' }}>Humeur</p>
              {checkIns.length > 0 ? <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '100px' }}>{checkIns.slice(-7).map((c, i) => <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div style={{ width: '100%', height: `${c.mood * 18}px`, background: t.accent, borderRadius: '8px 8px 0 0' }} /><span style={{ fontSize: '16px', marginTop: '8px' }}>{MOODS.find(m => m.v === c.mood)?.e}</span></div>)}</div> : <p style={{ color: t.soft, textAlign: 'center' }}>Premier check-in ?</p>}
            </div>
            <div style={S.card}>
              <p style={{ fontSize: '11px', color: t.soft, marginBottom: '16px', textTransform: 'uppercase' }}>Victoires</p>
              {streak >= 1 && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>{Icons.fire(t.accent)}<span>{streak} check-ins</span></div>}
              {exercisesDone.length >= 1 && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>{Icons.lotus(t.accent)}<span>{exercisesDone.length} exercices</span></div>}
              {profileComplete && <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>{Icons.target(t.accent)}<span>Profil OK</span></div>}
            </div>
          </>}
        </main>

        {/* NAV BAR Premium */}
        <nav style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          background: dark ? 'rgba(26,26,46,0.98)' : 'rgba(255,255,255,0.98)', 
          backdropFilter: 'blur(20px)', 
          borderTop: `1px solid ${t.border}`, 
          padding: '10px 0 30px', 
          display: 'flex', 
          justifyContent: 'space-around', 
          zIndex: 50 
        }}>
          {[
            { id: 'home', icon: Icons.home, l: 'Accueil' }, 
            { id: 'chat', icon: Icons.chat, l: 'Chat' }, 
            { id: 'learn', icon: Icons.book, l: 'Apprendre' }, 
            { id: 'exercises', icon: Icons.lotus, l: 'Exercices' }, 
            { id: 'baby', icon: Icons.baby, l: 'Bébé' }, 
            { id: 'evolution', icon: Icons.chart, l: 'Évolution' }
          ].map(n => (
            <div 
              key={n.id} 
              onClick={() => n.id === 'chat' ? openChat() : setTab(n.id)} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '4px', 
                padding: '6px 8px', 
                cursor: 'pointer', 
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                padding: '8px', 
                borderRadius: '12px', 
                background: tab === n.id ? `${t.accent}15` : 'transparent',
                transition: 'all 0.2s ease'
              }}>
                {n.icon(tab === n.id ? t.accent : t.soft)}
              </div>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: tab === n.id ? '500' : '400',
                color: tab === n.id ? t.accent : t.soft
              }}>{n.l}</span>
              {n.id === 'chat' && !profileComplete && (
                <div style={{ 
                  position: 'absolute', 
                  top: '4px', 
                  right: '4px', 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: t.danger,
                  boxShadow: '0 2px 4px rgba(232,165,165,0.4)'
                }} />
              )}
            </div>
          ))}
        </nav>

        {modal === 'exercise' && currentExercise && <div style={S.full}><div style={{ padding: '24px', maxWidth: '440px', margin: '0 auto' }}>
          <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: t.soft }}>{Icons.back(t.soft)} <span>Retour</span></button>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: currentExercise.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 16px' }}>{currentExercise.icon}</div>
            <h2 style={{ fontSize: '24px', fontWeight: '400' }}>{currentExercise.title}</h2>
            <p style={{ fontSize: '14px', color: t.soft, marginTop: '4px' }}>{currentExercise.duration}</p>
          </div>
          
          {/* Description si pas encore commencé */}
          {exerciseStep === 0 && !currentExercise.isKegel && currentExercise.desc && (
            <div style={{ ...S.card, marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: t.soft }}>{currentExercise.desc}</p>
            </div>
          )}
          
          {currentExercise.isKegel ? <>
            <div style={{ ...S.card, marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: t.soft, marginBottom: '16px' }}>{currentExercise.desc}</p>
            </div>
            <div style={{ ...S.card, textAlign: 'center', padding: '24px' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>Contracte : <strong>3 secondes</strong></p>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>Relâche : <strong>6 secondes</strong></p>
              <p style={{ fontSize: '16px' }}>Répète : <strong>8 fois</strong></p>
            </div>
            <button onClick={() => { doneEx(); setModal(null); }} style={{ ...S.btn(true), marginTop: '24px' }}>J'ai fait ! ✓</button>
          </> : exerciseStep < (currentExercise.steps?.length || 0) ? <>
            <div style={{ height: '4px', background: t.border, borderRadius: '2px', marginBottom: '24px' }}><div style={{ height: '100%', width: `${(exerciseStep + 1) / currentExercise.steps.length * 100}%`, background: t.accent, borderRadius: '2px', transition: 'width 0.3s' }} /></div>
            <p style={{ fontSize: '12px', color: t.soft, textAlign: 'center', marginBottom: '16px' }}>Étape {exerciseStep + 1} sur {currentExercise.steps.length}</p>
            <div style={{ ...S.card, padding: '32px 24px', textAlign: 'center', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ fontSize: '18px', lineHeight: 1.6 }}>{currentExercise.steps[exerciseStep]}</p></div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>{exerciseStep > 0 && <button onClick={() => setExerciseStep(s => s - 1)} style={S.btnSm}>← Précédent</button>}<button onClick={() => exerciseStep === currentExercise.steps.length - 1 ? doneEx() : setExerciseStep(s => s + 1)} style={{ ...S.btn(true), flex: 1 }}>{exerciseStep === currentExercise.steps.length - 1 ? 'Terminer ✓' : 'Suivant →'}</button></div>
          </> : <><div style={{ ...S.card, background: `${t.success}15`, textAlign: 'center', padding: '32px' }}><span style={{ fontSize: '56px' }}>✓</span><p style={{ fontSize: '20px', fontWeight: '500', marginTop: '16px' }}>Bravo !</p><p style={{ color: t.soft, marginTop: '8px' }}>Tu as pris soin de toi 💜</p></div><button onClick={() => setModal(null)} style={{ ...S.btn(true), marginTop: '24px' }}>Fermer</button></>}
        </div></div>}

        {modal === 'symptoms' && <div style={S.full}><div style={{ padding: '24px', maxWidth: '440px', margin: '0 auto' }}>
          <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px' }}>{Icons.back(t.soft)}</button>
          <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: '20px' }}>C'est normal ?</h2>
          {[{ icon: '😢', title: 'Baby blues', desc: 'J3-J10' }, { icon: '😤', title: 'Rage', desc: 'Épuisement' }, { icon: '⚖️', title: 'Poids', desc: '9+ mois' }, { icon: '🌸', title: 'Périnée', desc: 'Rééducation' }].map((s, i) => <div key={i} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '14px' }}><span style={{ fontSize: '28px' }}>{s.icon}</span><div><p style={{ fontWeight: '500' }}>{s.title}</p><p style={{ fontSize: '13px', color: t.soft }}>{s.desc}</p></div></div>)}
        </div></div>}

        {modal === 'weekly' && <div style={S.full}><div style={{ padding: '24px', maxWidth: '440px', margin: '0 auto' }}>
          <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px' }}>{Icons.back(t.soft)}</button>
          <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: '24px' }}>Semaine {week}</h2>
          <div style={{ ...S.card, background: `linear-gradient(135deg, ${t.accent}15, ${t.accent2}10)` }}><p>💡 {week <= 2 ? 'Repos' : week <= 6 ? 'Survie !' : 'Rythme'}</p></div>
        </div></div>}

        {modal === 'sos' && <div style={S.full}><div style={{ padding: '24px', maxWidth: '440px', margin: '0 auto' }}>
          <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px' }}>{Icons.back(t.soft)}</button>
          <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: '24px' }}>Aide urgente</h2>
          {SOS.map(s => <div key={s.number} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><p style={{ fontWeight: '500' }}>{s.name}</p><p style={{ fontSize: '13px', color: t.soft }}>{s.desc}</p></div><a href={`tel:${s.number}`} style={{ padding: '10px 18px', background: t.danger, color: '#fff', borderRadius: '50px', textDecoration: 'none' }}>{s.number}</a></div>)}
          <p style={{ textAlign: 'center', marginTop: '24px', color: t.soft }}>Demander aide = force 💜</p>
        </div></div>}

        {modal === 'addEvent' && <div style={S.full}><div style={{ padding: '24px', maxWidth: '440px', margin: '0 auto' }}>
          <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px' }}>{Icons.back(t.soft)}</button>
          <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: '20px' }}>Ajouter événement</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>{BABY_EVENTS.map(e => <button key={e.id} onClick={() => setNewEventType(e.id)} style={{ padding: '10px 14px', borderRadius: '50px', border: newEventType === e.id ? `2px solid ${t.accent}` : `1px solid ${t.border}`, background: newEventType === e.id ? `${t.accent}15` : 'transparent', cursor: 'pointer' }}>{e.icon} {e.label}</button>)}</div>
          <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} style={{ ...S.input, marginBottom: '20px' }} />
          <button onClick={addEvent} style={{ ...S.btn(true), opacity: newEventType && newEventDate ? 1 : 0.4 }}>Ajouter</button>
        </div></div>}

        {selectedArticle && <div style={S.full}><div style={{ padding: '24px', maxWidth: '500px', margin: '0 auto' }}>
          <button onClick={() => { if (!readArticles.includes(selectedArticle.id)) setReadArticles([...readArticles, selectedArticle.id]); setSelectedArticle(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: t.soft }}>{Icons.back(t.soft)} <span>Retour</span></button>
          
          {/* En-tête de l'article */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '50px', background: `${CATEGORIES.find(c => c.id === selectedArticle.cat)?.color}30`, fontSize: '12px' }}>{CATEGORIES.find(c => c.id === selectedArticle.cat)?.label}</span>
              <span style={{ fontSize: '12px', color: t.soft }}>{selectedArticle.readTime || '2 min'} de lecture</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '400', lineHeight: 1.3 }}>{selectedArticle.title}</h2>
          </div>
          
          {/* Contenu formaté */}
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
          
          <button onClick={() => { if (!readArticles.includes(selectedArticle.id)) setReadArticles([...readArticles, selectedArticle.id]); setSelectedArticle(null); }} style={{ ...S.btn(true), marginTop: '24px' }}>J'ai compris 💜</button>
        </div></div>}
      </div>
    );
  }

  return null;
}

function SecondarySelector({ axes, onSelect, onSkip, S, t }) {
  const [selected, setSelected] = useState([]);
  const toggle = (id) => {
    if (selected.includes(id)) setSelected(selected.filter(x => x !== id));
    else if (selected.length < 2) setSelected([...selected, id]);
  };
  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {axes.map(a => <button key={a.id} onClick={() => toggle(a.id)} style={{ ...S.card, padding: '14px', textAlign: 'left', cursor: 'pointer', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '12px', border: selected.includes(a.id) ? `2px solid ${t.accent}` : 'none', background: selected.includes(a.id) ? `${t.accent}10` : t.card }}><span style={{ fontSize: '24px' }}>{a.icon}</span><div style={{ flex: 1 }}><p style={{ fontWeight: '500' }}>{a.label}</p></div>{selected.includes(a.id) && <span style={{ color: t.accent }}>✓</span>}</button>)}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => onSelect(selected)} style={{ ...S.btn(true), flex: 1 }}>{selected.length > 0 ? `Valider (${selected.length})` : 'Valider'}</button>
        <button onClick={onSkip} style={S.btnSm}>Passer</button>
      </div>
    </div>
  );
}
