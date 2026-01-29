'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/app');
      router.refresh();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 80% 50% at 50% 0%, rgba(247,219,240,0.5) 0%, transparent 50%),
        radial-gradient(ellipse 60% 40% at 80% 60%, rgba(205,240,234,0.4) 0%, transparent 50%),
        #FDF8F6
      `,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(247,219,240,0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(190,174,226,0.5) 0%, transparent 60%),
            linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(247,219,240,0.3) 100%)
          `,
          margin: '0 auto 16px',
          boxShadow: '0 20px 60px rgba(190,174,226,0.25)'
        }} />
        <h1 style={{ fontSize: '32px', fontWeight: '200', color: '#2D2D3A', letterSpacing: '2px' }}>éclore</h1>
        <p style={{ color: '#9D9DAF', fontSize: '14px', marginTop: '8px' }}>Content de te revoir</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '320px' }}>
        {error && (
          <div style={{
            background: '#FEE2E2',
            color: '#DC2626',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{
              width: '100%',
              padding: '18px 24px',
              borderRadius: '20px',
              border: 'none',
              background: 'rgba(255,255,255,0.7)',
              color: '#2D2D3A',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box',
              backdropFilter: 'blur(8px)'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
            style={{
              width: '100%',
              padding: '18px 24px',
              borderRadius: '20px',
              border: 'none',
              background: 'rgba(255,255,255,0.7)',
              color: '#2D2D3A',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box',
              backdropFilter: 'blur(8px)'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '18px 36px',
            borderRadius: '60px',
            border: 'none',
            background: 'linear-gradient(135deg, #BEAEE2 0%, #F7DBF0 100%)',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: '400',
            letterSpacing: '0.5px',
            boxShadow: '0 12px 32px rgba(190, 174, 226, 0.35)',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      {/* Link to signup */}
      <p style={{ marginTop: '32px', color: '#9D9DAF', fontSize: '14px' }}>
        Pas encore de compte ?{' '}
        <Link href="/signup" style={{ color: '#BEAEE2', textDecoration: 'none', fontWeight: '500' }}>
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
