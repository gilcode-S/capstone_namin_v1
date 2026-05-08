import React from 'react';
import { useForm, router } from '@inertiajs/react';

export default function UserManagement({ users, flash, errors }) {
    
    const { data, setData, post, processing, reset, errors: formErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'Registrar' // Default selection
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/users', {
            onSuccess: () => reset('name', 'email', 'password'),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to revoke this user\'s access and delete their account?')) {
            router.delete(`/users/${id}`);
        }
    };

    // Helper to style role badges based on your specific RBAC rules
    const getRoleBadgeStyle = (role) => {
        switch(role) {
            case 'Super Admin': return 'bg-red-100 text-red-800 border-red-200';
            case 'HR': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Registrar': return 'bg-green-100 text-green-800 border-green-200';
            case 'Scheduler': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 font-sans">
            <h1 className="text-2xl font-bold mb-2 text-gray-900">System Access & Roles</h1>
            <p className="text-sm text-gray-500 mb-6">Manage administrative accounts and assign module permissions.</p>

            {flash?.success && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 font-semibold">{flash.success}</div>}
            {errors?.error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 font-semibold">{errors.error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Add User Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 h-fit">
                    <h2 className="text-lg font-bold mb-4 text-gray-900">Create New Staff Account</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                required 
                                className="w-full bg-gray-50 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-black" 
                                placeholder="e.g., John Doe" 
                            />
                            {formErrors.name && <span className="text-red-500 text-xs mt-1">{formErrors.name}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <input 
                                type="email" 
                                value={data.email} 
                                onChange={e => setData('email', e.target.value)} 
                                required 
                                className="w-full bg-gray-50 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-black" 
                                placeholder="name@school.edu" 
                            />
                            {formErrors.email && <span className="text-red-500 text-xs mt-1">{formErrors.email}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Temporary Password</label>
                            <input 
                                type="text" 
                                value={data.password} 
                                onChange={e => setData('password', e.target.value)} 
                                required 
                                minLength="8"
                                className="w-full bg-gray-50 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-black" 
                                placeholder="Minimum 8 characters" 
                            />
                            {formErrors.password && <span className="text-red-500 text-xs mt-1">{formErrors.password}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">System Role</label>
                            <select 
                                value={data.role} 
                                onChange={e => setData('role', e.target.value)} 
                                className="w-full bg-gray-50 border-none rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-black cursor-pointer"
                            >
                                <option value="Registrar">Registrar (Curriculum & Subjects)</option>
                                <option value="HR">HR (Faculty Profiles)</option>
                                <option value="Scheduler">Scheduler (Rooms & Generation)</option>
                                <option value="Super Admin">Super Admin (Unrestricted Access)</option>
                            </select>
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing} 
                            className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition mt-2 shadow-sm"
                        >
                            {processing ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* User List Table */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h2 className="text-lg font-bold mb-4 text-gray-900">Active Staff Directory</h2>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="text-gray-500 border-b border-gray-100">
                                    <th className="pb-3 font-semibold">Staff Member</th>
                                    <th className="pb-3 font-semibold">Assigned Role</th>
                                    <th className="pb-3 font-semibold">Date Added</th>
                                    <th className="pb-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4">
                                            <div className="font-bold text-gray-900">{user.name}</div>
                                            <div className="text-gray-500 text-xs">{user.email}</div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 border rounded-full text-xs font-bold ${getRoleBadgeStyle(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 text-gray-600">
                                            {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(user.id)} 
                                                className="text-red-500 hover:text-red-700 font-bold text-sm px-2 py-1 rounded hover:bg-red-50 transition"
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
    );
}