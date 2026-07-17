"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@sandworm/ui/components/dialog";
import { Input } from "@sandworm/ui/components/input";
import { Textarea } from "@sandworm/ui/components/textarea";
import { Button } from "@sandworm/ui/components/button";
import { Label } from "@sandworm/ui/components/label";
import { Checkbox } from "@sandworm/ui/components/checkbox";

import { useCreateQuery } from "@/hooks/useCreateQuery";
import { useSaveQuery } from "@/hooks/useSaveQuery";

import { useSession } from "../Editor/hooks/useAuth";

interface SaveModalProps {
  open: boolean;
  setOpenAction: (open: boolean) => void;
  title: string;
  content: string;
  tabId: string;
}

export const isFirebaseId = (id: string) => {
  // Local tab IDs are UUIDs with dashes, Firebase IDs are short & no dashes. This check is janky but it works
  return !id.includes("-");
};

export const SaveModal = ({
  open,
  setOpenAction,
  title,
  content,
  tabId,
}: SaveModalProps) => {
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [formTitle, setFormTitle] = useState(title);

  const { create, loading } = useCreateQuery();
  const { save, loading: saving } = useSaveQuery();
  const { user: session } = useSession({ redirectToLogin: true });

  const handleSave = async () => {
    if (!session?.id) {
      toast.error("You need to login first to save a query");
      return;
    }

    const payload = {
      title: formTitle,
      description,
      query: content,
      privateQuery: isPrivate,
      tags: tags.split(",").map(tag => tag.trim()),
      creator: session?.id,
      id: tabId,
    };

    let res = null;

    // Behold: the unholy check. Future me, I'm sorry. I was sleepy
    if (isFirebaseId(tabId)) {
      res = await save(payload);
    } else {
      res = await create(payload, tabId);
    }

    if (res) {
      toast.success("Query saved successfully!");
      setOpenAction(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpenAction}>
      <DialogContent className="sm:max-w-lg font-body  rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-medium">Save Query</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Title
            </Label>
            <Input
              id="title"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full px-3 py-1  rounded-md dark:bg-ink-100 border dark:border-border-tertiary border-border dark:text-white placeholder:dark:text-ink-300  placeholder-[#455768] focus:outline-none  focus:border-primary transition text-xs md:text-sm bg-base-300"
            />
          </div>
          <div>
            <Label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter description"
              className="w-full px-3 py-1.5  rounded-md dark:bg-ink-100 border dark:border-border-tertiary border-border dark:text-white placeholder:dark:text-ink-300  placeholder-[#455768] focus:outline-none  focus:border-primary transition text-xs md:text-sm bg-base-300 min-h-[6rem] resize-none "
            />
          </div>
          <div>
            <Label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. sql, database, analytics"
              className="w-full px-3 py-1  rounded-md dark:bg-ink-100 border dark:border-border-tertiary border-border dark:text-white placeholder:dark:text-ink-300  placeholder-[#455768] focus:outline-none  focus:border-primary transition text-xs md:text-sm bg-base-300"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="private"
              checked={isPrivate}
              onCheckedChange={checked => setIsPrivate(checked === true)}
              className="w-5 h-5"
            />
            <Label htmlFor="private">Make Private</Label>
          </div>
          <Button
            disabled={loading}
            onClick={handleSave}
            className="px-4 py-3 text-sm font-medium text-white bg-primary hover:bg-primary dark:bg-primary dark:hover:bg-primary rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full text-center justify-center"
          >
            {loading || saving ? "Saving..." : "Save Query"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
