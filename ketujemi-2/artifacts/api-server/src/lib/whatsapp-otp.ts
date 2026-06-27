const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendWhatsAppOTP(phone: string, otp: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: {
            body: `Kodi juaj i verifikimit për KetuJemi është: *${otp}*\n\nKodi skadon pas 10 minutash.`,
          },
        }),
      },
    );
    const data = (await response.json()) as Record<string, unknown>;
    console.log("WhatsApp OTP response:", data);
    return response.ok;
  } catch (error) {
    console.error("WhatsApp OTP error:", error);
    return false;
  }
}
