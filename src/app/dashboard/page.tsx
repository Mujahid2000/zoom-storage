/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGetFilesQuery, useUploadFileMutation, useDeleteFileMutation, useRenameFileMutation } from '../../lib/api/filesApiSlice';
import { useGetFoldersQuery, useCreateFolderMutation, useDeleteFolderMutation, useRenameFolderMutation, useGetFolderPathQuery } from '../../lib/api/foldersApiSlice';
import { useGetCurrentSubscriptionQuery } from '../../lib/api/packagesApiSlice';
import { Search, Plus, Upload, Folder, MoreVertical, File, FileImage, FileVideo, FileAudio, FileText, Check, Loader2, ChevronRight, Home, Pencil, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast, Toaster } from 'sonner';
import Image from 'next/image';

const folderSchema = z.object({
    name: z.string().min(1, "Folder name is required"),
});

type FolderFormValues = z.infer<typeof folderSchema>;

export default function UserDashboard() {
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const { user, loading: authLoading } = useAuth();
    const [isUploading, setIsUploading] = useState(false);

    // RTK Query hooks
    const { data: filesData, isLoading: filesLoading, isFetching: filesFetching } = useGetFilesQuery(currentFolderId);
    const { data: foldersData, isLoading: foldersLoading, isFetching: foldersFetching } = useGetFoldersQuery(currentFolderId);
    const { data: pathData, isFetching: pathFetching } = useGetFolderPathQuery(currentFolderId as string, { skip: !currentFolderId });
    const { data: subscription } = useGetCurrentSubscriptionQuery();

    const files = filesData || [];
    const folders = foldersData || [];
    const breadcrumbPath = pathData || [];

    const [createFolder, { isLoading: isCreatingFolder }] = useCreateFolderMutation();
    const [uploadFile] = useUploadFileMutation();
    const [deleteFile] = useDeleteFileMutation();
    const [renameFile] = useRenameFileMutation();
    const [deleteFolder] = useDeleteFolderMutation();
    const [renameFolder] = useRenameFolderMutation();

    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [itemToRename, setItemToRename] = useState<any>(null);
    const [renameType, setRenameType] = useState<'folder' | 'file'>('folder');
    const [renameName, setRenameName] = useState('');

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'folder' | 'file', name: string } | null>(null);

    const folderForm = useForm<FolderFormValues>({
        resolver: zodResolver(folderSchema),
        defaultValues: { name: '' },
    });

    // Removed fetchUsage as it's now handled by the layout and RTK Query tags
    /*
    const fetchUsage = useCallback(async () => {
        ...
    }, []);
    */

    useEffect(() => {
        // No-op for now as layout handles shared data
    }, [user]);

    const onFolderSubmit = async (values: FolderFormValues) => {
        try {
            await createFolder({ name: values.name, parentId: currentFolderId }).unwrap();
            toast.success('Folder created successfully');
            setIsFolderDialogOpen(false);
            folderForm.reset();
            // fetchUsage(); // Handled by RTK Query tags or layout level reload if needed
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to create folder');
        }
    };

    const onFileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return toast.error('Please select a file to upload');

        // Check file size against package limit
        const maxFileSizeMB = subscription?.package?.maxFileSizeMB || 5;
        const fileSizeMB = selectedFile.size / (1024 * 1024);

        if (fileSizeMB > maxFileSizeMB) {
            return toast.error(`File is too large. Your current plan (${subscription?.package?.name || 'Free'}) allows a maximum of ${maxFileSizeMB} MB per file.`);
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        console.log('[Upload] Current Folder ID:', currentFolderId);
        if (currentFolderId && currentFolderId !== 'null' && currentFolderId !== 'undefined') {
            formData.append('folderId', currentFolderId);
        }
        setIsUploading(true);
        try {
            const response = await uploadFile(formData).unwrap();
            console.log('[Upload] Response:', response);
            toast.success('File uploaded successfully');
            setIsFileDialogOpen(false);
            setSelectedFile(null);
            // fetchUsage(); // Handled by RTK Query tags or layout level reload if needed
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRename = async () => {
        if (!renameName) return toast.error('Name is required');
        try {
            if (renameType === 'folder') {
                await renameFolder({ id: itemToRename.id, name: renameName, parentId: currentFolderId }).unwrap();
            } else {
                await renameFile({ id: itemToRename.id, name: renameName, folderId: currentFolderId }).unwrap();
            }
            toast.success(`${renameType === 'folder' ? 'Folder' : 'File'} renamed successfully`);
            setIsRenameDialogOpen(false);
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to rename');
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            if (itemToDelete.type === 'folder') {
                await deleteFolder({ id: itemToDelete.id, parentId: currentFolderId }).unwrap();
            } else {
                await deleteFile({ id: itemToDelete.id, folderId: currentFolderId }).unwrap();
            }
            toast.success(`${itemToDelete.type === 'folder' ? 'Folder' : 'File'} deleted successfully`);
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
            // fetchUsage(); // Handled by RTK Query tags or layout level reload if needed
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to delete');
        }
    };

    if (authLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">Loading...</div>;
    if (!user) return null;

    return (
        <div className="p-8">
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 w-fit">
                <Home size={14} className="cursor-pointer hover:text-zinc-100" onClick={() => setCurrentFolderId(null)} />
                <ChevronRight size={14} />
                <span
                    className={`cursor-pointer transition-colors ${!currentFolderId ? 'text-zinc-100 font-bold' : 'hover:text-black'}`}
                    onClick={() => setCurrentFolderId(null)}
                >
                    My Files
                </span>
                {breadcrumbPath.map((folder: any, index: number) => (
                    <React.Fragment key={folder.id}>
                        <ChevronRight size={14} />
                        <span
                            className={`cursor-pointer transition-colors ${index === breadcrumbPath.length - 1 ? 'text-zinc-100 font-bold italic' : 'hover:text-black'}`}
                            onClick={() => setCurrentFolderId(folder.id)}
                        >
                            {folder.name}
                        </span>
                        {index === breadcrumbPath.length - 1 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setItemToRename(folder);
                                    setRenameType('folder');
                                    setRenameName(folder.name);
                                    setIsRenameDialogOpen(true);
                                }}
                            >
                                <Pencil size={12} />
                            </Button>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <header className="h-16 border-b border-zinc-800 flex flex-col md:flex-row gap-2 items-start justify-between px-0 mb-8 bg-transparent">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input
                            placeholder="Search your files..."
                            className="pl-10 bg-zinc-800 border-zinc-700 focus-visible:ring-zinc-600 w-full"
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-zinc-700 text-black  gap-2">
                                <Plus size={18} /> New Folder
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                            <DialogHeader>
                                <DialogTitle>Create Folder</DialogTitle>
                                <DialogDescription className="text-zinc-400">Enter a name for your new folder.</DialogDescription>
                            </DialogHeader>
                            <Form {...folderForm}>
                                <form onSubmit={folderForm.handleSubmit(onFolderSubmit)}>
                                    <FormField
                                        control={folderForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Folder Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="bg-zinc-800 border-zinc-700" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter className="mt-4">
                                        <Button type="button" variant="ghost" onClick={() => setIsFolderDialogOpen(false)} disabled={isCreatingFolder}>Cancel</Button>
                                        <Button type="submit" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" disabled={isCreatingFolder}>
                                            {isCreatingFolder ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isFileDialogOpen} onOpenChange={(open) => { setIsFileDialogOpen(open); if (!open) setSelectedFile(null); }}>
                        <DialogTrigger asChild>
                            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 gap-2 font-bold shadow-lg shadow-zinc-100/10">
                                <Upload size={18} /> Upload
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold tracking-tight">Upload File</DialogTitle>
                                <DialogDescription className="text-zinc-400">
                                    Select a file to upload to the current folder.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-4">
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        const file = e.dataTransfer.files[0];
                                        if (file) setSelectedFile(file);
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`
                                        relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer group
                                        ${isDragging
                                            ? 'border-zinc-100 bg-zinc-800/80 scale-[0.99]'
                                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50'
                                        }
                                    `}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />

                                    <div className={`
                                        w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110
                                        ${selectedFile ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'}
                                    `}>
                                        {selectedFile ? <Check size={28} /> : <Upload size={28} />}
                                    </div>

                                    <div className="text-center">
                                        {selectedFile ? (
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-zinc-100 truncate max-w-[240px]">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-zinc-100">Click to browse or drag & drop</p>
                                                <p className="text-xs text-zinc-500 italic">Support for all file types</p>
                                            </div>
                                        )}
                                    </div>

                                    {selectedFile && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                        >
                                            <Plus className="rotate-45" size={14} />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="mt-8 flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsFileDialogOpen(false)}
                                    className="flex-1 text-zinc-400 "
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={onFileSubmit}
                                    disabled={!selectedFile || isUploading}
                                    className={`flex-[2] font-bold transition-all ${selectedFile && !isUploading
                                        ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                        }`}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        'Start Upload'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
                {(filesLoading || foldersLoading || filesFetching || foldersFetching || pathFetching) ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                        <p className="text-zinc-500">Updating your files...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-zinc-900/80">
                            <TableRow>
                                <TableHead className="w-[400px] text-zinc-400">Name</TableHead>
                                <TableHead className="text-zinc-400">Type</TableHead>
                                <TableHead className="text-zinc-400">Size</TableHead>
                                <TableHead className="text-right text-zinc-400">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {folders.map((f: any) => (
                                <TableRow key={f.id} className="cursor-pointer border-zinc-800" onClick={() => setCurrentFolderId(f.id)}>
                                    <TableCell className="font-medium flex items-center gap-3 py-4">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                                            <Folder size={20} fill="currentColor" />
                                        </div>
                                        {f.name}
                                    </TableCell>
                                    <TableCell className="text-zinc-500">Folder</TableCell>
                                    <TableCell className="text-zinc-500">-</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setItemToRename(f);
                                                    setRenameType('folder');
                                                    setRenameName(f.name);
                                                    setIsRenameDialogOpen(true);
                                                }}>Rename</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-400" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setItemToDelete({ id: f.id, type: 'folder', name: f.name });
                                                    setIsDeleteDialogOpen(true);
                                                }}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {files.map((f: any) => (
                                <TableRow key={f.id} className="border-zinc-800 group">
                                    <TableCell className="font-medium flex items-center gap-3 py-4">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 overflow-hidden border border-zinc-700">
                                            {f.type === 'IMAGE' && f.url ? (
                                                <Image
                                                    src={f.url}
                                                    alt={f.name}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    unoptimized
                                                />
                                            ) : f.type === 'IMAGE' ? (
                                                <FileImage size={20} />
                                            ) : f.type === 'VIDEO' ? (
                                                <FileVideo size={20} className="text-purple-400" />
                                            ) : f.type === 'AUDIO' ? (
                                                <FileAudio size={20} className="text-amber-400" />
                                            ) : f.type === 'PDF' ? (
                                                <FileText size={20} className="text-red-400" />
                                            ) : (
                                                <File size={20} />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-zinc-100">{f.name}</span>
                                            {f.url && (
                                                <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors">
                                                    <ExternalLink size={10} /> View on Cloudinary
                                                </a>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-500">
                                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] uppercase font-bold tracking-wider border border-zinc-700">
                                            {f.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-500">{(f.size / (1024 * 1024)).toFixed(2)} MB</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                                {f.url && (
                                                    <DropdownMenuItem asChild>
                                                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="cursor-pointer flex items-center gap-2">
                                                            <ExternalLink size={14} /> Open Original
                                                        </a>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                                                    <a href={`https://backend-iota-inky-13.vercel.app/api/files/${f.id}/download?token=${typeof window !== 'undefined' ? encodeURIComponent(localStorage.getItem('token') || '') : ''}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer">Download</a>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setItemToRename(f);
                                                    setRenameType('file');
                                                    setRenameName(f.name);
                                                    setIsRenameDialogOpen(true);
                                                }}>Rename</DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-zinc-800" />
                                                <DropdownMenuItem className="text-red-400" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setItemToDelete({ id: f.id, type: 'file', name: f.name });
                                                    setIsDeleteDialogOpen(true);
                                                }}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {((folders.length === 0 && files.length === 0) && !filesFetching && !foldersFetching) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-96 text-center text-zinc-500 bg-zinc-900/20">
                                        <div className="flex flex-col items-center justify-center gap-4 py-12">
                                            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-2">
                                                <File size={40} className="text-zinc-600 opacity-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xl font-bold text-zinc-300">No content here yet</p>
                                                <p className="text-sm text-zinc-500 max-w-xs mx-auto">This folder is currently empty. Start by uploading a file or creating a new folder.</p>
                                            </div>
                                            <div className="flex gap-3 mt-4">
                                                <Button variant="outline" size="sm" onClick={() => setIsFolderDialogOpen(true)} className="border-zinc-800 text-black">
                                                    <Plus size={14} className="mr-2" /> New Folder
                                                </Button>
                                                <Button variant="secondary" size="sm" onClick={() => setIsFileDialogOpen(true)} className="bg-zinc-100 text-zinc-900">
                                                    <Upload size={14} className="mr-2" /> Upload File
                                                </Button>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <DialogHeader>
                        <DialogTitle>Rename {renameType === 'folder' ? 'Folder' : 'File'}</DialogTitle>
                        <DialogDescription className="text-zinc-400">Enter the new name for this {renameType === 'folder' ? 'folder' : 'file'}.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={renameName}
                            onChange={(e) => setRenameName(e.target.value)}
                            className="bg-zinc-800 border-zinc-700"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleRename} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            This action cannot be undone. This will permanently delete the {itemToDelete?.type} <strong>{itemToDelete?.name}</strong> and remove all associated data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                        >
                            Yes, Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toaster />
        </div>
    );
}
