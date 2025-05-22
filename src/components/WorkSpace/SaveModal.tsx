"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { useCreateQuery } from "@/hooks/useCreateQuery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSaveQuery } from "@/hooks/useSaveQuery";

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
  const { data: session } = useSession();

  const handleSave = async () => {
    if (!session?.user?.id) {
      toast.error("You need to login first to save a query");
      return;
    }

    const payload = {
      title: formTitle,
      description,
      query: content,
      privateQuery: isPrivate,
      tags: tags.split(",").map(tag => tag.trim()),
      creator: session.user.id,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Save Query</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Title
            </Label>
            <Input
              id="title"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
            />
          </div>
          <div>
            <Label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <div>
            <Label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. sql, database, analytics"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="private"
              checked={isPrivate}
              onCheckedChange={checked => setIsPrivate(checked === true)}
            />
            <Label htmlFor="private">Make Private</Label>
          </div>
          <Button
            disabled={loading}
            onClick={handleSave}
            className="w-full bg-white text-black font-medium py-5 text-base"
          >
            {loading || saving ? "Saving..." : "Save Query"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
