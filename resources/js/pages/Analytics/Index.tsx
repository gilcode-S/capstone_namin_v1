import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    BarChart,
    Bar,
    PieChart,
    Pie,
} from 'recharts'

export default function Analytics() {

    // ================= STATE (NEW) =================
    const [tab, setTab] = useState('performance')
    const [department, setDepartment] = useState('All')

    // ================= UI DATA =================
    const stats = {
        scheduleEfficiency: 89,
        teacherUtilization: 76,
        roomUtilization: 92,
    }

    const teachers = [
        { name: "Dr. Sarah Johnson", department: "Computer Science", hours: 18, max: 20 },
        { name: "Prof. Michael Chen", department: "Information Technology", hours: 15, max: 20 },
        { name: "Dr. Emily Davis", department: "Computer Science", hours: 20, max: 20 },
        { name: "Prof. James Wilson", department: "Mathematics", hours: 12, max: 20 },
    ]

    const chartData = [
        { name: "Jan", detected: 8, resolved: 6 },
        { name: "Feb", detected: 7, resolved: 6 },
        { name: "Mar", detected: 5, resolved: 4 },
        { name: "Apr", detected: 10, resolved: 7 },
        { name: "May", detected: 9, resolved: 8 },
        { name: "Jun", detected: 6, resolved: 5 },
    ]

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Analytics", href: "/pages/analytics" }
            ]}
        >
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

                {/* ================= HEADER ================= */}
                <div>
                    <h1 className="text-2xl font-semibold">
                        Analytics Dashboard
                    </h1>
                    <p className="text-sm text-gray-500">
                        Comprehensive scheduling insights and performance metrics
                    </p>
                </div>

                {/* ================= TOP CARDS ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <StatCard
                        title="Schedule Efficiency"
                        value={stats.scheduleEfficiency}
                        subtitle="Overall optimization score"
                    />

                    <StatCard
                        title="Teacher Utilization"
                        value={stats.teacherUtilization}
                        subtitle="Average workload balance"
                    />

                    <StatCard
                        title="Room Utilization"
                        value={stats.roomUtilization}
                        subtitle="Classroom usage efficiency"
                    />

                </div>

                {/* ================= TAB VIEW (NEW) ================= */}
                <div className="flex bg-white border rounded-xl p-1">

                    {[
                        'performance',
                        'utilization',
                        'optimization',
                        'insights'
                    ].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2 text-sm rounded-lg transition ${tab === t
                                    ? 'bg-black text-white'
                                    : 'text-gray-600'
                                }`}
                        >
                            {t.toUpperCase()}
                        </button>
                    ))}

                </div>

                {/* ================= PERFORMANCE TAB ================= */}
                {tab === 'performance' && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* LEFT PANEL */}
                            <div className="bg-white border rounded-xl p-5 space-y-4">

                                <div className="flex items-center justify-between">

                                    <h3 className="font-semibold">
                                        Teacher Workload Distribution
                                    </h3>

                                    <select
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="border rounded-lg px-2 py-1 text-sm"
                                    >
                                        <option value="All">All Departments</option>
                                        <option value="Computer Science">Computer Science Department</option>
                                        <option value="Information Technology">Tourism Management Department</option>
                                        <option value="Mathematics">Criminology Department</option>
                                        <option value="Mathematics">Business Management and Accountancy Department</option>
                                    </select>

                                </div>

                                {teachers
                                    .filter(t =>
                                        department === 'All' ||
                                        t.department === department
                                    )
                                    .map((t, i) => {

                                        const percent = (t.hours / t.max) * 100

                                        return (
                                            <div key={i}>

                                                <div className="flex justify-between text-sm mb-1">
                                                    <div>
                                                        <span className="font-medium">
                                                            {t.name}
                                                        </span>
                                                        <p className="text-xs text-gray-400">
                                                            {t.department}
                                                        </p>
                                                    </div>

                                                    <span className="text-gray-500">
                                                        {t.hours}/{t.max}h
                                                    </span>
                                                </div>

                                                <div className="w-full bg-gray-100 h-2 rounded-full">
                                                    <div
                                                        className="bg-black h-2 rounded-full"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>

                                            </div>
                                        )
                                    })}

                            </div>

                            {/* RIGHT PANEL */}
                            <div className="bg-white border rounded-xl p-5">

                                <h3 className="font-semibold mb-4">
                                    Conflict Resolution Trends
                                </h3>

                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <Tooltip />

                                        <Line
                                            type="monotone"
                                            dataKey="detected"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="resolved"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>

                            </div>

                        </div>

                        {/* ================= BOTTOM PANEL ================= */}
                        <div className="bg-white border rounded-xl p-5">

                            <h3 className="font-semibold mb-4">
                                Teacher Efficiency Metrics
                            </h3>

                            <div className="space-y-4">

                                {teachers.map((t, i) => {

                                    const percent = (t.hours / t.max) * 100

                                    return (
                                        <div key={i}>

                                            <div className="flex justify-between text-sm mb-1">

                                                {/* NAME + DEPARTMENT (NEW) */}
                                                <div>
                                                    <span className="font-medium">
                                                        {t.name}
                                                    </span>
                                                    <p className="text-xs text-gray-400">
                                                        {t.department}
                                                    </p>
                                                </div>

                                                <span className="text-gray-500">
                                                    {Math.round(percent)}% efficiency
                                                </span>

                                            </div>

                                            <div className="w-full bg-gray-100 h-2 rounded-full">
                                                <div
                                                    className="bg-black h-2 rounded-full"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>

                                        </div>
                                    )
                                })}

                            </div>

                        </div>
                    </>
                )}

                {/* ================= UTILIZATION ================= */}
                {tab === 'utilization' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* ================= LEFT: WEEKLY ROOM UTILIZATION ================= */}
                        <div className="bg-white border rounded-xl p-5 space-y-4">

                            {/* HEADER */}
                            <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                    🏫 Weekly Room Utilization
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Usage patterns across different facility types
                                </p>
                            </div>

                            {/* FILTER + LEGEND */}
                            <div className="flex items-center justify-between">

                                <select className="border rounded-lg px-3 py-1 text-sm">
                                    <option>Set A</option>
                                    <option>Set B</option>
                                </select>

                                <div className="flex gap-4 text-sm text-gray-600">

                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                        Classrooms
                                    </span>

                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Computer Lab
                                    </span>

                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                        PE Room
                                    </span>

                                </div>

                            </div>

                            {/* BAR CHART */}
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={[
                                    { day: 'Mon', classroom: 85, lab: 70, pe: 45 },
                                    { day: 'Tue', classroom: 95, lab: 88, pe: 60 },
                                    { day: 'Wed', classroom: 90, lab: 92, pe: 35 },
                                    { day: 'Thu', classroom: 92, lab: 80, pe: 50 },
                                    { day: 'Fri', classroom: 75, lab: 65, pe: 80 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <Tooltip />

                                    <Bar dataKey="classroom" fill="#6366f1" />
                                    <Bar dataKey="lab" fill="#22c55e" />
                                    <Bar dataKey="pe" fill="#fbbf24" />

                                </BarChart>
                            </ResponsiveContainer>

                        </div>

                        {/* ================= RIGHT: DEPARTMENT DISTRIBUTION ================= */}
                        <div className="bg-white border rounded-xl p-5 space-y-4">

                            <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                    📊 Department Distribution
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Resource allocation by academic department
                                </p>
                            </div>

                            <div className="flex items-center justify-between">

                                {/* DONUT */}
                                <ResponsiveContainer width="60%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Criminology', value: 35, fill: '#ef4444' },
                                                { name: 'Tourism', value: 28, fill: '#22c55e' },
                                                { name: 'Business', value: 19, fill: '#eab308' },
                                                { name: 'CS', value: 18, fill: '#3b82f6' },
                                            ]}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* LABELS */}
                                <div className="space-y-2 text-sm">

                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        Criminology 35%
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Tourism 28%
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                        Business 19%
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        Computer Science 18%
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>
                )}
                {/* ================= OPTIMIZATION ================= */}
                {tab === 'optimization' && (
                    <div className="space-y-6">

                        {/* ================= HEADER ================= */}
                        <div className="bg-white border rounded-xl p-5">
                            <h3 className="font-semibold text-lg">
                                Algorithm Performance
                            </h3>
                            <p className="text-sm text-gray-500">
                                Real time metrics from the optimization engines
                            </p>

                            {/* CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">

                                <div className="bg-gray-100 p-4 rounded-xl">
                                    <p className="text-sm text-gray-500">Rule-Based Algorithm</p>
                                    <p className="text-2xl font-bold">1,247</p>
                                    <p className="text-xs text-gray-400">Execution time: 2.3s</p>
                                </div>

                                <div className="bg-gray-100 p-4 rounded-xl">
                                    <p className="text-sm text-gray-500">Constraint Programming</p>
                                    <p className="text-2xl font-bold">156</p>
                                    <p className="text-xs text-gray-400">Execution time: 4.1s</p>
                                </div>

                                <div className="bg-gray-100 p-4 rounded-xl">
                                    <p className="text-sm text-gray-500">Constraint Satisfaction</p>
                                    <p className="text-2xl font-bold">98.5%</p>
                                    <p className="text-xs text-gray-400">Execution time: 0.8s</p>
                                </div>

                                <div className="bg-gray-100 p-4 rounded-xl">
                                    <p className="text-sm text-gray-500">Resource Allocation Score</p>
                                    <p className="text-2xl font-bold">94.2%</p>
                                    <p className="text-xs text-gray-400">Execution time: 1.2s</p>
                                </div>

                            </div>
                        </div>

                        {/* ================= CONSTRAINT SECTION ================= */}
                        <div className="bg-white border rounded-xl p-5 space-y-6">

                            <h3 className="font-semibold text-lg">
                                Constraint Satisfaction
                            </h3>
                            <p className="text-sm text-gray-500">
                                How well the optimization meets scheduling constraint
                            </p>

                            {/* HARD */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">Hard Constraints</span>
                                    <span>100%</span>
                                </div>
                                <div className="w-full bg-gray-200 h-2 rounded-full">
                                    <div className="bg-orange-400 h-2 rounded-full w-full"></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    No teacher conflicts room overlaps, or capacity violations
                                </p>
                            </div>

                            {/* SOFT */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">Soft Constraints</span>
                                    <span>89%</span>
                                </div>
                                <div className="w-full bg-gray-200 h-2 rounded-full">
                                    <div className="bg-orange-400 h-2 rounded-full w-[89%]"></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Teacher preferences and workload balance optimization
                                </p>
                            </div>

                            {/* RESOURCE */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">Resource Efficiency</span>
                                    <span>94%</span>
                                </div>
                                <div className="w-full bg-gray-200 h-2 rounded-full">
                                    <div className="bg-orange-400 h-2 rounded-full w-[94%]"></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Optimal allocation of classrooms and laboratories
                                </p>
                            </div>

                        </div>

                    </div>
                )}

                {/* ================= INSIGHTS ================= */}
                {tab === 'insights' && (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================= LEFT: KEY INSIGHTS ================= */}
        <div className="bg-white border rounded-xl p-5 space-y-5">

            <div>
                <h3 className="font-semibold">Key Insights</h3>
                <p className="text-sm text-gray-500">
                    Data-driven recommendations for schedule optimization
                </p>
            </div>

            {/* CARD 1 */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
                <h4 className="text-blue-700 font-semibold">
                    Peak Hour Optimization
                </h4>
                <p className="text-sm text-blue-600">
                    Consider splitting large classes during 10–11 AM peak hours to improve utilization
                </p>
            </div>

            {/* CARD 2 */}
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">
                <h4 className="text-green-700 font-semibold">
                    Workload Balance Success
                </h4>
                <p className="text-sm text-green-600">
                    Teacher workload distribution has improved by 15% since implementing automated scheduling
                </p>
            </div>

            {/* CARD 3 */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                <h4 className="text-orange-600 font-semibold">
                    Friday Underutilization
                </h4>
                <p className="text-sm text-orange-500">
                    Friday afternoon slots show 45% utilization. Consider scheduling makeup classes or optional seminars
                </p>
            </div>

            {/* CARD 4 */}
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                <h4 className="text-purple-600 font-semibold">
                    Laboratory Efficiency
                </h4>
                <p className="text-sm text-purple-500">
                    Labs scheduling can be optimized by 12% through better coordination of equipment
                </p>
            </div>

        </div>

        {/* ================= RIGHT: PREDICTIVE ================= */}
        <div className="bg-white border rounded-xl p-5 space-y-6">

            <div>
                <h3 className="font-semibold">Predictive Analytics</h3>
                <p className="text-sm text-gray-500">
                    Forecast trends and optimization opportunities
                </p>
            </div>

            {/* NEXT SEMESTER */}
            <div className="space-y-4">

                <h4 className="font-medium">Next Semester Predictions</h4>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                        Expected Enrollment Growth
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        +8%
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                        Additional Room Requirements
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        2–3 rooms
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                        Optimal Schedule Efficiency
                    </span>
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm">
                        92%
                    </span>
                </div>

            </div>

            {/* ACTIONS */}
            <div className="space-y-3">

                <h4 className="font-medium">Recommended Actions</h4>

                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 mt-1 bg-green-500 rounded-full"></span>
                    Schedule high-demand courses in larger auditoriums
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 mt-1 bg-blue-500 rounded-full"></span>
                    Implement block scheduling for laboratory courses
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 mt-1 bg-red-500 rounded-full"></span>
                    Consider hiring 1–2 additional part-time faculty
                </div>

            </div>

        </div>

    </div>
)}

            </div>
        </AppLayout>
    )
}

/* ================= COMPONENT ================= */

function StatCard({ title, value, subtitle }: any) {
    return (
        <div className="bg-white border rounded-xl p-5">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold">{value}%</p>
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
    )
}