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
    <form className="border-border border-t p-4" onSubmit={submitMessage}>
      <div className="flex gap-3">
        <input
          className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary/55 h-11 min-w-0 flex-1 rounded-xl border px-4 text-sm outline-none"
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write a message..."
          value={body}
        />
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl px-4 text-sm font-black"
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? "Sending" : "Send"}
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
      {status && <p className="text-muted-foreground mt-3 text-xs font-bold">{status}</p>}
    </form>
  );
}
