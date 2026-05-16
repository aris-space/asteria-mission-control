import {
  EventKind,
  RemoteComputerInfo,
  useActiveRemote,
  useRemotes,
  useStateMachine,
  OptionalResultStateMachine,
  StateMachine,
} from "@asteria/mission-control-client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useEvent } from "@asteria/hooks/EventContext";
import { notifications } from "@mantine/notifications";
import { useListState } from "@mantine/hooks";

interface RemoteComputerContextDefinition {
  availableRemoteComputers: Array<RemoteComputerInfo>;
  remoteComputer: RemoteComputerInfo | null;
  isRemoteComputerLoading: boolean;
  stateMachine: StateMachine | null;
  isStateMachineLoading: boolean;
  errors: Array<string>;
  dismissError: (idx: number) => void;
  dismissAllErrors: () => void;
}

const defaultValue: RemoteComputerContextDefinition = {
  availableRemoteComputers: [],
  remoteComputer: null,
  isRemoteComputerLoading: false,
  stateMachine: null,
  isStateMachineLoading: false,
  errors: [],
  dismissError: () => {},
  dismissAllErrors: () => {},
};

const RemoteComputerContext =
  createContext<RemoteComputerContextDefinition>(defaultValue);

export function RemoteComputerProvider(props: PropsWithChildren) {
  const remotes = useRemotes();
  const remotesRef = useRef<Array<RemoteComputerInfo>>([]);
  const {
    data: activeData,
    isLoading: isRemoteComputerLoading,
    refetch: refetchActive,
  } = useActiveRemote({ query: { retry: false } });
  const { data: stateMachineData, isLoading: isStateMachineLoading } =
    useStateMachine({ query: { retry: false } });

  const [errors, errorHandler] = useListState<string>([]);

  const [currentActive, setCurrentActive] = useState<RemoteComputerInfo | null>(
    null,
  );
  const [stateMachine, setStateMachine] = useState<StateMachine | null>(null);

  useEffect(() => {
    remotesRef.current = remotes.data || [];
  }, [remotes.data]);

  useEffect(() => {
    if (currentActive && activeData && activeData != currentActive) {
      // Clear the errors from the old remote computer.
      errorHandler.setState([]);
    }
    setCurrentActive(activeData || null);
  }, [activeData]);

  useEffect(() => {
    updateStateMachine(stateMachineData || null);
  }, [stateMachineData]);

  useEvent<string>(EventKind.REMOTE, (event) => {
    const newActive = event.data;

    if (!newActive || newActive == "null") {
      notifications.show({ message: `Active remote got deactivated` });
    } else {
      notifications.show({
        message: `Active remote changed to '${newActive}'`,
      });
    }

    const remote = remotesRef.current.find((rc) => rc.name == newActive);
    setCurrentActive(remote || null);
    // Clear the errors from the old remote computer.
    errorHandler.setState([]);
    refetchActive();
  });

  useEvent<string>(EventKind.STATE_MACHINE, (event) => {
    const stateMachineJson = JSON.parse(event.data);
    updateStateMachine(stateMachineJson as OptionalResultStateMachine | null);
  });

  const updateStateMachine = (result: OptionalResultStateMachine | null) => {
    if (!result || result.kind == "none") return setStateMachine(null);

    if (result.kind == "some") setStateMachine(result.value);
    else if (result.kind == "error") errorHandler.append(result.value);
  };

  /**
   * Dismiss the error at a given index.
   * @param idx index of the error
   */
  const dismissError = (idx: number) => {
    errorHandler.remove(idx);
  };

  return (
    <RemoteComputerContext.Provider
      value={{
        availableRemoteComputers: remotes.data || [],
        remoteComputer: currentActive,
        isRemoteComputerLoading,
        stateMachine,
        isStateMachineLoading,
        errors,
        dismissError,
        dismissAllErrors: () => errorHandler.setState([]),
      }}
    >
      {props.children}
    </RemoteComputerContext.Provider>
  );
}

/**
 * Get information about the currently active remote computer, if one is
 * currently active.
 * @returns information about the currently active remote computer
 */
export function useRemoteComputer(): Omit<
  RemoteComputerContextDefinition,
  "errors" | "dismissError" | "dismissAllErrors"
> {
  const context = useContext(RemoteComputerContext);
  if (!context) {
    throw new Error(
      "useRemoteComputer must only be used within RemoteComputerProvider",
    );
  }

  return context;
}

/**
 * Handle the errors of the active remote computer.
 * @returns errors of the current remote computer
 */
export function useRemoteComputerErrors(): Pick<
  RemoteComputerContextDefinition,
  "errors" | "dismissError" | "dismissAllErrors"
> {
  const context = useContext(RemoteComputerContext);
  if (!context) {
    throw new Error(
      "useRemoteComputerErrors must only be used within RemoteComputerProvider",
    );
  }

  return {
    errors: context.errors,
    dismissError: context.dismissError,
    dismissAllErrors: context.dismissAllErrors,
  };
}
