// src/app/chat/[id]/page.tsx

"use client"

import { useChat } from "@/store/ChatStore";
import ChatHistory from "../components/ChatHistory";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { isValidObjectId } from "@/lib/utils";

export default function ChatPage() {
  const params = useParams()
  const id = params.id as string

  const { isLoaded, userId } = useAuth()

  const updateId = useChat(state => state.updateId)

  useEffect(() => {
    if (isLoaded && userId && isValidObjectId(id)) {
      updateId(id)
    }
  }, [id, isLoaded, userId])

  return (
    <>
      <ChatHistory />
    </>
  )
}