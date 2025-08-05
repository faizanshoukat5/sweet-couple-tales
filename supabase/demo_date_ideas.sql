-- Demo data for date_ideas table
insert into public.date_ideas (id, title, description, category, image_url, is_public, created_at)
values
  (gen_random_uuid(), 'Stargazing Picnic', 'Pack a blanket and snacks, drive out of the city, and watch the stars together.', 'Romantic', null, true, now()),
  (gen_random_uuid(), 'Cooking Challenge', 'Pick a random recipe and cook it together. Loser does the dishes!', 'At Home', null, true, now()),
  (gen_random_uuid(), 'Hiking Adventure', 'Find a new trail and explore nature hand-in-hand.', 'Adventurous', null, true, now()),
  (gen_random_uuid(), 'Board Game Night', 'Play your favorite board games or try a new one for a cozy night in.', 'At Home', null, true, now()),
  (gen_random_uuid(), 'Food Truck Crawl', 'Visit several food trucks and sample something from each.', 'Food & Drink', null, true, now()),
  (gen_random_uuid(), 'Bike Ride & Ice Cream', 'Go for a bike ride and treat yourselves to ice cream at the end.', 'Outdoors', null, true, now()),
  (gen_random_uuid(), 'DIY Spa Night', 'Light candles, play relaxing music, and give each other massages.', 'Romantic', null, true, now()),
  (gen_random_uuid(), 'Farmers Market Date', 'Browse a local farmers market and pick out ingredients for a meal.', 'Food & Drink', null, true, now()),
  (gen_random_uuid(), 'Winter Wonderland Walk', 'Bundle up and take a walk in the snow, then warm up with hot cocoa.', 'Seasonal', null, true, now()),
  (gen_random_uuid(), 'Karaoke Night', 'Sing your hearts out at home or at a karaoke bar.', 'Adventurous', null, true, now()),
  (gen_random_uuid(), 'Sunset Beach Picnic', 'Pack a picnic and watch the sunset at the beach.', 'Outdoors', null, true, now()),
  (gen_random_uuid(), 'Thrift Store Challenge', 'Set a budget and buy each other a silly or stylish outfit.', 'Budget-Friendly', null, true, now()),
  (gen_random_uuid(), 'Double Date Bowling', 'Invite another couple and go bowling together.', 'Double Date', null, true, now()),
  (gen_random_uuid(), 'Movie Marathon', 'Pick a theme and watch a series of movies back-to-back.', 'At Home', null, true, now()),
  (gen_random_uuid(), 'Plant a Garden', 'Start a small garden or plant flowers together.', 'Outdoors', null, true, now()),
  (gen_random_uuid(), 'Paint & Sip', 'Paint together while enjoying your favorite drinks.', 'At Home', null, true, now()),
  (gen_random_uuid(), 'Ice Skating', 'Go ice skating at a local rink or outdoor pond.', 'Seasonal', null, true, now()),
  (gen_random_uuid(), 'Coffee Shop Hopping', 'Visit several coffee shops and rate your favorite drinks.', 'Food & Drink', null, true, now()),
  (gen_random_uuid(), 'Bookstore Date', 'Browse a bookstore and pick out a book for each other.', 'Romantic', null, true, now()),
  (gen_random_uuid(), 'Volunteer Together', 'Spend a day volunteering for a cause you both care about.', 'Budget-Friendly', null, true, now());
