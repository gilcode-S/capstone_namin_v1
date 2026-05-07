import React from 'react';
import { useForm, router } from '@inertiajs/react';

export default function GenerateSchedule({ sections, selectedSection, previewData, flash }) {
    
    // Form handling for the final Generate button
    const { data, setData, post, processing } = useForm({
        section_id: selectedSection ? selectedSection.id : ''
    });

    // Fetch the preview data instantly when a section is selected
    const handleSectionChange = (e) => {
        const sectionId = e.target.value;
        setData('section_id', sectionId);
        
        // This reloads the page with the preview data without losing state
        router.get('/schedules/generate', { section_id: sectionId }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // The final trigger
    const handleGenerate = () => {
        post('/schedules/generate');
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-2">Schedule Generation Engine</h1>
            <p className="text-gray-600 mb-8">Select a section to run a competency preview before generating the final schedule.</p>

            {/* Error/Success Messages */}
            {flash?.error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4 font-bold">{flash.error}</div>}
            {flash?.success && <div className="bg-green-100 text-green-700 p-4 rounded mb-4 font-bold">{flash.success}</div>}

            {/* Step 1: Selection */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">1. Select Target Section</label>
                <select 
                    value={data.section_id} 
                    onChange={handleSectionChange}
                    className="w-full md:w-1/2 border-gray-300 rounded-md shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="" disabled>-- Choose a Section --</option>
                    {sections.map(section => (
                        <option key={section.id} value={section.id}>
                            {section.name} ({section.program.code} - Year {section.year_level})
                        </option>
                    ))}
                </select>
            </div>

            {/* Step 2: The Pre-Flight Dashboard */}
            {previewData && (
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-600">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold">2. Pre-Processing Review</h2>
                            <p className="text-sm text-gray-500">Curriculum mapped and teachers ranked via Domain Competency.</p>
                        </div>
                        
                        {/* THE BIG GENERATE BUTTON */}
                        <button 
                            onClick={handleGenerate}
                            disabled={processing || previewData.some(p => p.status.includes('Error'))}
                            className={`px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all 
                                ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'}
                                disabled:opacity-50`}
                        >
                            {processing ? '⚙️ Processing Math...' : '🚀 Confirm & Generate Schedule'}
                        </button>
                    </div>

                    {/* Preview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {previewData.map((preview, index) => (
                            <div key={index} className={`p-4 border rounded-lg ${preview.status.includes('Error') ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{preview.subject.name}</h3>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            {preview.subject.code} • {preview.subject.units} Units
                                        </span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${preview.status.includes('Error') ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                                        {preview.status}
                                    </span>
                                </div>
                                
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Top Ranked Faculty:</p>
                                    {preview.top_teachers.length > 0 ? (
                                        <ul className="space-y-1">
                                            {preview.top_teachers.map((teacher, tIndex) => (
                                                <li key={teacher.id} className="text-sm flex items-center space-x-2">
                                                    <span className="w-5 h-5 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
                                                        #{tIndex + 1}
                                                    </span>
                                                    <span>{teacher.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-red-600 font-semibold mt-2">
                                            ⚠️ No teacher matches this domain/department constraint. Please update faculty competencies before generating.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}