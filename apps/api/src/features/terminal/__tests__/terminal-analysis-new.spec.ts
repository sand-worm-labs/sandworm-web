import { TerminalContentService } from '../terminal-content.service';

// "New for you" on Analysis: a report is new for a week after it is published,
// whether or not the member has opened Briefing since.

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY);

function serviceWith(reports: { id: string; createdAt: Date; parentId?: string | null; tags?: string[] }[]) {
  const subjects = [
    { id: 's1', view: 'project', name: 'Paycrest', kind: '', impact: '', impactSize: 0, documentId: 'parent', clientId: 'c1' },
    { id: 'r1', view: 'region', name: 'Argentina', kind: '', impact: '', impactSize: 0, documentId: null, clientId: 'c1' },
  ];
  return Object.assign(Object.create(TerminalContentService.prototype), {
    members: {
      findOne: jest.fn().mockResolvedValue({ id: 'm1', clientId: 'c1', lastSeenBriefingAt: new Date() }),
    },
    subjects: { find: jest.fn().mockResolvedValue(subjects) },
    reportsOf: jest.fn().mockResolvedValue(
      reports.map(({ id, createdAt, parentId = 'parent', tags = [] }) => ({ id, title: id, description: null, tags, parentId, createdAt, workspaceId: 'w1', slug: null })),
    ),
  }) as TerminalContentService;
}

describe('analysis: new reports', () => {
  it('marks a report published in the last 7 days as new, even after the member opened Briefing', async () => {
    const service = serviceWith([
      { id: 'fresh', createdAt: daysAgo(2) },
      { id: 'week-old', createdAt: daysAgo(6) },
      { id: 'old', createdAt: daysAgo(9) },
    ]);

    const { subjects } = await service.getAnalysis('user-1');

    const isNew = Object.fromEntries(subjects[0]!.reports.map((report) => [report.id, report.isNew]));
    expect(isNew).toEqual({ fresh: true, 'week-old': true, old: false });
  });

  it('puts a report tagged with a region under the region even when it has no project', async () => {
    const service = serviceWith([
      { id: 'in-project', createdAt: daysAgo(1) },
      { id: 'region-only', createdAt: daysAgo(2), parentId: null, tags: ['r1'] },
    ]);

    const { subjects } = await service.getAnalysis('user-1');

    const idsOf = (name: string) => subjects.find((s) => s.name === name)!.reports.map((r) => r.id);
    expect(idsOf('Paycrest')).toEqual(['in-project']);
    expect(idsOf('Argentina')).toEqual(['region-only']);
  });
});
