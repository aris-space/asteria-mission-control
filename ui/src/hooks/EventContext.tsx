import { Message as MavlinkMessage } from "@asteria/mission-control-client";
import { useId } from "@mantine/hooks";
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

interface EventContextDefinition {
  latency: number;
  addNotifier: (
    name: string,
    board: string,
    messageType: string,
    cb: (message: MavlinkMessage) => void,
  ) => void;
  removeNotifier: (name: string) => void;
  getMessage(board: string, messageType: string): MavlinkMessage | undefined;
  getLastMessageTimestamp: () => number;
}

const defaultValue: EventContextDefinition = {
  latency: Infinity,
  addNotifier: () => {},
  removeNotifier: () => {},
  getMessage: () => undefined,
  getLastMessageTimestamp: () => NaN,
};

const EventContext = createContext<EventContextDefinition>(defaultValue);

export function EventProvider(props: PropsWithChildren) {
  const [source, setSource] = useState<EventSource | null>(null);
  const [latency, setLatency] = useState<number>(Infinity);
  // For every mavlink message type we just store the latest received message.
  // The messages are stored in a ref to prevent triggering a re-render for every received message.
  // To minimize the number of re-renders, we store callback functions for all `useMavlinkMessage`
  // hooks which are currently active and only trigger state updates inside those hooks.
  const mavlinkMessages = useRef<Record<string, MavlinkMessage>>({});
  const notifiers = useRef<
    Record<string, [string, (message: MavlinkMessage) => void]>
  >({});
  const lastMessageTimestamp = useRef<number>(NaN);

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

    eventSource.addEventListener("ping", (data) => {
      const timestamp = new Date(parseInt(data.data));
      const now = new Date();
      setLatency(now.getTime() - timestamp.getTime());

      console.debug(
        `Received ping with ${now.getTime() - timestamp.getTime()}ms latency`,
      );
    });

    eventSource.addEventListener("mavlink-message", (data) => {
      lastMessageTimestamp.current = Date.now();
      const mavlinkMessage = JSON.parse(data.data) as MavlinkMessage;
      const messageId = `${mavlinkMessage.board}-${mavlinkMessage.message.type}`;
      mavlinkMessages.current = {
        [messageId]: mavlinkMessage,
        ...mavlinkMessages.current,
      };
      Object.values(notifiers.current).forEach(([cbMessageId, cb]) => {
        if (cbMessageId == messageId) cb(mavlinkMessage);
      });
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

  /**
   * Add a callback function which get's called once a matching MavLink message is received. The
   * `name` is used as an identifier of this callback method such that it can be removed later on.
   * @param name identifier of the callback function
   * @param board board from which the message originates
   * @param messageType the type of message we're interested
   * @param cb the callback function which is called when a matching function is received
   */
  const addNotifier = (
    name: string,
    board: string,
    messageType: string,
    cb: (message: MavlinkMessage) => void,
  ) => {
    notifiers.current[name] = [`${board}-${messageType}`, cb];
  };

  /**
   * Remove a message callback function.
   * @param name identifier of the callback function
   */
  const removeNotifier = (name: string) => {
    const copy = notifiers.current;
    delete copy[name];
    notifiers.current = copy;
  };

  const getMessage = (board: string, messageType: string) => {
    const messageId = `${board}-${messageType}`;
    return mavlinkMessages.current[messageId];
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
    <EventContext.Provider
      value={{
        latency,
        addNotifier,
        removeNotifier,
        getMessage,
        getLastMessageTimestamp: () => lastMessageTimestamp.current,
      }}
    >
      {props.children}
    </EventContext.Provider>
  );
}

/**
 * Get the lantecy to the backend server.
 * @returns latency in milliseconds or Infinity should the client not yet have received a ping
 */
export function useBackendLatency(): number {
  const context = useContext(EventContext);
  if (!context)
    throw new Error(
      "useBackendLatency must only be used within a EventProvider",
    );
  return context.latency;
}

interface TelemetryHealthHook {
  getLastMessageTimestamp: () => number;
}

/**
 * Hook to get health information about the MavLink telemetry.
 */
export function useTelemetryHealth(): TelemetryHealthHook {
  const context = useContext(EventContext);
  if (!context)
    throw new Error(
      "useTelemetryHealth must only be used within a EventProvider",
    );

  return {
    getLastMessageTimestamp: context.getLastMessageTimestamp,
  };
}

/**
 * Get the latest mavlink message of a certain type.
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
  const id = useId();
  const context = useContext(EventContext);
  if (!context)
    throw new Error(
      "useMavlinkMessage must only be used within a EventProvider",
    );

  // Store current message in ref for comparison in callback function. This is needed
  // because of weird react behavior when just usting the state value.
  const currentMessage = useRef<MavlinkMessage>(undefined);
  const [message, setMessage] = useState<MavlinkMessage>();

  useEffect(() => {
    setMessage(context.getMessage(board, type));
    const cb = (newMessage: MavlinkMessage) => {
      if (
        JSON.stringify(currentMessage.current) != JSON.stringify(newMessage)
      ) {
        setMessage(newMessage);
      }
    };
    context.addNotifier(id, board, type, cb);
    return () => {
      context.removeNotifier(id);
    };
  }, [board, type]);

  useEffect(() => {
    currentMessage.current = message;
  }, [message]);

  return (
    (message as MavlinkMessage & {
      board: B;
      message: { type: T };
    }) ?? null
  );
}
