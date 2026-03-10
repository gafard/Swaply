"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimePostgresInsertPayload } from "@supabase/realtime-js";
import { MessageCircle } from "lucide-react";
import { AnimatedItem } from "@/components/AnimatedContainer";
import { createClient } from "@/lib/supabase/client";

type MessageRow = {
  id: string;
  exchangeId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

type MessageView = {
  id: string;
  senderId: string;
  content: string;
  sender: {
    username: string;
  };
};

type Participant = {
  id: string;
  username: string;
};

type Props = {
  currentUserId: string;
  exchangeId: string;
  initialMessages: MessageView[];
  owner: Participant;
  requester: Participant;
};

function resolveSenderUsername(payload: MessageRow, owner: Participant, requester: Participant) {
  if (payload.senderId === owner.id) return owner.username;
  if (payload.senderId === requester.id) return requester.username;
  return "Utilisateur";
}

export default function RealtimeMessages({
  currentUserId,
  exchangeId,
  initialMessages,
  owner,
  requester,
}: Props) {
  const [supabase] = useState(() => createClient());
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    const channel = supabase
      .channel(`exchange:${exchangeId}:messages`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `exchangeId=eq.${exchangeId}`,
        },
        (payload: RealtimePostgresInsertPayload<MessageRow>) => {
          const message = payload.new;

          setMessages((currentMessages) => {
            if (currentMessages.some((entry) => entry.id === message.id)) {
              return currentMessages;
            }

            return [
              ...currentMessages,
              {
                id: message.id,
                senderId: message.senderId,
                content: message.body,
                sender: {
                  username: resolveSenderUsername(message, owner, requester),
                },
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [exchangeId, owner, requester, supabase]);

  return (
    <div className="space-y-4">
      {messages.length === 0 && (
        <div className="text-center py-6 text-[13px] font-medium text-gray-400 border border-dashed border-gray-200 rounded-2xl">
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Pas encore de messages.
          </div>
        </div>
      )}

      {messages.map((message, index) => {
        const isMe = message.senderId === currentUserId;

        return (
          <AnimatedItem
            key={message.id}
            index={index}
            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
          >
            <div
              className={`px-4 py-3 rounded-[1.5rem] max-w-[85%] text-[14px] leading-relaxed shadow-[0_2px_8px_rgba(0,0,0,0.03)] font-medium ${
                isMe
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
              }`}
            >
              {message.content}
            </div>
            <span className="text-[10px] text-gray-400 mt-1.5 mx-1 font-semibold">
              {isMe ? "Vous" : message.sender.username}
            </span>
          </AnimatedItem>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
