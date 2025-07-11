import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

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
    <section className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b bg-card rounded-t-lg">
        <h2 className="font-serif text-2xl font-bold text-primary">Private Messages</h2>
        <span className="text-muted-foreground text-sm">Chat with your partner</span>
      </header>
      {!isValidUUID(partnerId) ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Please select a valid chat partner to start messaging.
        </div>
      ) : (
      <>
      <div className="flex-1 overflow-y-auto px-4 py-2 bg-background">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-12">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`mb-2 flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg shadow-sm break-words ${msg.sender_id === user.id ? "bg-primary text-white" : "bg-muted-foreground text-background"}`} style={msg.id.startsWith('temp-') ? { opacity: 0.5 } : {}}>
                {msg.content}
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <footer className="p-4 border-t bg-card rounded-b-lg">
        <form
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring focus:border-primary"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            autoFocus
            disabled={sending}
          />
          <Button type="submit" variant="romantic" disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      </footer>
      </>
      )}
    </section>
  );
};

export default Chat;
