import React, { useState } from 'react';

export default function ConflictDetection({ unresolved = [], resolved = [], stats }) {
    const [activeTab, setActiveTab] = useState('Unresolved');
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [selectedConflict, setSelectedConflict] = useState(null);

    const handleActionClick = (conflict) => {
        setSelectedConflict(conflict);
        setShowResolveModal(true);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 font-sans">
            
            {/* Header & Scan Button */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Conflict Detection</h1>
                    <p className="text-sm text-gray-500">Identify and resolve scheduling conflicts using automation analysis</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Scan for Conflicts
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm bg-white hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Auto-Resolve
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500 font-semibold">Total Conflicts</span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="text-sm text-gray-500 font-semibold mb-2">Total Unresolved</div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-red-600">{stats.unresolvedCount}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Unresolved conflict</div>
                </div>
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500 font-semibold">Total Resolved</span>
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="text-3xl font-bold text-green-600">{stats.resolvedCount}</div>
                    <div className="text-xs text-gray-500 mt-1">Successfully handled</div>
                </div>
            </div>

            {/* Critical Alert Banner (Only show if unresolved exist) */}
            {stats.unresolvedCount > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex items-start">
                    <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <div>
                        <h4 className="text-sm font-bold text-red-800">Critical conflicts detected!</h4>
                        <p className="text-sm text-red-600 mt-1">{stats.unresolvedCount} critical issues require immediate resolution to prevent scheduling disruptions.</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex bg-gray-200 rounded-full p-1 mb-6">
                {['Unresolved', 'Resolved', 'Analysis'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
                            activeTab === tab ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab} {tab === 'Unresolved' ? `(${stats.unresolvedCount})` : tab === 'Resolved' ? `(${stats.resolvedCount})` : ''}
                    </button>
                ))}
            </div>

            {/* TAB 1: UNRESOLVED CONTENT */}
            {activeTab === 'Unresolved' && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-5 border-b">
                        <h2 className="text-lg font-bold text-gray-900">Active Conflicts</h2>
                        <p className="text-sm text-gray-500">Conflicts that require resolution for optimal scheduling</p>
                    </div>
                    <div className="overflow-x-auto p-5">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-gray-500 border-b">
                                    <th className="pb-3 font-semibold">Type</th>
                                    <th className="pb-3 font-semibold">Conflict</th>
                                    <th className="pb-3 font-semibold">Time Slot</th>
                                    <th className="pb-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {unresolved.length > 0 ? unresolved.map(conflict => (
                                    <tr key={conflict.id} className="hover:bg-gray-50">
                                        <td className="py-4">
                                            <div className="flex items-center text-gray-700 font-medium">
                                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                {conflict.type}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="font-bold text-gray-900">{conflict.title}</div>
                                            <div className="text-gray-500 mt-1">{conflict.description}</div>
                                            <div className="flex space-x-2 mt-2">
                                                {conflict.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-1 bg-gray-100 border rounded text-xs text-gray-600 font-mono">{tag}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 text-gray-600">{conflict.timeslot}</td>
                                        <td className="py-4 text-right">
                                            <button onClick={() => handleActionClick(conflict)} className="text-gray-400 hover:text-black mx-1 p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>
                                            <button className="text-gray-400 hover:text-red-600 mx-1 p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="py-8 text-center text-gray-500">No unresolved conflicts detected!</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: RESOLVED CONTENT */}
            {activeTab === 'Resolved' && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-5 border-b">
                        <h2 className="text-lg font-bold text-gray-900">Resolved Conflicts</h2>
                        <p className="text-sm text-gray-500">Previously resolved scheduling conflicts</p>
                    </div>
                    <div className="overflow-x-auto p-5">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-gray-500 border-b">
                                    <th className="pb-3 font-semibold">Type</th>
                                    <th className="pb-3 font-semibold">Conflict</th>
                                    <th className="pb-3 font-semibold">Solution Applied</th>
                                    <th className="pb-3 font-semibold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {resolved.map(conflict => (
                                    <tr key={conflict.id} className="hover:bg-gray-50">
                                        <td className="py-4 font-medium text-gray-700">{conflict.type}</td>
                                        <td className="py-4 text-gray-900 whitespace-pre-line">{conflict.conflict}</td>
                                        <td className="py-4 text-gray-600">{conflict.solution}</td>
                                        <td className="py-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                Resolved
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: ANALYSIS CONTENT (From Mockup 3) */}
            {activeTab === 'Analysis' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Conflict Patterns</h2>
                        <p className="text-sm text-gray-500 mb-6">Analysis of common scheduling issues</p>
                        
                        <div className="space-y-6">
                            {[
                                { label: 'Teacher Overlaps', pct: '40%', color: 'bg-orange-300' },
                                { label: 'Room Conflicts', pct: '30%', color: 'bg-red-400' },
                                { label: 'Resource Shortages', pct: '20%', color: 'bg-orange-200' },
                                { label: 'Workload Imbalances', pct: '10%', color: 'bg-red-300' }
                            ].map(item => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                                        <span>{item.label}</span>
                                        <span>{item.pct}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: item.pct }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-sm font-bold text-gray-700 mb-1">Resolution Success Rate</h2>
                        <p className="text-xs text-gray-500 mb-6">Effectiveness of conflict resolution strategies</p>
                        
                        <div className="text-center mb-8">
                            <div className="text-5xl font-bold text-green-500 mb-2">20%</div>
                            <div className="text-sm text-gray-600">of conflicts successfully resolved</div>
                        </div>

                        <div className="space-y-3 border-t pt-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Automatic Resolution</span>
                                <span className="font-semibold text-gray-900">75%</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Manual Intervention</span>
                                <span className="font-semibold text-gray-900">25%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resolution Modal Overlay */}
            {showResolveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Resolve Conflict</h2>
                        <p className="text-gray-600 mb-6 text-sm">How would you like to resolve the conflict for <strong>{selectedConflict?.title}</strong>?</p>
                        <div className="space-y-3">
                            <button className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-3 rounded-lg font-semibold hover:bg-blue-100 transition">
                                Let Algorithm Auto-Resolve
                            </button>
                            <button className="w-full bg-gray-50 text-gray-700 border border-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                                Manually Edit Schedule
                            </button>
                        </div>
                        <button onClick={() => setShowResolveModal(false)} className="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-800">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}