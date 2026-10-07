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
  GncPolygon,
  Message,
  OptionalResultStateMachine,
  Pss,
  RemoteComputerInfo,
  ServerInfo,
  TileServers200,
} from "./mission-control.schemas";

import { customAxiosInstance } from "./api/mutator/custom-axios-instance";
import type { ErrorType } from "./api/mutator/custom-axios-instance";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * @summary Get general information about the running API server.
 */
export const info = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<ServerInfo>(
    { url: `/api/`, method: "GET", signal },
    options,
  );
};

export const getInfoQueryKey = () => {
  return [`/api/`] as const;
};

export const getInfoQueryOptions = <
  TData = Awaited<ReturnType<typeof info>>,
  TError = ErrorType<unknown>,
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
export type InfoQueryError = ErrorType<unknown>;

export function useInfo<
  TData = Awaited<ReturnType<typeof info>>,
  TError = ErrorType<unknown>,
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
  TError = ErrorType<unknown>,
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
  TError = ErrorType<unknown>,
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
/**
 * @summary Get general information about the running API server.
 */

export function useInfo<
  TData = Awaited<ReturnType<typeof info>>,
  TError = ErrorType<unknown>,
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

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Transition into the next abort state from the current state of the active state machine.
When the transition message is successfully sent, the name of the target abort state is
returned.
 */
export const abort = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<string>(
    { url: `/api/abort`, method: "PUT", signal },
    options,
  );
};

export const getAbortMutationOptions = <
  TError = ErrorType<string>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof abort>>,
    TError,
    void,
    TContext
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof abort>>,
  TError,
  void,
  TContext
> => {
  const mutationKey = ["abort"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof abort>>,
    void
  > = () => {
    return abort(requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type AbortMutationResult = NonNullable<
  Awaited<ReturnType<typeof abort>>
>;

export type AbortMutationError = ErrorType<string>;

/**
 * @summary Transition into the next abort state from the current state of the active state machine.
When the transition message is successfully sent, the name of the target abort state is
returned.
 */
export const useAbort = <TError = ErrorType<string>, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof abort>>,
      TError,
      void,
      TContext
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof abort>>,
  TError,
  void,
  TContext
> => {
  return useMutation(getAbortMutationOptions(options), queryClient);
};

/**
 * @summary Get the TOML schema for the config file.
 */
export const configSchema = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<unknown>(
    { url: `/api/config/schema`, method: "GET", signal },
    options,
  );
};

export const getConfigSchemaQueryKey = () => {
  return [`/api/config/schema`] as const;
};

export const getConfigSchemaQueryOptions = <
  TData = Awaited<ReturnType<typeof configSchema>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof configSchema>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getConfigSchemaQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof configSchema>>> = ({
    signal,
  }) => configSchema(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof configSchema>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type ConfigSchemaQueryResult = NonNullable<
  Awaited<ReturnType<typeof configSchema>>
>;
export type ConfigSchemaQueryError = ErrorType<unknown>;

export function useConfigSchema<
  TData = Awaited<ReturnType<typeof configSchema>>,
  TError = ErrorType<unknown>,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof configSchema>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof configSchema>>,
          TError,
          Awaited<ReturnType<typeof configSchema>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useConfigSchema<
  TData = Awaited<ReturnType<typeof configSchema>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof configSchema>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof configSchema>>,
          TError,
          Awaited<ReturnType<typeof configSchema>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useConfigSchema<
  TData = Awaited<ReturnType<typeof configSchema>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof configSchema>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
/**
 * @summary Get the TOML schema for the config file.
 */

export function useConfigSchema<
  TData = Awaited<ReturnType<typeof configSchema>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof configSchema>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getConfigSchemaQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * Endpoints triggering SSE events specify which events are to be
expected as a consequence of calling the endpoint.
 * @summary Subscribe to API events using SSE.
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
  TError = ErrorType<unknown>,
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
export type SubscribeEventsQueryError = ErrorType<unknown>;

export function useSubscribeEvents<
  TData = Awaited<ReturnType<typeof subscribeEvents>>,
  TError = ErrorType<unknown>,
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
  TError = ErrorType<unknown>,
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
  TError = ErrorType<unknown>,
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
/**
 * @summary Subscribe to API events using SSE.
 */

export function useSubscribeEvents<
  TData = Awaited<ReturnType<typeof subscribeEvents>>,
  TError = ErrorType<unknown>,
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

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Get the GNC polygon for the active remote computer.
 */
export const polygon = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<null | GncPolygon>(
    { url: `/api/gnc-polygon`, method: "GET", signal },
    options,
  );
};

export const getPolygonQueryKey = () => {
  return [`/api/gnc-polygon`] as const;
};

export const getPolygonQueryOptions = <
  TData = Awaited<ReturnType<typeof polygon>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof polygon>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getPolygonQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof polygon>>> = ({
    signal,
  }) => polygon(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof polygon>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type PolygonQueryResult = NonNullable<
  Awaited<ReturnType<typeof polygon>>
>;
export type PolygonQueryError = ErrorType<unknown>;

export function usePolygon<
  TData = Awaited<ReturnType<typeof polygon>>,
  TError = ErrorType<unknown>,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof polygon>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof polygon>>,
          TError,
          Awaited<ReturnType<typeof polygon>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function usePolygon<
  TData = Awaited<ReturnType<typeof polygon>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof polygon>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof polygon>>,
          TError,
          Awaited<ReturnType<typeof polygon>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function usePolygon<
  TData = Awaited<ReturnType<typeof polygon>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof polygon>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
/**
 * @summary Get the GNC polygon for the active remote computer.
 */

export function usePolygon<
  TData = Awaited<ReturnType<typeof polygon>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof polygon>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getPolygonQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Get the configured tile servers for the map on the mission control.
 */
export const tileServers = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<TileServers200>(
    { url: `/api/map/tile-servers`, method: "GET", signal },
    options,
  );
};

export const getTileServersQueryKey = () => {
  return [`/api/map/tile-servers`] as const;
};

export const getTileServersQueryOptions = <
  TData = Awaited<ReturnType<typeof tileServers>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof tileServers>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getTileServersQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof tileServers>>> = ({
    signal,
  }) => tileServers(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof tileServers>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type TileServersQueryResult = NonNullable<
  Awaited<ReturnType<typeof tileServers>>
>;
export type TileServersQueryError = ErrorType<unknown>;

export function useTileServers<
  TData = Awaited<ReturnType<typeof tileServers>>,
  TError = ErrorType<unknown>,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof tileServers>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof tileServers>>,
          TError,
          Awaited<ReturnType<typeof tileServers>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useTileServers<
  TData = Awaited<ReturnType<typeof tileServers>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof tileServers>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof tileServers>>,
          TError,
          Awaited<ReturnType<typeof tileServers>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useTileServers<
  TData = Awaited<ReturnType<typeof tileServers>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof tileServers>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
/**
 * @summary Get the configured tile servers for the map on the mission control.
 */

export function useTileServers<
  TData = Awaited<ReturnType<typeof tileServers>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof tileServers>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getTileServersQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Send JSON-serialized MavLink message to the active remote computer.
 */
export const sendMessage = (
  message: Message,
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<unknown>(
    {
      url: `/api/message`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      data: message,
      signal,
    },
    options,
  );
};

export const getSendMessageMutationOptions = <
  TError = ErrorType<string>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof sendMessage>>,
    TError,
    { data: Message },
    TContext
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof sendMessage>>,
  TError,
  { data: Message },
  TContext
> => {
  const mutationKey = ["sendMessage"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof sendMessage>>,
    { data: Message }
  > = (props) => {
    const { data } = props ?? {};

    return sendMessage(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type SendMessageMutationResult = NonNullable<
  Awaited<ReturnType<typeof sendMessage>>
>;
export type SendMessageMutationBody = Message;
export type SendMessageMutationError = ErrorType<string>;

/**
 * @summary Send JSON-serialized MavLink message to the active remote computer.
 */
export const useSendMessage = <TError = ErrorType<string>, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof sendMessage>>,
      TError,
      { data: Message },
      TContext
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof sendMessage>>,
  TError,
  { data: Message },
  TContext
> => {
  return useMutation(getSendMessageMutationOptions(options), queryClient);
};

/**
 * @summary Get the PSS diagram for the RFS.
 */
export const rfsPss = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<Pss>(
    { url: `/api/pss/rfs`, method: "GET", signal },
    options,
  );
};

export const getRfsPssQueryKey = () => {
  return [`/api/pss/rfs`] as const;
};

export const getRfsPssQueryOptions = <
  TData = Awaited<ReturnType<typeof rfsPss>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof rfsPss>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getRfsPssQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof rfsPss>>> = ({
    signal,
  }) => rfsPss(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof rfsPss>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type RfsPssQueryResult = NonNullable<Awaited<ReturnType<typeof rfsPss>>>;
export type RfsPssQueryError = ErrorType<unknown>;

export function useRfsPss<
  TData = Awaited<ReturnType<typeof rfsPss>>,
  TError = ErrorType<unknown>,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof rfsPss>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof rfsPss>>,
          TError,
          Awaited<ReturnType<typeof rfsPss>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useRfsPss<
  TData = Awaited<ReturnType<typeof rfsPss>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof rfsPss>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof rfsPss>>,
          TError,
          Awaited<ReturnType<typeof rfsPss>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useRfsPss<
  TData = Awaited<ReturnType<typeof rfsPss>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof rfsPss>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
/**
 * @summary Get the PSS diagram for the RFS.
 */

export function useRfsPss<
  TData = Awaited<ReturnType<typeof rfsPss>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof rfsPss>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getRfsPssQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Get the PSS diagram for the rocket.
 */
export const rocketPss = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<Pss>(
    { url: `/api/pss/rocket`, method: "GET", signal },
    options,
  );
};

export const getRocketPssQueryKey = () => {
  return [`/api/pss/rocket`] as const;
};

export const getRocketPssQueryOptions = <
  TData = Awaited<ReturnType<typeof rocketPss>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof rocketPss>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getRocketPssQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof rocketPss>>> = ({
    signal,
  }) => rocketPss(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof rocketPss>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type RocketPssQueryResult = NonNullable<
  Awaited<ReturnType<typeof rocketPss>>
>;
export type RocketPssQueryError = ErrorType<unknown>;

export function useRocketPss<
  TData = Awaited<ReturnType<typeof rocketPss>>,
  TError = ErrorType<unknown>,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof rocketPss>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof rocketPss>>,
          TError,
          Awaited<ReturnType<typeof rocketPss>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useRocketPss<
  TData = Awaited<ReturnType<typeof rocketPss>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof rocketPss>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof rocketPss>>,
          TError,
          Awaited<ReturnType<typeof rocketPss>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useRocketPss<
  TData = Awaited<ReturnType<typeof rocketPss>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof rocketPss>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
/**
 * @summary Get the PSS diagram for the rocket.
 */

export function useRocketPss<
  TData = Awaited<ReturnType<typeof rocketPss>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof rocketPss>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getRocketPssQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Get all available remote computers.
 */
export const remotes = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<RemoteComputerInfo[]>(
    { url: `/api/remotes`, method: "GET", signal },
    options,
  );
};

export const getRemotesQueryKey = () => {
  return [`/api/remotes`] as const;
};

export const getRemotesQueryOptions = <
  TData = Awaited<ReturnType<typeof remotes>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof remotes>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getRemotesQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof remotes>>> = ({
    signal,
  }) => remotes(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof remotes>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type RemotesQueryResult = NonNullable<
  Awaited<ReturnType<typeof remotes>>
>;
export type RemotesQueryError = ErrorType<unknown>;

export function useRemotes<
  TData = Awaited<ReturnType<typeof remotes>>,
  TError = ErrorType<unknown>,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof remotes>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof remotes>>,
          TError,
          Awaited<ReturnType<typeof remotes>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useRemotes<
  TData = Awaited<ReturnType<typeof remotes>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof remotes>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof remotes>>,
          TError,
          Awaited<ReturnType<typeof remotes>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useRemotes<
  TData = Awaited<ReturnType<typeof remotes>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof remotes>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
/**
 * @summary Get all available remote computers.
 */

export function useRemotes<
  TData = Awaited<ReturnType<typeof remotes>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof remotes>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getRemotesQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Get the active remote computer, if one is currently active.
 */
export const activeRemote = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<null | RemoteComputerInfo>(
    { url: `/api/remotes/active`, method: "GET", signal },
    options,
  );
};

export const getActiveRemoteQueryKey = () => {
  return [`/api/remotes/active`] as const;
};

export const getActiveRemoteQueryOptions = <
  TData = Awaited<ReturnType<typeof activeRemote>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof activeRemote>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getActiveRemoteQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof activeRemote>>> = ({
    signal,
  }) => activeRemote(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof activeRemote>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type ActiveRemoteQueryResult = NonNullable<
  Awaited<ReturnType<typeof activeRemote>>
>;
export type ActiveRemoteQueryError = ErrorType<unknown>;

export function useActiveRemote<
  TData = Awaited<ReturnType<typeof activeRemote>>,
  TError = ErrorType<unknown>,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activeRemote>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof activeRemote>>,
          TError,
          Awaited<ReturnType<typeof activeRemote>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useActiveRemote<
  TData = Awaited<ReturnType<typeof activeRemote>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activeRemote>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof activeRemote>>,
          TError,
          Awaited<ReturnType<typeof activeRemote>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useActiveRemote<
  TData = Awaited<ReturnType<typeof activeRemote>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activeRemote>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
/**
 * @summary Get the active remote computer, if one is currently active.
 */

export function useActiveRemote<
  TData = Awaited<ReturnType<typeof activeRemote>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof activeRemote>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getActiveRemoteQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * **Events**:
- `REMOTE` with body containing `null`.
- `STATE_MACHINE` with body containing `null`.
 * @summary Deactivate the currently active remote computer.
 */
export const deactivateActiveRemote = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<unknown>(
    { url: `/api/remotes/active`, method: "DELETE", signal },
    options,
  );
};

export const getDeactivateActiveRemoteMutationOptions = <
  TError = ErrorType<string>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deactivateActiveRemote>>,
    TError,
    void,
    TContext
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof deactivateActiveRemote>>,
  TError,
  void,
  TContext
> => {
  const mutationKey = ["deactivateActiveRemote"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof deactivateActiveRemote>>,
    void
  > = () => {
    return deactivateActiveRemote(requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type DeactivateActiveRemoteMutationResult = NonNullable<
  Awaited<ReturnType<typeof deactivateActiveRemote>>
>;

export type DeactivateActiveRemoteMutationError = ErrorType<string>;

/**
 * @summary Deactivate the currently active remote computer.
 */
export const useDeactivateActiveRemote = <
  TError = ErrorType<string>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof deactivateActiveRemote>>,
      TError,
      void,
      TContext
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof deactivateActiveRemote>>,
  TError,
  void,
  TContext
> => {
  return useMutation(
    getDeactivateActiveRemoteMutationOptions(options),
    queryClient,
  );
};

/**
 * **Events**:
- `REMOTE` with body containing the name of the newly activated remote.
- `MAVLINK_MESSAGE` with body containing JSON-serialized MavLink [`Message`].
- `STATE_MACHINE` with body containing the JSON-serialized [`StateMachine`].
 * @summary Change the active remote computer.
 */
export const changeActiveRemote = (
  name: string,
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<unknown>(
    { url: `/api/remotes/active/${name}`, method: "PUT", signal },
    options,
  );
};

export const getChangeActiveRemoteMutationOptions = <
  TError = ErrorType<string>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof changeActiveRemote>>,
    TError,
    { name: string },
    TContext
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof changeActiveRemote>>,
  TError,
  { name: string },
  TContext
> => {
  const mutationKey = ["changeActiveRemote"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof changeActiveRemote>>,
    { name: string }
  > = (props) => {
    const { name } = props ?? {};

    return changeActiveRemote(name, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type ChangeActiveRemoteMutationResult = NonNullable<
  Awaited<ReturnType<typeof changeActiveRemote>>
>;

export type ChangeActiveRemoteMutationError = ErrorType<string>;

/**
 * @summary Change the active remote computer.
 */
export const useChangeActiveRemote = <
  TError = ErrorType<string>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof changeActiveRemote>>,
      TError,
      { name: string },
      TContext
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof changeActiveRemote>>,
  TError,
  { name: string },
  TContext
> => {
  return useMutation(
    getChangeActiveRemoteMutationOptions(options),
    queryClient,
  );
};

/**
 * Since the active remote transmits the used configuration asynchronously, it could
be that this endpoint returns [`OptionalResult::None`] despite there being an active remote
with a state machine. In that case, just retry calling the endpoint a bit later.
 * @summary Get the state machine of the active remote.
 */
export const stateMachine = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<OptionalResultStateMachine>(
    { url: `/api/state-machine`, method: "GET", signal },
    options,
  );
};

export const getStateMachineQueryKey = () => {
  return [`/api/state-machine`] as const;
};

export const getStateMachineQueryOptions = <
  TData = Awaited<ReturnType<typeof stateMachine>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof stateMachine>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getStateMachineQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof stateMachine>>> = ({
    signal,
  }) => stateMachine(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof stateMachine>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type StateMachineQueryResult = NonNullable<
  Awaited<ReturnType<typeof stateMachine>>
>;
export type StateMachineQueryError = ErrorType<unknown>;

export function useStateMachine<
  TData = Awaited<ReturnType<typeof stateMachine>>,
  TError = ErrorType<unknown>,
>(
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
  TError = ErrorType<unknown>,
>(
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
  TError = ErrorType<unknown>,
>(
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
/**
 * @summary Get the state machine of the active remote.
 */

export function useStateMachine<
  TData = Awaited<ReturnType<typeof stateMachine>>,
  TError = ErrorType<unknown>,
>(
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
  const queryOptions = getStateMachineQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}
