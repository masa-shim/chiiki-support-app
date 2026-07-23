// SMS / メール送信の抽象化。
// DEV_FAKE_DELIVERY=true のときは実送信せずサーバログにコードを出す（開発用）。

const FAKE = process.env.DEV_FAKE_DELIVERY === "true";

export async function sendSms(to: string, body: string): Promise<void> {
  if (FAKE) {
    console.log(`[FAKE SMS] to=${to} body=${body}`);
    return;
  }
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM_NUMBER!;
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    }
  );
  if (!res.ok) throw new Error(`SMS送信失敗: ${res.status}`);
}

export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  if (FAKE) {
    console.log(`[FAKE EMAIL] to=${to} subject=${subject} text=${text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, text }),
  });
  if (!res.ok) throw new Error(`メール送信失敗: ${res.status}`);
}
