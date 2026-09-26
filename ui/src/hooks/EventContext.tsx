import { useId } from "@mantine/hooks";
import { EventKind } from "@asteria/mission-control-client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

interface EventActionsContextDefinition {
  addListener: (id: string, eventType: string, cb: EventCallback) => void;
  removeListener: (id: string) => void;
}

// The listener API is stable for the lifetime of the provider. It is kept in its own context
// such that components which only subscribe to events via `useEvent` don't re-render when the
// latency is updated on every ping.
const defaultActionsValue: EventActionsContextDefinition = {
  addListener: () => {},
  removeListener: () => {},
};

const EventActionsContext =
  createContext<EventActionsContextDefinition>(defaultActionsValue);

// The latency changes on every ping, so it is kept in a separate context such that only
// components using `useBackendLatency` re-render when it updates.
const EventLatencyContext = createContext<number>(Infinity);

export function EventProvider(props: PropsWithChildren) {
  const [source, setSource] = useState<EventSource | null>(null);
  // Kept in sync with the `source` state such that the (stable) listener functions below always
  // operate on the currently active event source, also right after a reconnect.
  const sourceRef = useRef<EventSource | null>(null);
  // Every `useEvent` instance has an unique id from `useId` which is used as key in this record.
  // The value for each key is the event type the `useEvent` instance is interested in and the
  // callback function which should called when such an event is received.
  const listeners = useRef<Record<string, [string, EventCallback]>>({});

  const [latency, setLatency] = useState<number>(Infinity);

  useEffect(() => {
    setupEventSource();
  }, []);

  useEffect(() => {
    sourceRef.current = source;
    if (source) {
      // We got a new source, so we should re-add all registered listeners.
      for (const id in listeners.current) {
        const [eventType, cb] = listeners.current[id];
        source.addEventListener(eventType, cb);
      }
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
      const pingLatency = Date.now() - Number(data.data);
      setLatency(pingLatency);

      console.debug(`Received ping with ${pingLatency}ms latency`);
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
  const addListener = useCallback(
    (id: string, eventType: string, cb: EventCallback) => {
      sourceRef.current?.addEventListener(eventType, cb);
      listeners.current[id] = [eventType, cb];
    },
    [],
  );

  /**
   * Remove a listener from the event source.
   * @param id unique id of the listener
   */
  const removeListener = useCallback((id: string) => {
    const listener = listeners.current[id];
    if (listener) {
      sourceRef.current?.removeEventListener(listener[0], listener[1]);
      delete listeners.current[id];
    }
  }, []);

  const actions: EventActionsContextDefinition = useMemo(
    () => ({
      addListener,
      removeListener,
    }),
    [addListener, removeListener],
  );

  return (
    <EventActionsContext.Provider value={actions}>
      <EventLatencyContext.Provider value={latency}>
        {props.children}
      </EventLatencyContext.Provider>
    </EventActionsContext.Provider>
  );
}

/**
 * Hook to get the latency to the backend in milliseconds.
 * The latency is updated every ~10s through the `ping` message.
 * @returns latency to the backend in milliseconds
 */
export function useBackendLatency(): number {
  return useContext(EventLatencyContext);
}

/**
 * Hook to subscribe to SSE events.
 * @param eventType type of SSE event to subscribe to
 * @param cb callback function which gets executed for every received event
 */
export function useEvent<T = any>(eventType: string, cb: EventCallback<T>) {
  const id = useId();
  const context = useContext(EventActionsContext);

  if (!context) {
    throw new Error("useEvent must only be used within an EventProvider");
  }

  // The latest callback is kept in a ref such that the stable listener registered with the
  // event source always invokes the current callback without re-subscribing on every render.
  const cbRef = useRef(cb);
  cbRef.current = cb;

  useEffect(() => {
    if (!eventType) return;

    const stableCb = (message: MessageEvent<T>) => cbRef.current(message);
    context.addListener(id, eventType, stableCb);

    return () => {
      context.removeListener(id);
    };
  }, [context, eventType, id]);
}
