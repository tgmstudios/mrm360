export interface IcsEventInput {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  attendeeEmail?: string;
  attendeeName?: string;
  organizerEmail?: string;
  organizerName?: string;
}

function toIcsUtc(date: Date): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let remaining = line;
  while (remaining.length > 75) {
    chunks.push(remaining.slice(0, 75));
    remaining = remaining.slice(75);
  }
  chunks.push(remaining);
  return chunks.join('\r\n ');
}

function parseFromAddress(raw: string | undefined): { email: string; name?: string } {
  if (!raw) return { email: 'noreply@mrm360.local' };
  const bracketed = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (bracketed) return { name: bracketed[1] || undefined, email: bracketed[2] };
  return { email: raw.trim() };
}

export function buildEventIcs(input: IcsEventInput): string {
  const parsed = parseFromAddress(process.env.SMTP_FROM);
  const organizerEmail = input.organizerEmail || parsed.email;
  const organizerName = input.organizerName || parsed.name || 'MRM360';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MRM360//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${input.uid}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(input.start)}`,
    `DTEND:${toIcsUtc(input.end)}`,
    `SUMMARY:${escapeText(input.title)}`,
  ];

  if (input.description) lines.push(`DESCRIPTION:${escapeText(input.description)}`);
  if (input.location) lines.push(`LOCATION:${escapeText(input.location)}`);

  lines.push(`ORGANIZER;CN=${escapeText(organizerName)}:mailto:${organizerEmail}`);

  if (input.attendeeEmail) {
    const cn = input.attendeeName ? `;CN=${escapeText(input.attendeeName)}` : '';
    lines.push(
      `ATTENDEE${cn};RSVP=FALSE;PARTSTAT=ACCEPTED;ROLE=REQ-PARTICIPANT:mailto:${input.attendeeEmail}`,
    );
  }

  lines.push('STATUS:CONFIRMED', 'SEQUENCE:0', 'END:VEVENT', 'END:VCALENDAR');

  return lines.map(foldLine).join('\r\n') + '\r\n';
}
