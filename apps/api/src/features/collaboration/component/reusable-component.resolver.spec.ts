import { ReusableComponentResolver } from './reusable-component.resolver';
import { ReusableComponentService } from './reusable-component.service';
import { ReusableComponent } from './model/reusable-component.model';
import { ReusableComponentInstance } from './model/reusable-component-instance.model';

function makeService(): jest.Mocked<ReusableComponentService> {
  return {
    getComponent: jest.fn(),
    getWorkspaceComponents: jest.fn(),
    createComponent: jest.fn(),
    updateComponent: jest.fn(),
    deleteComponent: jest.fn(),
    createInstance: jest.fn(),
    deleteInstance: jest.fn(),
    getComponentInstances: jest.fn(),
  } as any;
}

function makeResolver(service = makeService()) {
  return { resolver: new ReusableComponentResolver(service), service };
}

const WORKSPACE = 'ws-1';
const COMPONENT_ID = 'comp-1';
const BLOCK_ID = 'block-1';

describe('ReusableComponentResolver', () => {
  describe('getComponent', () => {
    it('delegates to service and returns result', async () => {
      const { resolver, service } = makeResolver();
      const component = { id: COMPONENT_ID } as ReusableComponent;
      service.getComponent.mockResolvedValue(component);

      const result = await resolver.getComponent(COMPONENT_ID, WORKSPACE);

      expect(service.getComponent).toHaveBeenCalledWith(COMPONENT_ID, WORKSPACE);
      expect(result).toBe(component);
    });
  });

  describe('getWorkspaceComponents', () => {
    it('maps entities through ReusableComponent.fromEntity', async () => {
      const { resolver, service } = makeResolver();
      const entity = { id: 'c1', name: 'Test', workspaceId: WORKSPACE, state: Buffer.from('') } as any;
      service.getWorkspaceComponents.mockResolvedValue([entity]);

      const results = await resolver.getWorkspaceComponents(WORKSPACE);

      expect(service.getWorkspaceComponents).toHaveBeenCalledWith(WORKSPACE);
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(ReusableComponent);
    });

    it('returns empty array when workspace has no components', async () => {
      const { resolver, service } = makeResolver();
      service.getWorkspaceComponents.mockResolvedValue([]);

      expect(await resolver.getWorkspaceComponents(WORKSPACE)).toEqual([]);
    });
  });

  describe('createComponent', () => {
    it('delegates to service and returns created component', async () => {
      const { resolver, service } = makeResolver();
      const input = { name: 'My Component' } as any;
      const component = { id: COMPONENT_ID } as ReusableComponent;
      service.createComponent.mockResolvedValue(component);

      const result = await resolver.createComponent(WORKSPACE, input);

      expect(service.createComponent).toHaveBeenCalledWith(WORKSPACE, input);
      expect(result).toBe(component);
    });
  });

  describe('updateComponent', () => {
    it('delegates to service and returns updated component', async () => {
      const { resolver, service } = makeResolver();
      const input = { name: 'Updated' } as any;
      const component = { id: COMPONENT_ID, name: 'Updated' } as ReusableComponent;
      service.updateComponent.mockResolvedValue(component);

      const result = await resolver.updateComponent(COMPONENT_ID, WORKSPACE, input);

      expect(service.updateComponent).toHaveBeenCalledWith(COMPONENT_ID, WORKSPACE, input);
      expect(result).toBe(component);
    });
  });

  describe('deleteComponent', () => {
    it('calls service and returns true', async () => {
      const { resolver, service } = makeResolver();
      service.deleteComponent.mockResolvedValue(undefined);

      const result = await resolver.deleteComponent(COMPONENT_ID, WORKSPACE);

      expect(service.deleteComponent).toHaveBeenCalledWith(COMPONENT_ID, WORKSPACE);
      expect(result).toBe(true);
    });
  });

  describe('createComponentInstance', () => {
    it('delegates to service and returns instance', async () => {
      const { resolver, service } = makeResolver();
      const input = { documentId: 'doc-1' } as any;
      const instance = { id: 'inst-1' } as ReusableComponentInstance;
      service.createInstance.mockResolvedValue(instance);

      const result = await resolver.createComponentInstance(COMPONENT_ID, WORKSPACE, input);

      expect(service.createInstance).toHaveBeenCalledWith(COMPONENT_ID, WORKSPACE, input);
      expect(result).toBe(instance);
    });
  });

  describe('deleteComponentInstance', () => {
    it('delegates to service and returns its result', async () => {
      const { resolver, service } = makeResolver();
      service.deleteInstance.mockResolvedValue(true);

      const result = await resolver.deleteComponentInstance(COMPONENT_ID, BLOCK_ID, WORKSPACE);

      expect(service.deleteInstance).toHaveBeenCalledWith(COMPONENT_ID, BLOCK_ID, WORKSPACE);
      expect(result).toBe(true);
    });
  });

  describe('instances (ResolveField)', () => {
    it('loads instances for the parent component', async () => {
      const { resolver, service } = makeResolver();
      const instances = [{ id: 'i1' }] as ReusableComponentInstance[];
      service.getComponentInstances.mockResolvedValue(instances);
      const parent = { id: COMPONENT_ID } as ReusableComponent;

      const result = await resolver.instances(parent);

      expect(service.getComponentInstances).toHaveBeenCalledWith(COMPONENT_ID);
      expect(result).toBe(instances);
    });
  });
});
