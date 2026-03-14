import { List } from "immutable";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  NewReusableComponent,
  APIReusableComponent,
  UpdateReusableComponent,
} from "@/types";
import {
  useGetWorkspaceComponentsQuery,
  useCreateComponentMutation,
  useUpdateComponentMutation,
  useDeleteComponentMutation,
  useCreateComponentInstanceMutation,
  useDeleteComponentInstanceMutation,
} from "@/generated/graphql";

import { useWebsocket } from "./useWebSocket";

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

type UseReusableComponents = [
  { data: ReusableComponents; isLoading: boolean },
  API,
];

export const useReusableComponents = (
  workspaceId: string
): UseReusableComponents => {
  const [state, api] = useContext(Context);
  return useMemo(() => {
    const data = state.get(workspaceId);
    return [{ data: data ?? List(), isLoading: !data }, api];
  }, [state, workspaceId, api]);
};

interface Props {
  workspaceId: string;
  children: React.ReactNode;
}

export function ReusableComponentsProvider({ workspaceId, children }: Props) {
  const socket = useWebsocket();
  const [state, setState] = useState<State>(new Map());

  const { data, loading } = useGetWorkspaceComponentsQuery({
    variables: { workspaceId },
    skip: !workspaceId,
  });

  const [createComponentMutation] = useCreateComponentMutation();
  const [updateComponentMutation] = useUpdateComponentMutation();
  const [deleteComponentMutation] = useDeleteComponentMutation();
  const [createInstanceMutation] = useCreateComponentInstanceMutation();
  const [deleteInstanceMutation] = useDeleteComponentInstanceMutation();

  // Sync query data to state
  useEffect(() => {
    if (data?.getWorkspaceComponents) {
      setState(prev => {
        const next = new Map(prev);
        next.set(
          workspaceId,
          List(data.getWorkspaceComponents as APIReusableComponent[])
        );
        return next;
      });
    }
  }, [data, workspaceId]);

  useEffect(() => {
    if (!socket || !workspaceId) return;

    socket.emit("fetch-workspace-components", { workspaceId });
  }, [socket, workspaceId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

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

  const create = useCallback(
    async (
      workspaceId: string,
      data: Omit<NewReusableComponent, "id"> & { id: string },
      documentTitle: string,
      documentIcon: string
    ) => {
      // Optimistic update
      setState(prev => {
        const next = new Map(prev);
        const components = next.get(workspaceId) ?? List();
        next.set(
          workspaceId,
          components.push({
            ...data,
            document: {
              id: data.documentId,
              title: documentTitle,
              icon: documentIcon,
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
            workspaceId,
            input: {
              blockId: data.blockId,
              documentId: data.documentId,
              state: data.state,
              title: data.title,
              type: data.type.toUpperCase() as ReusableComponentType,
            },
          },
        });
      } catch {
        console.error("Mutation error:", error);

        alert("Failed to create reusable component");
        setState(prev => {
          const next = new Map(prev);
          const components = next.get(workspaceId) ?? List();
          next.set(
            workspaceId,
            components.filter(c => c.id !== data.id)
          );
          return next;
        });
      }
    },
    [createComponentMutation]
  );

  const update = useCallback(
    async (workspaceId: string, id: string, data: UpdateReusableComponent) => {
      const prevComponent = state.get(workspaceId)?.find(c => c.id === id);

      // Optimistic update
      setState(prev => {
        const next = new Map(prev);
        const components = next.get(workspaceId) ?? List();
        const index = components.findIndex(c => c.id === id);
        const component = components.get(index);

        if (index === -1 || !component) return prev;

        next.set(
          workspaceId,
          components.set(index, {
            ...component,
            ...data,
            id,
            updatedAt: new Date().toISOString(),
          })
        );
        return next;
      });

      try {
        await updateComponentMutation({
          variables: {
            workspaceId,
            componentId: id,
            input: data,
          },
        });
      } catch {
        if (prevComponent) {
          setState(prev => {
            const next = new Map(prev);
            const components = next.get(workspaceId) ?? List();
            const index = components.findIndex(c => c.id === id);

            if (index === -1) return prev;

            next.set(workspaceId, components.set(index, prevComponent));
            return next;
          });
        }
        alert("Failed to update reusable component");
      }
    },
    [state, updateComponentMutation]
  );

  const remove = useCallback(
    async (workspaceId: string, id: string) => {
      const prevComponent = state.get(workspaceId)?.find(c => c.id === id);
      if (!prevComponent) return;

      // Optimistic update
      setState(prev => {
        const next = new Map(prev);
        const components = next.get(workspaceId) ?? List();
        next.set(
          workspaceId,
          components.filter(c => c.id !== id)
        );
        return next;
      });

      try {
        await deleteComponentMutation({
          variables: { workspaceId, componentId: id },
        });
      } catch {
        alert("Failed to remove reusable component");
        setState(prev => {
          const next = new Map(prev);
          const components = next.get(workspaceId) ?? List();
          next.set(workspaceId, components.push(prevComponent));
          return next;
        });
      }
    },
    [state, deleteComponentMutation]
  );

  const createInstance = useCallback(
    async (
      workspaceId: string,
      componentId: string,
      data: { documentId: string; blockId: string }
    ) => {
      try {
        await createInstanceMutation({
          variables: {
            workspaceId,
            componentId,
            input: data,
          },
        });
      } catch {
        throw new Error("Failed to create component instance");
      }
    },
    [createInstanceMutation]
  );

  const removeInstance = useCallback(
    async (workspaceId: string, componentId: string, blockId: string) => {
      try {
        await deleteInstanceMutation({
          variables: { workspaceId, componentId, blockId },
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
