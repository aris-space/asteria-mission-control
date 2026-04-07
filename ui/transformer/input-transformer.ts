import type { OpenApiDocument, OpenApiSchemaObject } from "orval";
import fs from "fs";
import path from "path";

export default (document: OpenApiDocument) => {
  const messageSchema = document.components?.schemas?.Message;

  if (!messageSchema || !document.components?.schemas) {
    createIndexFile(false);
    return document;
  }

  const boardMessageTypeMapping: Record<string, Array<object>> = {};

  (messageSchema.oneOf || []).forEach((variant: OpenApiSchemaObject) => {
    const variantName = variant.properties.board.enum[0] as string;
    const variantTypeName = variant.properties.message.$ref.split("/").pop();
    const variantType = document.components!.schemas![variantTypeName];
    const types = ((variantType.oneOf as Array<OpenApiSchemaObject>) || []).map(
      (variant: OpenApiSchemaObject) => ({
        type: variant.properties.type.enum[0] as string,
        hasContent: variant.required.includes("content"),
      }),
    );
    boardMessageTypeMapping[variantName] = types;
  });

  // Create a custom file containing a static "board name" -> "available message types" map
  // and add it to the index file of the api client.
  const mapJson = JSON.stringify(boardMessageTypeMapping, null, 2);
  const content = `export const BOARD_MESSAGE_MAP = ${mapJson}`;

  fs.writeFile(
    path.join(__dirname, "../packages/api-client/src/board-message-map.ts"),
    content,
    () => {},
  );

  createIndexFile(true);

  return document;
};

function createIndexFile(withMessageMap: boolean) {
  let content = `
    export * from "./mission-control.ts";
    export * from "./mission-control.schemas.ts";
    `;
  if (withMessageMap) content += `export * from "./board-message-map.ts"`;

  fs.writeFile(
    path.join(__dirname, "../packages/api-client/src/index.ts"),
    content,
    () => {},
  );
}
