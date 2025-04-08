import { useState } from "react";

export function useClipBoard() {
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);

    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedMessageIndex(null);
    }, 2000);
  };

  return { copiedMessageIndex, copyToClipboard }
}