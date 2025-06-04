"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Terminal } from "lucide-react";

export function CommandMenu() {
  return (
    <div className="dark">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="gap-2 text-muted-foreground">
            <Terminal size={16} />
            Command Menu
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md p-0 overflow-hidden text-foreground dark">
          <DialogTitle>Command Menu</DialogTitle>

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
                  <span className="text-sm text-muted-foreground">
                    ⌘ + ⇧ + F
                  </span>
                </CommandItem>
                <CommandItem className="justify-between">
                  Share Query{" "}
                  <span className="text-sm text-muted-foreground">
                    ⌘ + ⇧ + S
                  </span>
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
                  <span className="text-sm text-muted-foreground">
                    ⌘ + ⇧ + X
                  </span>
                </CommandItem>
                <CommandItem className="justify-between">
                  Close Current Tab{" "}
                  <span className="text-sm text-muted-foreground">⌘ + W</span>
                </CommandItem>
                <CommandItem className="justify-between">
                  Toggle Dark Mode{" "}
                  <span className="text-sm text-muted-foreground">⌘ + B</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}
