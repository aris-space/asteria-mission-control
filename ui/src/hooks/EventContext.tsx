import { Message as MavlinkMessage } from "@asteria/mission-control-client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

// API url constant which is filled using the `VITE_API_URL` environment variable
// at build time
const API_URL = import.meta.env.VITE_API_URL;

// Duration in millseconds after which the event source should try to reconnect to the server upon
// receiving an error
const EVENTS_RECONNECT_TIMEOUT = 2000;

interface EventContextDefinition {
  latency: number;
  messages: Record<string, MavlinkMessage>;
}

const defaultValue: EventContextDefinition = {
  latency: Infinity,
  messages: {},
};

const EventContext = createContext<EventContextDefinition>(defaultValue);

export function EventProvider(props: PropsWithChildren) {
  const [source, setSource] = useState<EventSource | null>(null);
  const [latency, setLatency] = useState<number>(Infinity);
  // for every mavlink message type we just store the latest received message
  const [mavlinkMessages, setMavlinkMessages] = useState<
    Record<string, MavlinkMessage>
  >({});

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

      console.debug(
        `Received ping with ${now.getTime() - timestamp.getTime()}ms latency`,
      );
    });

    eventSource.addEventListener("mavlink-message", (data) => {
      console.log("Received mavlink message");

      const mavlinkMessage = JSON.parse(data.data) as MavlinkMessage;
      setMavlinkMessages((messages) => ({
        [`${mavlinkMessage.board}-${mavlinkMessage.message.type}`]:
          mavlinkMessage,
        ...messages,
      }));
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
    <EventContext.Provider value={{ latency, messages: mavlinkMessages }}>
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
  if (!context)
    throw new Error("useLatency must only be used within a EventProvider");
  return context.latency;
}

/**
 * Get the latest mavlink message of a certain type
 * @param type message type to get
 * @returns latest mavlink message of this type or null if no message of this type was received until now
 */
export function useMavlinkMessage<
  B extends MavlinkMessage["board"],
  T extends Extract<MavlinkMessage, { board: B }>["message"]["type"],
>(
  board: B,
  type: T,
): (MavlinkMessage & { board: B; message: { type: T } }) | null {
  const context = useContext(EventContext);
  if (!context)
    throw new Error(
      "useMavlinkMessage must only be used within a EventProvider",
    );

  return (
    (context.messages[`${board}-${type}`] as MavlinkMessage & {
      board: B;
      message: { type: T };
    }) ?? null
  );
}
