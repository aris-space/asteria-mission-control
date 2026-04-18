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
  Message,
  Pss200,
  RemoteComputerInfo,
  StateMachine,
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
 * Since the active remote transmits the used configuration asynchronously, it could
be that this endpoint returns [`ErrorNotFound`] despite there being an active remote. In
that case, just retry calling the endpoint a bit later.

If the endpoint returns [`ErrorInternalServerError`], the error body contains information about
why the PSS parsing failed.
 * @summary Get the PSS configurations of the active remote.
 */
export const pss = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<Pss200>(
    { url: `/api/pss`, method: "GET", signal },
    options,
  );
};

export const getPssQueryKey = () => {
  return [`/api/pss`] as const;
};

export const getPssQueryOptions = <
  TData = Awaited<ReturnType<typeof pss>>,
  TError = ErrorType<string>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof pss>>, TError, TData>
  >;
  request?: SecondParameter<typeof customAxiosInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getPssQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof pss>>> = ({
    signal,
  }) => pss(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof pss>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type PssQueryResult = NonNullable<Awaited<ReturnType<typeof pss>>>;
export type PssQueryError = ErrorType<string>;

export function usePss<
  TData = Awaited<ReturnType<typeof pss>>,
  TError = ErrorType<string>,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof pss>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof pss>>,
          TError,
          Awaited<ReturnType<typeof pss>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function usePss<
  TData = Awaited<ReturnType<typeof pss>>,
  TError = ErrorType<string>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof pss>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof pss>>,
          TError,
          Awaited<ReturnType<typeof pss>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function usePss<
  TData = Awaited<ReturnType<typeof pss>>,
  TError = ErrorType<string>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof pss>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
/**
 * @summary Get the PSS configurations of the active remote.
 */

export function usePss<
  TData = Awaited<ReturnType<typeof pss>>,
  TError = ErrorType<string>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof pss>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getPssQueryOptions(options);

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
- `remote-change` with id `null`
- `state-machine-change` with body containing `null`
- `pss-change` with body containing `null`
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
- `remote-change` with id containing the name of the newly activated remote
- `mavlink-message` with body containing JSON-serialized MavLink [`Message`]
- `state-machine-change` with body containing the JSON-serialized [`StateMachine`]
- `pss-change` with body containing the JSON-serialized vector of [`Pss`]
- `state-machine-error` with body containing state machine parse error string
- `pss-error` with body containing PSS parse error string
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
be that this endpoint returns [`ErrorNotFound`] despite there being an active remote. In
that case, just retry calling the endpoint a bit later.

If the endpoint returns [`ErrorInternalServerError`], the error body contains information about
why the state machine parsing failed.
 * @summary Get the state machine of the active remote.
 */
export const stateMachine = (
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<StateMachine>(
    { url: `/api/state-machine`, method: "GET", signal },
    options,
  );
};

export const getStateMachineQueryKey = () => {
  return [`/api/state-machine`] as const;
};

export const getStateMachineQueryOptions = <
  TData = Awaited<ReturnType<typeof stateMachine>>,
  TError = ErrorType<string>,
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
export type StateMachineQueryError = ErrorType<string>;

export function useStateMachine<
  TData = Awaited<ReturnType<typeof stateMachine>>,
  TError = ErrorType<string>,
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
  TError = ErrorType<string>,
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
  TError = ErrorType<string>,
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
  TError = ErrorType<string>,
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
