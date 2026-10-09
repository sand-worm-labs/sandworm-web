jest.mock('../../workspace/service/workspace-membership.service', () => ({
  WorkspaceMembershipService: jest.fn(),
}));

import { BadRequestException } from '@nestjs/common';
import { ShowcaseService } from '../showcase.service';

const OFFICIAL = 'ws-official';

function makeService(officialIds = OFFICIAL) {
  const query: any = {};
  for (const method of ['where', 'andWhere', 'orderBy']) query[method] = jest.fn(() => query);
  query.getMany = jest.fn().mockResolvedValue([]);
  const documentRepository = {
    createQueryBuilder: jest.fn(() => query),
    findOne: jest.fn(),
    save: jest.fn(async (doc: unknown) => doc),
  } as any;
  const leadRepository = { create: jest.fn((lead: unknown) => lead), save: jest.fn() } as any;
  const membership = { assertCanEdit: jest.fn().mockResolvedValue(undefined) } as any;
  const config = { get: jest.fn(() => officialIds) } as any;
  const config_ = {
    groups: { find: jest.fn().mockResolvedValue([]) } as any,
    categories: { find: jest.fn().mockResolvedValue([]) } as any,
    chains: { find: jest.fn().mockResolvedValue([]) } as any,
    templates: { find: jest.fn().mockResolvedValue([]) } as any,
  };
  const service = new ShowcaseService(
    documentRepository,
    leadRepository,
    config_.groups,
    config_.categories,
    config_.chains,
    config_.templates,
    membership,
    config,
  );
  return { service, query, documentRepository, leadRepository, membership, tables: config_ };
}

describe('ShowcaseService', () => {
  describe('listNotebooks', () => {
    it('shows nothing when no workspace is official', async () => {
      const { service, documentRepository } = makeService('');

      expect(await service.listNotebooks()).toEqual([]);
      expect(documentRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('lists only published notebooks from the official workspaces, narrowed by category and kind', async () => {
      const { service, query } = makeService();

      await service.listNotebooks({ category: 'off-ramps', kind: 'case_study' });

      expect(query.where).toHaveBeenCalledWith(expect.stringContaining('workspace_id IN'), { workspaceIds: [OFFICIAL] });
      const conditions = query.andWhere.mock.calls.map((call: unknown[]) => call[0]);
      expect(conditions).toEqual(expect.arrayContaining([expect.stringContaining(`'status' = 'published'`)]));
      expect(query.andWhere).toHaveBeenCalledWith(expect.stringContaining(`'category'`), { category: 'off-ramps' });
      expect(query.andWhere).toHaveBeenCalledWith(expect.stringContaining(`'kind'`), { kind: 'case_study' });
    });
  });

  describe('setShowcase', () => {
    it('saves valid metadata on a notebook the user can edit', async () => {
      const { service, documentRepository, membership } = makeService();
      const document = { id: 'd1', showcase: null };
      documentRepository.findOne.mockResolvedValue(document);

      await service.setShowcase('d1', 'w1', 'u1', { kind: 'case_study', category: 'off-ramps', protocol: 'Paj Cash', status: 'published' });

      expect(membership.assertCanEdit).toHaveBeenCalledWith('w1', 'u1');
      expect(document.showcase).toMatchObject({ kind: 'case_study', protocol: 'Paj Cash', chains: [], heroStats: [] });
    });

    it('refuses a case study with no protocol, and more than 4 hero stats', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'd1' });
      const stat = { label: 'Cashed out', value: '$1.16M' };

      await expect(service.setShowcase('d1', 'w1', 'u1', { kind: 'case_study', category: 'off-ramps' })).rejects.toThrow(BadRequestException);
      await expect(
        service.setShowcase('d1', 'w1', 'u1', { kind: 'category', category: 'off-ramps', heroStats: [stat, stat, stat, stat, stat] }),
      ).rejects.toThrow(BadRequestException);
      expect(documentRepository.save).not.toHaveBeenCalled();
    });

    it('takes a notebook off the Showcase when given null', async () => {
      const { service, documentRepository } = makeService();
      const document = { id: 'd1', showcase: { kind: 'category' } };
      documentRepository.findOne.mockResolvedValue(document);

      await service.setShowcase('d1', 'w1', 'u1', null);

      expect(document.showcase).toBeNull();
    });
  });

  describe('createLead', () => {
    it('saves a coverage request with where the visitor came from', async () => {
      const { service, leadRepository } = makeService();

      await service.createLead({ kind: 'coverage', category: 'off-ramps', protocol: ' Yellow Card ', source: { utm_source: 'x' } });

      expect(leadRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'coverage', protocol: 'Yellow Card', source: { utm_source: 'x' }, userId: null }),
      );
    });

    it('saves a claim only with a work email and the case study it is for', async () => {
      const { service, leadRepository } = makeService();

      await expect(service.createLead({ kind: 'claim', protocol: 'Paj Cash' })).rejects.toThrow(BadRequestException);
      await service.createLead({ kind: 'claim', protocol: 'Paj Cash', email: 'ada@paj.cash', notebookSlug: 'just-paj-it', role: 'Growth' }, 'u1');

      expect(leadRepository.save).toHaveBeenCalledTimes(1);
      expect(leadRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'claim', email: 'ada@paj.cash', notebookSlug: 'just-paj-it', role: 'Growth', userId: 'u1' }),
      );
    });
  });

  describe('getConfig', () => {
    it('lays the tables out the way the pages read them', async () => {
      const { service, tables } = makeService();
      tables.groups.find.mockResolvedValue([{ id: 'money', label: 'Money', position: 0 }]);
      tables.categories.find.mockResolvedValue([
        { slug: 'off-ramps', groupId: 'money', name: 'Off-ramps', question: 'Who cashes out?', metricSpec: null, protocols: ['Paj'], chains: ['Base'] },
      ]);
      tables.chains.find.mockResolvedValue([
        { name: 'Base', color: '#0052FF', position: 1 },
        { name: 'Solana', color: '#9945FF', position: 0 },
        { name: 'Tron', color: '#EB0029', position: null },
      ]);
      tables.templates.find.mockResolvedValue([{ kind: 'category', sections: [{ id: 'header' }] }]);

      const config = await service.getConfig();

      expect(config.taxonomy.groups).toEqual([{ id: 'money', label: 'Money' }]);
      expect(config.taxonomy.categories).toEqual([
        { group: 'money', slug: 'off-ramps', name: 'Off-ramps', question: 'Who cashes out?', protocols: ['Paj'], chains: ['Base'] },
      ]);
      // Only chains given a place are ordered; the rest sort themselves on the page.
      expect(config.taxonomy.chainOrder).toEqual(['Solana', 'Base']);
      expect(config.chains.Tron).toEqual({ color: '#EB0029' });
      expect(config.templates).toEqual({ category: { sections: [{ id: 'header' }] } });
    });
  });
});
