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

import type { Info } from "./mission-control.schemas";

import { customAxiosInstance } from "./api/mutator/custom-axios-instance";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * Get basic information about the running API server
 */
export type infoResponse200 = {
  data: Info;
  status: 200;
};

export type infoResponseSuccess = infoResponse200 & {
  headers: Headers;
};
export type infoResponse = infoResponseSuccess;

export const getInfoUrl = () => {
  return `/api/`;
};

export const info = async (options?: RequestInit): Promise<infoResponse> => {
  return customAxiosInstance<infoResponse>(getInfoUrl(), {
    ...options,
    method: "GET",
  });
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
  }) => info({ signal, ...requestOptions });

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
export type subscribeEventsResponseDefault = {
  data: unknown;
  status: number;
};
export type subscribeEventsResponseError = subscribeEventsResponseDefault & {
  headers: Headers;
};

export type subscribeEventsResponse = subscribeEventsResponseError;

export const getSubscribeEventsUrl = () => {
  return `/api/events`;
};

export const subscribeEvents = async (
  options?: RequestInit,
): Promise<subscribeEventsResponse> => {
  return customAxiosInstance<subscribeEventsResponse>(getSubscribeEventsUrl(), {
    ...options,
    method: "GET",
  });
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
  }) => subscribeEvents({ signal, ...requestOptions });

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
