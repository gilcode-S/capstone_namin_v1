import React, { useState, useMemo, useRef } from 'react';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import PrintableSchedule from '@/components/schedules/PrintableSchedule';
import MasterGrid from '@/components/MasterGrid';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Viewer',
        href: '/schedules/viewer',
    },
];

export default function ScheduleViewer({
    activeVersion,
    activeVersionId,
    versions = [],
    timeslots,
    semester,
    academicYear,
    schedules = [],
    rooms = [],
    teachers = [],
    sections = [],
    subjects = [],
    curriculumSubjects = [],
    versionStatus,
}) {
    console.log('ACTIVE VERSION ID:', activeVersionId);
    console.log('VERSIONS:', versions);
    console.log(schedules);
    const [activeTab, setActiveTab] = useState('grid');
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null);
    // const [viewSet, setViewSet] = useState('Set A');
    // View States for clicking cards
    const [selectedSection, setSelectedSection] = useState(null);
    const [updatingTeacher, setUpdatingTeacher] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [sectionSet, setSectionSet] = useState('Set A');
    const printRef = React.useRef();
    const handleSetChange = (newSet) => {
        setSectionSet(newSet);
    };

    const [sectionSearch, setSectionSearch] = useState('');
    const [teacherSearch, setTeacherSearch] = useState('');

    const filteredSections = useMemo(() => {
        return sections.filter((s) =>
            s.name?.toLowerCase().includes(sectionSearch.toLowerCase()),
        );
    }, [sections, sectionSearch]);

    const filteredTeachers = useMemo(() => {
        return teachers.filter((t) =>
            t.name?.toLowerCase().includes(teacherSearch.toLowerCase()),
        );
    }, [teachers, teacherSearch]);

    // Filters for Grid View
    const [filters, setFilters] = useState({
        set: 'Set A',
        department: 'All Department',
        day: 'Monday',
        building: 'All Building',
        floor: 'All Floor',
        shift: 'All Shift',
    });

    const [newSchedule, setNewSchedule] = useState({
        section_id: '',
        subject_id: '',
        teacher_id: '',
        room_id: '',
        timeslot_id: '',
        schedule_version_id: activeVersionId,
    });

    /**
     * SELECTED VALUES
     */
    const selectedSection1 = useMemo(
        () => sections.find((s) => s.id == newSchedule.section_id),
        [newSchedule.section_id],
    );

    const selectedSubject = useMemo(
        () => subjects.find((s) => s.id == newSchedule.subject_id),
        [newSchedule.subject_id],
    );

    const selectedTeacher1 = useMemo(
        () => teachers.find((t) => t.id == newSchedule.teacher_id),
        [newSchedule.teacher_id],
    );

    const groupedTimeslots = useMemo(() => {
        return timeslots.reduce((groups, slot) => {
            if (!groups[slot.day]) {
                groups[slot.day] = [];
            }

            groups[slot.day].push(slot);

            return groups;
        }, {});
    }, [timeslots]);

    /**
     * 1. FILTER SUBJECTS BY SECTION (SMART FILTER)
     */
    console.log('Semester:', semester);
    console.log('Selected Section:', selectedSection1);
    console.log('Curriculum Subjects:', curriculumSubjects);

    const currentSemester =
        semester === '1st Semester'
            ? 1
            : semester === '2nd Semester'
              ? 2
              : semester;
    const filteredSubjects = useMemo(() => {
        if (!selectedSection1) return [];

        return curriculumSubjects
            .filter((curriculum) => {
                return (
                    curriculum.program_id == selectedSection1.program_id &&
                    curriculum.year_level == selectedSection1.year_level &&
                    curriculum.semester == selectedSection1.semester
                );
            })
            .map((curriculum) => curriculum.subject);
    }, [curriculumSubjects, selectedSection1]);

    /**
     * 2. AVAILABLE ROOMS (BASED ON TIMESLOT)
     */
    const availableRooms = useMemo(() => {
        if (!newSchedule.timeslot_id) return rooms;

        // simple conflict filter (UI only)
        return rooms;
    }, [newSchedule.timeslot_id, rooms]);

    /**
     * 3. TEACHER WORKLOAD (UI ONLY)
     */
    const getTeacherLoad = (teacher) => {
        return teacher?.current_load ?? 0;
    };

    const saveManualSchedule = () => {
        setSaving(true);

        router.post('/schedules/manual-add', newSchedule, {
            preserveScroll: true,

            onSuccess: () => {
                toast.success('Schedule added successfully!');

                setShowAddModal(false);

                setNewSchedule({
                    section_id: '',
                    subject_id: '',
                    teacher_id: '',
                    room_id: '',
                    timeslot_id: '',
                    schedule_version_id: activeVersionId,
                });

                setSaving(false);
            },

            onError: (errors) => {
                Object.values(errors).forEach((message) => {
                    toast.error(message);
                });

                setSaving(false);
            },
        });
    };

    const hasSundaySchedule = schedules.some(
        (s) => s.timeslot?.day === 'Sunday',
    );

    const downloadJPEG = async () => {
        const element = printRef.current;

        const canvas = await html2canvas(element, {
            scale: 2,
        });

        canvas.toBlob((blob) => {
            if (blob) {
                saveAs(blob, 'schedule.jpeg');
            }
        });
    };
    const downloadPDF = async (data, type) => {
        const element = printRef.current;

        const canvas = await html2canvas(element, {
            scale: 2,
        });

        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('landscape', 'mm', 'a4');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

        pdf.save(`${data.name}_schedule.pdf`);
    };
    const DAYS = hasSundaySchedule
        ? [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
          ]
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Fixed Time blocks for the template rows
    const formatTime = (time) => {
        if (!time) return '';

        return new Date(`1970-01-01T${time}`)
            .toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
            .toLowerCase();
    };

    const dynamicTimeslots = timeslots.map((slot) => ({
        shift: slot.shift || 'Morning',

        label: `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`,

        start: slot.start_time,
    }));
    const SHIFTS = dynamicTimeslots.reduce((acc, slot) => {
        if (!acc[slot.shift]) {
            acc[slot.shift] = [];
        }

        acc[slot.shift].push(slot.label);

        return acc;
    }, {});
    Object.keys(SHIFTS).forEach((shift) => {
        SHIFTS[shift] = [...new Set(SHIFTS[shift])];

        SHIFTS[shift].sort((a, b) => {
            const aStart = a.split(' - ')[0];
            const bStart = b.split(' - ')[0];

            return (
                new Date(`1970/01/01 ${aStart}`) -
                new Date(`1970/01/01 ${bStart}`)
            );
        });
    });

    // If database has no rooms yet, use these to force the grid shape to appear.
    // =========================================
    // ROOM FILTERING
    // =========================================

    const buildingOptions = [
        'All Building',
        ...new Set(rooms.map((r) => r.building).filter(Boolean)),
    ];

    const floorOptions = [
        'All Floor',
        ...new Set(rooms.map((r) => r.floor).filter(Boolean)),
    ];

    // Filtered rooms for grid
    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {
            const buildingMatch =
                filters.building === 'All Building' ||
                room.building === filters.building;

            const floorMatch =
                filters.floor === 'All Floor' ||
                String(room.floor) === String(filters.floor);

            return buildingMatch && floorMatch;
        });
    }, [rooms, filters.building, filters.floor]);

    // fallback if no rooms exist
    const displayRooms = useMemo(() => {
        return filteredRooms.length > 0
            ? filteredRooms
            : [
                  { id: 't1', generated_name: 'ROOM 101' },
                  { id: 't2', generated_name: 'ROOM 102' },
                  { id: 't3', generated_name: 'ROOM 103' },
                  { id: 't4', generated_name: 'ROOM 104' },
              ];
    }, [filteredRooms]);
    const roomScheduleMap = useMemo(() => {
        const map = new Map();

        schedules.forEach((s) => {
            if (!s.timeslot_id || !s.room_id) return;

            map.set(`${s.timeslot_id}-${s.room_id}`, s);
        });

        return map;
    }, [schedules]);
    const timeslotLookup = useMemo(() => {
        const map = {};

        schedules.forEach((s) => {
            if (!s.timeslot) return;

            const key =
                `${formatTime(s.timeslot.start_time)} - ${formatTime(s.timeslot.end_time)}`
                    .replace(/\s/g, '')
                    .toLowerCase() +
                '|' +
                s.timeslot.day.toLowerCase();

            map[key] = s.timeslot_id;
        });

        return map;
    }, [schedules]);
    const scheduleMap = useMemo(() => {
        const map = {};

        schedules.forEach((s) => {
            if (!s.timeslot) return;

            const timeKey =
                `${formatTime(s.timeslot.start_time)}-${formatTime(s.timeslot.end_time)}`
                    .replace(/\s/g, '')
                    .toLowerCase();

            const dayKey = (s.timeslot.day || '').toLowerCase();

            // ROOM VIEW
            const roomKey = `${timeKey}|${dayKey}|room|${s.room_id}`;

            // TEACHER VIEW
            const teacherKey = `${timeKey}|${dayKey}|teacher|${s.teacher_id}`;

            // SECTION VIEW
            const sectionKey = `${timeKey}|${dayKey}|section|${s.section_id}`;

            map[roomKey] = s;
            map[teacherKey] = s;
            map[sectionKey] = s;
        });

        return map;
    }, [schedules]);

    const masterGridSchedules = useMemo(() => {
        return schedules.filter((s) => {
            if (!s.section) return false;

            if (sectionSet === 'Set A') {
                return s.section.year_level === 1;
            }

            return [2, 3, 4].includes(s.section.year_level);
        });
    }, [schedules, sectionSet]);

    const masterGridMap = useMemo(() => {
        const map = {};

        masterGridSchedules.forEach((s) => {
            if (!s.timeslot) return;

            const timeKey =
                `${formatTime(s.timeslot.start_time)}-${formatTime(s.timeslot.end_time)}`
                    .replace(/\s/g, '')
                    .toLowerCase();

            const dayKey = (s.timeslot.day || '').toLowerCase();

            const roomKey = `${timeKey}|${dayKey}|room|${s.room_id}`;

            // Clone schedule for ONLINE override
            const cloned = { ...s };

            if (sectionSet === 'Set B') {
                cloned.room = {
                    ...s.room,
                    generated_name: 'ONLINE',
                };
            }

            map[roomKey] = cloned;
        });

        return map;
    }, [masterGridSchedules, sectionSet]);

    const getMasterGridSchedule = (time, room_id, day) => {
        const cleanTime = time.replace(/\s/g, '').toLowerCase();

        const dayKey = (day || '').toLowerCase();

        const key = `${cleanTime}|${dayKey}|room|${room_id}`;

        return masterGridMap[key] || null;
    };

    const getSchedule = (
        time,
        room_id = null,
        day = null,
        teacher_id = null,
        section_id = null,
    ) => {
        const cleanTime = time.replace(/\s/g, '').toLowerCase();
        const dayKey = (day || '').toLowerCase();

        let key = '';

        if (room_id) {
            key = `${cleanTime}|${dayKey}|room|${room_id}`;
        }

        if (teacher_id) {
            key = `${cleanTime}|${dayKey}|teacher|${teacher_id}`;
        }

        if (section_id) {
            key = `${cleanTime}|${dayKey}|section|${section_id}`;
        }

        return scheduleMap[key] || null;
    };

    const handleDragStart = (e, scheduleId) => {
        setDraggedItem(scheduleId);

        e.dataTransfer.setData('scheduleId', scheduleId);
        toast.loading('Moving schedule...', {
            id: 'drag-toast',
        });
    };
    const programColors = {
        BC: 'bg-blue-100 border-blue-500 text-blue-900', // Computer Science
        BT: 'bg-green-100 border-green-500 text-green-900', // Tourism
        BP: 'bg-red-100 border-red-500 text-red-900', // Criminology
        BA: 'bg-yellow-100 border-yellow-500 text-yellow-900', // Accountancy
        BO: 'bg-purple-100 border-purple-500 text-purple-900', // Office Admin
    };
    const getProgramColor = (program) => {
        const code = program?.code; // THIS is the key

        return (
            programColors[code] || 'bg-gray-100 border-gray-400 text-gray-800'
        );
    };

    const handleDrop = (e, targetRoomId, targetTime, targetDay) => {
        e.preventDefault();

        const scheduleId = e.dataTransfer.getData('scheduleId');

        const lookupKey =
            targetTime.replace(/\s/g, '').toLowerCase() +
            '|' +
            targetDay.toLowerCase();

        const targetTimeslotId = timeslotLookup[lookupKey];

        // ❌ NO MATCH = conflict (invalid slot)
        if (!targetTimeslotId) {
            toast.error(
                'Failed to move schedule: conflicting or invalid timeslot',
                {
                    id: 'drag-toast',
                },
            );

            return;
        }

        toast.loading('Moving schedule...', {
            id: 'drag-toast',
        });

        router.put(
            `/schedules/${scheduleId}`,
            {
                room_id: targetRoomId,
                timeslot_id: targetTimeslotId,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    toast.success('Schedule moved successfully!', {
                        id: 'drag-toast',
                    });
                },

                onError: () => {
                    toast.error('Failed to move schedule (conflict detected)', {
                        id: 'drag-toast',
                    });
                },
            },
        );
    };
    const updateTeacher = (scheduleId, teacherId) => {
        router.put(`/schedules/${scheduleId}`, {
            teacher_id: teacherId,
        });
    };

    // --- RENDER: MASTER GRID TAB ---

    const getDisplayRoom = (sched, mode = 'section') => {
        if (!sched) return '';

        const year = sched.section?.year_level;

        // =========================
        // SECTION VIEW RULES
        // =========================
        if (mode === 'section') {
            // FIRST YEAR
            if (year === 1) {
                // Set A = FTF
                if (sectionSet === 'Set A') {
                    return sched.room?.generated_name || sched.room?.name;
                }

                // Set B = ONLINE
                return 'ONLINE';
            }

            // SECOND - FOURTH YEAR
            if ([2, 3, 4].includes(year)) {
                // Set B = FTF
                if (sectionSet === 'Set B') {
                    return sched.room?.generated_name || sched.room?.name;
                }

                // Set A = ONLINE
                return 'ONLINE';
            }
        }

        // =========================
        // TEACHER VIEW RULES
        // =========================
        if (mode === 'teacher') {
            // FIRST YEAR
            if (year === 1) {
                // Set A = FTF
                if (sectionSet === 'Set A') {
                    return sched.room?.generated_name || sched.room?.name;
                }

                // Set B = ONLINE
                return 'ONLINE';
            }

            // SECOND - FOURTH YEAR
            if ([2, 3, 4].includes(year)) {
                // Set B = FTF
                if (sectionSet === 'Set B') {
                    return sched.room?.generated_name || sched.room?.name;
                }

                // Set A = ONLINE
                return 'ONLINE';
            }
        }

        // fallback
        return sched.room?.generated_name || sched.room?.name;
    };

    // --- RENDER: SECTION DETAIL (Time vs Day) ---
    const renderSectionDetail = () => (
        <div className="animate-fadeIn mt-4">
            <button
                onClick={() => setSelectedSection(null)}
                className="mb-4 text-sm font-bold text-gray-500 hover:text-black"
            >
                ← Back to Sections
            </button>
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900">
                        {selectedSection.name}
                    </h2>
                    <div className="mt-1 text-sm text-gray-600 uppercase">
                        {/* <div>Dept: Assigned Department</div>
                        <div>
                            Capacity: {selectedSection.student_count || 0}{' '}
                            Students
                        </div> */}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex rounded-full bg-gray-900 p-1 text-sm font-bold text-white">
                        <button
                            onClick={() => handleSetChange('Set A')} // Changed this
                            className={`rounded-lg px-6 py-2 text-xs font-black transition-all ${
                                sectionSet === 'Set A'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            SET A
                        </button>
                        <button
                            onClick={() => handleSetChange('Set B')} // Changed this
                            className={`rounded-lg px-6 py-2 text-xs font-black transition-all ${
                                sectionSet === 'Set B'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            SET B
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() =>
                                downloadPDF(selectedSection, 'section')
                            }
                            className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                        >
                            PDF
                        </button>

                        <button
                            onClick={downloadJPEG}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                        >
                            JPEG
                        </button>

                        {/* <button
                            onClick={() =>
                                downloadPDF(
                                    { id: selectedSection.id },
                                    selectedSection.name,
                                    'section',
                                )
                            }
                            className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                        >
                            PDF
                        </button> */}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl bg-white p-2">
                <table className="w-full min-w-max border-collapse border-2 border-black text-center text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="w-28 border-2 border-black p-2 font-black uppercase">
                                SHIFT
                            </th>
                            {DAYS.map((day) => (
                                <th
                                    key={day}
                                    className="border-2 border-black p-3 font-bold uppercase"
                                >
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(SHIFTS).map(([shiftName, times]) =>
                            times.map((time, index) => (
                                <tr
                                    key={time}
                                    className="transition-colors hover:bg-blue-50"
                                >
                                    <td className="w-40 border-2 border-black bg-white px-2 py-1 font-bold whitespace-nowrap text-gray-800">
                                        {time}
                                    </td>
                                    {DAYS.map((day) => {
                                        const sched = getSchedule(
                                            time,
                                            null,
                                            day,
                                            null,
                                            selectedSection.id,
                                        );
                                        return (
                                            <td
                                                key={`${time}-${day}`}
                                                className="h-16 border-2 border-black bg-white p-2 align-middle"
                                            >
                                                {sched && (
                                                    <div className="flex flex-col items-center text-xs">
                                                        <div className="mb-0.5 text-sm font-black text-gray-900">
                                                            {
                                                                sched.subject
                                                                    ?.code
                                                            }
                                                        </div>
                                                        <div className="font-semibold text-gray-700">
                                                            <div className="font-semibold text-gray-700">
                                                                {getDisplayRoom(
                                                                    sched,
                                                                    'section',
                                                                )}{' '}
                                                                •{' '}
                                                                {
                                                                    sched
                                                                        .teacher
                                                                        ?.name
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            )),
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // --- RENDER: TEACHER DETAIL (Time vs Day) ---
    const renderTeacherDetail = () => (
        <div className="animate-fadeIn mt-4">
            <button
                onClick={() => setSelectedTeacher(null)}
                className="mb-4 text-sm font-bold text-gray-500 hover:text-black"
            >
                ← Back to Teachers
            </button>
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900">
                        {selectedTeacher.name}
                    </h2>
                    <div className="mt-1 text-sm text-gray-600 uppercase">
                        <div>Code: FAC-{selectedTeacher.id}</div>
                        <div>
                            Workload: {selectedTeacher.current_hours || 0}/
                            {selectedTeacher.max_hours || 0} Hours
                        </div>
                    </div>
                </div>

                {/* ✅ ADD THIS RIGHT SIDE BLOCK */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handleSetChange('Set A')} // Changed this
                        className={`rounded-lg px-6 py-2 text-xs font-black transition-all ${
                            sectionSet === 'Set A'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        SET A
                    </button>
                    <button
                        onClick={() => handleSetChange('Set B')} // Changed this
                        className={`rounded-lg px-6 py-2 text-xs font-black transition-all ${
                            sectionSet === 'Set B'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        SET B
                    </button>

                    <button
                        onClick={() => downloadPDF(selectedTeacher, 'teacher')}
                        className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                    >
                        PDF
                    </button>

                    <button
                        onClick={downloadJPEG}
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                    >
                        JPEG
                    </button>

                    {/* <button
                        onClick={() =>
                            downloadPDF(
                                { id: selectedTeacher.id },
                                selectedTeacher.name,
                                'teacher',
                            )
                        }
                        className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                    >
                        PDF
                    </button> */}
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl bg-white p-2">
                <table className="w-full min-w-max border-collapse border-2 border-black text-center text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="w-28 border-2 border-black p-2 font-black uppercase">
                                TIME
                            </th>
                            {DAYS.map((day) => (
                                <th
                                    key={day}
                                    className="border-2 border-black p-3 font-bold uppercase"
                                >
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(SHIFTS).map(([shiftName, times]) =>
                            times.map((time, index) => (
                                <tr
                                    key={time}
                                    className="transition-colors hover:bg-blue-50"
                                >
                                    <td className="w-40 border-2 border-black bg-white px-2 py-1 font-bold whitespace-nowrap text-gray-800">
                                        {time}
                                    </td>
                                    {DAYS.map((day) => {
                                        const sched = getSchedule(
                                            time,
                                            null,
                                            day,
                                            selectedTeacher.id,
                                            null,
                                        );
                                        return (
                                            <td
                                                key={`${time}-${day}`}
                                                className="h-16 border-2 border-black bg-white p-2 align-middle"
                                            >
                                                {sched && (
                                                    <div className="flex flex-col items-center text-xs">
                                                        <div className="mb-0.5 text-sm font-black text-gray-900">
                                                            {
                                                                sched.subject
                                                                    ?.code
                                                            }
                                                        </div>
                                                        <div className="font-semibold text-gray-700">
                                                            {getDisplayRoom(
                                                                sched,
                                                                'teacher',
                                                            )}{' '}
                                                            •{' '}
                                                            {
                                                                sched.section
                                                                    ?.name
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            )),
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // --- MAIN LAYOUT RETURN ---
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Viewer" />
            <div className="w-full max-w-full overflow-x-auto p-2 font-sans md:p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-gray-900">
                        Schedule Viewer
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-gray-500 uppercase">
                        Viewing: {activeVersion}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                        <select
                            className="rounded-lg border p-2 text-sm font-medium"
                            value={activeVersionId || ''}
                            onChange={(e) => {
                                router.get('/schedules/viewer', {
                                    version: e.target.value,
                                });
                            }}
                        >
                            {versions.map((version) => (
                                <option key={version.id} value={version.id}>
                                    #{version.version_number} • {version.status}{' '}
                                    • {version.academic_year} •{' '}
                                    {version.semester}
                                </option>
                            ))}
                        </select>

                        {versionStatus === 'Draft' && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                            >
                                + Add Schedule
                            </button>
                        )}
                    </div>
                </div>

                {/* Top Navigation Pill */}
                <div className="mb-6 flex w-full rounded-full bg-gray-200 p-1 shadow-inner md:w-3/4">
                    <button
                        onClick={() => {
                            setActiveTab('grid');
                            setSelectedSection(null);
                            setSelectedTeacher(null);
                        }}
                        className={`flex-1 rounded-full py-2 text-sm font-bold transition ${activeTab === 'grid' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                    >
                        MASTER GRID
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('section');
                            setSelectedTeacher(null);
                        }}
                        className={`flex-1 rounded-full py-2 text-sm font-bold transition ${activeTab === 'section' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                    >
                        BY SECTION
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('teacher');
                            setSelectedSection(null);
                        }}
                        className={`flex-1 rounded-full py-2 text-sm font-bold transition ${activeTab === 'teacher' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                    >
                        BY TEACHER
                    </button>
                </div>

                {/* TAB 1: GRID VIEW */}
                {activeTab === 'grid' && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-2 text-xs font-black tracking-wider text-gray-500 uppercase">
                            Grid Filters
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <select
                                className="rounded-lg border-2 border-gray-200 bg-gray-50 p-2 text-sm font-bold text-gray-700"
                                value={filters.day}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        day: e.target.value,
                                    })
                                }
                            >
                                {DAYS.map((d) => (
                                    <option key={d}>{d}</option>
                                ))}
                            </select>
                            <select
                                className="rounded-lg border-2 border-gray-200 bg-gray-50 p-2 text-sm font-bold text-gray-700"
                                value={filters.shift}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        shift: e.target.value,
                                    })
                                }
                            >
                                <option>All Shift</option>
                                <option>Morning</option>
                                <option>Afternoon</option>
                                <option>Evening</option>
                            </select>
                            <button
                                onClick={() => handleSetChange('Set A')} // Changed this
                                className={`rounded-lg px-6 py-2 text-xs font-black transition-all ${
                                    sectionSet === 'Set A'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                SET A
                            </button>
                            <button
                                onClick={() => handleSetChange('Set B')} // Changed this
                                className={`rounded-lg px-6 py-2 text-xs font-black transition-all ${
                                    sectionSet === 'Set B'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                SET B
                            </button>

                            {/* BUILDING FILTER */}
                            <select
                                className="rounded-lg border-2 border-gray-200 bg-gray-50 p-2 text-sm font-bold text-gray-700"
                                value={filters.building}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        building: e.target.value,
                                    })
                                }
                            >
                                {buildingOptions.map((building) => (
                                    <option key={building} value={building}>
                                        {building}
                                    </option>
                                ))}
                            </select>

                            {/* FLOOR FILTER */}
                            <select
                                className="rounded-lg border-2 border-gray-200 bg-gray-50 p-2 text-sm font-bold text-gray-700"
                                value={filters.floor}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        floor: e.target.value,
                                    })
                                }
                            >
                                {floorOptions.map((floor) => (
                                    <option key={floor} value={floor}>
                                        {floor}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {
                            <MasterGrid
                                SHIFTS={SHIFTS}
                                displayRooms={displayRooms}
                                filters={filters}
                                getMasterGridSchedule={getMasterGridSchedule}
                                handleDrop={handleDrop}
                                handleDragStart={handleDragStart}
                                setEditingSchedule={setEditingSchedule}
                                getProgramColor={getProgramColor}
                            />
                        }
                    </div>
                )}

                {/* TAB 2: BY SECTION */}
                {activeTab === 'section' && !selectedSection && (
                    <div>
                        <input
                            type="text"
                            placeholder="Search Section..."
                            value={sectionSearch}
                            onChange={(e) => setSectionSearch(e.target.value)}
                            className="mb-6 w-full rounded-lg border-2 border-gray-200 bg-white p-3 font-bold shadow-sm md:w-1/3"
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                            {sections &&
                                filteredSections.map((s) => (
                                    <div
                                        key={s.id}
                                        onClick={() => setSelectedSection(s)}
                                        className="cursor-pointer rounded-xl border-2 border-gray-200 bg-white p-5 transition hover:border-black"
                                    >
                                        <h2 className="mb-1 text-2xl font-black text-gray-900">
                                            {s.name}
                                        </h2>
                                        <p className="text-sm font-bold text-gray-500">
                                            👥 {s.capacity || 0} Students
                                        </p>
                                    </div>
                                ))}
                            {(!sections || sections.length === 0) && (
                                <p className="text-gray-500">
                                    No sections found in database.
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'section' &&
                    selectedSection &&
                    renderSectionDetail()}

                {/* TAB 3: BY TEACHER */}
                {activeTab === 'teacher' && !selectedTeacher && (
                    <div>
                        <input
                            type="text"
                            placeholder="Search Teacher..."
                            value={teacherSearch}
                            onChange={(e) => setTeacherSearch(e.target.value)}
                            className="mb-6 w-full rounded-lg border-2 border-gray-200 bg-white p-3 font-bold shadow-sm md:w-1/3"
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                            {teachers &&
                                filteredTeachers.map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => setSelectedTeacher(t)}
                                        className="cursor-pointer rounded-xl border-2 border-gray-200 bg-white p-5 transition hover:border-black"
                                    >
                                        <h2 className="mb-1 text-xl font-black text-gray-900">
                                            {t.name}
                                        </h2>
                                        <p className="text-sm font-bold text-gray-500">
                                            🕒 {t.current_hours || 0} Hrs (
                                            {t.workload_percent || 0}%)
                                        </p>
                                    </div>
                                ))}
                            {(!teachers || teachers.length === 0) && (
                                <p className="text-gray-500">
                                    No teachers found in database.
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'teacher' &&
                    selectedTeacher &&
                    renderTeacherDetail()}
            </div>
            {editingSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                        <h3 className="mb-2 text-2xl font-black">
                            Edit Schedule
                        </h3>

                        <p className="mb-6 text-sm font-bold tracking-widest text-gray-500 uppercase">
                            {editingSchedule.subject?.code}
                        </p>

                        <label className="mb-2 block text-xs font-black tracking-widest text-gray-400 uppercase">
                            Assign Teacher
                        </label>

                        <select
                            disabled={updatingTeacher}
                            className={`mb-8 w-full rounded-xl border border-gray-200 p-3 font-bold transition ${
                                updatingTeacher
                                    ? 'cursor-not-allowed bg-gray-100 opacity-60'
                                    : 'bg-white'
                            }`}
                            value={editingSchedule.teacher_id || ''}
                            onChange={async (e) => {
                                const newTeacherId = Number(e.target.value);

                                // backup old teacher
                                const oldTeacherId = editingSchedule.teacher_id;

                                // optimistic update
                                setEditingSchedule({
                                    ...editingSchedule,
                                    teacher_id: newTeacherId,
                                });

                                setUpdatingTeacher(true);

                                const toastId = toast.loading(
                                    'Updating teacher...',
                                );

                                try {
                                    await updateTeacher(
                                        editingSchedule.id,
                                        newTeacherId,
                                    );

                                    toast.success(
                                        'Teacher updated successfully!',
                                        {
                                            id: toastId,
                                        },
                                    );
                                } catch (error) {
                                    // rollback
                                    setEditingSchedule({
                                        ...editingSchedule,
                                        teacher_id: oldTeacherId,
                                    });

                                    toast.error('Failed to update teacher.', {
                                        id: toastId,
                                    });
                                } finally {
                                    setUpdatingTeacher(false);
                                }
                            }}
                        >
                            <option value="">Select Teacher</option>

                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        {updatingTeacher && (
                            <div className="mb-4 text-center text-xs font-bold tracking-widest text-blue-600 uppercase">
                                Saving Changes...
                            </div>
                        )}

                        <button
                            disabled={updatingTeacher}
                            onClick={() => setEditingSchedule(null)}
                            className={`w-full rounded-xl py-3 text-xs font-black tracking-widest text-white uppercase transition ${
                                updatingTeacher
                                    ? 'cursor-not-allowed bg-gray-400'
                                    : 'bg-gray-900 hover:bg-black'
                            }`}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                        {/* HEADER */}
                        <div className="border-b px-8 py-6">
                            <h2 className="text-2xl font-black">
                                Manual Schedule Builder
                            </h2>

                            <p className="text-sm text-slate-500">
                                Smart assignment with live validation
                            </p>
                        </div>

                        {/* BODY */}
                        <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
                            {/* SECTION */}
                            <div>
                                <label className="text-xs font-black text-slate-500 uppercase">
                                    Section
                                </label>

                                <select
                                    className="mt-2 w-full rounded-xl border p-3"
                                    value={newSchedule.section_id}
                                    onChange={(e) =>
                                        setNewSchedule({
                                            ...newSchedule,
                                            section_id: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Select Section</option>

                                    {sections.map((section) => (
                                        <option
                                            key={section.id}
                                            value={section.id}
                                        >
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* SUBJECT (FILTERED) */}
                            <div>
                                <label className="text-xs font-black text-slate-500 uppercase">
                                    Subject
                                </label>

                                <select
                                    className="mt-2 w-full rounded-xl border p-3"
                                    value={newSchedule.subject_id}
                                    onChange={(e) =>
                                        setNewSchedule({
                                            ...newSchedule,
                                            subject_id: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Select Subject</option>

                                    {filteredSubjects.map((subject) => (
                                        <option
                                            key={subject.id}
                                            value={subject.id}
                                        >
                                            {subject.code} - {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* TEACHER */}
                            <div>
                                <label className="text-xs font-black text-slate-500 uppercase">
                                    Teacher
                                </label>

                                <select
                                    className="mt-2 w-full rounded-xl border p-3"
                                    value={newSchedule.teacher_id}
                                    onChange={(e) =>
                                        setNewSchedule({
                                            ...newSchedule,
                                            teacher_id: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Select Teacher</option>

                                    {teachers.map((teacher) => (
                                        <option
                                            key={teacher.id}
                                            value={teacher.id}
                                        >
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>

                                {/* WORKLOAD BADGE */}
                                {selectedTeacher1 && (
                                    <div className="mt-2 rounded-lg bg-slate-100 p-2 text-sm">
                                        Load:
                                        <span className="font-black">
                                            {' '}
                                            {getTeacherLoad(selectedTeacher1)}
                                        </span>
                                        {' / '}
                                        {selectedTeacher1.max_hours}
                                    </div>
                                )}
                            </div>

                            {/* ROOM */}
                            <div>
                                <label className="text-xs font-black text-slate-500 uppercase">
                                    Room
                                </label>

                                <select
                                    className="mt-2 w-full rounded-xl border p-3"
                                    value={newSchedule.room_id}
                                    onChange={(e) =>
                                        setNewSchedule({
                                            ...newSchedule,
                                            room_id: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Select Room</option>

                                    {availableRooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            {room.generated_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* TIMESLOT */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-black text-slate-500 uppercase">
                                    Timeslot
                                </label>

                                <select
                                    className="mt-2 w-full rounded-xl border p-3"
                                    value={newSchedule.timeslot_id}
                                    onChange={(e) =>
                                        setNewSchedule({
                                            ...newSchedule,
                                            timeslot_id: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Select Timeslot</option>

                                    {Object.entries(groupedTimeslots).map(
                                        ([day, slots]) => (
                                            <optgroup
                                                key={day}
                                                label={day.toUpperCase()}
                                            >
                                                {slots.map((slot) => (
                                                    <option
                                                        key={slot.id}
                                                        value={slot.id}
                                                    >
                                                        {formatTime(
                                                            slot.start_time,
                                                        )}{' '}
                                                        -{' '}
                                                        {formatTime(
                                                            slot.end_time,
                                                        )}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ),
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-3 border-t bg-slate-50 px-8 py-5">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="rounded-xl border px-6 py-3 font-bold"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={saving}
                                onClick={saveManualSchedule}
                                className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: 0,
                }}
            >
                <PrintableSchedule
                    ref={printRef}
                    data={selectedTeacher || selectedSection}
                    type={selectedTeacher ? 'teacher' : 'section'}
                    schedules={schedules}
                    SHIFTS={SHIFTS}
                    DAYS={DAYS}
                    semester={semester}
                    academicYear={academicYear}
                    sectionSet={sectionSet}
                    getSchedule={getSchedule}
                    getDisplayRoom={getDisplayRoom}
                />
            </div>
        </AppLayout>
    );
}
