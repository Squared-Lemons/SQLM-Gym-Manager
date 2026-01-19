import { nanoid } from "nanoid";

export function generateQRCode(gymId: string, memberId: string): string {
  // Generate a unique QR code that includes gym and member identifiers
  const uniqueCode = nanoid(12);
  return `GYM-${gymId.slice(0, 8)}-MEM-${memberId.slice(0, 8)}-${uniqueCode}`;
}

export function parseQRCode(qrCode: string): {
  isValid: boolean;
  gymIdPrefix?: string;
  memberIdPrefix?: string;
  uniqueCode?: string;
} {
  const pattern = /^GYM-([A-Za-z0-9_-]+)-MEM-([A-Za-z0-9_-]+)-([A-Za-z0-9_-]+)$/;
  const match = qrCode.match(pattern);

  if (!match) {
    return { isValid: false };
  }

  return {
    isValid: true,
    gymIdPrefix: match[1],
    memberIdPrefix: match[2],
    uniqueCode: match[3],
  };
}

export function validateQRCodeFormat(qrCode: string): boolean {
  const pattern = /^GYM-[A-Za-z0-9_-]+-MEM-[A-Za-z0-9_-]+-[A-Za-z0-9_-]+$/;
  return pattern.test(qrCode);
}
