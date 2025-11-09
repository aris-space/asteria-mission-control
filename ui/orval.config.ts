import { defineConfig } from "orval";

export default defineConfig({
  "asteria-mission-control": {
    input: {
      target: "http://localhost:8899/docs/openapi.json"
    },
    output: {
      workspace: "packages/api-client/src",
      target: "./mission-control.ts",
      client: "react-query",
      mode: "split",
      override: {
        header: false
      }
    }
  }
})