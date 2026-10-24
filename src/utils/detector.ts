import { DropCategory, DropMetadata, ExpirationPreset } from '../types';

// Map of common Turkish Bank Codes (first 5 digits after TRxx)
const TR_BANK_CODES: Record<string, string> = {
  '00010': 'Ziraat Bankası',
  '00012': 'Halkbank',
  '00015': 'Vakıfbank',
  '00032': 'Türk Ekonomi Bankası (TEB)',
  '00046': 'Akbank',
  '00062': 'Garanti BBVA',
  '00064': 'Türkiye İş Bankası',
  '00067': 'Yapı ve Kredi Bankası',
  '00099': 'ING Bank',
  '00103': 'Fibabanka',
  '00111': 'QNB Finansbank',
  '00123': 'HSBC',
  '00124': 'Alternatif Bank',
  '00134': 'DenizBank',
  '00135': 'Anadolubank',
  '00146': 'Odea Bank',
  '00203': 'Albaraka Türk',
  '00205': 'Kuveyt Türk',
  '00206': 'Türkiye Finans',
  '00208': 'Vakıf Katılım',
  '00209': 'Ziraat Katılım',
  '00210': 'Emlak Katılım',
  '00801': 'Papara',
};

/**
 * Checks if a trimmed string is an IBAN (Turkish or international)
 */
export function detectIban(text: string): { isIban: boolean; rawIban?: string; formatted?: string; bankName?: string } {
  const cleaned = text.trim().replace(/[\s\.-]/g, '').toUpperCase();

  // Turkish IBAN: TR followed by 2 check digits and 22 digits/chars (total 26 chars)
  const isTrIban = /^TR\d{2}[0-9A-Z]{22}$/.test(cleaned);

  // General International IBAN: 2 letters + 2 digits + 11 to 30 alphanumeric characters
  const isGeneralIban = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(cleaned);

  if (isTrIban || isGeneralIban) {
    // Format into groups of 4 characters
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;

    let bankName: string | undefined;
    if (isTrIban) {
      const bankCode = cleaned.substring(4, 9);
      bankName = TR_BANK_CODES[bankCode] || 'Turkish Bank';
    }

    return {
      isIban: true,
      rawIban: cleaned,
      formatted,
      bankName,
    };
  }

  return { isIban: false };
}

/**
 * Checks if a trimmed string is a valid URL
 */
export function detectUrl(text: string): { isUrl: boolean; normalizedUrl?: string; domain?: string } {
  const trimmed = text.trim();

  // If contains spaces or line breaks, unlikely to be a pure URL
  if (/\s/.test(trimmed)) {
    return { isUrl: false };
  }

  let candidate = trimmed;
  if (/^www\./i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      const hostname = url.hostname.replace(/^www\./, '');
      return {
        isUrl: true,
        normalizedUrl: url.toString(),
        domain: hostname,
      };
    }
  } catch {
    // Check if it's a domain-like string (e.g. google.com, sub.domain.co.uk/path)
    const domainRegex = /^[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
    if (domainRegex.test(trimmed)) {
      try {
        const url = new URL(`https://${trimmed}`);
        return {
          isUrl: true,
          normalizedUrl: url.toString(),
          domain: url.hostname.replace(/^www\./, ''),
        };
      } catch {
        return { isUrl: false };
      }
    }
  }

  return { isUrl: false };
}

/**
 * Auto-detects category and generates relevant metadata
 */
export function detectCategory(text: string): { category: DropCategory; meta: DropMetadata } {
  const ibanCheck = detectIban(text);
  if (ibanCheck.isIban) {
    return {
      category: 'iban',
      meta: {
        rawIban: ibanCheck.rawIban,
        formattedIban: ibanCheck.formatted,
        bankName: ibanCheck.bankName,
      },
    };
  }

  const urlCheck = detectUrl(text);
  if (urlCheck.isUrl) {
    return {
      category: 'link',
      meta: {
        domain: urlCheck.domain,
        title: urlCheck.domain,
      },
    };
  }

  return {
    category: 'note',
    meta: {},
  };
}

/**
 * Calculates expiration timestamp in milliseconds from a preset
 */
export function calculateExpiresAt(preset: ExpirationPreset, fromTime: number = Date.now()): number | null {
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;

  switch (preset) {
    case '24h':
      return fromTime + 1 * DAY;
    case '3d':
      return fromTime + 3 * DAY;
    case '7d':
      return fromTime + 7 * DAY;
    case 'never':
      return null;
    default:
      return fromTime + 3 * DAY;
  }
}

/**
 * Formats time remaining for a card badge
 */
export function formatTimeRemaining(
  expiresAt: number | null,
  isPinned: boolean,
  now: number = Date.now()
): { label: string; isUrgent: boolean; progressPercent: number; isPermanent: boolean } {
  if (isPinned) {
    return {
      label: 'Pinned',
      isUrgent: false,
      progressPercent: 100,
      isPermanent: true,
    };
  }

  if (expiresAt === null) {
    return {
      label: 'Permanent',
      isUrgent: false,
      progressPercent: 100,
      isPermanent: true,
    };
  }

  const diffMs = expiresAt - now;

  if (diffMs <= 0) {
    return {
      label: 'Expired',
      isUrgent: true,
      progressPercent: 0,
      isPermanent: false,
    };
  }

  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  let label = '';
  if (diffDays >= 1) {
    label = `${diffDays}d ${diffHours % 24}h left`;
  } else if (diffHours >= 1) {
    label = `Expires in ${diffHours}h`;
  } else if (diffMins > 0) {
    label = `Expires in ${diffMins}m`;
  } else {
    label = 'Expires in < 1m';
  }

  // Calculate approximate percentage of lifespan (capped at 100%)
  const isUrgent = diffHours < 3; // less than 3 hours remaining is urgent

  return {
    label,
    isUrgent,
    progressPercent: Math.min(100, Math.max(5, (diffMs / (3 * 24 * 3600 * 1000)) * 100)),
    isPermanent: false,
  };
}
