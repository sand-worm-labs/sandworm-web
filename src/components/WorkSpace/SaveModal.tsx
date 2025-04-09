"use client";

import { useState } from "react";
import { useCreateQuery } from "@/hooks/useCreateQuery";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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

interface SaveModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  content: string;
}

export default function SaveModal({
  open,
  setOpen,
  title,
  content,
}: SaveModalProps) {
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const { create, loading, error } = useCreateQuery();
  const { data: session } = useSession();

  const handleSave = async () => {
    if (!session?.userId) {
      toast.error("You need to login first to save a query 👀");
      console.log("User not logged in");
      return;
    }

    const res = await create({
      title,
      description,
      query: content,
      privateQuery: isPrivate,
      tags: tags.split(",").map(tag => tag.trim()),
    });

    if (res) {
      toast.success("Query saved successfully! 🔥");
      console.log("Query saved successfully:", res);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <Input id="title" value={title} readOnly />
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
              onCheckedChange={setIsPrivate}
            />
            <Label htmlFor="private">Make Private</Label>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-white text-black font-medium py-5 text-base"
          >
            {loading ? "Saving..." : "Save Query"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
