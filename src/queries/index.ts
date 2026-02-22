// src/queries/index.ts
// App-side query registry (NOT core).
// Put every query function in this registry so the team can see what exists.

import * as schools from "./schools";

export const queries = {
  schools,
} as const;

export const queryList = [
  "schools.listWithPlaceCount",
  "schools.getByCity",
] as const;
