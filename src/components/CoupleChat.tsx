import * as React from "react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/useMobile";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Send,
  Check,
  CheckCheck,
  Circle,
  Smile,
  Paperclip,
  Mic,
  MoreVertical,
  ArrowLeft,
  Info,
  Bell,
  BellOff,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { useToast } from "@/hooks/use-toast";
import { AttachmentUpload, AttachmentDisplay } from "./AttachmentUpload";
import { VoiceRecorder } from "./VoiceRecorder";
import { VoicePlayer } from "./VoicePlayer";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { uploadVoiceMessage } from "@/utils/uploadVoiceMessage";
import { getSignedChatAttachmentUrl } from "@/utils/getSignedChatAttachmentUrl";
import { chatHaptics } from "@/utils/hapticFeedback";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  is_read?: boolean;
  delivered_at?: string | null;
  read_at?: string | null;
  reply_to?: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  attachment_filename?: string;
  attachment_size?: number;
  voice_duration?: number;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const isValidUUID = (id: string | null | undefined): id is string =>
  typeof id === "string" &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    id
  );

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffHrs = (now.getTime() - date.getTime()) / 3600000;
  if (diffHrs < 24) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

// Hook to resolve storage paths to signed URLs
const useSignedUrl = (raw?: string) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!raw) {
      setUrl(null);
      return;
    }
    if (raw.startsWith("http")) {
      setUrl(raw);
      return;
    }
    getSignedChatAttachmentUrl(raw).then(setUrl).catch(() => setUrl(null));
  }, [raw]);
  return url;
};

// ─────────────────────────────────────────────────────────────
// Attachment display inside a message bubble
// ─────────────────────────────────────────────────────────────
const MessageAttachment: React.FC<{ msg: Message; isOwn: boolean }> = ({
  msg,
  isOwn,
}) => {
  const signedUrl = useSignedUrl(msg.attachment_url);
  if (!msg.attachment_url) return null;
  const urlToUse = signedUrl ?? "";

  if (!signedUrl && !msg.attachment_url.startsWith("http")) {
    return (
      <div className="text-xs text-muted-foreground mb-2">
        Loading attachment…
      </div>
    );
  }

  if (msg.attachment_type === "image") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <img
            src={urlToUse}
            alt="attachment"
            className="max-w-[200px] rounded-lg cursor-pointer mb-2"
          />
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          <DialogDescription className="sr-only">
            Preview of attached image
          </DialogDescription>
          <img src={urlToUse} alt="full" className="w-full h-auto" />
        </DialogContent>
      </Dialog>
    );
  }

  if (msg.attachment_type === "voice") {
    return (
      <div className="mb-2">
        <VoicePlayer
          audioUrl={urlToUse}
          duration={msg.voice_duration || 0}
          isOwn={isOwn}
        />
      </div>
    );
  }

  return (
    <a
      href={urlToUse}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 text-sm underline mb-2"
    >
      <Paperclip className="w-4 h-4" />
      {msg.attachment_filename || msg.attachment_name || "Attachment"}
    </a>
  );
};

// ─────────────────────────────────────────────────────────────
// Single message bubble
// ─────────────────────────────────────────────────────────────
const MessageBubble: React.FC<{
  msg: Message;
  isOwn: boolean;
  onReply: () => void;
  replyPreview?: Message | null;
  userId?: string;
}> = ({ msg, isOwn, onReply, replyPreview, userId }) => {
  return (
    <div
      className={cn(
        "group flex items-end gap-2 mb-3",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar (partner only) */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
          <Heart className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm relative",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border/50 rounded-bl-md"
        )}
      >
        {/* Reply preview */}
        {replyPreview && (
          <div
            className={cn(
              "text-xs mb-2 p-2 rounded-lg border-l-2",
              isOwn
                ? "bg-primary-foreground/10 border-primary-foreground/40 text-primary-foreground/80"
                : "bg-muted border-primary text-muted-foreground"
            )}
          >
            <span className="font-medium">
              {replyPreview.sender_id === userId ? "You" : "Partner"}:
            </span>{" "}
            {replyPreview.content.slice(0, 50)}
            {replyPreview.content.length > 50 && "…"}
          </div>
        )}

        {/* Attachment */}
        <MessageAttachment msg={msg} isOwn={isOwn} />

        {/* Text */}
        {msg.content && !msg.content.startsWith("🎤") && (
          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
        )}

        {/* Time + status */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          <span
            className={cn(
              "text-[10px]",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {formatTime(msg.timestamp)}
          </span>
          {isOwn && (
            <>
              {msg.id.startsWith("temp-") ? (
                <Circle className="w-3 h-3 text-primary-foreground/50" />
              ) : msg.read_at ? (
                <CheckCheck className="w-3 h-3 text-primary-foreground" />
              ) : msg.delivered_at ? (
                <CheckCheck className="w-3 h-3 text-primary-foreground/60" />
              ) : (
                <Check className="w-3 h-3 text-primary-foreground/60" />
              )}
            </>
          )}
        </div>

        {/* Reply button on hover */}
        <button
          type="button"
          onClick={onReply}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/80 border opacity-0 group-hover:opacity-100 transition-opacity",
            isOwn ? "-left-8" : "-right-8"
          )}
          aria-label="Reply"
        >
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M9 17l-5-5 5-5M4 12h16"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Own avatar */}
      {isOwn && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0">
          <Heart className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Chat Component
// ─────────────────────────────────────────────────────────────
const CoupleChat: React.FC<{ partnerId: string | null }> = ({ partnerId }) => {
  const { user } = useAuth();
  const isMobile = useMobile();
  const { toast } = useToast();

  // ─── State ─────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // ─── Refs ──────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingChannelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationRef = useRef<HTMLAudioElement>(null);

  // Track whether user is near bottom (for auto-scroll decisions)
  const userNearBottom = useRef(true);
  // Track if we've done the initial scroll
  const initialScrollDone = useRef(false);

  // ─── Scroll helpers ────────────────────────────────────────
  const scrollToBottom = useCallback((instant = false) => {
    const el = containerRef.current;
    if (!el) return;
    // Use requestAnimationFrame to ensure DOM is painted
    requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: instant ? "auto" : "smooth",
      });
    });
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userNearBottom.current = distFromBottom < 80;
    setShowScrollBtn(distFromBottom > 300);
  }, []);

  // ─── Mark messages read ────────────────────────────────────
  const markAsRead = useCallback(async () => {
    if (!user?.id || !isValidUUID(partnerId)) return;
    const { data: unread } = await supabase
      .from("messages")
      .select("id")
      .eq("sender_id", partnerId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
    if (!unread || unread.length === 0) {
      setUnreadCount(0);
      return;
    }
    const ids = unread.map((m) => m.id);
    await supabase
      .from("messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in("id", ids);
    setMessages((prev) =>
      prev.map((m) =>
        ids.includes(m.id)
          ? { ...m, is_read: true, read_at: new Date().toISOString() }
          : m
      )
    );
    setUnreadCount(0);
  }, [user?.id, partnerId]);

  // ─── Typing indicator ──────────────────────────────────────
  const sendTyping = useCallback(
    async (typing: boolean) => {
      const ch = typingChannelRef.current;
      if (!ch || !user?.id || !isValidUUID(partnerId)) return;
      await ch.send({
        type: "broadcast",
        event: "typing",
        payload: { user_id: user.id, partner_id: partnerId, is_typing: typing },
      });
    },
    [user?.id, partnerId]
  );

  const handleTypingInput = useCallback(() => {
    sendTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 1500);
  }, [sendTyping]);

  // ─── Send text message ─────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || sending || !user?.id || !isValidUUID(partnerId))
      return;
    setSending(true);
    sendTyping(false);
    chatHaptics.messageSent();

    const tempId = `temp-${Date.now()}`;
    const ts = new Date().toISOString();
    const optimistic: Message = {
      id: tempId,
      sender_id: user.id,
      receiver_id: partnerId,
      content: newMessage,
      timestamp: ts,
      is_read: false,
      delivered_at: ts,
      ...(replyTo ? { reply_to: replyTo.id } : {}),
    };

    setMessages((prev) => [...prev, optimistic]);
    setNewMessage("");
    setReplyTo(null);

    // Scroll immediately after sending own message
    setTimeout(() => scrollToBottom(false), 50);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: partnerId,
          content: optimistic.content,
          timestamp: ts,
          delivered_at: ts,
          ...(replyTo ? { reply_to: replyTo.id } : {}),
        })
        .select()
        .single();
      if (error) throw error;
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? (data as Message) : m))
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast({
        title: "Failed to send",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [
    newMessage,
    sending,
    user?.id,
    partnerId,
    replyTo,
    sendTyping,
    scrollToBottom,
    toast,
  ]);

  // ─── Send attachment ───────────────────────────────────────
  const handleAttachment = useCallback(
    async (
      url: string,
      filename: string,
      fileType: string,
      fileSize: number
    ) => {
      if (!user?.id || !isValidUUID(partnerId)) return;
      const tempId = `temp-${Date.now()}`;
      const ts = new Date().toISOString();
      const opt: Message = {
        id: tempId,
        sender_id: user.id,
        receiver_id: partnerId,
        content: `📎 ${filename}`,
        timestamp: ts,
        is_read: false,
        delivered_at: ts,
        attachment_url: url,
        attachment_type: fileType,
        attachment_filename: filename,
        attachment_size: fileSize,
      };
      setMessages((prev) => [...prev, opt]);
      setShowAttachments(false);
      setTimeout(() => scrollToBottom(false), 50);

      try {
        const { data, error } = await supabase
          .from("messages")
          .insert({
            sender_id: user.id,
            receiver_id: partnerId,
            content: opt.content,
            timestamp: ts,
            delivered_at: ts,
            attachment_url: url,
            attachment_type: fileType,
            attachment_name: filename,
            attachment_filename: filename,
            attachment_size: fileSize,
          })
          .select()
          .single();
        if (error) throw error;
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (data as Message) : m))
        );
        toast({ title: "File sent" });
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        toast({
          title: "Upload failed",
          variant: "destructive",
        });
      }
    },
    [user?.id, partnerId, scrollToBottom, toast]
  );

  // ─── Send voice ────────────────────────────────────────────
  const handleVoice = useCallback(
    async (blob: Blob, duration: number) => {
      if (!user?.id || !isValidUUID(partnerId)) return;
      const tempId = `temp-${Date.now()}`;
      const ts = new Date().toISOString();
      const opt: Message = {
        id: tempId,
        sender_id: user.id,
        receiver_id: partnerId,
        content: `🎤 Voice (${Math.floor(duration)}s)`,
        timestamp: ts,
        is_read: false,
        delivered_at: ts,
        attachment_type: "voice",
        voice_duration: duration,
      };
      setMessages((prev) => [...prev, opt]);
      setShowVoice(false);
      setTimeout(() => scrollToBottom(false), 50);

      try {
        const voiceUrl = await uploadVoiceMessage(user.id, partnerId, blob);
        if (!voiceUrl) throw new Error("Upload failed");
        const { data, error } = await supabase
          .from("messages")
          .insert({
            sender_id: user.id,
            receiver_id: partnerId,
            content: opt.content,
            timestamp: ts,
            delivered_at: ts,
            attachment_url: voiceUrl,
            attachment_type: "voice",
            voice_duration: duration,
          })
          .select()
          .single();
        if (error) throw error;
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (data as Message) : m))
        );
        toast({ title: "Voice sent" });
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        toast({ title: "Voice upload failed", variant: "destructive" });
      }
    },
    [user?.id, partnerId, scrollToBottom, toast]
  );

  // ─── Fetch initial messages ────────────────────────────────
  useEffect(() => {
    if (!user?.id || !isValidUUID(partnerId)) return;
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
        )
        .order("timestamp", { ascending: true });
      if (data) {
        setMessages(data as Message[]);
        const unread = (data as Message[]).filter(
          (m) => m.sender_id === partnerId && !m.is_read
        ).length;
        setUnreadCount(unread);
      }
    })();
  }, [user?.id, partnerId]);

  // ─── Initial scroll to bottom ──────────────────────────────
  useEffect(() => {
    if (messages.length > 0 && !initialScrollDone.current) {
      initialScrollDone.current = true;
      // Instant scroll on first load
      setTimeout(() => scrollToBottom(true), 0);
    }
  }, [messages.length, scrollToBottom]);

  // ─── Auto-scroll on new messages (only if near bottom) ─────
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    const isOwn = last?.sender_id === user?.id;
    // Always scroll for own messages; for partner only if near bottom
    if (isOwn || userNearBottom.current) {
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [messages.length, user?.id, scrollToBottom]);

  // ─── Realtime subscription ─────────────────────────────────
  useEffect(() => {
    if (!user?.id || !isValidUUID(partnerId)) return;
    const chName = `messages-${[user.id, partnerId].sort().join("-")}`;
    const channel = supabase
      .channel(chName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id}))`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            // avoid duplicates
            if (prev.some((m) => m.id === msg.id)) {
              return prev.map((m) => (m.id === msg.id ? msg : m));
            }
            // match optimistic
            if (msg.sender_id === user?.id) {
              const optIdx = prev.findIndex(
                (m) =>
                  m.id.startsWith("temp-") &&
                  m.content === msg.content &&
                  Math.abs(
                    new Date(m.timestamp).getTime() -
                      new Date(msg.timestamp).getTime()
                  ) < 5000
              );
              if (optIdx !== -1) {
                const copy = [...prev];
                copy[optIdx] = msg;
                return copy;
              }
            }
            return [...prev, msg];
          });

          if (msg.sender_id === partnerId) {
            setUnreadCount((c) => c + 1);
            if (!isMuted && notificationRef.current) {
              notificationRef.current.currentTime = 0;
              notificationRef.current.play().catch(() => {});
            }
            if (document.visibilityState === "visible") {
              markAsRead();
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const upd = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === upd.id ? upd : m))
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnectionStatus("connected");
        else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        )
          setConnectionStatus("disconnected");
        else setConnectionStatus("connecting");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, partnerId, isMuted, markAsRead]);

  // ─── Typing channel ────────────────────────────────────────
  useEffect(() => {
    if (!user?.id || !isValidUUID(partnerId)) return;
    const chName = `typing-${[user.id, partnerId].sort().join("-")}`;
    const channel = supabase.channel(chName);
    typingChannelRef.current = channel;
    let hideTimer: NodeJS.Timeout;

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.user_id === partnerId) {
          setPartnerTyping(payload.payload.is_typing);
          if (payload.payload.is_typing) {
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => setPartnerTyping(false), 3000);
          }
        }
      })
      .subscribe();

    return () => {
      clearTimeout(hideTimer);
      typingChannelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [user?.id, partnerId]);

  // ─── Focus / visibility listeners ──────────────────────────
  useEffect(() => {
    if (!user?.id || !isValidUUID(partnerId)) return;
    const check = () => {
      if (document.visibilityState === "visible" && document.hasFocus()) {
        markAsRead();
      }
    };
    check();
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [user?.id, partnerId, markAsRead]);

  // ─── Reply lookup map ──────────────────────────────────────
  const msgMap = useMemo(() => {
    const map: Record<string, Message> = {};
    messages.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [messages]);

  // ─── No partner selected ───────────────────────────────────
  if (!isValidUUID(partnerId)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Select a partner to begin chatting in your private space.
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "flex flex-col bg-background h-full w-full overflow-hidden",
        isMobile ? "fixed inset-0 z-40" : "rounded-xl border shadow-sm"
      )}
    >
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card/80 backdrop-blur flex-shrink-0">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-gray-400"
              )}
            />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Your Partner</h2>
            <p className="text-xs text-muted-foreground">
              {partnerTyping ? (
                <span className="text-primary font-medium flex items-center gap-1">
                  typing
                  <span className="flex gap-0.5">
                    <span
                      className="w-1 h-1 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1 h-1 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1 h-1 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                </span>
              ) : connectionStatus === "connected" ? (
                "Online"
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setIsMuted((m) => !m);
                toast({
                  title: isMuted
                    ? "Notifications unmuted"
                    : "Notifications muted",
                });
              }}
            >
              {isMuted ? (
                <Bell className="mr-2 h-4 w-4" />
              ) : (
                <BellOff className="mr-2 h-4 w-4" />
              )}
              {isMuted ? "Unmute" : "Mute"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ─── Messages area ──────────────────────────────────── */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Heart className="w-12 h-12 mb-4 text-primary/30" />
            <p className="text-sm">No messages yet. Say hello! 💕</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.sender_id === user?.id}
              onReply={() => setReplyTo(msg)}
              replyPreview={msg.reply_to ? msgMap[msg.reply_to] : null}
              userId={user?.id}
            />
          ))
        )}

        {/* Typing indicator */}
        {partnerTyping && (
          <div className="flex items-end gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Scroll to bottom FAB ───────────────────────────── */}
      {showScrollBtn && (
        <div className="absolute bottom-24 right-4 z-30">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg relative"
            onClick={() => {
              scrollToBottom(false);
              markAsRead();
            }}
          >
            <ChevronDown className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </Button>
        </div>
      )}

      {/* ─── Reply preview ──────────────────────────────────── */}
      {replyTo && (
        <div className="px-4 py-2 border-t bg-muted/50 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Replying to{" "}
                {replyTo.sender_id === user?.id ? "yourself" : "partner"}
              </p>
              <p className="text-sm truncate">{replyTo.content}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setReplyTo(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* ─── Attachments / Voice area ───────────────────────── */}
      {showAttachments && (
        <div className="px-4 py-3 border-t bg-muted/30">
          <AttachmentUpload
            userId={user?.id || ""}
            partnerId={partnerId}
            onAttachmentUpload={handleAttachment}
          />
        </div>
      )}
      {showVoice && (
        <div className="px-4 py-3 border-t bg-muted/30">
          <VoiceRecorder
            onVoiceMessageSend={handleVoice}
            onCancel={() => setShowVoice(false)}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
        </div>
      )}

      {/* ─── Input footer ───────────────────────────────────── */}
      <footer className="border-t bg-card/95 backdrop-blur px-4 py-3 flex-shrink-0">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          {/* Emoji */}
          <div className="relative hidden md:block">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setShowEmoji((v) => !v)}
            >
              <Smile className="w-5 h-5 text-muted-foreground" />
            </Button>
            {showEmoji && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker
                  onSelect={(emoji) => {
                    setNewMessage((m) => m + emoji);
                    setShowEmoji(false);
                    inputRef.current?.focus();
                  }}
                  onClose={() => setShowEmoji(false)}
                />
              </div>
            )}
          </div>

          {/* Attachment */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 hidden md:inline-flex"
            onClick={() => {
              setShowAttachments((v) => !v);
              setShowVoice(false);
            }}
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>

          {/* Voice */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 hidden md:inline-flex",
              (showVoice || isRecording) && "bg-muted"
            )}
            onClick={() => {
              setShowVoice((v) => !v);
              setShowAttachments(false);
            }}
          >
            <Mic
              className={cn(
                "w-5 h-5",
                isRecording ? "text-red-500 animate-pulse" : "text-muted-foreground"
              )}
            />
          </Button>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ fontSize: "16px" }}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTypingInput();
            }}
          />

          {/* Send */}
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="rounded-full h-10 w-10 p-0"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>

        {/* Connection status */}
        <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "connecting"
                ? "bg-yellow-500 animate-pulse"
                : "bg-red-500"
            )}
          />
          <span className="capitalize">{connectionStatus}</span>
        </div>
      </footer>

      {/* Notification audio */}
      <audio
        ref={notificationRef}
        src="/notification.mp3"
        preload="auto"
        className="hidden"
      />
    </div>
  );
};

export default CoupleChat;
