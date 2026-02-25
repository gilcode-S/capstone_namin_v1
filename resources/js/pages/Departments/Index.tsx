import { Head, router, usePage } from '@inertiajs/react'
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react'

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout'



interface Department {
    id: number
    department_code: string
    department_name: string
}

const emptyForms = { department_code: "", department_name: "" };

const Index = () => {
    const { departments } = usePage().props as unknown as { departments: Department[] }
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState(emptyForms);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // functions
    const handleOpen = () => {
        setForm(emptyForms);
        setOpen(true);
        setIsEdit(false);
        setEditId(null);
    }

    const handleClose = () => {
        setForm(emptyForms);
        setOpen(false);
        setIsEdit(false);
        setEditId(null);
    }

    const handleOpenEdit = (departments: Department) => {
        setForm({
            department_code: departments.department_code,
            department_name: departments.department_name
        });

        setOpen(true);
        setIsEdit(true);
        setEditId(departments.id);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form, [e.target.name]: e.target.value
        });
    }
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (isEdit && editId) {
            router.put(`/department/${editId}`, form, {
                onSuccess: () => {
                    setLoading(false);
                    handleClose();
                },
                onError: () => {
                    setLoading(false);
                }
            });
        } else {
            router.post('/department', form, {
                onSuccess: () => {
                    setLoading(false);
                    handleClose();
                },
                onError: () => {
                    setLoading(false);
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this department?")) return;
    
        router.delete(`/department/${id}`, {
            onSuccess: () => {
                // optional: toast later
            }
        });
    };


    return (
        <AppLayout breadcrumbs={[{ title: "Departments", href: '/department' }]}>
            <Head title="Departments" />

            <div className="p-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <Building2 className='mr-2 text-blue-500' size={32} />
                        <h1 className='text-2xl font-bold'>Manage Department</h1>
                    </div>
                    <Button onClick={handleOpen} className='gap-2'>
                        <Plus size={18} />
                        Add Department
                    </Button>
                </div>

                {/* tables */}
                <div className="overflow-x-auto rounded-lg shadow border dark:border-gray-700">
                    <table className='min-w-full bg-white dark:bg-gray-800'>
                        <thead>
                            <tr className='bg-gray-100 dark:bg-gray-800'>
                                <th className='px-4 text-left'>Department_code</th>
                                <th className='px-4 text-left'>Department_name</th>
                                <th className='px-4 text-center'>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {departments && departments.length > 0 ? departments.map((department) => (
                                <tr key={department.id} className='border-t dark:border-gray-700'>
                                    <td className='px-4 py-2 font-medium'>{department.department_code}</td>
                                    <td className='px-4 py-2 font-medium'>{department.department_name}</td>
                                    <td className='px-4 py-2 text-center'>
                                        <Button size={'sm'} variant={'outline'} className='mr-2' title='Edit' onClick={() => handleOpenEdit(department)}>
                                            <Pencil size={18} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            title="Delete"
                                            onClick={() => handleDelete(department.id)}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className='px-4 py-5 text-center text-gray-500 dark:text-gray-400'>No Departments Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>


                {/* modal dialog/compent/@ design */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEdit ? "Edit Department" : "Add Departments"}</DialogTitle>
                        </DialogHeader>

                        {/* form */}
                        <form onSubmit={handleSubmit}>
                            <div>
                                <Label>Department Code: </Label>
                                <Input type='text' name='department_code' value={form.department_code} onChange={handleChange} required />
                            </div>

                            <div className='mt-5 mb-5'>
                                <Label>Department Name: </Label>
                                <Input type='text' name='department_name' value={form.department_name} onChange={handleChange} required />
                            </div>

                            <DialogFooter>
                                <Button type='button' variant={'outline'} onClick={handleClose} disabled={loading}>Cancel</Button>
                                <Button type='submit'>{loading ? (isEdit ? "saving. . ." : "Adding") : (isEdit ? "Save Changes" : 'Add Department')}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    )
}

export default Index