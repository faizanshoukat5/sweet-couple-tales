# Chat Real-Time Testing Guide

## 🚀 Quick Setup

### 1. Database Setup
**IMPORTANT: Run this first!**
```sql
-- Execute the content from: SETUP_CHAT_DATABASE.sql
-- Copy and paste the entire content into your Supabase SQL Editor
```

### 2. Testing Setup
1. **Open two browsers** (Chrome + Firefox, or use incognito mode)
2. **Log in as different users** (User A and User B)
3. **Ensure both users are partners** (check couples table)
4. **Navigate to Dashboard → Chat section**

## 🧪 Real-Time Tests

### Test 1: Basic Message Delivery
1. **User A**: Send message "Hello from User A"
2. **Expected**: 
   - ✅ Message appears instantly for User A
   - ✅ Message appears in 1-2 seconds for User B
   - ✅ Single check mark (delivered) for User A

### Test 2: Read Status
1. **User B**: View the message (just look at it)
2. **Expected**:
   - ✅ Double check mark (read) appears for User A after 2 seconds
   - ✅ Unread count decreases for User B

### Test 3: Typing Indicators
1. **User A**: Start typing (don't send)
2. **Expected**:
   - ✅ "Typing..." appears for User B
   - ✅ Animated dots show for User B

### Test 4: Online Presence
1. **User A**: Close browser/tab
2. **Expected**:
   - ✅ User B sees "Offline" status for User A

## 🔍 Debug Console Logs

Open browser dev tools (F12) and look for these logs:

### ✅ Success Logs:
```
Message subscription status: SUBSCRIBED
Typing subscription status: SUBSCRIBED
Presence subscription status: SUBSCRIBED
New message received: {payload data}
Message sent successfully: {message data}
```

### ❌ Error Logs to Watch For:
```
Message subscription status: CHANNEL_ERROR
Failed to send message: {error}
RLS policy violation
WebSocket connection failed
```

## 🛠️ Troubleshooting

### Issue: Messages don't appear in real-time

**Check List:**
- [ ] Both users logged in with valid UUIDs
- [ ] Console shows "SUBSCRIBED" status
- [ ] Network tab shows WebSocket connection
- [ ] Database queries ran successfully

**Solutions:**
1. **Refresh both browsers**
2. **Check Supabase project settings**:
   - Go to Settings → API
   - Ensure Real-time is enabled
3. **Verify RLS policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'messages';
   ```

### Issue: Database permission errors

**Check:**
```sql
-- Test if you can read messages
SELECT * FROM messages LIMIT 1;

-- Test if you can insert messages
INSERT INTO messages (sender_id, receiver_id, content) 
VALUES (auth.uid(), 'test-uuid', 'test message');
```

**Solution:** Re-run the RLS policy setup from `SETUP_CHAT_DATABASE.sql`

### Issue: Typing indicators don't work

**Check Console:** Look for "Typing indicator received" logs

**Solution:** 
1. Ensure both users use same channel naming
2. Check if broadcast events are enabled in Supabase

### Issue: Presence (online/offline) doesn't work

**Check:** Presence sync logs in console

**Solution:** Verify presence channel subscription is working

## 📱 Expected WhatsApp-like Behavior

### ✅ Working Correctly:
- [x] Message appears instantly for sender (optimistic UI)
- [x] Message appears in real-time for receiver
- [x] Single check = delivered
- [x] Double check = read
- [x] Typing indicators work
- [x] Online/offline status updates
- [x] Messages persist after refresh
- [x] Secure (only sender/receiver can see messages)

### 🔧 Advanced Features (Already Implemented):
- [x] Character count (500 max)
- [x] Message timestamps
- [x] Auto-scroll to latest message
- [x] Unread message counter
- [x] Failed message handling with retry

## 🔄 Channel Names Used

The system uses consistent channel naming:
- **Messages**: `messages-{userId}-{partnerId}`
- **Typing**: `typing-{sortedUserIds}` (alphabetically sorted)
- **Presence**: `presence-{sortedUserIds}` (alphabetically sorted)

This ensures both users subscribe to the same channels.

## 🎯 Quick Verification Commands

Run these in Supabase SQL Editor to verify setup:

```sql
-- 1. Check if messages table has new columns
\d+ messages;

-- 2. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'messages';

-- 3. Check real-time publication
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'messages';

-- 4. Test message insertion
SELECT auth.uid(); -- Should return your user ID
```

## 🆘 Still Having Issues?

1. **Check Supabase Dashboard**:
   - Settings → Database → Connection pooling
   - Settings → API → Real-time section

2. **Verify Network**:
   - Check if WebSocket connections are blocked
   - Try different network/VPN

3. **Browser Issues**:
   - Clear browser cache
   - Try different browser
   - Disable browser extensions

4. **Database Issues**:
   - Check Supabase project status
   - Verify database connection
   - Check for any ongoing maintenance

## 📞 Contact

If you're still experiencing issues after following this guide:
1. Check the browser console for specific error messages
2. Verify all SQL queries ran successfully
3. Test with the provided sample data

The chat system should now work exactly like WhatsApp with real-time message delivery, read receipts, typing indicators, and presence status! 🎉
