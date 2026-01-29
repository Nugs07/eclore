import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EcloreClient from './EcloreClient';

export const dynamic = 'force-dynamic';

export default async function AppPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Load profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const initialProfile = profile ? {
    name: profile.name || undefined,
    babyName: profile.baby_name || undefined,
    babyDate: profile.baby_date || undefined,
    feeding: profile.feeding || undefined,
    initialMood: profile.initial_mood ? parseInt(profile.initial_mood) : undefined,
  } : undefined;

  return <EcloreClient user={user} initialProfile={initialProfile} />;
}
