import { NextResponse } from "next/server";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_MESSAGE_LENGTH = 1000;

const TYPE_LABELS: Record<string, string> = {
  bug: "🐛 Bug",
  "data-inaccuracy": "📊 Data Inaccuracy",
  "feature-request": "✨ Feature Request",
  performance: "⚡ Performance Issue",
  "general-feedback": "💬 General Feedback",
};

const TYPE_COLORS: Record<string, number> = {
  bug: 0xef4444,
  "data-inaccuracy": 0xf59e0b,
  "feature-request": 0x8b5cf6,
  performance: 0x3b82f6,
  "general-feedback": 0x10b981,
};

export async function POST(request: Request) {
  const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("DISCORD_FEEDBACK_WEBHOOK_URL is not configured");
    return NextResponse.json(
      { error: "Feedback isn't configured on this server yet." },
      { status: 500 }
    );
  }

  const form = await request.formData();
  const type = String(form.get("type") ?? "");
  const message = String(form.get("message") ?? "")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
  const userEmail = form.get("userEmail");
  const username = form.get("username");
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (!type || !message) {
    return NextResponse.json(
      { error: "Missing feedback type or message." },
      { status: 400 }
    );
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `You can attach up to ${MAX_FILES} files.` },
      { status: 400 }
    );
  }

  const oversized = files.find(file => file.size > MAX_FILE_SIZE);
  if (oversized) {
    return NextResponse.json(
      { error: `"${oversized.name}" is larger than 10MB.` },
      { status: 400 }
    );
  }

  const userLine = userEmail
    ? `${username ? `${username} · ` : ""}${userEmail}`
    : "Anonymous";

  const discordForm = new FormData();
  discordForm.append(
    "payload_json",
    JSON.stringify({
      embeds: [
        {
          title: TYPE_LABELS[type] ?? "💬 Feedback",
          description: message,
          color: TYPE_COLORS[type] ?? 0x6366f1,
          fields: [{ name: "User", value: userLine }],
          timestamp: new Date().toISOString(),
        },
      ],
    })
  );

  files.forEach((file, i) => {
    discordForm.append(`files[${i}]`, file, file.name);
  });

  const discordRes = await fetch(webhookUrl, {
    method: "POST",
    body: discordForm,
  });

  if (!discordRes.ok) {
    const body = await discordRes.text().catch(() => "");
    console.error("Discord webhook failed", discordRes.status, body);
    return NextResponse.json(
      { error: "Failed to send feedback. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
