import { getDb } from "@/db";
import { contactMessages } from "@/db/schema";
import { clientIp, readEnv } from "@/lib/env";
import { checkRateLimit, tooManyRequests } from "@/lib/rate-limit";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type Enquiry = { name: string; email: string; type: string; message: string };

/**
 * Splits a `Name <address@example.com>` string into the shape Brevo wants.
 * A bare address is accepted too, in which case no display name is sent.
 */
function parseSender(value: string): { name?: string; email: string } {
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (!match) return { email: value.trim() };
  const name = match[1].replace(/^"|"$/g, "").trim();
  return name ? { name, email: match[2].trim() } : { email: match[2].trim() };
}

/**
 * Emails the enquiry. Returns whether delivery succeeded so the caller can tell
 * a fully-dropped message apart from one that is at least stored.
 *
 * Brevo rather than Resend because it verifies a single sender *address*, so a
 * personal mailbox works and no custom domain is required.
 */
async function deliverEmail(enquiry: Enquiry): Promise<boolean> {
  const apiKey = readEnv("BREVO_API_KEY");
  const destination = readEnv("CONTACT_EMAIL");

  if (!apiKey || !destination) {
    console.warn("Contact email skipped: BREVO_API_KEY or CONTACT_EMAIL unset");
    return false;
  }

  // Defaulting the sender to the destination means the one address verified in
  // Brevo to receive on is also the one sent from — nothing else to set up.
  const sender = parseSender(readEnv("CONTACT_FROM") || `Portfolio <${destination}>`);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender,
        to: [{ email: destination }],
        // Hitting reply in the mail client answers the visitor, not yourself.
        replyTo: { email: enquiry.email, name: enquiry.name },
        subject: `Portfolio enquiry: ${enquiry.type} — ${enquiry.name}`,
        htmlContent: `
            <h2>New portfolio enquiry</h2>
            <p><strong>Name:</strong> ${escapeHtml(enquiry.name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p>
            <p><strong>Topic:</strong> ${escapeHtml(enquiry.type)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(enquiry.message).replaceAll("\n", "<br />")}</p>
          `,
        // A text part alongside the HTML keeps spam filters happier.
        textContent: [
          "New portfolio enquiry",
          `Name: ${enquiry.name}`,
          `Email: ${enquiry.email}`,
          `Topic: ${enquiry.type}`,
          "",
          enquiry.message,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      console.error(
        "Contact email delivery failed",
        response.status,
        await response.text().catch(() => ""),
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("Contact email delivery threw", error);
    return false;
  }
}

async function storeEnquiry(enquiry: Enquiry): Promise<boolean> {
  try {
    const db = await getDb();
    await db.insert(contactMessages).values(enquiry);
    return true;
  } catch (error) {
    console.error("Contact message could not be stored", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim().slice(0, 100);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160);
    const type = String(body.type ?? "").trim().slice(0, 80);
    const message = String(body.message ?? "").trim().slice(0, 3000);
    const company = String(body.company ?? "").trim();

    // Honeypot: bots fill every field, humans never see this one.
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

    const limit = await checkRateLimit({
      bucket: "contact",
      identifier: clientIp(request),
      limit: 5,
      windowSeconds: 3600,
    });
    if (!limit.allowed) {
      return tooManyRequests(
        limit,
        "You have sent several messages already. Please try again a little later, or email me directly.",
      );
    }

    const enquiry: Enquiry = { name, email, type, message };

    // Deliver and persist independently: a D1 outage must not swallow an
    // enquiry, and a Resend outage must not lose the stored copy. Previously
    // the insert ran first and threw, so the email was never attempted.
    const [delivered, stored] = await Promise.all([
      deliverEmail(enquiry),
      storeEnquiry(enquiry),
    ]);

    if (!delivered && !stored) {
      return Response.json(
        {
          error:
            "Your message could not be sent right now. Please email me directly at raghu9555k@gmail.com.",
        },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Contact route failed", error);
    return Response.json(
      {
        error:
          "Your message could not be sent. Please try again, or email me directly at raghu9555k@gmail.com.",
      },
      { status: 500 },
    );
  }
}
