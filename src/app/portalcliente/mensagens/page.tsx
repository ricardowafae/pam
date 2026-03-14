"use client";

import { Send, PawPrint } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mockConversations = [
  {
    id: 1,
    name: "Equipe PAM",
    lastMessage: "Seu Dogbook esta pronto para aprovacao!",
    time: "10:30",
    unread: 1,
    active: true,
  },
  {
    id: 2,
    name: "Juliano Lemos",
    lastMessage: "Sessao confirmada para sabado as 10h",
    time: "Ontem",
    unread: 0,
    active: false,
  },
];

const mockMessages = [
  {
    id: 1,
    sender: "Equipe PAM",
    content: "Ola Ana! Tudo bem? O layout do Dogbook 'Verao da Luna' ficou pronto.",
    time: "09:15",
    isOwn: false,
  },
  {
    id: 2,
    sender: "Ana",
    content: "Que otimo! Mal posso esperar para ver!",
    time: "09:20",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Equipe PAM",
    content: "Seu Dogbook esta pronto para aprovacao! Acesse a area de aprovacao para revisar o layout completo.",
    time: "10:30",
    isOwn: false,
  },
];

export default function MensagensPage() {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [messageInput, setMessageInput] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          Mensagens
        </h1>
        <p className="text-muted-foreground mt-1">
          Converse com a equipe Patas, Amor e Memorias.
        </p>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-4 min-h-[500px]">
        {/* Conversation List */}
        <Card className="h-fit md:h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conversas</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {mockConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    selectedConversation === conv.id
                      ? "bg-primary/10"
                      : "hover:bg-secondary"
                  )}
                >
                  <Avatar size="sm">
                    <AvatarFallback>
                      {conv.name === "Equipe PAM" ? (
                        <PawPrint className="size-3" />
                      ) : (
                        conv.name.charAt(0)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {conv.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conv.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-xs">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="flex flex-col">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback>
                  <PawPrint className="size-3" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-sm">Equipe PAM</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.isOwn ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-3 py-2",
                    msg.isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      msg.isOwn
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
          <Separator />
          <div className="p-3 flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1"
            />
            <Button size="icon">
              <Send className="size-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
