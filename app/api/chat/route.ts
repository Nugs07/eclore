import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chat, ChatContext } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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
    let babyAgeWeeks: number | undefined;
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

    // Sauvegarder les messages
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
