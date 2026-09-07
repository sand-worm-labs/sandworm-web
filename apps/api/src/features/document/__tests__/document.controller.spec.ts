import { DocumentQueryController } from '../document.controller';

function makeController() {
  const jupyterService = {
    getFile: jest.fn(),
    listFiles: jest.fn().mockResolvedValue([]),
  } as any;
  const controller = new DocumentQueryController(jupyterService);
  return { controller, jupyterService };
}

function makeReply() {
  const reply: any = {};
  reply.status = jest.fn(() => reply);
  reply.header = jest.fn(() => reply);
  reply.send = jest.fn(() => reply);
  return reply;
}

const WORKSPACE_ID = 'ws-1';
const DOCUMENT_ID = 'doc-1';
const QUERY_ID = 'query-1';

describe('DocumentQueryController', () => {
  describe('downloadCsv', () => {
    it('returns a 500 when the query result file is not found', async () => {
      const { controller, jupyterService } = makeController();
      jupyterService.getFile.mockResolvedValue(null);
      const reply = makeReply();

      await controller.downloadCsv(WORKSPACE_ID, DOCUMENT_ID, QUERY_ID, undefined as any, reply);

      expect(reply.status).toHaveBeenCalledWith(500);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Query result not found. Run the query first.' });
    });

    it('streams the CSV with headers derived from queryId when no name is given', async () => {
      const { controller, jupyterService } = makeController();
      const stream = { pipe: jest.fn() };
      jupyterService.getFile.mockResolvedValue({ stream, size: 1234 });
      const reply = makeReply();

      await controller.downloadCsv(WORKSPACE_ID, DOCUMENT_ID, QUERY_ID, undefined as any, reply);

      expect(jupyterService.getFile).toHaveBeenCalledWith(WORKSPACE_ID, `.sandworm/query-${QUERY_ID}.csv`);
      expect(reply.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${QUERY_ID}.csv"`);
      expect(reply.header).toHaveBeenCalledWith('Content-Length', 1234);
      expect(reply.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(reply.send).toHaveBeenCalledWith(stream);
    });

    it('uses the provided name for the downloaded filename', async () => {
      const { controller, jupyterService } = makeController();
      const stream = {};
      jupyterService.getFile.mockResolvedValue({ stream, size: 10 });
      const reply = makeReply();

      await controller.downloadCsv(WORKSPACE_ID, DOCUMENT_ID, QUERY_ID, 'my-export', reply);

      expect(reply.header).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="my-export.csv"');
    });
  });
});
