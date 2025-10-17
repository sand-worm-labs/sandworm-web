import { setSeederFactory } from 'typeorm-extension';
import { Plan, WorkspaceEntity } from '../entities';

export default setSeederFactory(WorkspaceEntity, (fake) => {
    const workspace = new WorkspaceEntity();

    workspace.name = fake.company.name();
    workspace.source = fake.internet.url(); // or leave undefined sometimes
    workspace.useCases = fake.helpers.arrayElements(
        ["analytics", "marketing", "dev", "design", "support"],
        fake.datatype.number({ min: 1, max: 3 })
    );
    workspace.useContext = fake.lorem.sentence();
    workspace.plan = fake.helpers.arrayElement([Plan.FREE, Plan.PRO, Plan.ENTERPRISE]);

    return workspace;
}); 