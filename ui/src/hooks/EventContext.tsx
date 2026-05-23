import { useId } from "@mantine/hooks";
import { EventKind } from "@asteria/mission-control-client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

// API url constant which is filled using the `VITE_API_URL` environment variable
// at build time
const API_URL = import.meta.env.VITE_API_URL;

// Duration in millseconds after which the event source should try to reconnect to the server upon
// receiving an error
const EVENTS_RECONNECT_TIMEOUT = 2000;

type EventCallback<T = any> = (message: MessageEvent<T>) => void;

interface EventContextDefinition {
  latency: number;
  addListener: (id: string, eventType: string, cb: EventCallback) => void;
  removeListener: (id: string) => void;
}

const defaultValue: EventContextDefinition = {
  latency: Infinity,
  addListener: () => {},
  removeListener: () => {},
};

const EventContext = createContext<EventContextDefinition>(defaultValue);

export function EventProvider(props: PropsWithChildren) {
  const [source, setSource] = useState<EventSource | null>(null);
  // Every `useEvent` instance has an unique id from `useId` which is used as key in this record.
  // The value for each key is the event type the `useEvent` instance is interested in and the
  // callback function which should called when such an event is received.
  const listeners = useRef<Record<string, [string, EventCallback]>>({});

  const [latency, setLatency] = useState<number>(Infinity);

  useEffect(() => {
    setupEventSource();
  }, []);

  useEffect(() => {
    if (source) {
      // We got a new source, so we should re-add all registered listeners.
      Object.values(listeners.current).forEach(([eventType, cb]) =>
        source.addEventListener(eventType, cb),
      );
    }

    return () => {
      source?.close();
    };
  }, [source]);

  /**
   * Create a new event source and store it in local state.
   */
  const setupEventSource = () => {
    const eventSource = new EventSource(`${API_URL}/api/events`);
    setSource((src) => {
      // Close existing event source.
      src?.close();
      return eventSource;
    });

    eventSource.addEventListener("open", () => {
      console.log("Successfully connected to events!");
    });

    eventSource.addEventListener(EventKind.PING, (data) => {
      const timestamp = new Date(parseInt(data.data));
      const now = new Date();
      setLatency(now.getTime() - timestamp.getTime());

      console.debug(
        `Received ping with ${now.getTime() - timestamp.getTime()}ms latency`,
      );
    });

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

  /**
   * Reconnect the event source once the `EVENTS_RECONNECT_TIMEOUT`
   * timeout expired.
   */
  const reconnectEventSource = () => {
    setTimeout(() => {
      console.log("Attempting to reconnect to events");
      setupEventSource();
    }, EVENTS_RECONNECT_TIMEOUT);
  };

  /**
   * Add a new listener to the event source.
   * @param id unique id of the listener
   * @param eventType the type of event the listener is interested in
   * @param cb the callback function to call when an event occurs
   */
  const addListener = (id: string, eventType: string, cb: EventCallback) => {
    if (source) {
      // We need to add the listener to the existing source.
      source.addEventListener(eventType, cb);
    }
    listeners.current[id] = [eventType, cb];
  };

  /**
   * Remove a listener from the event source.
   * @param id unique id of the listener
   */
  const removeListener = (id: string) => {
    const listener = listeners.current[id];
    if (listener && source) {
      // We need to remove the listener from the existing source.
      source.removeEventListener(listener[0], listener[1]);
    }
    delete listeners.current[id];
  };

  return (
    <EventContext.Provider
      value={{
        latency,
        addListener,
        removeListener,
      }}
    >
      {props.children}
    </EventContext.Provider>
  );
}

/**
 * Hook to get the latency to the backend in milliseconds.
 * The latency is updated every ~10s through the `ping` message.
 * @returns latency to the backend in milliseconds
 */
export function useBackendLatency(): number {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error(
      "useBackendLatency must only be used within an EventProvider",
    );
  }

  return context.latency;
}

/**
 * Hook to subscribe to SSE events.
 * @param eventType type of SSE event to subscribe to
 * @param cb callback function which gets executed for every received event
 */
export function useEvent<T = any>(eventType: string, cb: EventCallback<T>) {
  const id = useId();
  const context = useContext(EventContext);

  if (!context) {
    throw new Error("useEvent must only be used within an EventProvider");
  }

  useEffect(() => {
    if (!eventType) return;

    context.addListener(id, eventType, cb);

    return () => {
      context.removeListener(id);
    };
  }, [eventType]);
}
