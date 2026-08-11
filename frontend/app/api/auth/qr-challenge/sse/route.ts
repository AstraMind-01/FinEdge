import { NextRequest } from "next/server";
import { challengeStore } from "../route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const challengeId = searchParams.get("challengeId") || searchParams.get("challenge") || "";

  const responseHeaders = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  if (!challengeId) {
    return new Response(`event: error\ndata: ${JSON.stringify({ error: "Missing challengeId" })}\n\n`, {
      headers: responseHeaders,
      status: 400,
    });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          // Client disconnected
        }
      };

      // Initial check
      const record = challengeStore.get(challengeId);
      if (!record) {
        sendEvent({ status: "NOT_FOUND", code: "NOT_FOUND" });
        controller.close();
        return;
      }

      sendEvent({
        status: record.status,
        code: record.status === "EXPIRED" ? "EXPIRED" : (record.status === "LOGIN_APPROVED" || record.status === "LOGIN_COMPLETED") ? "ALREADY_USED" : "VALID",
        remainingSeconds: Math.max(0, Math.ceil((record.expiresAt - Date.now()) / 1000)),
      });

      // Stream updates every 1 second
      const interval = setInterval(() => {
        const currentRecord = challengeStore.get(challengeId);
        if (!currentRecord) {
          sendEvent({ status: "NOT_FOUND", code: "NOT_FOUND" });
          clearInterval(interval);
          try { controller.close(); } catch (e) {}
          return;
        }

        if (Date.now() > currentRecord.expiresAt && currentRecord.status !== "LOGIN_APPROVED" && currentRecord.status !== "LOGIN_COMPLETED") {
          currentRecord.status = "EXPIRED";
        }

        const remainingSeconds = Math.max(0, Math.ceil((currentRecord.expiresAt - Date.now()) / 1000));

        sendEvent({
          status: currentRecord.status,
          code: currentRecord.status === "EXPIRED" ? "EXPIRED" : (currentRecord.status === "LOGIN_APPROVED" || currentRecord.status === "LOGIN_COMPLETED") ? "ALREADY_USED" : "VALID",
          remainingSeconds,
          token: (currentRecord.status === "LOGIN_APPROVED" || currentRecord.status === "LOGIN_COMPLETED") ? currentRecord.token : undefined,
          user: (currentRecord.status === "LOGIN_APPROVED" || currentRecord.status === "LOGIN_COMPLETED") ? {
            name: "Soumya",
            username: "soumya",
            email: currentRecord.userEmail || "datebong59@gmail.com",
          } : undefined,
        });

        if (currentRecord.status === "LOGIN_APPROVED" || currentRecord.status === "LOGIN_COMPLETED" || currentRecord.status === "EXPIRED" || currentRecord.status === "CANCELLED" || currentRecord.status === "FAILED") {
          clearInterval(interval);
          setTimeout(() => {
            try { controller.close(); } catch (e) {}
          }, 1500);
        }
      }, 1000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try { controller.close(); } catch (e) {}
      });
    },
  });

  return new Response(stream, { headers: responseHeaders });
}
