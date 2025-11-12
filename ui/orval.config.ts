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
        mutator: {
          path: "./api/mutator/custom-axios-instance.ts",
          name: "customAxiosInstance"
        },
        header: false
      },
    }
  }
})