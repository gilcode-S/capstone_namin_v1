import { Head, usePage, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { AlertTriangle, Check, X, Zap } from 'lucide-react'
import { useState } from 'react'

export default function Conflicts() {

    const { conflicts, resolved, stats, versionId } = usePage<any>().props
    const [tab, setTab] = useState<'unresolved' | 'resolved' | 'analysis'>('unresolved')

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Scheduling", href: "#" },
                { title: "Conflict Detection", href: "/conflicts" }
            ]}
        >
            <Head title="Conflict Detection" />

            {/* FULL PAGE WRAPPER */}
            <div className="p-6 space-y-6 bg-white">

                {/* ================= HEADER ================= */}
                <div className="flex justify-between items-start">

                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-500" size={28} />

                        <div>
                            <h1 className="text-xl font-semibold">
                                Conflict Detection
                            </h1>
                            <p className="text-sm text-gray-500">
                                Detect and resolve scheduling conflicts
                            </p>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.post(`/conflicts/${versionId}/scan`)}
                            className="px-4 py-2 text-sm bg-black text-white rounded-lg"
                        >
                            Scan Conflicts
                        </button>

                        <button
                            onClick={() => {
                                if (confirm("Auto resolve all conflicts?")) {
                                    router.post(`/conflicts/${versionId}/auto-resolve`)
                                }
                            }}
                            className="px-4 py-2 text-sm border rounded-lg"
                        >
                            Auto Resolve
                        </button>
                    </div>

                </div>

                {/* ================= STATS ================= */}
                <div className="grid grid-cols-3 gap-4">

                    <div className="border rounded-xl p-4">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>

                 

                    <div className="border rounded-xl p-4">
                        <p className="text-sm text-gray-500">Resolved</p>
                        <p className="text-2xl font-bold text-green-600">
                            {stats.resolved}
                        </p>
                    </div>

                </div>

                {/* ================= FULL WIDTH TAB BAR ================= */}
                <div className="w-full border rounded-xl p-1 flex bg-gray-50">

                    {['unresolved', 'resolved', 'analysis'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t as any)}
                            className={`flex-1 py-2 text-sm rounded-lg transition ${
                                tab === t
                                    ? 'bg-white shadow'
                                    : 'text-gray-500'
                            }`}
                        >
                            {t.toUpperCase()}
                        </button>
                    ))}

                </div>

                {/* ================= CONTENT AREA ================= */}
                <div className="border rounded-xl bg-white">

                    {/* ---------------- UNRESOLVED ---------------- */}
                    {tab === 'unresolved' && (
    <div className="p-5">

        {/* SECTION TITLE */}
        <div className="mb-4">
            <h2 className="font-semibold">Active Conflicts</h2>
            <p className="text-sm text-gray-500">
                Conflicts that require resolution for optimal scheduling
            </p>
        </div>

        {/* TABLE */}
        <div className="border rounded-xl overflow-hidden">

            {/* HEADER */}
            <div className="grid grid-cols-5 bg-gray-50 text-sm font-medium text-gray-600 p-3">
                <div>Type</div>
                <div>Conflict</div>
                <div>Timeslot</div>
                <div>Details</div>
                <div className="text-right">Actions</div>
            </div>

            {/* ROWS */}
            <div className="divide-y">

                {conflicts.map((conflict: any, i: number) => {

                    const first = conflict.items[0]

                    return (
                        <div key={i} className="grid grid-cols-5 p-3 items-center text-sm">

                            {/* TYPE */}
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={14} className="text-red-500" />
                                <span className="font-medium">
                                    {conflict.type}
                                </span>
                            </div>

                            {/* CONFLICT DESCRIPTION */}
                            <div className="text-gray-600">
                                {conflict.items.length} schedules affected
                            </div>

                            {/* TIMESLOT */}
                            <div className="text-gray-600">
                                {first.timeslot.day_of_week}{" "}
                                {first.timeslot.start_time} -{" "}
                                {first.timeslot.end_time}
                            </div>

                            {/* DETAILS */}
                            <div className="text-gray-500">
                                {first.assignment.subject.subject_code} /{" "}
                                {first.assignment.section.section_name}
                            </div>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-2">

                                <button
                                    onClick={() =>
                                        router.post(
                                            `/conflicts/${versionId}/resolve`,
                                            {
                                                type: conflict.type
                                            }
                                        )
                                    }
                                    className="px-2 py-1 text-xs border rounded hover:bg-green-50 text-green-600"
                                >
                                    Resolve
                                </button>

                                <button className="px-2 py-1 text-xs border rounded hover:bg-red-50 text-red-500">
                                    Ignore
                                </button>

                            </div>

                        </div>
                    )

                })}

            </div>

        </div>

    </div>
)}

                    {/* ---------------- RESOLVED ---------------- */}
                    {tab === 'resolved' && (
    <div className="space-y-4">

        {/* 🔴 CRITICAL / EMPTY STATE MESSAGE */}
        {/* {resolved.length === 0 && (
            <div className="border border-gray-200 bg-white p-6 rounded-xl text-gray-500">
                No resolved conflicts yet
            </div>
        )} */}

        {resolved.length === 0 && (
            <>
                {/* 🔔 CRITICAL MESSAGE (KEEP THIS) */}
                <div className="border border-green-200 bg-green-50 text-green-700 p-4 rounded-xl">
                    <div className="flex items-center gap-2 font-semibold">
                        ✓ Resolved Conflicts Overview
                    </div>
                    <p className="text-sm mt-1">
                        Previously resolved scheduling conflicts and applied solutions.
                    </p>
                </div>

                {/* 📊 TABLE */}
                <div className="border rounded-xl overflow-hidden bg-white">

                    {/* TABLE HEADER */}
                    <table className="w-full text-sm">

                        <thead className="bg-gray-50 text-gray-600 text-left">
                            <tr>
                                <th className="p-3 font-medium">Type</th>
                                <th className="p-3 font-medium">Conflict</th>
                                <th className="p-3 font-medium">Solution Applied</th>
                                <th className="p-3 font-medium text-right">Status</th>
                            </tr>
                        </thead>

                        {/* TABLE BODY */}
                        <tbody className="divide-y">

                            {resolved.map((r: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-50 transition">

                                    {/* TYPE */}
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-500">⚠</span>
                                            <span className="font-medium">
                                                {r.type}
                                            </span>
                                        </div>
                                    </td>

                                    {/* CONFLICT */}
                                    <td className="p-3 text-gray-500">
                                        {r.description || "Preferred time conflict"}
                                    </td>

                                    {/* SOLUTION */}
                                    <td className="p-3 text-gray-600">
                                        {r.solution || "Moved to available timeslot"}
                                    </td>

                                    {/* STATUS */}
                                    <td className="p-3 text-right">
                                        <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                                            ✓ Resolved
                                        </span>
                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>

                </div>
            </>
        )}

    </div>
)}

                    {/* ---------------- ANALYSIS ---------------- */}
                    {tab === 'analysis' && (
    <div className="space-y-6">

        {/* HEADER */}
        <div>
            <h2 className="text-lg font-semibold">Conflict Analysis</h2>
            <p className="text-sm text-gray-500">
                System-wide scheduling conflict insights and performance metrics
            </p>
        </div>

        {/* 2 COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ================= LEFT: CONFLICT PATTERNS ================= */}
            <div className="border rounded-xl bg-white p-5 space-y-4">

                <h3 className="font-semibold text-gray-700">
                    Conflict Patterns
                </h3>

                {/* ITEM */}
                <div className="space-y-4">

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Teacher Overlaps</span>
                            <span className="font-medium text-red-500">32%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full">
                            <div className="bg-red-500 h-2 rounded-full w-[32%]"></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Room Conflicts</span>
                            <span className="font-medium text-orange-500">21%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full">
                            <div className="bg-orange-500 h-2 rounded-full w-[21%]"></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Resource Shortages</span>
                            <span className="font-medium text-yellow-500">18%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full">
                            <div className="bg-yellow-500 h-2 rounded-full w-[18%]"></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Workload Imbalances</span>
                            <span className="font-medium text-blue-500">29%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full">
                            <div className="bg-blue-500 h-2 rounded-full w-[29%]"></div>
                        </div>
                    </div>

                </div>

            </div>

            {/* ================= RIGHT: PERFORMANCE ================= */}
            <div className="space-y-6">

                {/* RESOLUTION SUCCESS */}
                <div className="border rounded-xl bg-white p-5">

                    <h3 className="font-semibold text-gray-700 mb-4">
                        Resolution Performance
                    </h3>

                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Success Rate</span>
                        <span className="font-bold text-green-600">87%</span>
                    </div>

                    <div className="w-full bg-gray-100 h-2 rounded-full">
                        <div className="bg-green-500 h-2 rounded-full w-[87%]"></div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                        Percentage of all conflicts successfully resolved
                    </p>

                </div>

                {/* AUTO VS MANUAL */}
                <div className="border rounded-xl bg-white p-5 space-y-4">

                    <h3 className="font-semibold text-gray-700">
                        Resolution Method Breakdown
                    </h3>

                    {/* AUTO */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Automatic Resolution</span>
                            <span className="font-medium text-blue-600">72%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full">
                            <div className="bg-blue-500 h-2 rounded-full w-[72%]"></div>
                        </div>
                    </div>

                    {/* MANUAL */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Manual Intervention</span>
                            <span className="font-medium text-purple-600">28%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full">
                            <div className="bg-purple-500 h-2 rounded-full w-[28%]"></div>
                        </div>
                    </div>

                </div>

            </div>

        </div>

    </div>
)}

                </div>

            </div>
        </AppLayout>
    )
}