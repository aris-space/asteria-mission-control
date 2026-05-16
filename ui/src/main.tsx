import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/code-highlight/styles.css";
import { MantineProvider } from "@mantine/core";
import { Layout } from "./layout";
import { EventProvider } from "./hooks/EventContext";
import { theme } from "./theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "react-router";
import { Routes } from "react-router";
import { notifications, Notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import {
  CodeHighlightAdapterProvider,
  createShikiAdapter,
} from "@mantine/code-highlight";
import { RemoteComputerProvider } from "@asteria/hooks/RemoteComputerContext";
import { MavlinkProvider } from "@asteria/hooks/MavlinkContext";

import StateMachine from "./pages/statemachine/StateMachine";
import PSS from "./pages/pss/PSS";
import Health from "./pages/health/Health";
import Telemetry from "./pages/telemetry/Telemetry";
import { PssDataProvider } from "./hooks/PssDataContext";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (err) => {
        if (err instanceof AxiosError) {
          notifications.show({
            title: err.message,
            message: err.response?.data ?? err.message,
            color: "red",
          });
        } else {
          notifications.show({
            title: err.name,
            message: err.message,
            color: "red",
          });
        }
      },
    },
  },
});

const loadShiki = async () => {
  const { createHighlighter } = await import("shiki");
  const shiki = await createHighlighter({
    langs: ["json"],
    themes: ["catppuccin-latte"],
  });

  return shiki;
};

const shikiAdapter = createShikiAdapter(loadShiki);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="light" theme={theme}>
        <CodeHighlightAdapterProvider adapter={shikiAdapter}>
          <EventProvider>
            <Notifications />
            <RemoteComputerProvider>
              <MavlinkProvider>
                <PssDataProvider>
                  <BrowserRouter>
                    <Layout>
                      <Routes>
                        <Route path="statemachine" element={<StateMachine />} />
                        <Route
                          path="pss/rocket"
                          element={<PSS kind="rocket" />}
                        />
                        <Route path="pss/rfs" element={<PSS kind="rfs" />} />
                        <Route path="health" element={<Health />} />
                        <Route path="telemetry" element={<Telemetry />} />
                      </Routes>
                    </Layout>
                  </BrowserRouter>
                </PssDataProvider>
              </MavlinkProvider>
            </RemoteComputerProvider>
          </EventProvider>
        </CodeHighlightAdapterProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
