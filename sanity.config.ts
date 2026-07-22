"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "@/sanity/env";
import { SINGLETON_TYPES, schemaTypes } from "@/sanity/schemaTypes";
import { structure } from "@/sanity/structure";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  document: {
    // Page singletons are reached through the desk structure only — hide the
    // "create new" and "duplicate" actions so a second Home can never exist.
    actions: (input, context) =>
      SINGLETON_TYPES.has(context.schemaType)
        ? input.filter(({ action }) =>
            ["publish", "discardChanges", "restore"].includes(action ?? ""),
          )
        : input,
    newDocumentOptions: (prev) =>
      prev.filter((item) => !SINGLETON_TYPES.has(item.templateId)),
  },
});
