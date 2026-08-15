import { getDb } from "@/db";
import { contactMessages } from "@/db/schema";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim().slice(0, 100);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160);
    const type = String(body.type ?? "").trim().slice(0, 80);
    const message = String(body.message ?? "").trim().slice(0, 3000);
    const company = String(body.company ?? "").trim();

    if (company) return Response.json({ ok: true });
    if (name.length < 2) {
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!emailPattern.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!type) {
      return Response.json({ error: "Please select what you need help with." }, { status: 400 });
    }
    if (message.length < 20) {
      return Response.json({ error: "Please share at least 20 characters of context." }, { status: 400 });
    }

    const db = await getDb();
    await db.insert(contactMessages).values({ name, email, type, message });

    const apiKey = process.env.RESEND_API_KEY;
    const destination = process.env.CONTACT_EMAIL;
    const from = process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>";

    if (apiKey && destination) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [destination],
          reply_to: email,
          subject: `Portfolio enquiry: ${type} — ${name}`,
          html: `
            <h2>New portfolio enquiry</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Topic:</strong> ${escapeHtml(type)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
          `,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Contact email delivery failed", emailResponse.status);
      }
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Your message could not be sent. Please try again." },
      { status: 500 },
    );
  }
}
