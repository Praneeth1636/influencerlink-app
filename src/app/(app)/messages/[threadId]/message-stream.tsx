"use client";

// Refresh trigger for the thread page. Calls router.refresh() every 5s so
// the server component re-renders with the latest messages without the
// user having to hit reload. We don't render anything — server renders
// the messages with the existing mapping, and we just nudge it on a timer.
//
// Why router.refresh() not tRPC polling: the server already maps the raw
// thread rows into the polished view shape (senderLabel, sentByViewer)
// using auth context. Replicating that mapping on the client doubles the
// surface for drift bugs. router.refresh() is the cheapest correct option.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function MessageStream() {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, 5_000);
    return () => clearInterval(id);
  }, [router]);

  return null;
}
