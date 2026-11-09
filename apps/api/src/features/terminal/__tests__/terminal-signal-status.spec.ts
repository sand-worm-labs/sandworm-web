import { SignalDismissReasonId, SignalStatusId } from '@sandworm/types/terminal';
import { TerminalContentService } from '../terminal-content.service';

// What a client records when it triages a signal: a status, and for "dismissed" why.

function setup() {
  const row = { id: 's1', status: SignalStatusId.NEW, dismissReason: null as SignalDismissReasonId | null, documentId: null, publishedAt: new Date() };
  const signals = { findOneBy: jest.fn().mockResolvedValue(row), save: jest.fn().mockResolvedValue(undefined) };
  const service = Object.assign(Object.create(TerminalContentService.prototype), {
    signals,
    writerOf: jest.fn().mockResolvedValue({ id: 'member-1', clientId: 'client-1' }),
    paths: jest.fn().mockResolvedValue(new Map()),
  }) as TerminalContentService;
  return { service, row };
}

describe('signal status', () => {
  it('keeps the reason a signal was dismissed for', async () => {
    const { service } = setup();

    const signal = await service.setSignalStatus('u', 's1', SignalStatusId.DISMISSED, SignalDismissReasonId.BAD_TIMING);

    expect(signal).toMatchObject({ status: 'dismissed', dismissReason: 'bad-timing' });
  });

  it('forgets the reason when the signal is taken up again', async () => {
    const { service, row } = setup();
    row.dismissReason = SignalDismissReasonId.LOOKS_WRONG;

    const signal = await service.setSignalStatus('u', 's1', SignalStatusId.LOOKING, SignalDismissReasonId.LOOKS_WRONG);

    expect(signal.dismissReason).toBeNull();
  });

  it('rejects a reason it does not know', async () => {
    const { service } = setup();

    await expect(
      service.setSignalStatus('u', 's1', SignalStatusId.DISMISSED, 'because' as SignalDismissReasonId),
    ).rejects.toThrow('Unknown reason');
  });
});
