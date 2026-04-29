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
    <form className="border-t border-white/10 p-4" onSubmit={submitMessage}>
      <div className="flex gap-3">
        <input
          className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#D85A30]/55"
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write a message..."
          value={body}
        />
        <Button
          className="h-11 rounded-xl bg-[#D85A30] px-4 text-sm font-black text-white hover:bg-[#c54f29]"
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? "Sending" : "Send"}
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
      {status && <p className="mt-3 text-xs font-bold text-white/42">{status}</p>}
    </form>
  );
}
