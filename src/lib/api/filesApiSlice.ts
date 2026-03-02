import { apiSlice } from './apiSlice';

export interface File {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    folderId: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export const filesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFiles: builder.query<File[], string | null>({
            query: (folderId) => `/files${folderId ? `?folderId=${folderId}` : ''}`,
            transformResponse: (response: { data: File[] }) => response.data,
            providesTags: (result, error, folderId) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'File' as const, id })),
                        { type: 'File' as const, id: `LIST-${folderId ?? 'root'}` },
                    ]
                    : [{ type: 'File' as const, id: `LIST-${folderId ?? 'root'}` }],
        }),
        uploadFile: builder.mutation<unknown, FormData>({
            query: (formData) => ({
                url: '/files',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: (result, error, formData) => [
                { type: 'File', id: `LIST-${(formData.get('folderId') as string | null) ?? 'root'}` }
            ],
        }),
        deleteFile: builder.mutation<unknown, { id: string; folderId: string | null }>({
            query: ({ id }) => ({
                url: `/files/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { id, folderId }) => [
                { type: 'File', id },
                { type: 'File', id: `LIST-${folderId ?? 'root'}` },
            ],
        }),
        renameFile: builder.mutation<unknown, { id: string; name: string; folderId: string | null }>({
            query: ({ id, name }) => ({
                url: `/files/${id}`,
                method: 'PUT',
                body: { name },
            }),
            invalidatesTags: (result, error, { id, folderId }) => [
                { type: 'File', id },
                { type: 'File', id: `LIST-${folderId ?? 'root'}` },
            ],
        }),
    }),
});

export const {
    useGetFilesQuery,
    useUploadFileMutation,
    useDeleteFileMutation,
    useRenameFileMutation,
} = filesApiSlice;
