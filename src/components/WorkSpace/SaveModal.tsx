"use client";

import { useState } from "react";

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
}

export default function SaveModal({ open, setOpen, title }: SaveModalProps) {
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSave = () => {
    console.log({
      title,
      description,
      tags: tags.split(",").map(tag => tag.trim()),
      isPrivate,
    });
    setOpen(false);
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
            className="w-full bg-white text-black  font-medium py-5 text-base "
          >
            Save Query
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
