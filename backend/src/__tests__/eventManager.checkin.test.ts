import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  findUserByQrCode: vi.fn(),
  findEvent: vi.fn(),
  findRsvp: vi.fn(),
  findCheckIn: vi.fn(),
  createCheckIn: vi.fn(),
  countConfirmedRsvps: vi.fn(),
  createRsvp: vi.fn(),
  updateRsvp: vi.fn(),
  TaskManager: vi.fn(),
}));

vi.mock('@/utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/services/eventEmailService', () => ({
  sendRsvpConfirmedEmail: vi.fn(),
  sendRsvpDeclinedEmail: vi.fn(),
  sendRsvpWaitlistedEmail: vi.fn(),
  sendWaitlistPromotedEmail: vi.fn(),
}));

vi.mock('@/managers/taskManager', () => ({
  TaskManager: mocks.TaskManager,
}));

import { EventManager } from '@/managers/eventManager';

const user = { id: 'user-1', qrCode: 'qr-1' };
const fullEvent = {
  id: 'event-1',
  attendanceCap: 1,
  waitlistEnabled: false,
};

describe('EventManager.checkInAttendance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUserByQrCode.mockResolvedValue(user);
    mocks.findEvent.mockResolvedValue(fullEvent);
    mocks.findRsvp.mockResolvedValue({ status: 'DECLINED' });
    mocks.findCheckIn.mockResolvedValue({ id: 'check-in-1' });
    mocks.countConfirmedRsvps.mockResolvedValue(1);
  });

  it('returns already checked in before RSVP and capacity checks for a duplicate QR scan', async () => {
    const manager = new EventManager({
      user: { findFirst: mocks.findUserByQrCode },
      event: { findUnique: mocks.findEvent },
      rSVP: {
        findUnique: mocks.findRsvp,
        count: mocks.countConfirmedRsvps,
        create: mocks.createRsvp,
        update: mocks.updateRsvp,
      },
      checkIn: {
        findUnique: mocks.findCheckIn,
        create: mocks.createCheckIn,
      },
    } as any);

    await expect(manager.checkInAttendance({ qrCode: 'qr-1', eventId: 'event-1' }))
      .resolves.toEqual({ success: false, message: 'User already checked in' });

    expect(mocks.findRsvp).not.toHaveBeenCalled();
    expect(mocks.countConfirmedRsvps).not.toHaveBeenCalled();
    expect(mocks.createCheckIn).not.toHaveBeenCalled();
  });

  it('returns already checked in when a concurrent check-in create hits the unique constraint', async () => {
    mocks.findCheckIn.mockResolvedValue(null);
    mocks.findRsvp.mockResolvedValue({ status: 'CONFIRMED' });
    mocks.findEvent.mockResolvedValue({
      ...fullEvent,
      autoAssignEnabled: true,
      teamsEnabled: true,
      membersPerTeam: 4,
    });
    mocks.createCheckIn.mockRejectedValue(new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`userId`,`eventId`)',
      { code: 'P2002', clientVersion: '5.0.0' },
    ));

    const manager = new EventManager({
      user: { findFirst: mocks.findUserByQrCode },
      event: { findUnique: mocks.findEvent },
      rSVP: {
        findUnique: mocks.findRsvp,
        count: mocks.countConfirmedRsvps,
        create: mocks.createRsvp,
        update: mocks.updateRsvp,
      },
      checkIn: {
        findUnique: mocks.findCheckIn,
        create: mocks.createCheckIn,
      },
    } as any);
    const triggerAutoAssignment = vi.spyOn(manager, 'triggerAutoAssignment');

    await expect(manager.checkInAttendance({ qrCode: 'qr-1', eventId: 'event-1' }))
      .resolves.toEqual({ success: false, message: 'User already checked in' });

    expect(triggerAutoAssignment).not.toHaveBeenCalled();
    expect(mocks.TaskManager).not.toHaveBeenCalled();
  });
});
