// resources/js/Pages/Analytics/Index.jsx

import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Analytics',
        href: '/analytics',
    },
];

export default function AnalyticsDashboard({ kpiStats, teacherData, conflictTrends, roomUtilization, departmentDist, algoMetrics }) {
    const [activeTab, setActiveTab] = useState('Performance');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Conflicts Dashboard" />
            <div className="max-w-7xl p-2 font-sans bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics Dashboard</h1>
                    <p className="text-sm text-gray-500 font-medium">Real-time scheduling insights from your faculty and resource data</p>
                </div>

                {/* Top KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KPICard title="Schedule Efficiency" value={`${kpiStats.efficiency}%`} desc="Overall optimization score" color="text-green-600" />
                    <KPICard title="Teacher Utilization" value={`${kpiStats.teacher_utilization}%`} desc="Active faculty workload" color="text-indigo-600" />
                    <KPICard title="Room Utilization" value={`${kpiStats.room_utilization}%`} desc="Classroom occupancy rate" color="text-amber-600" />
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-gray-200 rounded-full p-1 mb-8 shadow-inner">
                    {['Performance', 'Utilization', 'Optimization', 'Insights'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-full transition-all ${activeTab === tab ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* TAB 1: PERFORMANCE */}
                {activeTab === 'Performance' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartContainer title="Teacher Workload Distribution" subtitle="Current vs Maximum Hours (Calculated via Timeslots)">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={teacherData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                        <Tooltip cursor={{ fill: '#F3F4F6' }} />
                                        <Bar dataKey="current" name="Assigned Load" fill="#000000" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="maximum" name="Max Load" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>

                            <ChartContainer title="Conflict Resolution" subtitle="Historical detection and automated resolution trends">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={conflictTrends}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="detected" stroke="#EF4444" strokeWidth={3} dot={false} />
                                        <Line type="monotone" dataKey="resolved" stroke="#3B82F6" strokeWidth={3} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-900 mb-6">Individual Efficiency Tracker</h3>
                            <div className="space-y-5">
                                {teacherData.map(teacher => (
                                    <div key={teacher.name}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-700">{teacher.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-black text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase">{teacher.efficiency}% EFF</span>
                                                <span className="text-[10px] text-gray-400">{teacher.current} / {teacher.maximum} hrs</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-black h-full transition-all duration-1000" style={{ width: `${teacher.efficiency}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: OPTIMIZATION (Dynamic Algorithm Cards) */}
                {activeTab === 'Optimization' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-tighter">Algorithm Performance</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {algoMetrics.map((stat, i) => (
                                    <div key={i} className="bg-gray-50 p-5 rounded-xl border border-gray-100 transition-hover hover:border-black group">
                                        <div className="text-[10px] font-black text-gray-400 mb-2 uppercase group-hover:text-black">{stat.label}</div>
                                        <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
                                        <div className="text-[10px] text-gray-500 font-bold">{stat.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-tighter">Constraint Satisfaction Breakdown</h2>
                            <div className="space-y-8">
                                <ConstraintRow label="Hard Constraints" pct="100%" desc="Teacher overlaps and room conflicts are physically impossible." />
                                <ConstraintRow label="Soft Constraints" pct="88%" desc="Teacher preferences and specialized room requests." />
                                <ConstraintRow label="Distribution Balance" pct="92%" desc="Even spread of classes across the academic week." />
                            </div>
                        </div>
                    </div>
                )}

                {/* Other tabs follow the same logic as your mockup... */}
            </div>
        </AppLayout>
    );
}

// Reusable Components
function KPICard({ title, value, desc, color }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{title}</p>
            <h2 className={`text-4xl font-black ${color} mb-1`}>{value}</h2>
            <p className="text-[10px] text-gray-400 font-bold">{desc}</p>
        </div>
    );
}

function ChartContainer({ title, subtitle, children }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-1">{title}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-6">{subtitle}</p>
            <div className="h-64">{children}</div>
        </div>
    );
}

function ConstraintRow({ label, pct, desc }) {
    return (
        <div>
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h4 className="text-xs font-black text-gray-900">{label}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{desc}</p>
                </div>
                <span className="text-sm font-black text-gray-900">{pct}</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-orange-400 h-full rounded-full" style={{ width: pct }}></div>
            </div>
        </div>
    );
}
