import { apiSlice } from './apiSlice';
import { Package, Subscription } from './packagesApiSlice';

export interface AdminUser {
    id: string;
    email: string;
    isVerified: boolean;
    role: string;
    subscriptions?: {
        package: {
            name: string;
        };
    }[];
    createdAt: string;
}

export interface SystemConfig {
    maintenanceMode: boolean;
    maxUploadSizeMB: number;
    updatedAt: string;
}

export const adminApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAdminUsers: builder.query<AdminUser[], void>({
            query: () => '/admin/users',
            transformResponse: (response: { data: AdminUser[] }) => response.data,
            providesTags: ['User'],
        }),
        getAdminSubscriptions: builder.query<Subscription[], void>({
            query: () => '/admin/subscriptions',
            transformResponse: (response: { data: Subscription[] }) => response.data,
            providesTags: ['Subscription'],
        }),
        getSystemConfig: builder.query<SystemConfig, void>({
            query: () => '/admin/system-config',
            transformResponse: (response: { data: SystemConfig }) => response.data,
            providesTags: ['SystemConfig'],
        }),
        updateSystemConfig: builder.mutation<SystemConfig, Partial<SystemConfig>>({
            query: (data) => ({
                url: '/admin/system-config',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['SystemConfig'],
        }),
        verifyUser: builder.mutation<{ message: string }, string>({
            query: (userId) => ({
                url: `/admin/users/${userId}/verify`,
                method: 'POST',
            }),
            invalidatesTags: ['User'],
        }),
        deleteUser: builder.mutation<{ message: string }, string>({
            query: (userId) => ({
                url: `/admin/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
        createPackage: builder.mutation<Package, Partial<Package>>({
            query: (data) => ({
                url: '/packages',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Package'],
        }),
    }),
});

export const {
    useGetAdminUsersQuery,
    useGetAdminSubscriptionsQuery,
    useGetSystemConfigQuery,
    useUpdateSystemConfigMutation,
    useVerifyUserMutation,
    useDeleteUserMutation,
    useCreatePackageMutation,
} = adminApiSlice;
