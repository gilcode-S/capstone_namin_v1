import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';


import { Head } from '@inertiajs/react';
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

export default function AnalyticsDashboard({ stats, workloadData, conflictTrend, roomTypeUsage, deptDistribution, algoMetrics, filters }) {
    const [activeTab, setActiveTab] = useState('performance');
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const handleFilter = (key, value) => {
        router.get(route('analytics.index'), { ...filters, [key]: value }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics Dashboard" />
        <div className="p-8 bg-[#f8f9fa] min-h-screen font-sans">
            <h1 className="text-3xl font-black mb-8 italic tracking-tighter">SYSTEM ANALYTICS</h1>

            {/* STAT CARDS */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <StatCard label="Schedule Efficiency" value={`${stats.efficiency}%`} desc="Subjects Successfully Placed" />
                <StatCard label="Teacher Utilization" value={`${stats.teacher_util}%`} desc="Average Workload Load" />
                <StatCard label="Room Utilization" value={`${stats.room_util}%`} desc="Physical Resource Usage" />
            </div>

            {/* TABS */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                {['performance', 'utilization', 'optimization', 'insights'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                        className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'border-b-4 border-black text-black' : 'text-gray-400'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* VIEWS */}
            {activeTab === 'performance' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Workload Chart */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-lg">Teacher Workload Distribution</h3>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Search Teacher..." className="text-xs border-gray-200 rounded-lg" 
                                    onBlur={(e) => handleFilter('search', e.target.value)} />
                                <select className="text-xs border-gray-200 rounded-lg" onChange={(e) => handleFilter('dept', e.target.value)}>
                                    <option value="">All Dept</option>
                                    <option value="CS">Computer Science</option>
                                    <option value="IT">Information Tech</option>
                                </select>
                            </div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={workloadData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" hide />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="current_hours" fill="#000" radius={[4, 4, 0, 0]} name="Current Load" />
                                    <Bar dataKey="max_hours" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Max Capacity" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Conflict Resolution Line Chart */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-black text-lg mb-6">Conflict Resolution Trend</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={conflictTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="detected" stroke="#ef4444" strokeWidth={3} />
                                        <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Efficiency Table */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-auto">
                            <h3 className="font-black text-lg mb-4">Teacher Efficiency Metrics</h3>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-gray-400 font-black uppercase text-[10px] border-b">
                                        <th className="pb-3">Teacher</th>
                                        <th className="pb-3">Efficiency</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workloadData.map(t => (
                                        <tr key={t.name} className="border-b last:border-0">
                                            <td className="py-3 font-bold">{t.name}</td>
                                            <td className="py-3 font-black text-blue-600">
                                                {((t.current_hours / (t.max_hours || 1)) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'utilization' && (
                <div className="grid grid-cols-2 gap-8 animate-in fade-in">
                    <div className="bg-white p-8 rounded-3xl shadow-sm">
                        <h3 className="font-black text-lg mb-6">Room Usage by Type</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={roomTypeUsage}>
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm">
                        <h3 className="font-black text-lg mb-6">Resource Allocation (Dept)</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={deptDistribution} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {deptDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'optimization' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in zoom-in-95">
                    {algoMetrics.map(algo => (
                        <div key={algo.id} className="bg-white p-6 rounded-3xl border-2 border-gray-100">
                            <div className="text-xs font-black text-blue-600 mb-2 uppercase">{algo.algorithm_name}</div>
                            <div className="text-2xl font-black mb-4">{algo.execution_time}s <span className="text-[10px] text-gray-400">Exec Time</span></div>
                            <div className="space-y-3">
                                <MetricBar label="Hard Constraints" val={algo.hard_constraints_score} color="bg-red-500" />
                                <MetricBar label="Soft Constraints" val={algo.soft_constraints_score} color="bg-yellow-500" />
                                <MetricBar label="Resource Efficiency" val={algo.resource_efficiency} color="bg-green-500" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'insights' && (
                <div className="bg-black text-white p-10 rounded-[3rem] animate-in slide-in-from-bottom-8">
                    <h2 className="text-4xl font-black mb-8 italic">SMART INSIGHTS</h2>
                    <div className="grid grid-cols-2 gap-10">
                        <InsightBox title="Bottleneck Alert" 
                            text={stats.room_util > 85 ? "Room utilization is critical (>85%). Consider adding more laboratory spaces." : "Resource capacity is currently healthy."} />
                        <InsightBox title="Faculty Optimization" 
                            text={`Current teacher load is ${stats.teacher_util}%. You can increase workload by ${100 - stats.teacher_util}% before needing new hires.`} />
                    </div>
                </div>
            )}
        </div>
        </AppLayout>
    );
}

function StatCard({ label, value, desc }) {
    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">{label}</div>
            <div className="text-5xl font-black mb-2">{value}</div>
            <div className="text-xs font-bold text-gray-500">{desc}</div>
        </div>
    );
}

function MetricBar({ label, val, color }) {
    return (
        <div>
            <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                <span>{label}</span>
                <span>{val}%</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className={`${color} h-full transition-all duration-1000`} style={{ width: `${val}%` }}></div>
            </div>
        </div>
    );
}

function InsightBox({ title, text }) {
    return (
        <div className="border-l-4 border-blue-500 pl-6">
            <h4 className="text-blue-500 font-black text-xs uppercase mb-2">{title}</h4>
            <p className="text-xl font-bold text-gray-300 leading-relaxed">{text}</p>
        </div>
    );
}
