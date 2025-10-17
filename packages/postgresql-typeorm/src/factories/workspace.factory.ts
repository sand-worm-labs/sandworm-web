import { setSeederFactory } from 'typeorm-extension';
import { WorkspaceEntity } from '../entities';

export default setSeederFactory(WorkspaceEntity, (fake) => {
    const workspace = new WorkspaceEntity();

    workspace.name = fake.company.name();
    // workspace.ownerId = 1; // adjust as needed
    // workspace.createdAt = fake.date.past();
    // workspace.updatedAt = fake.date.recent();

    return workspace;
}); 