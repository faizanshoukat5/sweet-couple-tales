import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
}

const Chat = ({ partnerId }: { partnerId: string }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // UUID validation function
  const isValidUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

  // Fetch only messages between user and partner
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order("timestamp", { ascending: true });
      if (!error && data) setMessages(data as Message[]);
    };
    fetchMessages();
  }, [user.id, partnerId]);

  // Subscribe to new messages between user and partner
  useEffect(() => {
    const subscription = supabase
      .channel("messages-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (
            (msg.sender_id === user.id && msg.receiver_id === partnerId) ||
            (msg.sender_id === partnerId && msg.receiver_id === user.id)
          ) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user.id, partnerId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message (optimistic UI)
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    if (!isValidUUID(partnerId)) {
      alert("Invalid partner ID. Please select a valid chat partner.");
      return;
    }
    if (!isValidUUID(user?.id)) {
      alert("Invalid user ID. Please log in again.");
      return;
    }
    console.log('Current user id:', user?.id); // Debug: log user id
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: user.id,
      receiver_id: partnerId,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id: partnerId,
        content: optimisticMsg.content,
        timestamp: optimisticMsg.timestamp,
      })
      .select();
    setSending(false);
    if (error) {
      console.error('Supabase insert error:', error); // Debug: log error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[500px]">
      <header className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm rounded-t-lg">
        <h2 className="font-serif text-xl font-bold text-primary">Private Messages</h2>
        <span className="text-muted-foreground text-sm">Chat with your partner 💕</span>
      </header>
      
      {!isValidUUID(partnerId) ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
          <div className="text-center">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p>Please select a valid chat partner to start messaging.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-background/50 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-12">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="font-medium">No messages yet</p>
                <p className="text-sm">Start your conversation and share your thoughts! 💭</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm break-words transition-all duration-200 ${
                      msg.sender_id === user.id 
                        ? "bg-gradient-romantic text-white rounded-br-md" 
                        : "bg-card text-card-foreground border rounded-bl-md"
                    }`} 
                    style={msg.id.startsWith('temp-') ? { opacity: 0.6, transform: 'scale(0.98)' } : {}}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className={`text-xs mt-2 flex justify-end ${
                      msg.sender_id === user.id ? "text-white/70" : "text-muted-foreground"
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {msg.id.startsWith('temp-') && (
                        <span className="ml-1">⏳</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <footer className="p-4 border-t bg-card/50 backdrop-blur-sm rounded-b-lg">
            <form
              className="flex gap-3"
              onSubmit={e => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <input
                type="text"
                className="flex-1 border border-border rounded-full px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                autoFocus
                disabled={sending}
                maxLength={500}
              />
              <Button 
                type="submit" 
                variant="romantic" 
                disabled={sending || !newMessage.trim()}
                className="rounded-full px-6 hover:scale-105 transition-transform"
              >
                {sending ? "💨" : "💌"}
              </Button>
            </form>
            {newMessage.length > 450 && (
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {500 - newMessage.length} characters remaining
              </p>
            )}
          </footer>
        </>
      )}
    </div>
  );
};

export default Chat;
