import { In } from 'typeorm';
import { TerminalContentService } from '../terminal-content.service';

// What a member can do with a briefing item besides read it: read it again later
// (unread) and put it away (archive). Only the repositories these actions use are stubbed.

const MEMBER = { id: 'member-1', clientId: 'client-1' };

function setup({ own = ['a', 'b'], member = MEMBER as typeof MEMBER | null } = {}) {
  const insert = {
    into: jest.fn(),
    values: jest.fn(),
    orIgnore: jest.fn(),
    orUpdate: jest.fn(),
    execute: jest.fn().mockResolvedValue(undefined),
  };
  insert.values.mockReturnValue(insert);
  insert.orIgnore.mockReturnValue(insert);
  insert.orUpdate.mockReturnValue(insert);
  const reads = {
    delete: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    createQueryBuilder: jest.fn().mockReturnValue({ insert: () => insert }),
  };
  const items = { find: jest.fn().mockResolvedValue(own.map((id) => ({ id }))) };
  const service = Object.assign(Object.create(TerminalContentService.prototype), {
    members: { findOne: jest.fn().mockResolvedValue(member) },
    briefingItems: items,
    briefingReads: reads,
  }) as TerminalContentService;
  return { service, reads, items, insert };
}

describe('briefing state', () => {
  it('puts items back to unread by removing the member\'s read rows', async () => {
    const { service, reads } = setup();

    await expect(service.markBriefingUnread('user-1', ['a', 'b'])).resolves.toBe(true);

    expect(reads.delete).toHaveBeenCalledWith({ memberId: 'member-1', itemId: In(['a', 'b']) });
  });

  it('archives only the items that are the member\'s to act on, and reads them', async () => {
    const { service, insert } = setup({ own: ['a'] });

    await service.setBriefingArchived('user-1', ['a', 'someone-elses'], true);

    const [rows] = insert.values.mock.calls[0];
    expect(rows).toEqual([{ itemId: 'a', memberId: 'member-1', archivedAt: expect.any(Date) }]);
    expect(insert.orUpdate).toHaveBeenCalledWith(['archived_at'], ['item_id', 'member_id']);
  });

  it('takes items out of the archive and leaves them read', async () => {
    const { service, reads } = setup();

    await service.setBriefingArchived('user-1', ['a', 'b'], false);

    expect(reads.update).toHaveBeenCalledWith({ memberId: 'member-1', itemId: In(['a', 'b']) }, { archivedAt: null });
    expect(reads.delete).not.toHaveBeenCalled();
  });

  it('does nothing for someone who is not part of a client, or with nothing to change', async () => {
    const outsider = setup({ member: null });
    await expect(outsider.service.markBriefingUnread('user-1', ['a'])).resolves.toBe(false);
    await expect(outsider.service.setBriefingArchived('user-1', ['a'], true)).resolves.toBe(false);

    const empty = setup();
    await expect(empty.service.setBriefingArchived('user-1', [], true)).resolves.toBe(false);
    expect(empty.items.find).not.toHaveBeenCalled();
  });

  it('does not archive when none of the items are the member\'s', async () => {
    const { service, insert } = setup({ own: [] });

    await expect(service.setBriefingArchived('user-1', ['x'], true)).resolves.toBe(false);

    expect(insert.execute).not.toHaveBeenCalled();
  });
});
