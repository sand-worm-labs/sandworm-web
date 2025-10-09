// Here you probably want to add abstractions of libraries or utilities

// for example if you were using Sanity as your CMS you might want to add:
// sanity.ts -> methods to interact with Sanity CMS
import { fetcher } from "./fetcher";
import { timeAgo, getDateCompare } from "./date";

export { fetcher, getDateCompare, timeAgo };
