-- Create demo user profiles
INSERT INTO public.profiles (
    id,
    user_id, 
    email,
    display_name,
    created_at,
    updated_at
) VALUES 
-- Demo User 1: Emma
(
    'demo-emma-profile-uuid-123456789012',
    'demo-emma-user-uuid-1234567890123456',
    'emma.demo@coupleconnect.app',
    'Emma Johnson',
    '2024-01-15 10:00:00+00',
    '2024-01-15 10:00:00+00'
),
-- Demo User 2: Alex  
(
    'demo-alex-profile-uuid-123456789012',
    'demo-alex-user-uuid-1234567890123456', 
    'alex.demo@coupleconnect.app',
    'Alex Martinez',
    '2024-01-15 10:30:00+00',
    '2024-01-15 10:30:00+00'
)
ON CONFLICT (user_id) DO NOTHING;

-- Create couple relationship
INSERT INTO public.couples (
    id,
    user1_id,
    user2_id, 
    status,
    created_at,
    updated_at
) VALUES (
    'demo-couple-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    'demo-alex-user-uuid-1234567890123456',
    'accepted',
    '2024-01-16 14:30:00+00',
    '2024-01-16 14:30:00+00'
) ON CONFLICT DO NOTHING;

-- Create demo memories
INSERT INTO public.memories (
    id,
    user_id,
    title,
    content,
    memory_date,
    tags,
    location,
    created_at,
    updated_at
) VALUES 
(
    'memory-first-date-uuid-123456789012',
    'demo-emma-user-uuid-1234567890123456',
    'Our Magical First Date ✨',
    'Alex surprised me with a picnic in Central Park. We talked for hours under the cherry blossoms, and I knew there was something special about this person. The way Alex laughed at my terrible jokes and how we both reached for the same strawberry at the exact same time - it felt like destiny!',
    '2024-02-14 15:30:00+00',
    '["first date", "picnic", "Central Park", "cherry blossoms", "romantic"]',
    'Central Park, New York City',
    '2024-02-14 20:15:00+00',
    '2024-02-14 20:15:00+00'
),
(
    'memory-proposal-uuid-1234567890123456',
    'demo-alex-user-uuid-1234567890123456',
    'The Perfect Proposal 💍',
    'I spent weeks planning this moment. I took Emma back to the exact spot in Central Park where we had our first date. As the sun set behind the trees, I got down on one knee and asked the question that would change our lives forever. Her tears of joy were the most beautiful thing I''ve ever seen. She said YES!',
    '2024-08-20 19:45:00+00',
    '["proposal", "engagement", "Central Park", "sunset", "milestone"]',
    'Central Park, New York City',
    '2024-08-20 21:30:00+00',
    '2024-08-20 21:30:00+00'
),
(
    'memory-vacation-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    'Romantic Getaway to Santorini 🌅',
    'Our first vacation together was absolutely magical! Watching the sunset from our private terrace, exploring the charming blue and white villages, and sharing incredible Greek cuisine. Alex even learned a few Greek phrases to impress me - so sweet! This trip brought us even closer together.',
    '2024-06-10 18:00:00+00',
    '["vacation", "Santorini", "sunset", "Greece", "romantic getaway"]',
    'Santorini, Greece',
    '2024-06-15 12:00:00+00',
    '2024-06-15 12:00:00+00'
),
(
    'memory-moving-in-uuid-1234567890123456',
    'demo-alex-user-uuid-1234567890123456',
    'Moving In Together 🏠',
    'Today we officially moved in together! It''s amazing how our belongings just naturally found their perfect spots, like they were meant to be together just like us. Emma''s plants have already made our place feel like home, and I love seeing her coffee mug next to mine every morning.',
    '2024-09-01 12:00:00+00',
    '["milestone", "moving in", "new home", "together", "relationship goal"]',
    'Brooklyn, New York',
    '2024-09-01 19:30:00+00',
    '2024-09-01 19:30:00+00'
);

-- Create demo albums
INSERT INTO public.albums (
    id,
    user_id,
    title,
    description,
    cover_photo_url,
    "order",
    created_at,
    updated_at
) VALUES 
(
    'album-dates-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    'Our Amazing Dates 💕',
    'A collection of all our wonderful dates and adventures together',
    NULL,
    0,
    '2024-02-15 10:00:00+00',
    '2024-09-15 16:20:00+00'
),
(
    'album-vacation-uuid-1234567890123456',
    'demo-alex-user-uuid-1234567890123456', 
    'Santorini Adventure 🇬🇷',
    'Our unforgettable romantic getaway to the Greek islands',
    NULL,
    1,
    '2024-06-16 09:30:00+00',
    '2024-06-16 20:45:00+00'
),
(
    'album-everyday-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    'Everyday Magic ✨',
    'The little moments that make our love story special',
    NULL,
    2,
    '2024-07-01 14:15:00+00',
    '2024-09-10 11:30:00+00'
);

-- Create demo love notes
INSERT INTO public.love_notes (
    id,
    sender_id,
    recipient_id,
    content,
    created_at,
    updated_at
) VALUES 
(
    'note-good-morning-uuid-123456789012',
    'demo-alex-user-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    'Good morning, beautiful! I hope your day is as amazing as you are. Can''t wait to see you tonight for dinner! ❤️',
    '2024-09-18 07:15:00+00',
    '2024-09-18 07:15:00+00'
),
(
    'note-thank-you-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    'demo-alex-user-uuid-1234567890123456',
    'Thank you for always making me laugh, even on my worst days. You''re my sunshine and my best friend. I love you more than words can say! 💕',
    '2024-09-17 20:30:00+00',
    '2024-09-17 20:30:00+00'
),
(
    'note-anniversary-uuid-1234567890123456',
    'demo-alex-user-uuid-1234567890123456', 
    'demo-emma-user-uuid-1234567890123456',
    'Happy 8 month anniversary, my love! Every day with you feels like a new adventure. Here''s to many more months (and years) of laughter, love, and happiness together! 🥂',
    '2024-09-16 12:00:00+00',
    '2024-09-16 12:00:00+00'
);

-- Create demo messages (chat)
INSERT INTO public.messages (
    id,
    sender_id,
    recipient_id,
    content,
    created_at,
    updated_at,
    delivered_at
) VALUES 
(
    'msg-1-uuid-1234567890123456789012',
    'demo-emma-user-uuid-1234567890123456',
    'demo-alex-user-uuid-1234567890123456',
    'Hey babe! Just finished my meeting. How''s your day going? 😊',
    '2024-09-18 14:30:00+00',
    '2024-09-18 14:30:00+00',
    '2024-09-18 14:30:15+00'
),
(
    'msg-2-uuid-1234567890123456789012',
    'demo-alex-user-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    'Pretty good! Just wrapped up that big presentation. The team loved our proposal! 🎉',
    '2024-09-18 14:35:00+00',
    '2024-09-18 14:35:00+00',
    '2024-09-18 14:35:10+00'
),
(
    'msg-3-uuid-1234567890123456789012',
    'demo-emma-user-uuid-1234567890123456',
    'demo-alex-user-uuid-1234567890123456',
    'That''s amazing! I''m so proud of you! 💪 Want to celebrate with dinner at that new Italian place?',
    '2024-09-18 14:36:00+00',
    '2024-09-18 14:36:00+00',
    '2024-09-18 14:36:05+00'
),
(
    'msg-4-uuid-1234567890123456789012',
    'demo-alex-user-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    'Perfect! I''ll make a reservation for 7 PM. Can''t wait to see you! ❤️',
    '2024-09-18 14:38:00+00',
    '2024-09-18 14:38:00+00',
    '2024-09-18 14:38:03+00'
);

-- Create demo goals
INSERT INTO public.goals (
    id,
    user_id,
    title,
    description,
    target_date,
    completed,
    created_at,
    updated_at
) VALUES 
(
    'goal-travel-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    'Visit Japan Together 🇯🇵',
    'Plan and take our dream trip to Japan - visit Tokyo, Kyoto, and experience the cherry blossom season',
    '2025-04-01 00:00:00+00',
    false,
    '2024-08-25 16:00:00+00',
    '2024-09-10 11:15:00+00'
),
(
    'goal-cooking-uuid-1234567890123456',
    'demo-alex-user-uuid-1234567890123456',
    'Learn to Cook Together 👨‍🍳',
    'Take a couples cooking class and master 5 new recipes together',
    '2024-12-31 00:00:00+00',
    false,
    '2024-09-01 18:30:00+00',
    '2024-09-15 14:20:00+00'
),
(
    'goal-fitness-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    'Run a 5K Together 🏃‍♀️',
    'Train together and complete our first 5K race as a couple',
    '2024-11-15 00:00:00+00',
    true,
    '2024-07-01 09:00:00+00',
    '2024-09-05 07:45:00+00'
);

-- Create demo important dates
INSERT INTO public.important_dates (
    id,
    user_id,
    title,
    date,
    category,
    notes,
    created_at,
    updated_at
) VALUES 
(
    'date-anniversary-uuid-123456789012',
    'demo-emma-user-uuid-1234567890123456',
    'Our Anniversary 💕',
    '2025-02-14',
    'anniversary',
    'One year since our magical first date in Central Park',
    '2024-02-15 12:00:00+00',
    '2024-08-20 16:30:00+00'
),
(
    'date-emma-birthday-uuid-123456789012',
    'demo-alex-user-uuid-1234567890123456',
    'Emma''s Birthday 🎂',
    '2025-03-22',
    'birthday',
    'Plan something extra special this year!',
    '2024-02-20 15:45:00+00',
    '2024-09-01 10:20:00+00'
),
(
    'date-alex-birthday-uuid-123456789012',
    'demo-emma-user-uuid-1234567890123456',
    'Alex''s Birthday 🎉',
    '2025-07-08',
    'birthday',
    'Surprise party with all our friends?',
    '2024-02-20 15:50:00+00',
    '2024-08-15 14:00:00+00'
),
(
    'date-vacation-uuid-1234567890123456',
    'demo-alex-user-uuid-1234567890123456',
    'Japan Trip 🌸',
    '2025-04-01',
    'vacation',
    'Cherry blossom season in Kyoto!',
    '2024-08-25 16:15:00+00',
    '2024-09-10 11:20:00+00'
);

-- Create demo mood entries  
INSERT INTO public.moods (
    id,
    user_id,
    mood_type,
    intensity,
    notes,
    created_at,
    updated_at
) VALUES 
(
    'mood-happy-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    'happy',
    5,
    'Alex surprised me with flowers today! Feeling so loved and grateful.',
    '2024-09-18 09:30:00+00',
    '2024-09-18 09:30:00+00'
),
(
    'mood-excited-uuid-1234567890123456',
    'demo-alex-user-uuid-1234567890123456',
    'excited',
    4,
    'Our presentation went amazing! Can''t wait to celebrate with Emma tonight.',
    '2024-09-18 15:00:00+00',
    '2024-09-18 15:00:00+00'
),
(
    'mood-grateful-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    'grateful',
    5,
    'Reflecting on how lucky I am to have Alex in my life. Every day feels like a blessing.',
    '2024-09-17 21:45:00+00',
    '2024-09-17 21:45:00+00'
);

-- Create love language quiz results
INSERT INTO public.love_language_quiz_results (
    id,
    user_id,
    words_of_affirmation,
    acts_of_service,
    receiving_gifts,
    quality_time,
    physical_touch,
    primary_love_language,
    secondary_love_language,
    created_at,
    updated_at
) VALUES 
(
    'quiz-emma-uuid-1234567890123456',
    'demo-emma-user-uuid-1234567890123456',
    15,
    20,
    8,
    25,
    12,
    'quality_time',
    'acts_of_service',
    '2024-03-01 14:30:00+00',
    '2024-03-01 14:30:00+00'
),
(
    'quiz-alex-uuid-1234567890123456',
    'demo-alex-user-uuid-1234567890123456',
    22,
    12,
    10,
    18,
    18,
    'words_of_affirmation',
    'physical_touch',
    '2024-03-01 15:15:00+00',
    '2024-03-01 15:15:00+00'
);