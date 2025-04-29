"use client";

import ChatContainer from "@/app/(home)/components/ChatContainer";
import { useChatContext } from "@/context/ChatContext";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage(){
  const params = useParams(); // Get params object
  const id = params?.id as string | undefined; // Safely access id
  const { chatId: contextChatId, updateChatId, clearChat } = useChatContext();

  useEffect(() => {
    if (id && id !== contextChatId) {
       console.log(`ChatPage Effect: Route ID (${id}) differs from context ID (${contextChatId}). Updating context.`);
       updateChatId(id);
    } else if (!id && contextChatId) {
      console.log("ChatPage Effect: No ID in route, but context has ID:", contextChatId);
      clearChat()
    }
  }, [id, contextChatId, updateChatId, clearChat]);

  return <ChatContainer />
}