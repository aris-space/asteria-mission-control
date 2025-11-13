import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Layout } from "./layout";
import { EventProvider } from "./hooks/EventContext";
import { theme } from "./theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "react-router";
import { Routes } from "react-router";

import StateMachine from "./pages/statemachine/StateMachine";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <EventProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="statemachine" element={<StateMachine />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </EventProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
