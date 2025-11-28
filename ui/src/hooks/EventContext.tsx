import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface EventContextDefinition {
  latency: number;
}

const defaultValue: EventContextDefinition = {
  latency: Infinity,
};

const EventContext = createContext<EventContextDefinition>(defaultValue);

export function EventProvider(props: PropsWithChildren) {
  const [source, setSource] = useState<EventSource>()
  const [latency, setLatency] = useState<number>(Infinity);

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/api/events`);
    setSource(eventSource);

    eventSource.addEventListener("open", () => {
      console.log("Successfulyl connected to events!")
    });

    eventSource.addEventListener("ping", (data) => {
      const timestamp = new Date(parseInt(data.data));
      const now = new Date();
      setLatency(now.getTime() - timestamp.getTime());

      console.debug(`Received ping with ${now.getTime() - timestamp.getTime()}ms latency`)
    })

    return () => {
      if (source) source.close()
    }
  }, [])

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