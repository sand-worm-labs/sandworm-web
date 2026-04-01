import { List } from "immutable";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import type {
  NewReusableComponent,
  APIReusableComponent,
  UpdateReusableComponent,
} from "@sandworm/types";

import {
  useGetWorkspaceComponentsQuery,
  useCreateComponentMutation,
  useUpdateComponentMutation,
  useDeleteComponentMutation,
  useCreateComponentInstanceMutation,
  useDeleteComponentInstanceMutation,
  ReusableComponentType as GQLComponentType,
} from "@/generated/graphql";

import { useWebsocket } from "./useWebSocket";

// =====================================
// ⬢ Types
// =====================================
export type ReusableComponents = List<APIReusableComponent>;

type API = {
  create: (
    workspaceId: string,
    data: Omit<NewReusableComponent, "id"> & { id: string },
    documentTitle: string,
    documentIcon: string
  ) => void;
  update: (
    workspaceId: string,
    id: string,
    data: UpdateReusableComponent
  ) => void;
  remove: (workspaceId: string, id: string) => void;
  createInstance: (
    workspaceId: string,
    componentId: string,
    data: { documentId: string; blockId: string }
  ) => Promise<void>;
  removeInstance: (
    workspaceId: string,
    componentId: string,
    blockId: string
  ) => void;
};

type State = Map<string, ReusableComponents>;

type UseReusableComponents = [
  { data: ReusableComponents; isLoading: boolean },
  API,
];

// =====================================
// ⬢ Context
// =====================================
const Context = createContext<[State, API]>([
  new Map(),
  {
    create: () => {
      throw new Error(
        "Attempted to call component create without ReusableComponentsProvider"
      );
    },
    update: () => {
      throw new Error(
        "Attempted to call component update without ReusableComponentsProvider"
      );
    },
    remove: () => {
      throw new Error(
        "Attempted to call component remove without ReusableComponentsProvider"
      );
    },
    createInstance: async () => {
      throw new Error(
        "Attempted to call createInstance without ReusableComponentsProvider"
      );
    },
    removeInstance: () => {
      throw new Error(
        "Attempted to call removeInstance without ReusableComponentsProvider"
      );
    },
  },
]);

// =====================================
// ⬢ Use Reusable Components Hook
// =====================================
export const useReusableComponents = (
  workspaceId: string
): UseReusableComponents => {
  const [state, api] = useContext(Context);
  return useMemo(() => {
    const componentData = state.get(workspaceId);
    return [{ data: componentData ?? List(), isLoading: !componentData }, api];
  }, [state, workspaceId, api]);
};

interface Props {
  workspaceId: string;
  children: React.ReactNode;
}

// =====================================
// ⬢  Reusable Components Provider
// =====================================
export function ReusableComponentsProvider({ workspaceId, children }: Props) {
  const socket = useWebsocket();
  const [state, setState] = useState<State>(new Map());

  const { data: componentsData } = useGetWorkspaceComponentsQuery({
    variables: { workspaceId },
    skip: !workspaceId,
  });

  const [createComponentMutation] = useCreateComponentMutation();
  const [updateComponentMutation] = useUpdateComponentMutation();
  const [deleteComponentMutation] = useDeleteComponentMutation();
  const [createInstanceMutation] = useCreateComponentInstanceMutation();
  const [deleteInstanceMutation] = useDeleteComponentInstanceMutation();

  useEffect(() => {
    if (componentsData?.getWorkspaceComponents) {
      setState(prev => {
        const next = new Map(prev);
        next.set(
          workspaceId,
          List(
            componentsData.getWorkspaceComponents as unknown as APIReusableComponent[]
          )
        );
        return next;
      });
    }
  }, [componentsData, workspaceId]);

  useEffect(() => {
    if (!socket || !workspaceId) return;

    socket.emit("fetch-workspace-components", { workspaceId });
  }, [socket, workspaceId]);

  // ⬢ Socket listeners
  // =====================================
  useEffect(() => {
    if (!socket) return () => {};

    const onReusableComponents = (payload: {
      workspaceId: string;
      components: APIReusableComponent[];
    }) => {
      setState(prev => {
        const next = new Map(prev);
        next.set(payload.workspaceId, List(payload.components));
        return next;
      });
    };

    const onReusableComponentUpdate = (payload: {
      workspaceId: string;
      component: APIReusableComponent;
    }) => {
      setState(prev => {
        const next = new Map(prev);
        const components = next.get(payload.workspaceId) ?? List();
        const index = components.findIndex(c => c.id === payload.component.id);

        next.set(
          payload.workspaceId,
          index === -1
            ? components.push(payload.component)
            : components.set(index, payload.component)
        );
        return next;
      });
    };

    const onReusableComponentRemoved = (payload: {
      workspaceId: string;
      componentId: string;
    }) => {
      setState(prev => {
        const next = new Map(prev);
        const components = next.get(payload.workspaceId) ?? List();
        next.set(
          payload.workspaceId,
          components.filter(c => c.id !== payload.componentId)
        );
        return next;
      });
    };

    socket.on("workspace-components", onReusableComponents);
    socket.on("workspace-component-update", onReusableComponentUpdate);
    socket.on("workspace-component-removed", onReusableComponentRemoved);

    return () => {
      socket.off("workspace-components", onReusableComponents);
      socket.off("workspace-component-update", onReusableComponentUpdate);
      socket.off("workspace-component-removed", onReusableComponentRemoved);
    };
  }, [socket]);

  // ⬢ Create Reusable Component
  // =====================================
  const create = useCallback(
    async (
      wsId: string,
      componentData: Omit<NewReusableComponent, "id"> & { id: string },
      documentTitle: string
    ) => {
      setState(prev => {
        const next = new Map(prev);
        const components = next.get(wsId) ?? List();
        next.set(
          wsId,
          components.push({
            ...componentData,
            document: {
              id: componentData.documentId,
              title: documentTitle,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            instancesCreated: true,
          })
        );
        return next;
      });

      try {
        await createComponentMutation({
          variables: {
            workspaceId: wsId,
            input: {
              blockId: componentData.blockId,
              documentId: componentData.documentId,
              state: componentData.state,
              title: componentData.title,
              type:
                componentData.type === "sql"
                  ? GQLComponentType.Sql
                  : GQLComponentType.Python,
            },
          },
        });
        toast.success("Component saved", {
          description: `"${componentData.title}" is now available across your workspace`,
        });
      } catch (err) {
        console.error("Mutation error:", err);
        toast.error("Failed to save component", {
          description: "Your changes were not saved. Try again.",
        });
        setState(prev => {
          const next = new Map(prev);
          const components = next.get(wsId) ?? List();
          next.set(
            wsId,
            components.filter(c => c.id !== componentData.id)
          );
          return next;
        });
      }
    },
    [createComponentMutation]
  );

  // ⬢ Update Reusable Component
  // =====================================
  const update = useCallback(
    async (wsId: string, id: string, updateData: UpdateReusableComponent) => {
      const prevComponent = state.get(wsId)?.find(c => c.id === id);

      setState(prev => {
        const next = new Map(prev);
        const components = next.get(wsId) ?? List();
        const index = components.findIndex(c => c.id === id);
        const component = components.get(index);

        if (index === -1 || !component) return prev;

        next.set(
          wsId,
          components.set(index, {
            ...component,
            ...updateData,
            id,
            updatedAt: new Date().toISOString(),
          })
        );
        return next;
      });

      try {
        await updateComponentMutation({
          variables: {
            workspaceId: wsId,
            componentId: id,
            input: updateData,
          },
        });
        toast.success("Component updated", {
          description: `"${updateData.title ?? "Component"}" has been updated`,
        });
      } catch (err) {
        console.error("Mutation error:", err);
        if (prevComponent) {
          setState(prev => {
            const next = new Map(prev);
            const components = next.get(wsId) ?? List();
            const index = components.findIndex(c => c.id === id);

            if (index === -1) return prev;

            next.set(wsId, components.set(index, prevComponent));
            return next;
          });
        }
        toast.error("Failed to update component", {
          description: "Reverted to the previous version.",
        });
      }
    },
    [state, updateComponentMutation]
  );

  // ⬢ Delete Reusable Component
  // =====================================
  const remove = useCallback(
    async (wsId: string, id: string) => {
      const prevComponent = state.get(wsId)?.find(c => c.id === id);
      if (!prevComponent) return;

      setState(prev => {
        const next = new Map(prev);
        const components = next.get(wsId) ?? List();
        next.set(
          wsId,
          components.filter(c => c.id !== id)
        );
        return next;
      });

      try {
        await deleteComponentMutation({
          variables: { workspaceId: wsId, componentId: id },
        });
        toast.success("Component removed");
      } catch (err) {
        console.error("Mutation error:", err);
        toast.error("Failed to remove component", {
          description: "The component is still active. Try again.",
        });
        setState(prev => {
          const next = new Map(prev);
          const components = next.get(wsId) ?? List();
          next.set(wsId, components.push(prevComponent));
          return next;
        });
      }
    },
    [state, deleteComponentMutation]
  );

  const createInstance = useCallback(
    async (
      wsId: string,
      componentId: string,
      instanceData: { documentId: string; blockId: string }
    ) => {
      try {
        await createInstanceMutation({
          variables: {
            workspaceId: wsId,
            componentId,
            input: instanceData,
          },
        });
      } catch {
        throw new Error("Failed to create component instance");
      }
    },
    [createInstanceMutation]
  );

  const removeInstance = useCallback(
    async (wsId: string, componentId: string, blockId: string) => {
      try {
        await deleteInstanceMutation({
          variables: { workspaceId: wsId, componentId, blockId },
        });
      } catch {
        throw new Error("Failed to remove component instance");
      }
    },
    [deleteInstanceMutation]
  );

  const value: [State, API] = useMemo(
    () => [state, { create, update, remove, createInstance, removeInstance }],
    [state, create, update, remove, createInstance, removeInstance]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
