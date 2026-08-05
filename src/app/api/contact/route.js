export async function POST(request) {
  const BOT_TOKEN = "8893003051:AAFUbKUCR1K22n9vANk2TW6vaNb7y_CtPRs";
  const CHAT_ID = 8194599016;

  try {
    const { name, email, send } = await request.json();

    if (!name || !email || !send) {
      return Response.json(
        {
          success: false,
          error: "All fields are required",
        },
        { status: 400 },
      );
    }

    const text = `
Portfoliodan xabar:

Ismi: ${name}
Emaili: ${email}

Xabar: ${send}
    `;

    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text,
        }),
      },
    );

    if (!res.ok) {
      return Response.json({ success: false }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
