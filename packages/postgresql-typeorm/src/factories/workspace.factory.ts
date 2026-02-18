import { setSeederFactory } from 'typeorm-extension';
import { Plan, WorkspaceEntity } from '../entities';
import { fake } from '../utils';

export default setSeederFactory(WorkspaceEntity, () => {
    const workspace = new WorkspaceEntity();
    workspace.icon = fake.image.avatar();
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