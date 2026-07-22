import type { SchemaTypeDefinition } from "sanity";

import { collectionTypes } from "./collections";
import { objectTypes } from "./objects";
import { pageTypes } from "./pages";

export const schemaTypes: SchemaTypeDefinition[] = [
  ...objectTypes,
  ...pageTypes,
  ...collectionTypes,
];

export { SINGLETON_TYPES } from "./pages";
