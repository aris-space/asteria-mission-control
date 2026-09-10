import React, { StrictMode } from "react";
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

import { PssDataProvider } from "./hooks/PssDataContext";
import { Navigate } from "react-router";
import Views from "./pages/views/Views";
import { pages } from "./pages";

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
                        <Route index element={<Views />} />
                        {pages.map((page) => (
                          <Route
                            key={page.path}
                            path={page.path}
                            element={
                              <PageWithTitle
                                title={page.title}
                                page={page.page}
                              />
                            }
                          />
                        ))}
                        <Route path="*" element={<Navigate to="/" replace />} />
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

interface PageWithTitleProps {
  title: string;
  page: React.ReactNode;
}

function PageWithTitle({ title, page }: PageWithTitleProps) {
  return (
    <>
      <title>{title}</title>
      {page}
    </>
  );
}
