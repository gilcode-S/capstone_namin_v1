import React from 'react';
import { useForm, router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Users',
        href: '/users',
    },
];

export default function UserManagement({ users, flash, errors }) {
    const {
        data,
        setData,
        post,
        processing,
        reset,
        errors: formErrors,
    } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'Registrar', // Default selection
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/users', {
            onSuccess: () => reset('name', 'email', 'password'),
        });
    };

    const handleDelete = (id) => {
        if (
            confirm(
                "Are you sure you want to revoke this user's access and delete their account?",
            )
        ) {
            router.delete(`/users/${id}`);
        }
    };

    // Helper to style role badges based on your specific RBAC rules
    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'Super Admin':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'HR':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Registrar':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Scheduler':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Dashboard" />
            <div className="max-w-7xl p-2 font-sans">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                    System Access & Roles
                </h1>
                <p className="mb-6 text-sm text-gray-500">
                    Manage administrative accounts and assign module
                    permissions.
                </p>

                {flash?.success && (
                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 font-semibold text-green-700">
                        {flash.success}
                    </div>
                )}
                {errors?.error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
                        {errors.error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Add User Form */}
                    <div className="h-fit rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">
                            Create New Staff Account
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border-none bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-black"
                                    placeholder="e.g., John Doe"
                                />
                                {formErrors.name && (
                                    <span className="mt-1 text-xs text-red-500">
                                        {formErrors.name}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border-none bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-black"
                                    placeholder="name@school.edu"
                                />
                                {formErrors.email && (
                                    <span className="mt-1 text-xs text-red-500">
                                        {formErrors.email}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">
                                    Temporary Password
                                </label>
                                <input
                                    type="text"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required
                                    minLength="8"
                                    className="w-full rounded-lg border-none bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-black"
                                    placeholder="Minimum 8 characters"
                                />
                                {formErrors.password && (
                                    <span className="mt-1 text-xs text-red-500">
                                        {formErrors.password}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">
                                    System Role
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) =>
                                        setData('role', e.target.value)
                                    }
                                    className="w-full cursor-pointer rounded-lg border-none bg-gray-50 p-3 text-sm font-medium focus:ring-2 focus:ring-black"
                                >
                                    <option value="registrar">
                                        Registrar (Curriculum & Subjects)
                                    </option>
                                    <option value="hr">
                                        HR (Faculty Profiles)
                                    </option>
                                    <option value="staff">
                                        Scheduler (Rooms & Generation)
                                    </option>
                                    <option value="super admin">
                                        Super Admin (Unrestricted Access)
                                    </option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 w-full rounded-lg bg-black px-4 py-3 font-bold text-white shadow-sm transition hover:bg-gray-800"
                            >
                                {processing ? 'Creating...' : 'Create Account'}
                            </button>
                        </form>
                    </div>

                    {/* User List Table */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">
                            Active Staff Directory
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500">
                                        <th className="pb-3 font-semibold">
                                            Staff Member
                                        </th>
                                        <th className="pb-3 font-semibold">
                                            Assigned Role
                                        </th>
                                        <th className="pb-3 font-semibold">
                                            Date Added
                                        </th>
                                        <th className="pb-3 text-right font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="transition-colors hover:bg-gray-50"
                                        >
                                            <td className="py-4">
                                                <div className="font-bold text-gray-900">
                                                    {user.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-bold ${getRoleBadgeStyle(user.role)}`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-4 text-gray-600">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="py-4 text-right">
                                                <button
                                                    onClick={() =>
                                                        handleDelete(user.id)
                                                    }
                                                    className="rounded px-2 py-1 text-sm font-bold text-red-500 transition hover:bg-red-50 hover:text-red-700"
                                                >
                                                    Revoke Access
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
