// A kernel restart keeps the connection but not the process, so a cached session
// has to be dropped or the next run goes without the theme the first run set up.
jest.mock('@/infrastructure/jupyter/jupyter.service', () => ({ JupyterService: jest.fn() }));
jest.mock('@jupyterlab/services', () => ({}));

import { JupyterSessionService } from '../jupyter-session.service';
import { EventNames, KernelRestartedEvent } from '@/events/environment.events';

const fakeSession = () => ({
  session: { shutdown: jest.fn().mockResolvedValue(undefined), dispose: jest.fn() },
  kernel: { shutdown: jest.fn().mockResolvedValue(undefined), dispose: jest.fn(), connectionStatus: 'connected' },
});

function makeService() {
  const service = new JupyterSessionService({} as any, {} as any, {} as any);
  const sessions = (service as any).sessions as Map<string, ReturnType<typeof fakeSession>>;
  return { service, sessions };
}

describe('JupyterSessionService after a kernel restart', () => {
  it('listens for the restart event', () => {
    expect(EventNames.KERNEL_RESTARTED).toBe('environment-kernel-restarted');
    expect(Reflect.getMetadata('EVENT_LISTENER_METADATA', JupyterSessionService.prototype.onKernelRestarted)).toEqual(
      expect.arrayContaining([expect.objectContaining({ event: EventNames.KERNEL_RESTARTED })]),
    );
  });

  it("drops that workspace's cached sessions and shuts them down, so the next run starts a fresh one", async () => {
    const { service, sessions } = makeService();
    const mine = fakeSession();
    const other = fakeSession();
    sessions.set('w1-notebook-a', mine);
    sessions.set('w2-notebook-b', other);

    await service.onKernelRestarted(new KernelRestartedEvent('w1'));

    expect(sessions.has('w1-notebook-a')).toBe(false);
    expect(mine.session.shutdown).toHaveBeenCalled();
    expect(mine.kernel.shutdown).toHaveBeenCalled();
    // Another workspace's kernel was not restarted.
    expect(sessions.has('w2-notebook-b')).toBe(true);
    expect(other.kernel.shutdown).not.toHaveBeenCalled();
  });

  it('still drops the session when shutting it down fails', async () => {
    const { service, sessions } = makeService();
    const broken = fakeSession();
    broken.kernel.shutdown.mockRejectedValue(new Error('already gone'));
    sessions.set('w1-notebook-a', broken);

    await service.onKernelRestarted(new KernelRestartedEvent('w1'));

    expect(sessions.has('w1-notebook-a')).toBe(false);
  });
});
