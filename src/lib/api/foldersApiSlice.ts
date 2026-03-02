import { apiSlice } from './apiSlice';

export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export const foldersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFolders: builder.query<Folder[], string | null>({
            query: (parentId) => `/folders${parentId ? `?parentId=${parentId}` : ''}`,
            transformResponse: (response: { data: Folder[] }) => response.data,
            providesTags: (result, error, parentId) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Folder' as const, id })),
                        { type: 'Folder' as const, id: `LIST-${parentId ?? 'root'}` },
                    ]
                    : [{ type: 'Folder' as const, id: `LIST-${parentId ?? 'root'}` }],
        }),
        createFolder: builder.mutation<unknown, { name: string; parentId?: string | null }>({
            query: (folderData) => ({
                url: '/folders',
                method: 'POST',
                body: folderData,
            }),
            invalidatesTags: (result, error, { parentId }) => [
                { type: 'Folder', id: `LIST-${parentId ?? 'root'}` }
            ],
        }),
        deleteFolder: builder.mutation<unknown, { id: string; parentId: string | null }>({
            query: ({ id }) => ({
                url: `/folders/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { id, parentId }) => [
                { type: 'Folder', id },
                { type: 'Folder', id: `LIST-${parentId ?? 'root'}` },
            ],
        }),
        renameFolder: builder.mutation<unknown, { id: string; name: string; parentId: string | null }>({
            query: ({ id, name }) => ({
                url: `/folders/${id}`,
                method: 'PUT',
                body: { name },
            }),
            invalidatesTags: (result, error, { id, parentId }) => [
                { type: 'Folder', id },
                { type: 'Folder', id: `LIST-${parentId ?? 'root'}` },
            ],
        }),
        getFolderPath: builder.query<Folder[], string>({
            query: (id) => `/folders/${id}/path`,
            transformResponse: (response: { data: Folder[] }) => response.data,
        }),
    }),
});

export const {
    useGetFoldersQuery,
    useCreateFolderMutation,
    useDeleteFolderMutation,
    useRenameFolderMutation,
    useGetFolderPathQuery,
} = foldersApiSlice;
