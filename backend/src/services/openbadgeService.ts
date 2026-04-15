import { logger } from '@/utils/logger';

const OPENBADGE_BASE_URL = process.env.OPENBADGE_BASE_URL || '';
const OPENBADGE_API_KEY = process.env.OPENBADGE_API_KEY || '';

function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${OPENBADGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export interface BadgeClass {
  id: string;
  issuerId: string;
  name: string;
  description: string;
  imageUrl: string;
  criteriaUrl?: string;
  criteriaNarrative?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BadgeInvite {
  id: string;
  token: string;
  badgeClassId: string;
  recipientEmail: string | null;
  recipientName: string | null;
  status: 'pending' | 'claimed' | 'expired';
  expiresAt: string;
  assertionId: string | null;
  inviteUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assertion {
  id: string;
  badgeClassId: string;
  recipientEmail: string;
  recipientName?: string;
  issuedOn: string;
  expires?: string;
  revoked: boolean;
  emailSent: boolean;
  jws?: string | null;
}

async function openbadgeFetch(path: string, options: RequestInit = {}): Promise<Response> {
  if (!OPENBADGE_BASE_URL) {
    throw new Error('OPENBADGE_BASE_URL is not configured');
  }
  if (!OPENBADGE_API_KEY) {
    throw new Error('OPENBADGE_API_KEY is not configured');
  }

  const url = `${OPENBADGE_BASE_URL}${path}`;
  logger.info('OpenBadge API request', { url, method: options.method || 'GET' });

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENBADGE_API_KEY}`,
        ...options.headers,
      },
    });
  } catch (fetchError: any) {
    logger.error('OpenBadge API connection failed', { url, error: fetchError?.message });
    throw new Error(`OpenBadge API connection failed: ${fetchError?.message}`);
  }

  if (!res.ok) {
    const body = await res.text();
    logger.error('OpenBadge API error', { status: res.status, body, path });
    throw new Error(`OpenBadge API error: ${res.status} - ${body}`);
  }
  return res;
}

// ── Badge Classes ──

export async function getBadgeClasses(): Promise<BadgeClass[]> {
  const res = await openbadgeFetch('/api/badge-classes');
  const classes: BadgeClass[] = await res.json();
  return classes.map(bc => ({ ...bc, imageUrl: resolveImageUrl(bc.imageUrl) }));
}

export async function getBadgeClass(id: string): Promise<BadgeClass> {
  const res = await openbadgeFetch(`/api/badge-classes/${id}`);
  const bc: BadgeClass = await res.json();
  return { ...bc, imageUrl: resolveImageUrl(bc.imageUrl) };
}

// ── Invites ──

export async function sendBadgeInvite(
  badgeClassId: string,
  recipientEmail: string,
  recipientName?: string,
): Promise<BadgeInvite> {
  logger.info('Sending badge invite', { badgeClassId, recipientEmail });
  const res = await openbadgeFetch('/api/invites', {
    method: 'POST',
    body: JSON.stringify({
      badgeClassId,
      recipientEmail,
      recipientName,
      sendEmail: true,
    }),
  });
  const invite: BadgeInvite = await res.json();
  logger.info('Badge invite sent', { inviteId: invite.id, recipientEmail, inviteUrl: invite.inviteUrl });
  return invite;
}

export async function getInvitesForBadge(badgeClassId: string): Promise<BadgeInvite[]> {
  const res = await openbadgeFetch(`/api/invites?badgeClassId=${badgeClassId}`);
  return res.json();
}

// ── Assertions (for checking issued/claimed status) ──

export async function getAssertionsForBadge(badgeClassId: string): Promise<Assertion[]> {
  const res = await openbadgeFetch(`/api/assertions?badgeClassId=${badgeClassId}`);
  return res.json();
}
