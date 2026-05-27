import React from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];
export default function Dashboard({ roleStats, quickActions, activities, metrics, userRole }) {
    const { auth } = usePage().props;

    // Helper to render basic SVG icons
    const renderIcon = (name) => {
        const baseClass = "w-5 h-5 text-gray-500";
        switch (name) {
            case 'user-group': return <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
            case 'building-office': return <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
            case 'book-open': return <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
            case 'exclamation-circle': return <svg className={`${baseClass} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case 'exclamation-triangle': return <svg className={`${baseClass} text-orange-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
            default: return <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        }
    };

    return (

        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="max-w-7xl  p-6 font-sans">
                {/* Header */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {auth.user.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">Class Scheduling Dashboard • Automated scheduling system</p>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg border font-bold text-gray-700 text-sm flex items-center shadow-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {userRole} portal
                    </div>
                </div>

                {/* Top Stats Row (Dynamic based on Role) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {roleStats.map((stat, index) => (
                        <div key={index} className={`bg-white p-5 rounded-xl shadow-sm border ${stat.alert ? 'border-red-200 bg-red-50/10' : 'border-gray-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-semibold text-gray-500">{stat.label}</span>
                                {renderIcon(stat.icon)}
                            </div>
                            <div className={`text-3xl font-bold mb-1 ${stat.alert ? 'text-red-600' : 'text-gray-900'}`}>{stat.value}</div>
                            <div className="text-xs text-gray-400">{stat.desc}</div>
                        </div>
                    ))}
                </div>

                {/* Middle Section: Metrics & Recent Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                    {/* Optimization Metrics (Visible mainly to Scheduler/Director) */}
                    {(userRole === 'Super Admin' || userRole === 'Scheduler') && (
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center mb-1">
                                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                <h2 className="text-lg font-bold text-gray-900">Optimization Metrics</h2>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Current performance of the scheduling optimization algorithm</p>

                            <div className="space-y-5">
                                {metrics.map((metric, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-sm font-semibold text-gray-700">{metric.label}</span>
                                            <div className="text-xs">
                                                <span className="font-bold text-gray-900 mr-1">{metric.score}%</span>
                                                <span className="text-gray-400">{metric.status}</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3">
                                            <div className="bg-black h-3 rounded-full" style={{ width: `${metric.score}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Activities Feed (Visible to everyone) */}
                    <div className={`${(userRole === 'Super Admin' || userRole === 'Scheduler') ? 'lg:col-span-1' : 'lg:col-span-3'} bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col`}>
                        <div className="flex items-center mb-1">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Latest updates and system notifications</p>

                        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-start">
                                    {/* Dynamic Icon based on action type */}
                                    <div className="mt-0.5 mr-3">
                                        {activity.action.includes('Generate') ? <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> :
                                            activity.action.includes('Conflict') ? <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> :
                                                activity.module === 'Faculty' ? <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> :
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        }
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{activity.description}</p>
                                        <p className="text-xs text-gray-400">{activity.time} • by {activity.user}</p>
                                    </div>
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <p className="text-sm text-gray-400 italic">No recent activities to display.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions (Dynamic Buttons) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Quick Actions</h2>
                    <p className="text-sm text-gray-500 mb-6">Common tasks for schedule management</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => router.get(action.url)}
                                className="text-left border border-gray-200 rounded-xl p-4 hover:border-black hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center mb-2">
                                    <svg className="w-5 h-5 text-gray-500 group-hover:text-black transition-colors mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    <span className="font-bold text-gray-900">{action.title}</span>
                                </div>
                                <p className="text-xs text-gray-500">{action.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>


            </div>
        </AppLayout>
    );
}