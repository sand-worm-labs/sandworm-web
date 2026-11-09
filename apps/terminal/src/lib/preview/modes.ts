import { isEnumValue } from "@/lib/enum";

export enum AccessPreviewMode {
  ALLOWED = "allowed",
  NO_CLIENT = "noClient",
}

export const isAccessPreviewMode = isEnumValue(AccessPreviewMode);

export enum ContentPreviewMode {
  ITEMS = "items",
  EMPTY = "empty",
}

export const isContentPreviewMode = isEnumValue(ContentPreviewMode);

export enum AllowancePreviewMode {
  AVAILABLE = "available",
  USED = "used",
}

export const isAllowancePreviewMode = isEnumValue(AllowancePreviewMode);
