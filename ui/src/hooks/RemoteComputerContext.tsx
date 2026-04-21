import {
  Pss,
  RemoteComputerInfo,
  StateMachine,
  useActiveRemote,
  usePss,
  useRemotes,
  useStateMachine,
} from "@asteria/mission-control-client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useEvent } from "@asteria/hooks/EventContext";
import { notifications } from "@mantine/notifications";

interface RemoteComputerContextDefinition {
  availableRemoteComputers: Array<RemoteComputerInfo>;
  remoteComputer: RemoteComputerInfo | null;
  isRemoteComputerLoading: boolean;
  stateMachine: StateMachine | null;
  isStateMachineLoading: boolean;
  pss: Record<string, Pss> | null;
  isPssLoading: boolean;
}

const defaultValue: RemoteComputerContextDefinition = {
  availableRemoteComputers: [],
  remoteComputer: null,
  isRemoteComputerLoading: false,
  stateMachine: null,
  isStateMachineLoading: false,
  pss: null,
  isPssLoading: false,
};

const RemoteComputerContext =
  createContext<RemoteComputerContextDefinition>(defaultValue);

export function RemoteComputerProvider(props: PropsWithChildren) {
  const remotes = useRemotes();
  const active = useActiveRemote({ query: { retry: false } });
  const stateMachine = useStateMachine({ query: { retry: false } });
  const pss = usePss({ query: { retry: false } });

  const [currentActive, setCurrentActive] = useState<RemoteComputerInfo | null>(
    null,
  );
  const [currentStateMachine, setCurrentStateMachine] =
    useState<StateMachine | null>(null);
  const [currentPss, setCurrentPss] = useState<Record<string, Pss> | null>(
    null,
  );

  useEffect(() => {
    setCurrentActive(active.data || null);
  }, [active.data]);

  useEffect(() => {
    setCurrentStateMachine(stateMachine.data || null);
  }, [stateMachine.data]);

  useEffect(() => {
    setCurrentPss(pss.data || null);
  }, [pss.data]);

  useEvent<string>("remote-change", (event) => {
    const newActive = event.data;

    if (!newActive || newActive == "null") {
      notifications.show({ message: `Active remote got deactivated` });
    } else {
      notifications.show({
        message: `Active remote changed to '${newActive}'`,
      });
    }

    const remote = remotes?.data?.find((rc) => rc.name == newActive);
    setCurrentActive(remote || null);
    active.refetch();
  });

  useEvent<string>("state-machine-change", (event) => {
    const stateMachineJson = JSON.parse(event.data);
    setCurrentStateMachine(stateMachineJson as StateMachine | null);
  });

  useEvent<string>("pss-change", (event) => {
    const pssJson = JSON.parse(event.data);
    setCurrentPss(pssJson as Record<string, Pss> | null);
  });

  return (
    <RemoteComputerContext.Provider
      value={{
        availableRemoteComputers: remotes.data || [],
        remoteComputer: currentActive,
        isRemoteComputerLoading: active.isLoading,
        stateMachine: currentStateMachine,
        isStateMachineLoading: stateMachine.isLoading,
        pss: currentPss,
        isPssLoading: pss.isLoading,
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
export function useRemoteComputer(): RemoteComputerContextDefinition {
  const context = useContext(RemoteComputerContext);
  if (!context) {
    throw new Error(
      "useRemoteComputer must only be used within RemoteComputerProvider",
    );
  }

  return context;
}
