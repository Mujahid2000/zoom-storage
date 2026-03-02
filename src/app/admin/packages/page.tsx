'use client'
import React, { useState } from 'react';
import { Package, useGetPackagesQuery } from '@/lib/api/packagesApiSlice';
import { useCreatePackageMutation } from '@/lib/api/adminApiSlice';
import { Plus, Pencil, Trash2, Database, Loader2 } from 'lucide-react';
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
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const packageSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    maxFolders: z.coerce.number().min(1),
    maxNestingLevel: z.coerce.number().min(0),
    maxFileSizeMB: z.coerce.number().min(1),
    totalFileLimit: z.coerce.number().min(1),
    totalStorageMB: z.coerce.number().min(1).default(1024),
    filesPerFolder: z.coerce.number().min(1).default(100),
    allowedFileTypes: z.array(z.string()).default(["IMAGE", "VIDEO", "PDF", "AUDIO"]),
});

type PackageFormValues = z.infer<typeof packageSchema>;

export default function PackagesManagement() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data: packages = [], isLoading: packagesLoading } = useGetPackagesQuery();
    const [createPackage, { isLoading: isCreatingPackage }] = useCreatePackageMutation();

    const form = useForm<PackageFormValues>({
        resolver: zodResolver(packageSchema) as unknown as Resolver<PackageFormValues>,
        defaultValues: {
            name: '',
            maxFolders: 10,
            maxNestingLevel: 3,
            maxFileSizeMB: 5,
            totalFileLimit: 50,
            totalStorageMB: 1024,
            filesPerFolder: 20,
            allowedFileTypes: ["IMAGE", "VIDEO", "PDF", "AUDIO"],
        } as PackageFormValues,
    });

    const onSubmit: SubmitHandler<PackageFormValues> = async (values) => {
        try {
            await createPackage(values).unwrap();
            toast.success('Package created successfully');
            setIsDialogOpen(false);
            form.reset();
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error.data?.message || 'Failed to create package');
        }
    };

    return (
        <div>
            <header className="flex justify-between items-center mb-10 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight capitalize">
                        Packages Management
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Configure and manage your service packages
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold gap-2">
                            <Plus size={18} /> Create Package
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg overflow-y-auto max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>New Package</DialogTitle>
                            <DialogDescription className="text-zinc-400">Define limits and name for the new tier.</DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Gold" {...field} className="bg-zinc-800 border-zinc-700" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="maxFolders"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Folders</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="maxNestingLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Nesting</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="maxFileSizeMB"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max File Size (MB)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="totalStorageMB"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Storage (MB)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="totalFileLimit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total File Limit</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="filesPerFolder"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Files Per Folder</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter className="col-span-2 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isCreatingPackage} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                                        {isCreatingPackage ? <Loader2 className="animate-spin mr-2" /> : null}
                                        Save Package
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
                {packagesLoading ? (
                    <div className="h-60 flex items-center justify-center italic text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">Loading data...</div>
                ) : (
                    <Table>
                        <TableHeader className="bg-zinc-900 text-zinc-400 uppercase text-[10px] font-bold tracking-widest">
                            <TableRow className="border-zinc-800">
                                <TableHead className='text-zinc-100'>Tier Name</TableHead>
                                <TableHead className='text-zinc-100'>Folders/Nesting</TableHead>
                                <TableHead className='text-zinc-100'>Storage/File</TableHead>
                                <TableHead className='text-zinc-100'>File Limits</TableHead>
                                <TableHead className="text-right text-zinc-100">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages.map((pkg: Package) => (
                                <TableRow key={pkg.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                    <TableCell className="font-bold text-lg py-6">{pkg.name}</TableCell>
                                    <TableCell className="text-zinc-400">
                                        <div className="flex flex-col">
                                            <span>Max: {pkg.maxFolders}</span>
                                            <span className="text-[10px] text-zinc-500 uppercase">Nesting: {pkg.maxNestingLevel}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">
                                        <div className="flex flex-col">
                                            <span>Total: {pkg.totalStorageMB} MB</span>
                                            <span className="text-[10px] text-zinc-500 uppercase">Per File: {pkg.maxFileSizeMB} MB</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">
                                        <div className="flex flex-col">
                                            <span>Limit: {pkg.totalFileLimit}</span>
                                            <span className="text-[10px] text-zinc-500 uppercase">Per Folder: {pkg.filesPerFolder}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                                                <Pencil size={16} />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-red-400">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {packages.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-zinc-500 italic">No packages defined</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
