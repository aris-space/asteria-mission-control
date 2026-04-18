import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { Message as MavlinkMessage } from "@asteria/mission-control-client";
import { useId } from "@mantine/hooks";
import { useEvent } from "@asteria/hooks/EventContext";
import { useRemoteComputer } from "@asteria/hooks/RemoteComputerContext";

interface MavlinkContextDefinition {
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

const defaultValue: MavlinkContextDefinition = {
  addNotifier: () => {},
  removeNotifier: () => {},
  getMessage: () => undefined,
  getLastMessageTimestamp: () => NaN,
};

const MavlinkContext = createContext<MavlinkContextDefinition>(defaultValue);

export function MavlinkProvider(props: PropsWithChildren) {
  // For every mavlink message type we just store the latest received message.
  // The messages are stored in a ref to prevent triggering a re-render for every received message.
  // To minimize the number of re-renders, we store callback functions for all `useMavlinkMessage`
  // hooks which are currently active and only trigger state updates inside those hooks.
  const mavlinkMessages = useRef<Record<string, MavlinkMessage>>({});
  const notifiers = useRef<
    Record<string, [string, (message: MavlinkMessage) => void]>
  >({});
  const lastMessageTimestamp = useRef<number>(NaN);

  useEvent<string>("mavlink-message", (event) => {
    lastMessageTimestamp.current = Date.now();
    const mavlinkMessage = JSON.parse(event.data) as MavlinkMessage;
    const messageId = `${mavlinkMessage.board}-${mavlinkMessage.message.type}`;
    mavlinkMessages.current = {
      [messageId]: mavlinkMessage,
      ...mavlinkMessages.current,
    };
    Object.values(notifiers.current).forEach(([cbMessageId, cb]) => {
      if (cbMessageId == messageId) cb(mavlinkMessage);
    });
  });

  const { remoteComputer } = useRemoteComputer();

  useEffect(() => {
    // The remote computer changed so all previous MavLink messages get invalidated.
    mavlinkMessages.current = {};
    // Call all notifiers such that all `useMavlinkMessage` instances update to `null`.
    Object.values(notifiers.current).forEach(([_, cb]) => cb(null as any));
  }, [remoteComputer?.name]);

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

  /**
   * Get the last received message for a board and a message type.
   * @param board board which received the message
   * @param messageType the type of message to return
   * @returns the last message of this type for this board if one was received. Otherwise `undefined` is returned.
   */
  const getMessage = (
    board: string,
    messageType: string,
  ): MavlinkMessage | undefined => {
    const messageId = `${board}-${messageType}`;
    return mavlinkMessages.current[messageId];
  };

  return (
    <MavlinkContext.Provider
      value={{
        addNotifier,
        removeNotifier,
        getMessage,
        getLastMessageTimestamp: () => lastMessageTimestamp.current,
      }}
    >
      {props.children}
    </MavlinkContext.Provider>
  );
}

interface MavlinkTelemetryHealthHook {
  getLastMessageTimestamp: () => number;
}

/**
 * Hook to get health information about the MavLink telemetry.
 */
export function useMavlinkTelemetryHealth(): MavlinkTelemetryHealthHook {
  const context = useContext(MavlinkContext);
  if (!context)
    throw new Error(
      "useMavlinkTelemetryHealth must only be used within a MavlinkProvider",
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
  const context = useContext(MavlinkContext);
  if (!context)
    throw new Error(
      "useMavlinkMessage must only be used within a MavlinkProvider",
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
