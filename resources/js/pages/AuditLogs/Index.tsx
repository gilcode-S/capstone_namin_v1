import React from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';


const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'AuditLogs',
        href: '/audit-logs',
    },
];
export default function AuditLogIndex({ logs,
    filters,
    modules }) {

    // Handle dynamic filtering
    const handleFilterChange = (key, value) => {
        router.get('/audit-logs', { ...filters, [key]: value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs Dashboard" />
            <div className="max-w-7xl p-2 font-sans">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Schedule Audit Log</h1>
                    <p className="text-sm text-gray-500">Track and monitor all the system activities and user action</p>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <span className="block text-xs font-semibold text-gray-500 mb-1">Filters</span>
                        <input
                            type="text"
                            placeholder="Search User"
                            defaultValue={filters.search}
                            onBlur={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    <div className="w-full md:w-48 mt-5">
                        <select
                            value={filters.role || 'All User'}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-gray-200 cursor-pointer"
                        >
                            <option value="All User">All User</option>

                            <option value="super admin">
                                Super Admin
                            </option>

                            <option value="hr">
                                HR
                            </option>

                            <option value="registrar">
                                Registrar
                            </option>

                            <option value="staff">
                                Staff
                            </option>
                        </select>
                    </div>

                    <div className="w-full md:w-48 mt-5">
                        <select
                            value={filters.module || 'All Module'}
                            onChange={(e) =>
                                handleFilterChange('module', e.target.value)
                            }
                            className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm"
                        >
                            <option value="All Module">
                                All Module
                            </option>

                            {modules.map((module) => (
                                <option key={module} value={module}>
                                    {module}
                                </option>

                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-48 mt-5">
                        <select
                            value={filters.time || 'All Time'}
                            onChange={(e) =>
                                handleFilterChange('time', e.target.value)
                            }
                            className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-gray-200 cursor-pointer"
                        >
                            <option>All Time</option>
                            <option>Today</option>
                            <option>This Week</option>
                            <option>This Month</option>
                        </select>
                    </div>
                </div>

                {/* Audit Logs Table Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-900">Audit Logs</h2>
                        <p className="text-sm text-gray-500">Overview of all user action logs</p>
                    </div>

                    <div className="overflow-x-auto p-6">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="text-gray-500 border-b">
                                    <th className="pb-4 font-semibold">Timestamp</th>
                                    <th className="pb-4 font-semibold">User</th>
                                    <th className="pb-4 font-semibold">Role</th>
                                    <th className="pb-4 font-semibold">Action</th>
                                    <th className="pb-4 font-semibold">Module</th>
                                    <th className="pb-4 font-semibold">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.data && logs.data.length > 0 ? (
                                    logs.data.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 text-gray-700">
                                                {new Date(log.created_at).toLocaleDateString('en-US')} {''}
                                                {new Date(log.created_at).toLocaleTimeString('en-US')}
                                            </td>
                                            <td className="py-4 text-gray-900 font-medium">{log.user_name}</td>
                                            <td className="py-4 text-gray-600">{log.role}</td>
                                            <td className="py-4 text-gray-600">{log.action}</td>
                                            <td className="py-4 text-gray-600">{log.module}</td>
                                            <td className="py-4 text-gray-600">{log.description}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-400">
                                            No audit logs found matching the current filters.
                                        </td>
                                    </tr>
                                )}

                                {/* Empty rows to mimic the mockup's structural lines if data is sparse */}
                                {(!logs.data || logs.data.length < 4) && [...Array(4 - (logs.data?.length || 0))].map((_, i) => (
                                    <tr key={`empty-${i}`}>
                                        <td className="py-6"></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}