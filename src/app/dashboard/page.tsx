/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Link from 'next/link';
import {
    Folder, File, Plus, Upload, MoreVertical, LogOut, LayoutDashboard, CreditCard, Settings, ChevronRight, Home, Search, FileImage, FileVideo, FileAudio, FileText, ExternalLink,
    History as HistoryIcon,
    Check,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { toast } from 'sonner';

const folderSchema = z.object({
    name: z.string().min(1, "Folder name is required"),
});

type FolderFormValues = z.infer<typeof folderSchema>;

export default function UserDashboard() {
    const [folders, setFolders] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [usage, setUsage] = useState<any>(null);
    const [breadcrumbPath, setBreadcrumbPath] = useState<any[]>([]);
    const { user, logout, loading: authLoading } = useAuth();
    const [isUploading, setIsUploading] = useState(false);

    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [itemToRename, setItemToRename] = useState<any>(null);
    const [renameType, setRenameType] = useState<'folder' | 'file'>('folder');
    const [renameName, setRenameName] = useState('');

    const folderForm = useForm<FolderFormValues>({
        resolver: zodResolver(folderSchema),
        defaultValues: { name: '' },
    });

    const fetchData = useCallback(async () => {
        try {
            const foldersRes = await api.get(`/folders?parentId=${currentFolderId || ''}`);
            const filesRes = await api.get(`/files?folderId=${currentFolderId || ''}`);
            setFolders(foldersRes.data);
            setFiles(filesRes.data);

            if (currentFolderId) {
                const pathRes = await api.get(`/folders/${currentFolderId}/path`);
                setBreadcrumbPath(pathRes.data);
            } else {
                setBreadcrumbPath([]);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch data');
        }
    }, [currentFolderId]);

    const fetchUsage = useCallback(async () => {
        try {
            const { data } = await api.get('/user/usage');
            setUsage(data);
            setSubscription(data.package);
        } catch (err) {
            console.error("Fetch usage error:", err);
        }
    }, []);

    useEffect(() => {
        if (user) {
            // Use queueMicrotask to avoid synchronous setState during mount/effect
            // This prevents the "cascading renders" warning in React 19+
            queueMicrotask(() => {
                fetchData();
                fetchUsage();
            });
        }
    }, [user, fetchData, fetchUsage]);

    const onFolderSubmit = async (values: FolderFormValues) => {
        try {
            await api.post('/folders', { name: values.name, parentId: currentFolderId });
            toast.success('Folder created successfully');
            setIsFolderDialogOpen(false);
            folderForm.reset();
            fetchData();
            fetchUsage();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to create folder');
        }
    };

    const onFileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return toast.error('Please select a file to upload');

        const formData = new FormData();
        formData.append('file', selectedFile);
        if (currentFolderId) formData.append('folderId', currentFolderId);
        setIsUploading(true);
        try {
            await api.post('/files', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('File uploaded successfully');
            setIsFileDialogOpen(false);
            setSelectedFile(null);
            fetchData();
            fetchUsage();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRename = async () => {
        if (!renameName) return toast.error('Name is required');
        try {
            const endpoint = renameType === 'folder' ? `/folders/${itemToRename.id}` : `/files/${itemToRename.id}`;
            await api.put(endpoint, { name: renameName });
            toast.success(`${renameType === 'folder' ? 'Folder' : 'File'} renamed successfully`);
            setIsRenameDialogOpen(false);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to rename');
        }
    };

    const handleDelete = async (id: string, type: 'folder' | 'file') => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            const endpoint = type === 'folder' ? `/folders/${id}` : `/files/${id}`;
            await api.delete(endpoint);
            toast.success(`${type === 'folder' ? 'Folder' : 'File'} deleted successfully`);
            fetchData();
            fetchUsage();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to delete');
        }
    };

    if (authLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col hidden md:flex">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="bg-zinc-100 text-zinc-900 p-1.5 rounded">
                        <LayoutDashboard size={20} />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">SaaS Cloud</h2>
                </div>

                <nav className="flex-1 space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-3 bg-zinc-800 text-zinc-100">
                        <Folder size={18} /> My Files
                    </Button>
                    <Link href="/dashboard/plans">
                        <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:text-black">
                            <CreditCard size={18} /> Plans & Billing
                        </Button>
                    </Link>
                    <Link href="/dashboard/history">
                        <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:text-black">
                            <HistoryIcon size={18} /> Billing History
                        </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:text-black">
                        <Settings size={18} /> Settings
                    </Button>
                </nav>

                <div className="mt-auto space-y-4">
                    <Card className="bg-zinc-800 border-zinc-700">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Current Plan</CardTitle>
                            <CardDescription className="text-sm font-bold text-zinc-100 mt-1">
                                {subscription?.name || 'Free Tier'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="h-1.5 w-full bg-zinc-700 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-zinc-100 transition-all duration-500" style={{ width: `${usage?.usage?.storagePercent || 0}%` }}></div>
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-2">
                                Using {usage?.usage?.storageMB || 0} MB of {subscription?.totalStorageMB || 1024} MB
                            </p>
                            <Link href="/dashboard/plans">
                                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-zinc-300 mt-2 hover:text-zinc-100">Upgrade Plan</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Button onClick={logout} variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-950/20">
                        <LogOut size={18} /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-auto">
                <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md">
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
                                            <Button type="button" variant="ghost" onClick={() => setIsFolderDialogOpen(false)}>Cancel</Button>
                                            <Button type="submit" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Create</Button>
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
                        {breadcrumbPath.map((folder, index) => (
                            <React.Fragment key={folder.id}>
                                <ChevronRight size={14} />
                                <span
                                    className={`cursor-pointer transition-colors ${index === breadcrumbPath.length - 1 ? 'text-zinc-100 font-bold italic' : 'hover:text-black'}`}
                                    onClick={() => setCurrentFolderId(folder.id)}
                                >
                                    {folder.name}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
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
                                {folders.map((f) => (
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
                                                    <DropdownMenuItem onClick={() => {
                                                        setItemToRename(f);
                                                        setRenameType('folder');
                                                        setRenameName(f.name);
                                                        setIsRenameDialogOpen(true);
                                                    }}>Rename</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-400" onClick={() => handleDelete(f.id, 'folder')}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {files.map((f) => (
                                    <TableRow key={f.id} className="border-zinc-800 group">
                                        <TableCell className="font-medium flex items-center gap-3 py-4">
                                            <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 overflow-hidden border border-zinc-700">
                                                {f.type === 'IMAGE' && f.url ? (
                                                    <img src={f.url} alt={f.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
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
                                                    <DropdownMenuItem asChild>
                                                        <a href={`https://zoom-storage-server-1.onrender.com/api/files/${f.id}/download?token=${typeof window !== 'undefined' ? encodeURIComponent(localStorage.getItem('token') || '') : ''}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer">Download</a>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={() => {
                                                        setItemToRename(f);
                                                        setRenameType('file');
                                                        setRenameName(f.name);
                                                        setIsRenameDialogOpen(true);
                                                    }}>Rename</DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                    <DropdownMenuItem className="text-red-400" onClick={() => handleDelete(f.id, 'file')}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {folders.length === 0 && files.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-64 text-center text-zinc-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <File size={40} className="mb-2 opacity-20" />
                                                <p className="text-lg font-medium text-zinc-400">No files found</p>
                                                <p className="text-sm">This folder is empty. Upload or create something new.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
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
            </main>
        </div>
    );
}
