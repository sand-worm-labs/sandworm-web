import { useMemo, useEffect } from "react";
import { Plus, XSquareIcon } from "lucide-react";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRouter, usePathname, useParams } from "next/navigation";

import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useSandwormStore } from "@/store";
import type { Query } from "@/types";

import { HomeTab } from "./HomeTab";
import { SortableTab } from "./SortableTab";
import { QueryTab } from "./QueryTab";

export const WorkspaceTabs = ({
  initialQuery,
  currentUserId,
}: {
  initialQuery: Query;
  currentUserId: string;
}) => {
  const {
    tabs,
    activeTabId,
    createTab,
    setActiveTab,
    moveTab,
    closeAllTabs,
    initialize,
    isInitialized,
  } = useSandwormStore();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const urlTabId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    if (!initialQuery && urlTabId) {
      const tab = tabs.find(t => t.id === urlTabId);
      if (tab) {
        setActiveTab(tab.id);
      }
      return;
    }

    if (!initialQuery) return;

    const tabExists = tabs.some(tab => tab.id === initialQuery.id);
    const isReadonly = initialQuery.creator !== currentUserId;

    if (!tabExists) {
      createTab(initialQuery.title, initialQuery.id, "sql", initialQuery.query);

      useSandwormStore.setState(state => ({
        tabs: state.tabs.map(tab =>
          tab.id === initialQuery.id ? { ...tab, readonly: isReadonly } : tab
        ),
        activeTabId: initialQuery.id,
      }));
    } else {
      setActiveTab(initialQuery.id);
    }
  }, [
    initialQuery?.id,
    currentUserId,
    createTab,
    setActiveTab,
    tabs,
    urlTabId,
  ]);

  useEffect(() => {
    if (!isInitialized) {
      initialize().catch(console.error);
    }
  }, [isInitialized, initialize]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && active.id !== "home" && over?.id !== "home") {
      const oldIndex = tabs.findIndex(tab => tab.id === active.id);
      const newIndex = tabs.findIndex(tab => tab.id === over?.id);
      moveTab(oldIndex, newIndex);
    }
  };

  const sortedTabs = useMemo(() => {
    const homeTab = tabs.find(tab => tab.id === "home");
    const otherTabs = tabs.filter(tab => tab.id !== "home");
    return homeTab ? [homeTab, ...otherTabs] : otherTabs;
  }, [tabs]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    const basePath = "/workspace";
    const currentTabId = pathname.split("/")[2];
    if (tabId !== currentTabId) {
      router.push(`${basePath}/${tabId}`);
    }
  };

  const addNewCodeTab = () => {
    createTab("New Query", undefined, "sql", "");
  };

  return (
    <div className="flex flex-col h-full dark">
      <Tabs
        value={activeTabId || undefined}
        onValueChange={handleTabChange}
        className="flex flex-col h-full"
      >
        <div className="flex-shrink-0 flex items-center border-b-0 bg-muted">
          <Button
            variant="ghost"
            className="rounded-none hover:bg-gray-100 dark:hover:bg-gray-800 h-8 px-2 sticky left-0 z-10"
            onClick={addNewCodeTab}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <ScrollArea className="flex-grow">
            <ContextMenu>
              <ContextMenuTrigger>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedTabs.map(tab => tab.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex">
                      <TabsList className="inline-flex h-8  items-center justify-start rounded-none w-full bg-transparent ">
                        {sortedTabs.map(tab => (
                          <SortableTab
                            key={tab.id}
                            tab={tab}
                            isActive={activeTabId === tab.id}
                          />
                        ))}
                      </TabsList>
                    </div>
                  </SortableContext>
                </DndContext>
              </ContextMenuTrigger>
              <ContextMenuContent className=" dark rounded-none border">
                <ContextMenuItem
                  onClick={addNewCodeTab}
                  className="cursor-pointer"
                >
                  New Query Tab <Plus className="ml-4 h-4 w-4" />
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={closeAllTabs}
                  className="text-red-600 cursor-pointer"
                >
                  Close All Tabs{" "}
                  <XSquareIcon className="ml-4 h-4 w-4 text-red-600" />
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="flex-1 overflow-hidden">
          {sortedTabs.map(tab => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="h-full m-0 outline-none data-[state=active]:flex-1"
            >
              {(() => {
                if (tab.type === "home") {
                  return <HomeTab />;
                }
                if (tab.type === "sql") {
                  return <QueryTab tabId={tab.id} />;
                }
                return null;
              })()}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};
