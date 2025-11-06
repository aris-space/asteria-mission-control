import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

interface EventContext {
  latency: number;
}

const defaultValue: EventContext = {
  latency: Infinity,
};

const EventContext = createContext<EventContext>(defaultValue);

export function EventProvider(props: PropsWithChildren) {
  const [source, setSource] = useState<EventSource>()
  const [latency, setLatency] = useState<number>(Infinity);

  useEffect(() => {
    const eventSource = new EventSource(`${apiUrl}/events`);
    setSource(eventSource);

    eventSource.addEventListener("open", () => {
      console.log("connected to events!")
    })

    eventSource.addEventListener("ping", (data) => {
      const timestamp = new Date(parseInt(data.data));
      const now = new Date();
      setLatency(now.getTime() - timestamp.getTime());

      console.log(`Received ping with ${now.getTime() - timestamp.getTime()}ms latency`)
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

// eslint-disable-next-line react-refresh/only-export-components
export function useEvent(): EventContext {
  const context = useContext(EventContext);
  if (!context)
    throw new Error("useEvent must only be used within a EventProvider");
  return context;
}
