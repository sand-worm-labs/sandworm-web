import { setSeederFactory } from 'typeorm-extension';
import { Plan, WorkspaceEntity } from '../entities';
import { fake } from '../utils';

// Matches apps/api/src/common/utils/color.ts#getRandomIconColor — the
// WorkspaceIcon component builds an image path directly from this value
// (/img/<icon-without-extension>.png), so it must be one of these five
// filenames, not an arbitrary avatar URL.
const WORKSPACE_ICON_COLORS = ['red.png', 'blue.png', 'green.png', 'purple.png', 'yellow.png'] as const;

export default setSeederFactory(WorkspaceEntity, () => {
    const workspace = new WorkspaceEntity();
    workspace.icon = fake.helpers.arrayElement(WORKSPACE_ICON_COLORS);
    workspace.name = fake.company.name();
    workspace.source = fake.internet.url(); // or leave undefined sometimes
    workspace.useCases = fake.helpers.arrayElements(
        ["analytics", "marketing", "dev", "design", "support"],
        fake.number.int({ min: 1, max: 3 })
    );
    workspace.useContext = fake.lorem.sentence();
    workspace.plan = fake.helpers.arrayElement([Plan.FREE, Plan.PRO, Plan.ENTERPRISE]);

    return workspace;
}); 