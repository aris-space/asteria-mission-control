import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Layout } from "./layout";
import { EventProvider } from "./hooks/EventContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <EventProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </EventProvider>
    </MantineProvider>
  </StrictMode>,
);
