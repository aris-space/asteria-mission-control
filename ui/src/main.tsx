import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Layout } from "./layout";
import { EventProvider } from "./hooks/EventContext";
import { theme } from "./theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "react-router";
import { Routes } from "react-router";
import { notifications, Notifications } from "@mantine/notifications";
import StateMachine from "./pages/statemachine/StateMachine";
import PSS from "./pages/pss/PSS";
import Telemetry from "./pages/telemetry/Telemetry";
import Map from "./pages/map/Map";
import Views from "./pages/views/Views";
import { AxiosError } from "axios";

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="light" theme={theme}>
        <EventProvider>
          <Notifications />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Views />} />
                <Route path="statemachine" element={<StateMachine />} />
                <Route path="pss" element={<PSS />} />
                <Route path="telemetry" element={<Telemetry />} />
                <Route path="map" element={<Map />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </EventProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
