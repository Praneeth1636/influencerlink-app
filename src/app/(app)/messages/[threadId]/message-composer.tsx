"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";

export function MessageComposer({ threadId }: { threadId: string }) {
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const mutation = trpc.inbox.sendMessage.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.inbox.threadById.invalidate({ threadId }), utils.inbox.listThreads.invalidate()]);
    }
  });

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = body.trim();

    if (!message) {
      setStatus("Write a message first.");
      return;
    }

    setStatus(null);

    try {
      await mutation.mutateAsync({
        threadId,
        body: message,
        attachments: []
      });
      setBody("");
      setStatus("Message sent.");
    } catch {
      setStatus("Sign in as a thread participant to send messages.");
    }
  }

  return (
    <form className="border-t border-[#e9e9e7] p-4" onSubmit={submitMessage}>
      <div className="flex gap-3">
        <input
          className="h-11 min-w-0 flex-1 rounded-full border border-[#e9e9e7] bg-[#fbfbfa] px-4 text-sm text-[#37352f] outline-none placeholder:text-[#9b9a97] focus:border-[#9fc9e4] focus:bg-white"
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write a message..."
          value={body}
        />
        <Button
          className="h-11 rounded-full bg-[#37352f] px-4 text-sm font-semibold text-white hover:bg-[#262420]"
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? "Sending" : "Send"}
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
      {status && <p className="mt-3 text-xs font-medium text-[#787774]">{status}</p>}
    </form>
  );
}
