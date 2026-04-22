import React, { useEffect, useState } from "react";
import { router, Head } from "@inertiajs/react";
import AppLayout from '@/layouts/app-layout'


type Log = {
    id: string;
    created_at: string;
    user_name: string;
    role: string;
    action: string;
    module: string;
    description: string;
    is_restorable: boolean;
};

type Props = {
    logs: {
        data: Log[];
    };
    filters: {
        user?: string;
        role?: string;
        module?: string;
    };
    roles: string[];
};

export default function Index({ logs, filters, roles }: Props) {
    const handleFilter = (key: string, value: string) => {
        router.get(
            "/audit-logs",
            {
                ...filters,
                [key]: value,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };
    const [search, setSearch] = useState(filters.user || "");

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get("/audit-logs", {
                ...filters,
                user: search,
            }, { preserveState: true, replace: true });
        }, 500);

        return () => clearTimeout(delay);
    }, [search]);

    const isLatest = (id: string) => logs.data[0]?.id === id;

    return (
        <AppLayout
            breadcrumbs={[
                { title: "System", href: "#" },
                { title: "Audit Logs", href: "/audit-logs" },
            ]}
        >
            <Head title="Audit Logs" />

            <div className="p-6 space-y-6">
                {/* HEADER */}
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">
                        Audit Logs
                    </h1>
                    <p className="text-sm text-gray-500">
                        Track and monitor all system activities and user actions
                    </p>
                </div>

                {/* FILTERS */}
                <div className="bg-white border rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-600 mb-3">Filters</p>

                    <div className="flex flex-wrap gap-3">
                        {/* Search User */}
                        <input
                            type="text"
                            placeholder="Search User"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
                        />

                        {/* Role */}
                        <select
                            value={filters.role || ""}
                            onChange={(e) => handleFilter("role", e.target.value)}
                            className="px-3 py-2 border rounded-lg bg-gray-50"
                        >
                            <option value="">All Roles</option>

                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>

                        {/* Module */}
                        <select
                            defaultValue={filters.module || ""}
                            onChange={(e) => handleFilter("module", e.target.value)}
                            className="px-3 py-2 border rounded-lg bg-gray-50"
                        >
                            <option value="">All Modules</option>
                            <option value="Scheduler">Scheduler</option>
                            <option value="Users">Users</option>
                        </select>

                        {/* Time (placeholder) */}
                        <select className="px-3 py-2 border rounded-lg bg-gray-50">
                            <option>All Time</option>
                        </select>
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white border rounded-xl p-4">
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold text-gray-700">
                            Audit Log Records
                        </h2>
                        <p className="text-xs text-gray-400">
                            Overview of all recorded system actions
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-gray-500 border-b">
                                <tr>
                                    <th className="py-2">Timestamp</th>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                    <th>Module</th>
                                    <th>Description</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-6 text-gray-400">
                                            No logs found
                                        </td>
                                    </tr>
                                )}

                                {logs.data.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >
                                        <td className="py-2 text-gray-600">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td>{log.user_name}</td>
                                        <td>{log.role}</td>

                                        <td>
                                            <span className="px-2 py-1 text-xs rounded bg-gray-100 border">
                                                {log.action}
                                            </span>
                                        </td>

                                        <td>{log.module}</td>

                                        <td className="text-gray-600">
                                            {log.description}
                                        </td>

                                        <td>
                                            <button
                                                disabled={!log.is_restorable || isLatest(log.id)}
                                                onClick={() =>
                                                    router.post(`/audit-logs/${log.id}/restore`)
                                                }
                                                className={`px-2 py-1 text-xs rounded border transition
                          ${!log.is_restorable || isLatest(log.id)
                                                        ? "text-gray-300 border-gray-200 cursor-not-allowed"
                                                        : "text-gray-700 border-gray-300 hover:bg-gray-100"
                                                    }`}
                                            >
                                                Restore
                                            </button>
                                        </td>
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