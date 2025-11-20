import { useQuery } from "@tanstack/react-query";
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import type { Info, StateMachine } from "./mission-control.schemas";

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
 * Get the active state-machine
 */
export const getStateMachine = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<StateMachine>(
    { url: `/api/state-machine`, method: "GET", signal },
    options,
  );
};

export const getGetStateMachineQueryKey = () => {
  return [`/api/state-machine`] as const;
};

export const getGetStateMachineQueryOptions = <
  TData = Awaited<ReturnType<typeof getStateMachine>>,
  TError = unknown,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof getStateMachine>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetStateMachineQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getStateMachine>>> = ({
    signal,
  }) => getStateMachine(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getStateMachine>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type GetStateMachineQueryResult = NonNullable<
  Awaited<ReturnType<typeof getStateMachine>>
>;
export type GetStateMachineQueryError = unknown;

export function useGetStateMachine<
  TData = Awaited<ReturnType<typeof getStateMachine>>,
  TError = unknown,
>(
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof getStateMachine>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getStateMachine>>,
          TError,
          Awaited<ReturnType<typeof getStateMachine>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useGetStateMachine<
  TData = Awaited<ReturnType<typeof getStateMachine>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof getStateMachine>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getStateMachine>>,
          TError,
          Awaited<ReturnType<typeof getStateMachine>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useGetStateMachine<
  TData = Awaited<ReturnType<typeof getStateMachine>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof getStateMachine>>,
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

export function useGetStateMachine<
  TData = Awaited<ReturnType<typeof getStateMachine>>,
  TError = unknown,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof getStateMachine>>,
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
  const queryOptions = getGetStateMachineQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  query.queryKey = queryOptions.queryKey;

  return query;
}
