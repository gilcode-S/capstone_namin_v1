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
        title: 'Schedule Version',
        href: '/version-history',
    },
];

export default function VersionHistory({ versions, filters }) {
    
    // Handle Dropdown filtering
    const handleFilterChange = (key, value) => {
        router.get('/version-history', { ...filters, [key]: value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        }); 
    };

    // Helper to format dates cleanly
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (

        <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Version History Dashboard" />
        <div className="max-w-7xl p-3 font-sans">
            
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Schedule Version History</h1>
                <p className="text-sm text-gray-500">Access and review archived class schedules from past semesters.</p>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <span className="block text-sm font-semibold text-gray-700 mb-4">Filters</span>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-64">
                        <select 
                            value={filters.academic_year || ''} 
                            onChange={(e) => handleFilterChange('academic_year', e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-lg p-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-gray-200 cursor-pointer"
                        >
                            <option value="">Academic Year</option>
                            <option value="2026-2027">2026 - 2027</option>
                            <option value="2025-2026">2025 - 2026</option>
                        </select>
                    </div>
                    
                    <div className="w-full md:w-64">
                        <select 
                            value={filters.semester || ''} 
                            onChange={(e) => handleFilterChange('semester', e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-lg p-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-gray-200 cursor-pointer"
                        >
                            <option value="">Semester</option>
                            <option value="First">First Semester</option>
                            <option value="Second">Second Semester</option>
                            <option value="Summer">Summer Term</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Versions List */}
            <div className="space-y-4">
                {versions.map(version => (
                    <div key={version.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center transition hover:shadow-md">
                        
                        {/* Left Side: Info */}
                        <div className="w-full md:w-auto mb-4 md:mb-0">
                            <div className="flex items-center space-x-3 mb-2">
                                <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                                    {version.name}
                                </h2>
                                {version.status === 'Active' && (
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">Current Active</span>
                                )}
                                {version.status === 'Draft' && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">Draft</span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center text-sm text-gray-600 gap-y-2">
                                <div className="flex items-center mr-6">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="font-medium">Date Created:</span> <span className="ml-1">{formatDate(version.created_at)}</span>
                                </div>
                                
                                <div className="flex items-center mr-6">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span className="font-medium">Date Effective:</span> <span className="ml-1">{formatDate(version.effective_date)}</span>
                                </div>

                                <div className="flex items-center">
                                    <span className="font-medium">Version:</span> <span className="ml-1">{version.version_number}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Action Buttons */}
                        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                            {/* Uses router.get to navigate to the Schedule Viewer (Page 8), passing the version ID */}
                            <button 
                                onClick={() => router.get('/schedules', { version_id: version.id })}
                                className="bg-black text-white text-sm font-bold py-2.5 px-6 rounded-lg hover:bg-gray-800 transition whitespace-nowrap"
                            >
                                View Schedule
                            </button>
                            
                            {/* Uses router.get to navigate to the Audit Logs (Page 12), filtering by this specific version/timeframe */}
                            <button 
                                onClick={() => router.get('/audit-logs', { search: `Version ${version.version_number}` })}
                                className="bg-black text-white text-sm font-bold py-2.5 px-6 rounded-lg hover:bg-gray-800 transition whitespace-nowrap"
                            >
                                View Logs
                            </button>
                        </div>
                        
                    </div>
                ))}

                {versions.length === 0 && (
                    <div className="bg-white p-12 rounded-xl border border-gray-100 text-center">
                        <p className="text-gray-500">No schedule versions found. Generate your first schedule to create a version.</p>
                    </div>
                )}
            </div>

        </div>
    
        </AppLayout>
    );
}