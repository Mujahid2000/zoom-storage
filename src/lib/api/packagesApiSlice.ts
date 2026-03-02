import { apiSlice } from './apiSlice';

export interface Package {
    id: string;
    name: string;
    maxFolders: number;
    maxNestingLevel: number;
    maxFileSizeMB: number;
    totalFileLimit: number;
    totalStorageMB: number;
    filesPerFolder: number;
    allowedFileTypes: string[];
    price?: number;
}

export interface Subscription {
    id: string;
    packageId: string;
    userId: string;
    startDate: string;
    endDate?: string;
    expiryDate?: string;
    status: string;
    package: Package;
    user: {
        email: string;
    };
}

export const packagesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPackages: builder.query<Package[], void>({
            query: () => '/packages/all',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: any) => response.data,
            providesTags: ['Package'],
        }),
        getCurrentSubscription: builder.query<Subscription, void>({
            query: () => '/subscriptions/current',
            transformResponse: (response: { data: Subscription }) => response.data,
            providesTags: ['Subscription'],
        }),
        getSubscriptionHistory: builder.query<Subscription[], void>({
            query: () => '/subscriptions/history',
            transformResponse: (response: { data: Subscription[] }) => response.data,
            providesTags: ['Subscription'],
        }),
        upgradeSubscription: builder.mutation<Subscription, { packageId: string }>({
            query: (data) => ({
                url: '/subscriptions',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Subscription'],
        }),
    }),
});

export const {
    useGetPackagesQuery,
    useGetCurrentSubscriptionQuery,
    useGetSubscriptionHistoryQuery,
    useUpgradeSubscriptionMutation,
} = packagesApiSlice;
