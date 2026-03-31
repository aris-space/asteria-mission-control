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
  Pss,
  PssInfo,
  ScenarioInfo,
  StateMachine,
  StateMachineInfo,
} from "./mission-control.schemas";

import { customAxiosInstance } from "./api/mutator/custom-axios-instance";
import type { ErrorType } from "./api/mutator/custom-axios-instance";

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

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Get the TOML schema for the config
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

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Send a message which will be proxied by the backend as a MavLink message
 */
export const sendMessage = (
  message: Message,
  options?: SecondParameter<typeof customAxiosInstance>,
) => {
  return customAxiosInstance<unknown>(
    {
      url: `/api/message`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      data: message,
    },
    options,
  );
};

export const getSendMessageMutationOptions = <
  TError = ErrorType<unknown>,
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
export type SendMessageMutationError = ErrorType<unknown>;

export const useSendMessage = <TError = ErrorType<unknown>, TContext = unknown>(
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
  const mutationOptions = getSendMessageMutationOptions(options);

  return useMutation(mutationOptions, queryClient);
};

/**
 * Get all available PSS infos of a specific scenario
 */
export const allPssInfos = (
  scenarioId: string,
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<PssInfo[]>(
    { url: `/api/pss/scenario/${scenarioId}`, method: "GET", signal },
    options,
  );
};

export const getAllPssInfosQueryKey = (scenarioId?: string) => {
  return [`/api/pss/scenario/${scenarioId}`] as const;
};

export const getAllPssInfosQueryOptions = <
  TData = Awaited<ReturnType<typeof allPssInfos>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof allPssInfos>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getAllPssInfosQueryKey(scenarioId);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof allPssInfos>>> = ({
    signal,
  }) => allPssInfos(scenarioId, requestOptions, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!scenarioId,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof allPssInfos>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type AllPssInfosQueryResult = NonNullable<
  Awaited<ReturnType<typeof allPssInfos>>
>;
export type AllPssInfosQueryError = ErrorType<string>;

export function useAllPssInfos<
  TData = Awaited<ReturnType<typeof allPssInfos>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof allPssInfos>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof allPssInfos>>,
          TError,
          Awaited<ReturnType<typeof allPssInfos>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useAllPssInfos<
  TData = Awaited<ReturnType<typeof allPssInfos>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof allPssInfos>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof allPssInfos>>,
          TError,
          Awaited<ReturnType<typeof allPssInfos>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useAllPssInfos<
  TData = Awaited<ReturnType<typeof allPssInfos>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof allPssInfos>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};

export function useAllPssInfos<
  TData = Awaited<ReturnType<typeof allPssInfos>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof allPssInfos>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getAllPssInfosQueryOptions(scenarioId, options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Get a specific PSS information for a scenario
 */
export const pssInformation = (
  scenarioId: string,
  pssId: string,
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<Pss>(
    { url: `/api/pss/scenario/${scenarioId}/${pssId}`, method: "GET", signal },
    options,
  );
};

export const getPssInformationQueryKey = (
  scenarioId?: string,
  pssId?: string,
) => {
  return [`/api/pss/scenario/${scenarioId}/${pssId}`] as const;
};

export const getPssInformationQueryOptions = <
  TData = Awaited<ReturnType<typeof pssInformation>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
  pssId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof pssInformation>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getPssInformationQueryKey(scenarioId, pssId);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof pssInformation>>> = ({
    signal,
  }) => pssInformation(scenarioId, pssId, requestOptions, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!(scenarioId && pssId),
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof pssInformation>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type PssInformationQueryResult = NonNullable<
  Awaited<ReturnType<typeof pssInformation>>
>;
export type PssInformationQueryError = ErrorType<string>;

export function usePssInformation<
  TData = Awaited<ReturnType<typeof pssInformation>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
  pssId: string,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof pssInformation>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof pssInformation>>,
          TError,
          Awaited<ReturnType<typeof pssInformation>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function usePssInformation<
  TData = Awaited<ReturnType<typeof pssInformation>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
  pssId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof pssInformation>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof pssInformation>>,
          TError,
          Awaited<ReturnType<typeof pssInformation>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function usePssInformation<
  TData = Awaited<ReturnType<typeof pssInformation>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
  pssId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof pssInformation>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};

export function usePssInformation<
  TData = Awaited<ReturnType<typeof pssInformation>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
  pssId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof pssInformation>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getPssInformationQueryOptions(
    scenarioId,
    pssId,
    options,
  );

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
  TError = ErrorType<unknown>,
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
export type ActiveScenarioQueryError = ErrorType<unknown>;

export function useActiveScenario<
  TData = Awaited<ReturnType<typeof activeScenario>>,
  TError = ErrorType<unknown>,
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
  TError = ErrorType<unknown>,
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
  TError = ErrorType<unknown>,
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
  TError = ErrorType<unknown>,
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
  TError = ErrorType<unknown>,
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
export type AllScenariosQueryError = ErrorType<unknown>;

export function useAllScenarios<
  TData = Awaited<ReturnType<typeof allScenarios>>,
  TError = ErrorType<unknown>,
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
  TError = ErrorType<unknown>,
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
  TError = ErrorType<unknown>,
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
  TError = ErrorType<unknown>,
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
  return customAxiosInstance<string>(
    { url: `/api/scenario/${scenarioId}`, method: "PUT" },
    options,
  );
};

export const getChangeScenarioMutationOptions = <
  TError = ErrorType<string>,
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

export type ChangeScenarioMutationError = ErrorType<string>;

export const useChangeScenario = <
  TError = ErrorType<string>,
  TContext = unknown,
>(
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
 * Get all available state machines of a specific scenario
 */
export const allStateMachines = (
  scenarioId: string,
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<StateMachineInfo[]>(
    { url: `/api/statemachine/scenario/${scenarioId}`, method: "GET", signal },
    options,
  );
};

export const getAllStateMachinesQueryKey = (scenarioId?: string) => {
  return [`/api/statemachine/scenario/${scenarioId}`] as const;
};

export const getAllStateMachinesQueryOptions = <
  TData = Awaited<ReturnType<typeof allStateMachines>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
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
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getAllStateMachinesQueryKey(scenarioId);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof allStateMachines>>
  > = ({ signal }) => allStateMachines(scenarioId, requestOptions, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!scenarioId,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof allStateMachines>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type AllStateMachinesQueryResult = NonNullable<
  Awaited<ReturnType<typeof allStateMachines>>
>;
export type AllStateMachinesQueryError = ErrorType<string>;

export function useAllStateMachines<
  TData = Awaited<ReturnType<typeof allStateMachines>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
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
  TError = ErrorType<string>,
>(
  scenarioId: string,
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
  TError = ErrorType<string>,
>(
  scenarioId: string,
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
  TError = ErrorType<string>,
>(
  scenarioId: string,
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
  const queryOptions = getAllStateMachinesQueryOptions(scenarioId, options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Get a specific state machine for a scenario
 */
export const stateMachine = (
  scenarioId: string,
  stateMachineId: string,
  options?: SecondParameter<typeof customAxiosInstance>,
  signal?: AbortSignal,
) => {
  return customAxiosInstance<StateMachine>(
    {
      url: `/api/statemachine/scenario/${scenarioId}/${stateMachineId}`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const getStateMachineQueryKey = (
  scenarioId?: string,
  stateMachineId?: string,
) => {
  return [
    `/api/statemachine/scenario/${scenarioId}/${stateMachineId}`,
  ] as const;
};

export const getStateMachineQueryOptions = <
  TData = Awaited<ReturnType<typeof stateMachine>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
  stateMachineId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof stateMachine>>, TError, TData>
    >;
    request?: SecondParameter<typeof customAxiosInstance>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ??
    getStateMachineQueryKey(scenarioId, stateMachineId);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof stateMachine>>> = ({
    signal,
  }) => stateMachine(scenarioId, stateMachineId, requestOptions, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!(scenarioId && stateMachineId),
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
export type StateMachineQueryError = ErrorType<string>;

export function useStateMachine<
  TData = Awaited<ReturnType<typeof stateMachine>>,
  TError = ErrorType<string>,
>(
  scenarioId: string,
  stateMachineId: string,
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
  scenarioId: string,
  stateMachineId: string,
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
  scenarioId: string,
  stateMachineId: string,
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
  TError = ErrorType<string>,
>(
  scenarioId: string,
  stateMachineId: string,
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
  const queryOptions = getStateMachineQueryOptions(
    scenarioId,
    stateMachineId,
    options,
  );

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  query.queryKey = queryOptions.queryKey;

  return query;
}
