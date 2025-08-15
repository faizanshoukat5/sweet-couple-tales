

import React, { useMemo, useState, useEffect } from 'react';
import { Heart, Sparkles, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { usePartnerId } from '../hooks/usePartnerId';
import { supabase } from '../integrations/supabase/client';

const DEFAULT_NOTES = [
  "You are my favorite notification every day! 💌",
  "I love you more than words can say.",
  "Thank you for being my sunshine on cloudy days ☀️",
  "Every moment with you is my favorite memory.",
  "You make my heart smile! 😊",
  "Together is my favorite place to be.",
  "You are my today and all of my tomorrows.",
  "Falling in love with you is my favorite adventure.",
  "You are the reason I believe in magic. ✨",
  "I’m grateful for you every single day."
];


// Table: love_notes (id, couple_id, author_id, note, created_at)
// Only show notes authored by the partner, not the current user

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}


export const LoveNotesWidget: React.FC = () => {
  const { user } = useAuth();
  const partnerId = usePartnerId();
  const [partnerNotes, setPartnerNotes] = useState<string[]>([]);
  const [myNotes, setMyNotes] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes from Supabase
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const fetchNotes = async () => {
      // Get profile ID for the current user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !profileData) {
        setError('Could not find your profile.');
        setLoading(false);
        return;
      }
      
      // Get couple_id from couples table
      const { data: coupleData, error: coupleError } = await supabase
        .from('couples')
        .select('id, user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })
        .limit(1);
      if (coupleError || !coupleData || coupleData.length === 0) {
        setError('Could not find your couple.');
        setLoading(false);
        return;
      }
      const couple = coupleData[0];
      const coupleId = couple.id;
      
      // Get partner's user ID
      const partnerUserId = couple.user1_id === user.id ? couple.user2_id : couple.user1_id;
      
      // Get partner's profile ID
      const { data: partnerProfileData, error: partnerProfileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', partnerUserId)
        .single();
      
      if (partnerProfileError || !partnerProfileData) {
        console.warn('Could not find partner profile');
      }
      
      // Fetch all notes for this couple
      const { data: notes, error: notesError } = await supabase
        .from('love_notes')
        .select('id, author_id, note, created_at')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });
      if (notesError) {
        setError('Could not fetch notes.');
        setLoading(false);
        return;
      }
      setMyNotes(notes.filter((n: any) => n.author_id === profileData.id).map((n: any) => n.note));
      setPartnerNotes(partnerProfileData ? notes.filter((n: any) => n.author_id === partnerProfileData.id).map((n: any) => n.note) : []);
      setLoading(false);
    };
    fetchNotes();
  }, [user, partnerId]);

  // Add a new note (save to Supabase)
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    setLoading(true);
    setError(null);
    
    // Get profile ID for the current user
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profileData) {
      setError('Could not find your profile.');
      setLoading(false);
      return;
    }
    
    // Get couple_id
    const { data: coupleData, error: coupleError } = await supabase
      .from('couples')
      .select('id, user1_id, user2_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .single();
    if (coupleError || !coupleData) {
      setError('Could not find your couple.');
      setLoading(false);
      return;
    }
    const coupleId = coupleData.id;
    // Insert note
    const { error: insertError } = await supabase
      .from('love_notes')
      .insert({ couple_id: coupleId, author_id: profileData.id, note: input.trim() });
    if (insertError) {
      console.error('Insert error:', insertError);
      setError(`Could not add note: ${insertError.message}`);
      setLoading(false);
      return;
    }
    setInput('');
    setShowInput(false);
    // Refetch notes
    const { data: notes, error: notesError } = await supabase
      .from('love_notes')
      .select('id, author_id, note, created_at')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });
    if (!notesError && notes) {
      // Get partner's user ID from the couple data we already have
      const partnerUserId = coupleData.user1_id === user.id ? coupleData.user2_id : coupleData.user1_id;
      
      // Get partner's profile ID
      const { data: partnerProfileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', partnerUserId)
        .single();
      
      setMyNotes(notes.filter((n: any) => n.author_id === profileData.id).map((n: any) => n.note));
      setPartnerNotes(partnerProfileData ? notes.filter((n: any) => n.author_id === partnerProfileData.id).map((n: any) => n.note) : []);
    }
    setLoading(false);
  };

  // Remove a note (only your own)
  const handleRemoveNote = async (idx: number) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    
    // Get profile ID for the current user
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profileData) {
      setError('Could not find your profile.');
      setLoading(false);
      return;
    }
    
    // Get couple_id
    const { data: coupleData, error: coupleError } = await supabase
      .from('couples')
      .select('id, user1_id, user2_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .single();
    if (coupleError || !coupleData) {
      setError('Could not find your couple.');
      setLoading(false);
      return;
    }
    const coupleId = coupleData.id;
    // Find the note id to delete
    const { data: notes } = await supabase
      .from('love_notes')
      .select('id, author_id, note, created_at')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });
    const myNotesList = notes?.filter((n: any) => n.author_id === profileData.id) || [];
    const noteToDelete = myNotesList[idx];
    if (!noteToDelete) {
      setLoading(false);
      return;
    }
    await supabase.from('love_notes').delete().eq('id', noteToDelete.id);
    // Refetch notes
    const { data: notesAfter, error: notesError } = await supabase
      .from('love_notes')
      .select('id, author_id, note, created_at')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });
    if (!notesError && notesAfter) {
      // Get partner's user ID
      const partnerUserId = coupleData.user1_id === user.id ? coupleData.user2_id : coupleData.user1_id;
      
      // Get partner's profile ID
      const { data: partnerProfileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', partnerUserId)
        .single();
      
      setMyNotes(notesAfter.filter((n: any) => n.author_id === profileData.id).map((n: any) => n.note));
      setPartnerNotes(partnerProfileData ? notesAfter.filter((n: any) => n.author_id === partnerProfileData.id).map((n: any) => n.note) : []);
    }
    setLoading(false);
  };

  // Show only partner's notes to the user
  const notesToShow = partnerNotes.length > 0 ? partnerNotes : DEFAULT_NOTES;
  const today = new Date();
  const note = useMemo(() => {
    if (notesToShow.length === 0) return '';
    const idx = getDayOfYear(today) % notesToShow.length;
    return notesToShow[idx];
  }, [today, notesToShow]);

  return (
    <Card className="bg-gradient-to-br from-pink-50 via-white to-rose-100 border-0 shadow-lg rounded-2xl mb-8">
      <CardContent className="flex flex-col items-center gap-3 py-6 px-4 text-center">
        <span className="inline-flex items-center gap-2 text-2xl font-bold text-rose-500">
          <Heart className="w-6 h-6 animate-pulse text-rose-400" />
          Love Note
          <Sparkles className="w-5 h-5 text-yellow-400 ml-1 animate-bounce" />
        </span>
        {loading ? (
          <p className="text-rose-400">Loading...</p>
        ) : error ? (
          <p className="text-rose-400">{error}</p>
        ) : (
          <p className="font-serif text-lg text-rose-700 leading-relaxed min-h-[2.5rem]">
            {note}
          </p>
        )}

        {/* Add Note Button / Form */}
        {showInput ? (
          <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-2 w-full max-w-xs mx-auto mt-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 rounded-lg border border-rose-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="Write your own love note..."
              maxLength={120}
              autoFocus
              disabled={loading}
            />
            <Button type="submit" variant="romantic" className="px-4 py-2 rounded-lg" disabled={loading}>Add</Button>
            <Button type="button" variant="ghost" className="px-2" onClick={() => setShowInput(false)} disabled={loading}><X className="w-4 h-4" /></Button>
          </form>
        ) : (
          <Button variant="romantic" className="mt-2 px-6 py-2 rounded-full" onClick={() => setShowInput(true)} disabled={loading}>
            + Add Your Own Note
          </Button>
        )}

        {/* List your own notes with remove option */}
        {myNotes.length > 0 && (
          <div className="w-full max-w-xs mx-auto mt-4">
            <div className="text-xs text-rose-400 mb-1 font-semibold text-left">Your Notes (visible to your partner):</div>
            <ul className="flex flex-col gap-1">
              {myNotes.map((n, i) => (
                <li key={i} className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-lg px-3 py-1 text-sm text-rose-700">
                  <span className="truncate max-w-[80%]">{n}</span>
                  <Button size="icon" variant="ghost" className="ml-2" onClick={() => handleRemoveNote(i)} aria-label="Remove note" disabled={loading}>
                    <X className="w-4 h-4 text-rose-300" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
