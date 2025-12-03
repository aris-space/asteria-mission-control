import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

// API url constant which is filled using the `VITE_API_URL` environment variable
// at build time
const API_URL = import.meta.env.VITE_API_URL;

// Duration in millseconds after which the event source should try to reconnect to the server upon
// receiving an error
const EVENTS_RECONNECT_TIMEOUT = 2000;

interface EventContextDefinition {
  latency: number;
}

const defaultValue: EventContextDefinition = {
  latency: Infinity,
};

const EventContext = createContext<EventContextDefinition>(defaultValue);

export function EventProvider(props: PropsWithChildren) {
  const [source, setSource] = useState<EventSource | null>(null);
  const [latency, setLatency] = useState<number>(Infinity);

  const setupEventSource = () => {
    const eventSource = new EventSource(`${API_URL}/api/events`);
    setSource((src) => {
      // close existing event source
      src?.close();
      return eventSource;
    });

    eventSource.addEventListener("open", () => {
      console.log("Successfully connected to events!");
    });

    eventSource.addEventListener("ping", (data) => {
      const timestamp = new Date(parseInt(data.data));
      const now = new Date();
      setLatency(now.getTime() - timestamp.getTime());

      console.debug(`Received ping with ${now.getTime() - timestamp.getTime()}ms latency`)
    })

    eventSource.addEventListener("error", (data) => {
      console.error(
        "Event source unexpectedly closed. View debug logs to see the full error.",
      );
      console.debug(data);
      setLatency(Infinity);
      setSource((src) => {
        src?.close();
        return null;
      });
      reconnectEventSource();
    });
  };

  const reconnectEventSource = () => {
    setTimeout(() => {
      console.log("Attempting to reconnect to events");
      setupEventSource();
    }, EVENTS_RECONNECT_TIMEOUT);
  };

  useEffect(() => {
    setupEventSource();
  }, []);

  useEffect(() => {
    return () => {
      source?.close();
    };
  }, [source]);

  return (
    <EventContext.Provider value={{ latency }}>
      {props.children}
    </EventContext.Provider>
  );
}

/**
 * Get the lantecy to the backend server
 * @returns latency in milliseconds or Infinity should the client not yet have received a ping
 */
export function useLatency(): number {
  const context = useContext(EventContext);
  if (!context) throw new Error("useLatency must only be used within a EventProvider");
  return context.latency;
}
