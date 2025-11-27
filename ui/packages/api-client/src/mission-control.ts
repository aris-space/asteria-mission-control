import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import type {
  Info,
  ScenarioInfo,
  StateMachine,
  StateMachineInfo,
} from "./mission-control.schemas";

import { customAxiosInstance } from "./api/mutator/custom-axios-instance";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * Get basic information about the running API server
 */
export const info = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<Info>(
    { url: `/api/`, method: "GET", signal },
    options,
  );
};

export const getInfoQueryKey = () => {
  return [`/api/`] as const;
};

export const getInfoQueryOptions = <
  TData = Awaited<ReturnType<typeof info>>,
  TError = unknown,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof info>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getInfoQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof info>>> = ({
    signal,
  }) => info(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof info>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type InfoQueryResult = NonNullable<Awaited<ReturnType<typeof info>>>;
export type InfoQueryError = unknown;

export function useInfo<
  TData = Awaited<ReturnType<typeof info>>,
  TError = unknown,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof info>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof info>>,
          TError,
          Awaited<ReturnType<typeof info>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useInfo<
  TData = Awaited<ReturnType<typeof info>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof info>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof info>>,
          TError,
          Awaited<ReturnType<typeof info>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useInfo<
  TData = Awaited<ReturnType<typeof info>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof info>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};

export function useInfo<
  TData = Awaited<ReturnType<typeof info>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof info>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getInfoQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Subscribe to API event stream using SSE
 */
export const subscribeEvents = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<unknown>(
    { url: `/api/events`, method: "GET", signal },
    options,
  );
};

export const getSubscribeEventsQueryKey = () => {
  return [`/api/events`] as const;
};

export const getSubscribeEventsQueryOptions = <
  TData = Awaited<ReturnType<typeof subscribeEvents>>,
  TError = unknown,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof subscribeEvents>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getSubscribeEventsQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof subscribeEvents>>> = ({
    signal,
  }) => subscribeEvents(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof subscribeEvents>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type SubscribeEventsQueryResult = NonNullable<
  Awaited<ReturnType<typeof subscribeEvents>>
>;
export type SubscribeEventsQueryError = unknown;

export function useSubscribeEvents<
  TData = Awaited<ReturnType<typeof subscribeEvents>>,
  TError = unknown,
>(
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof subscribeEvents>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof subscribeEvents>>,
          TError,
          Awaited<ReturnType<typeof subscribeEvents>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useSubscribeEvents<
  TData = Awaited<ReturnType<typeof subscribeEvents>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof subscribeEvents>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof subscribeEvents>>,
          TError,
          Awaited<ReturnType<typeof subscribeEvents>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useSubscribeEvents<
  TData = Awaited<ReturnType<typeof subscribeEvents>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof subscribeEvents>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};

export function useSubscribeEvents<
  TData = Awaited<ReturnType<typeof subscribeEvents>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof subscribeEvents>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getSubscribeEventsQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Get the active scenario
 */
export const activeScenario = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<ScenarioInfo>(
    { url: `/api/scenario`, method: "GET", signal },
    options,
  );
};

export const getActiveScenarioQueryKey = () => {
  return [`/api/scenario`] as const;
};

export const getActiveScenarioQueryOptions = <
  TData = Awaited<ReturnType<typeof activeScenario>>,
  TError = unknown,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof activeScenario>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getActiveScenarioQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof activeScenario>>> = ({
    signal,
  }) => activeScenario(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof activeScenario>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type ActiveScenarioQueryResult = NonNullable<
  Awaited<ReturnType<typeof activeScenario>>
>;
export type ActiveScenarioQueryError = unknown;

export function useActiveScenario<
  TData = Awaited<ReturnType<typeof activeScenario>>,
  TError = unknown,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activeScenario>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof activeScenario>>,
          TError,
          Awaited<ReturnType<typeof activeScenario>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useActiveScenario<
  TData = Awaited<ReturnType<typeof activeScenario>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activeScenario>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof activeScenario>>,
          TError,
          Awaited<ReturnType<typeof activeScenario>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useActiveScenario<
  TData = Awaited<ReturnType<typeof activeScenario>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activeScenario>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};

export function useActiveScenario<
  TData = Awaited<ReturnType<typeof activeScenario>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activeScenario>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getActiveScenarioQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Get all available scenarios
 */
export const allScenarios = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<ScenarioInfo[]>(
    { url: `/api/scenario/all`, method: "GET", signal },
    options,
  );
};

export const getAllScenariosQueryKey = () => {
  return [`/api/scenario/all`] as const;
};

export const getAllScenariosQueryOptions = <
  TData = Awaited<ReturnType<typeof allScenarios>>,
  TError = unknown,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof allScenarios>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getAllScenariosQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof allScenarios>>> = ({
    signal,
  }) => allScenarios(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof allScenarios>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type AllScenariosQueryResult = NonNullable<
  Awaited<ReturnType<typeof allScenarios>>
>;
export type AllScenariosQueryError = unknown;

export function useAllScenarios<
  TData = Awaited<ReturnType<typeof allScenarios>>,
  TError = unknown,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof allScenarios>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof allScenarios>>,
          TError,
          Awaited<ReturnType<typeof allScenarios>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useAllScenarios<
  TData = Awaited<ReturnType<typeof allScenarios>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof allScenarios>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof allScenarios>>,
          TError,
          Awaited<ReturnType<typeof allScenarios>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useAllScenarios<
  TData = Awaited<ReturnType<typeof allScenarios>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof allScenarios>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};

export function useAllScenarios<
  TData = Awaited<ReturnType<typeof allScenarios>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof allScenarios>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getAllScenariosQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Change the active scenario. Emits a `scenario-change` event with the id of the new scenario to all clients
 */
export const changeScenario = (
  scenarioId: string,
  options?: SecondParameter<typeof customAxiosInstance>,
) => {
  return customAxiosInstance<unknown>(
    { url: `/api/scenario/${scenarioId}`, method: "PUT" },
    options,
  );
};

export const getChangeScenarioMutationOptions = <
  TError = string,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof changeScenario>>,
    TError,
    { scenarioId: string },
    TContext
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof changeScenario>>,
  TError,
  { scenarioId: string },
  TContext
> => {
  const mutationKey = ["changeScenario"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof changeScenario>>,
    { scenarioId: string }
  > = (props) => {
    const { scenarioId } = props ?? {};

    return changeScenario(scenarioId, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type ChangeScenarioMutationResult = NonNullable<
  Awaited<ReturnType<typeof changeScenario>>
>;

export type ChangeScenarioMutationError = string;

export const useChangeScenario = <TError = string, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof changeScenario>>,
      TError,
      { scenarioId: string },
      TContext
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof changeScenario>>,
  TError,
  { scenarioId: string },
  TContext
> => {
  const mutationOptions = getChangeScenarioMutationOptions(options);

  return useMutation(mutationOptions, queryClient);
};

/**
 * Get all available state machines from the active scenario
 */
export const allStateMachines = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<StateMachineInfo[]>(
    { url: `/api/statemachine`, method: "GET", signal },
    options,
  );
};

export const getAllStateMachinesQueryKey = () => {
  return [`/api/statemachine`] as const;
};

export const getAllStateMachinesQueryOptions = <
  TData = Awaited<ReturnType<typeof allStateMachines>>,
  TError = unknown,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof allStateMachines>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getAllStateMachinesQueryKey();

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof allStateMachines>>
  > = ({ signal }) => allStateMachines(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof allStateMachines>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type AllStateMachinesQueryResult = NonNullable<
  Awaited<ReturnType<typeof allStateMachines>>
>;
export type AllStateMachinesQueryError = unknown;

export function useAllStateMachines<
  TData = Awaited<ReturnType<typeof allStateMachines>>,
  TError = unknown,
>(
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof allStateMachines>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof allStateMachines>>,
          TError,
          Awaited<ReturnType<typeof allStateMachines>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useAllStateMachines<
  TData = Awaited<ReturnType<typeof allStateMachines>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof allStateMachines>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof allStateMachines>>,
          TError,
          Awaited<ReturnType<typeof allStateMachines>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useAllStateMachines<
  TData = Awaited<ReturnType<typeof allStateMachines>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof allStateMachines>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};

export function useAllStateMachines<
  TData = Awaited<ReturnType<typeof allStateMachines>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof allStateMachines>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getAllStateMachinesQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Get a state machine of the current active scenario
 */
export const stateMachine = (
  id: string,
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<StateMachine>(
    { url: `/api/statemachine/${id}`, method: "GET", signal },
    options,
  );
};

export const getStateMachineQueryKey = (id?: string) => {
  return [`/api/statemachine/${id}`] as const;
};

export const getStateMachineQueryOptions = <
  TData = Awaited<ReturnType<typeof stateMachine>>,
  TError = string,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof stateMachine>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getStateMachineQueryKey(id);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof stateMachine>>> = ({
    signal,
  }) => stateMachine(id, requestOptions, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!id,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof stateMachine>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type StateMachineQueryResult = NonNullable<
  Awaited<ReturnType<typeof stateMachine>>
>;
export type StateMachineQueryError = string;

export function useStateMachine<
  TData = Awaited<ReturnType<typeof stateMachine>>,
  TError = string,
>(
  id: string,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof stateMachine>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof stateMachine>>,
          TError,
          Awaited<ReturnType<typeof stateMachine>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useStateMachine<
  TData = Awaited<ReturnType<typeof stateMachine>>,
  TError = string,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof stateMachine>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof stateMachine>>,
          TError,
          Awaited<ReturnType<typeof stateMachine>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useStateMachine<
  TData = Awaited<ReturnType<typeof stateMachine>>,
  TError = string,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof stateMachine>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};

export function useStateMachine<
  TData = Awaited<ReturnType<typeof stateMachine>>,
  TError = string,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof stateMachine>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getStateMachineQueryOptions(id, options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  query.queryKey = queryOptions.queryKey;

  return query;
}
