import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWhatsAppPhone(phone?: string | null) {
  const digits = (phone ?? '').replace(/\D/g, '');

  if (digits.length < 10) return null;
  if (digits.startsWith('55')) return digits;

  return `55${digits}`;
}

export function getWhatsAppUrl(phone?: string | null, message?: string) {
  const whatsappPhone = getWhatsAppPhone(phone);

  if (!whatsappPhone) return null;

  const baseUrl = `https://api.whatsapp.com/send?phone=${whatsappPhone}`;
  return message ? `${baseUrl}&text=${encodeURIComponent(message)}` : baseUrl;
}
