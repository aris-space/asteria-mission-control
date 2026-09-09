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
import {
  DatapointValue,
  EventKind,
  NamedDatapointValue,
} from "@asteria/mission-control-client";
import { useId } from "@mantine/hooks";
import { useEvent } from "@asteria/hooks/EventContext";
import { useRemoteComputer } from "@asteria/hooks/RemoteComputerContext";
import { deepEqual } from "fast-equals";

interface PssDataContextDefinition {
  addNotifier: (
    name: string,
    datapointName: string,
    cb: (value: DatapointValue) => void,
  ) => void;
  removeNotifier: (name: string) => void;
  getValue: (datapointName: string) => DatapointValue | null;
}

const defaultValue: PssDataContextDefinition = {
  addNotifier: () => {},
  removeNotifier: () => {},
  getValue: () => null,
};

const PssDataContext = createContext<PssDataContextDefinition>(defaultValue);

export function PssDataProvider(props: PropsWithChildren) {
  // For every PSS datapoint we just store the latest received value.
  // Those values are stored in a ref to prevent triggering a re-render for every value update.
  // To minimize the number of re-renders, we store callback functions for all `usePssDatapointData`
  // hooks which are currently active and only trigger state updates inside those hooks.
  const datapointValues = useRef<Record<string, DatapointValue>>({});
  const notifiers = useRef<
    Record<string, [string, (value: DatapointValue) => void]>
  >({});

  useEvent<string>(EventKind.PSS_DATA, (event) => {
    const datapointValue = JSON.parse(event.data) as NamedDatapointValue;
    datapointValues.current[datapointValue.name] = datapointValue.value;
    // Use `for` loop instead of iterator to prevent allocating an array of notifiers
    // for each incoming message.
    for (const notifierId in notifiers.current) {
      const [name, cb] = notifiers.current[notifierId];
      if (name == datapointValue.name) cb(datapointValue.value);
    }
  });

  const { remoteComputer } = useRemoteComputer();

  useEffect(() => {
    // The remote computer changed so all previous datapoint values get invalidated.
    datapointValues.current = {};
    // Call all notifiers such that all `usePssDatapointData` instances update to `null`.
    for (const name in notifiers.current) {
      notifiers.current[name][1](null as any);
    }
  }, [remoteComputer?.name]);

  /**
   * Add a callback function which get's called once a matching PSS dataponit value is received. The
   * `id` is used as an identifier of this callback method such that it can be removed later on.
   * @param id identifier of the callback function
   * @param datapointName name of the datapoint we're interested in
   * @param cb the callback function which is called when a matching function is received
   */
  const addNotifier = useCallback(
    (id: string, datapointName: string, cb: (value: DatapointValue) => void) => {
      notifiers.current[id] = [datapointName, cb];
    },
    [],
  );

  /**
   * Remove a value callback function.
   * @param id identifier of the callback function
   */
  const removeNotifier = useCallback((id: string) => {
    delete notifiers.current[id];
  }, []);

  const getValue = useCallback((datapointName: string) => {
    return datapointValues.current[datapointName] || null;
  }, []);

  // Memoized such that consumers of the context don't re-render whenever this
  // provider re-renders (e.g. when the active remote computer changes).
  const value: PssDataContextDefinition = useMemo(
    () => ({
      addNotifier,
      removeNotifier,
      getValue,
    }),
    [addNotifier, removeNotifier, getValue],
  );

  return (
    <PssDataContext.Provider value={value}>
      {props.children}
    </PssDataContext.Provider>
  );
}

/**
 * Get the latest PSS value for a certain datapoint.
 * @param datapoint name of the datapoint
 * @returns latest PSS value for this datapoint or null if no value was received until now
 */
export function usePssDatapointData(datapoint: string): DatapointValue | null {
  const id = useId();
  const context = useContext(PssDataContext);
  if (!context)
    throw new Error(
      "usePssDatapointData must only be used within a PssDataProvider",
    );

  const currentValue = useRef<DatapointValue>(null);
  const [value, setValue] = useState<DatapointValue | null>(null);

  useEffect(() => {
    const initialValue = context.getValue(datapoint);
    currentValue.current = initialValue;
    setValue(initialValue);
    const cb = (newValue: DatapointValue) => {
      // Keep the ref in sync here (instead of a separate effect) such that the
      // comparison always sees the latest value.
      if (!deepEqual(currentValue.current, newValue)) {
        currentValue.current = newValue;
        setValue(newValue);
      }
    };
    context.addNotifier(id, datapoint, cb);
    return () => {
      context.removeNotifier(id);
    };
  }, [datapoint, context]);

  return value;
}
