export interface WhatsAppMessageProps {
  name: string;
  phone: string;
  ministryName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  token: string;
  baseUrl?: string;
}

export function cleanPhoneNumber(phone: string): string {
  // Strip spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  // If starts with 00, replace with +
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }
  // WhatsApp wa.me requires numbers without the '+' sign
  return cleaned.replace("+", "");
}

export function generateWhatsAppMessage({
  name,
  ministryName,
  eventDate,
  eventTime,
  location,
  token,
  baseUrl,
}: WhatsAppMessageProps): string {
  const host = baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const cardUrl = `${host}/invitation/${token}`;

  return `🕊️ *VINO-ESVI - Invitation pour toi ${name}*

Le *${ministryName}* a l'immense honneur de vous convier à un grand moment de prière, de grâce et d'édification spirituelle.

📅 *Date & Heure :* ${eventDate} à ${eventTime}
📍 *Lieu :* ${location}
📖 *Parole :* 1 Pierre 1:3

✨ *Ouvrez votre carte d'invitation personnelle et confirmez votre présence en cliquant ci-dessous :*
${cardUrl}

Nous serons infiniment bénis de vous compter parmi nous ! 🙏`;
}

export function getWhatsAppUrl({
  phone,
  message,
}: {
  phone: string;
  message: string;
}): string {
  const cleanedPhone = cleanPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
}
