"use client";

import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

export const CommandMenu = () => {
  return (
    <DialogContent className="max-w-md px-2 py-1 overflow-hidden text-foreground dark">
      <DialogTitle className="sr-only">Command Menu</DialogTitle>

      {/* TODO:map through commands */}
      <Command>
        <CommandList>
          <CommandGroup heading="Available Commands">
            <CommandItem className="justify-between">
              Run Query{" "}
              <span className="text-sm text-muted-foreground">⌘ + ↵</span>
            </CommandItem>
            <CommandItem className="justify-between">
              Save Query{" "}
              <span className="text-sm text-muted-foreground">⌘ + S</span>
            </CommandItem>
            <CommandItem className="justify-between">
              Fork Query{" "}
              <span className="text-sm text-muted-foreground">⌘ + ⇧ + F</span>
            </CommandItem>
            <CommandItem className="justify-between">
              Share Query{" "}
              <span className="text-sm text-muted-foreground">⌘ + ⇧ + S</span>
            </CommandItem>
            <CommandItem className="justify-between">
              New Query{" "}
              <span className="text-sm text-muted-foreground">⌘ + T</span>
            </CommandItem>
            <CommandItem className="justify-between">
              Open Docs{" "}
              <span className="text-sm text-muted-foreground">⌘ + H</span>
            </CommandItem>
            <CommandItem className="justify-between">
              Close All Tabs{" "}
              <span className="text-sm text-muted-foreground">⌘ + ⇧ + X</span>
            </CommandItem>
            <CommandItem className="justify-between">
              Close Current Tab{" "}
              <span className="text-sm text-muted-foreground">⌘ + W</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </DialogContent>
  );
};
