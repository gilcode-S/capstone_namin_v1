import React, { useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

export default function AnalyticsDashboard({ kpiStats, teacherData, conflictTrends, roomUtilization, departmentDist }) {
    const [activeTab, setActiveTab] = useState('Performance');

    return (
        <div className="max-w-7xl mx-auto p-6 font-sans">
            
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">Comprehensive analytics and insights from prescriptive scheduling optimization</p>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500 font-semibold">Schedule Efficiency</span>
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{kpiStats.efficiency}%</div>
                    <div className="text-xs text-gray-400">Overall optimization score</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500 font-semibold">Teacher Utilization</span>
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{kpiStats.teacher_utilization}%</div>
                    <div className="text-xs text-gray-400">Average workload balance</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500 font-semibold">Room Utilization</span>
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{kpiStats.room_utilization}%</div>
                    <div className="text-xs text-gray-400">Classroom usage efficiency</div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-gray-200 rounded-full p-1 mb-6">
                {['Performance', 'Utilization', 'Optimization', 'Insights'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
                            activeTab === tab ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ========================================= */}
            {/* TAB 1: PERFORMANCE (From Mockup 1)        */}
            {/* ========================================= */}
            {activeTab === 'Performance' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Workload Distribution Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                Teacher Workload Distribution
                            </h2>
                            <p className="text-xs text-gray-500 mb-6">Current vs maximum teaching hours by faculty</p>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={teacherData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
                                        <Tooltip cursor={{fill: '#F3F4F6'}} />
                                        <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                                        <Bar dataKey="current" name="Current Hours" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="maximum" name="Maximum Hours" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Conflict Resolution Trends */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                                Conflict Resolution Trends
                            </h2>
                            <p className="text-xs text-gray-500 mb-6">Monthly conflict detection and resolution rates</p>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={conflictTrends} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
                                        <Tooltip />
                                        <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                                        <Line type="monotone" dataKey="detected" name="Conflicts Detected" stroke="#FF4D4D" strokeWidth={2} dot={false} activeDot={{r: 6}} />
                                        <Line type="monotone" dataKey="resolved" name="Conflict Resolve" stroke="#3B82F6" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Teacher Efficiency Metrics */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">Teacher Efficiency Metrics</h2>
                                <p className="text-xs text-gray-500 mt-1">Individual performance indicators and workload balance</p>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            {teacherData.map(teacher => (
                                <div key={teacher.name}>
                                    <div className="flex justify-between items-center text-sm font-bold text-gray-900 mb-1">
                                        <span>{teacher.name}</span>
                                        <span className="flex items-center space-x-3">
                                            <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">{teacher.efficiency}% efficiency</span>
                                            <span className="text-gray-500 font-normal">{teacher.current}/{teacher.maximum}h</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div className="bg-black h-3 rounded-full" style={{ width: `${teacher.efficiency}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* TAB 2: UTILIZATION (From Mockup 2)        */}
            {/* ========================================= */}
            {activeTab === 'Utilization' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            Weekly Room Utilization
                        </h2>
                        <p className="text-xs text-gray-500 mb-6">Usage patterns across different facility types</p>
                        
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={roomUtilization} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                                    <Tooltip cursor={{fill: '#F3F4F6'}} />
                                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                                    <Bar dataKey="Classrooms" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="Computer Lab" fill="#34D399" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="PE Room" fill="#FBBF24" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Department Distribution
                        </h2>
                        <p className="text-xs text-gray-500 mb-6">Resource allocation by academic department</p>
                        
                        <div className="flex justify-center items-center h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={departmentDist}
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {departmentDist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* TAB 3: OPTIMIZATION (From Mockup 3)       */}
            {/* ========================================= */}
            {activeTab === 'Optimization' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-bold text-gray-900 mb-1">Algorithm Performance</h2>
                        <p className="text-xs text-gray-500 mb-6">Real time metrics from the optimization engines</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Rule-Based Algorithm', value: '1,247', sub: 'Execution time: 2.3s' },
                                { label: 'Constraint Programming', value: '156', sub: 'Execution time: 4.1s' },
                                { label: 'Constraint Satisfaction', value: '98.5%', sub: 'Execution time: 0.8s' },
                                { label: 'Resource Allocation Score', value: '94.2%', sub: 'Execution time: 1.2s' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs font-bold text-gray-700 mb-2">{stat.label}</div>
                                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                    <div className="text-[10px] text-gray-500">{stat.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-bold text-gray-900 mb-1">Constraint Satisfaction</h2>
                        <p className="text-xs text-gray-500 mb-6">How well the optimization meets scheduling constraint</p>
                        
                        <div className="space-y-6">
                            {[
                                { label: 'Hard Constraints', pct: '100%', desc: 'No teacher conflicts room overlaps, or capacity violations', color: 'bg-orange-300' },
                                { label: 'Soft Constraints', pct: '89%', desc: 'Teacher preferences and workload balance optimization', color: 'bg-orange-300' },
                                { label: 'Resource Efficiency', pct: '94%', desc: 'Optimal allocation of classrooms and laboratories', color: 'bg-orange-300' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-1">
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{item.label}</div>
                                            <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900">{item.pct}</div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 mt-2">
                                        <div className={`h-3 rounded-full ${item.color}`} style={{ width: item.pct }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* TAB 4: INSIGHTS (From Mockup 4)           */}
            {/* ========================================= */}
            {activeTab === 'Insights' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-bold text-gray-900 mb-1">Key Insights</h2>
                        <p className="text-xs text-gray-500 mb-6">Data-driven recommendations for schedule optimization</p>
                        
                        <div className="space-y-4">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <h3 className="font-bold text-blue-800 text-sm">Peak Hour Optimization</h3>
                                <p className="text-blue-600 text-xs mt-1">Consider splitting large classes during 10-11 AM peak hours to improve utilizations</p>
                            </div>
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                <h3 className="font-bold text-green-800 text-sm">Workload Balance Success</h3>
                                <p className="text-green-600 text-xs mt-1">Teacher workload distribution has improved by 15% since implementing automated scheduling</p>
                            </div>
                            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                                <h3 className="font-bold text-orange-800 text-sm">Friday Underutilization</h3>
                                <p className="text-orange-600 text-xs mt-1">Friday afternoon slots show 45% utilization. Consider scheduling makeup classes or optional seminar</p>
                            </div>
                            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                                <h3 className="font-bold text-purple-800 text-sm">Laboratory Efficiency</h3>
                                <p className="text-purple-600 text-xs mt-1">Labs scheduling can be optimized by 12% through better coordination of equipment</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-bold text-gray-900 mb-1">Predictive Analytics</h2>
                        <p className="text-xs text-gray-500 mb-8">Forecast trends and optimization opportunities</p>
                        
                        <h3 className="font-bold text-gray-900 text-sm mb-4">Next Semester Predictions</h3>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Expected Enrollment Growth</span>
                                <span className="bg-gray-100 px-2 py-1 rounded font-bold text-gray-800">+8%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Additional Room Requirements</span>
                                <span className="bg-gray-100 px-2 py-1 rounded font-bold text-gray-800">2-3 rooms</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Optimal Schedule Efficiency</span>
                                <span className="bg-black text-white px-2 py-1 rounded font-bold">92%</span>
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-900 text-sm mb-4">Recommended Actions</h3>
                        <ul className="space-y-3 text-xs text-gray-700">
                            <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Schedule high-demand courses in larger auditoriums</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Implement block scheduling for laboratory courses</li>
                            <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span> Consider hiring 1-2 additional part-time faculty</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}