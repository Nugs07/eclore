'use client';

import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Eclore from '@/components/Eclore';
import { createClient } from '@/lib/supabase/client';

interface EcloreClientProps {
  user: User;
  initialProfile?: {
    name?: string;
    babyName?: string;
    babyDate?: string;
    feeding?: 'breast' | 'bottle' | 'mixed' | 'weaned';
    initialMood?: number;
  };
}

export default function EcloreClient({ user, initialProfile }: EcloreClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return <Eclore user={user} initialProfile={initialProfile} onSignOut={handleSignOut} />;
}
