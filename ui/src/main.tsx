import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import '@mantine/core/styles.css';
import { MantineProvider } from "@mantine/core";
import { Layout } from "./layout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <BrowserRouter>
          <Layout />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
);
