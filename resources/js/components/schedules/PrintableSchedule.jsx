import React from 'react';

const PrintableSchedule = React.memo(
    React.forwardRef(
        (
            {
                data,
                type,
                schedules = [],
                SHIFTS = {},
                DAYS = [],
                semester,
                academicYear,
                sectionSet,
                getSchedule,
                getDisplayRoom,
            },
            ref,
        ) => {
            if (!data) return null;

            const teacherSchedules = schedules.filter(
                (s) => s.teacher_id === data?.id,
            );

            const summarySubjects = [];

            teacherSchedules.forEach((s) => {
                const existing = summarySubjects.find(
                    (x) => x.code === s.subject?.code,
                );

                if (existing) {
                    if (!existing.sectionIds.includes(s.section_id)) {
                        existing.sectionIds.push(s.section_id);

                        existing.sections += 1;

                        // units × sections
                        existing.hours = existing.units * existing.sections;
                    }
                } else {
                    const units = s.subject?.units || 3;

                    summarySubjects.push({
                        code: s.subject?.code,
                        description: s.subject?.name,

                        units,

                        sections: 1,

                        hours: units,

                        sectionIds: [s.section_id],
                    });
                }
            });

            const allTimes = Object.values(SHIFTS).flat();

            const totalHours = summarySubjects.reduce(
                (sum, subject) => sum + subject.hours,
                0,
            );

            const dayTotals = DAYS.map((day) => {
                return teacherSchedules.filter(
                    (s) => s.timeslot?.day?.toLowerCase() === day.toLowerCase(),
                ).length;
            });

            return (
                <div
                    ref={ref}
                    style={{
                        width: '1800px',
                        background: 'white',
                        color: 'black',
                        fontFamily: 'Arial Narrow, Arial, sans-serif',
                        padding: '12px',
                    }}
                >
                    <div style={{ border: '2px solid black' }}>
                        {/* HEADER */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 260px',
                                borderBottom: '2px solid black',
                                minHeight: '150px',
                            }}
                        >
                            {/* LEFT */}
                            <div
                                style={{
                                    padding: '12px',
                                    borderRight: '2px solid black',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '26px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    AISAT College - Dasmariñas
                                </div>

                                <div
                                    style={{
                                        marginTop: '4px',
                                        fontSize: '15px',
                                    }}
                                >
                                    Dasmariñas City, Cavite
                                </div>

                                <div
                                    style={{
                                        marginTop: '10px',
                                        fontSize: '17px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {semester}, School Year {academicYear}
                                </div>

                                <div
                                    style={{
                                        marginTop: '18px',
                                        display: 'grid',
                                        gridTemplateColumns:
                                            type === 'teacher'
                                                ? '140px 1fr 140px 140px'
                                                : '120px 1fr',
                                        alignItems: 'center',
                                        gap: '10px',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                        }}
                                    >
                                        {type === 'teacher'
                                            ? 'Professor:'
                                            : 'Section:'}
                                    </div>

                                    <div
                                        style={{
                                            fontWeight: 'bold',
                                            fontStyle: 'italic',
                                            fontSize: '28px',
                                        }}
                                    >
                                        {data?.name}
                                    </div>

                                    {type === 'teacher' && (
                                        <>
                                            <div style={{ fontSize: '15px' }}>
                                                <b>Faculty Code:</b>
                                                <br />
                                                {data?.code || 'N/A'}
                                            </div>

                                            <div style={{ fontSize: '15px' }}>
                                                <b>Total Hours:</b>
                                                <br />
                                                {totalHours}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div
                                style={{
                                    background: '#0b1f5e',
                                    color: 'white',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '12px',
                                        borderBottom: '2px solid white',
                                        textAlign: 'center',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Effectivity:
                                    <br />
                                    {new Date().toLocaleDateString()}
                                </div>

                                <div
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '48px',
                                        fontWeight: '900',
                                    }}
                                >
                                    SET {sectionSet === 'Set A' ? 'A' : 'B'}
                                </div>
                            </div>
                        </div>

                        {/* MAIN TABLE */}
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                tableLayout: 'fixed',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            border: '2px solid black',
                                            padding: '8px',
                                            fontSize: '15px',
                                            width: '160px',
                                        }}
                                    >
                                        TIME
                                    </th>

                                    {DAYS.map((day, index) => (
                                        <th
                                            key={day}
                                            style={{
                                                border: '2px solid black',
                                                padding: '8px',
                                                fontSize: '15px',
                                            }}
                                        >
                                            {String(index + 1).padStart(2, '0')}
                                            _{day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {allTimes.map((time, rowIndex) => {
                                    const rowLetter = String.fromCharCode(
                                        65 + rowIndex,
                                    );

                                    return (
                                        <tr key={time}>
                                            <td
                                                style={{
                                                    border: '2px solid black',
                                                    padding: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                <div>{rowLetter}_</div>
                                                <div
                                                    style={{ marginTop: '6px' }}
                                                >
                                                    {time}
                                                </div>
                                            </td>

                                            {DAYS.map((day) => {
                                                const sched =
                                                    type === 'section'
                                                        ? getSchedule(
                                                              time,
                                                              null,
                                                              day,
                                                              null,
                                                              data.id,
                                                          )
                                                        : getSchedule(
                                                              time,
                                                              null,
                                                              day,
                                                              data.id,
                                                              null,
                                                          );

                                                return (
                                                    <td
                                                        key={day + time}
                                                        style={{
                                                            border: '2px solid black',
                                                            height: '105px',
                                                            padding: '0',
                                                            verticalAlign:
                                                                'top',
                                                        }}
                                                    >
                                                        {sched && (
                                                            <div
                                                                style={{
                                                                    height: '100%',
                                                                    display:
                                                                        'grid',
                                                                    gridTemplateRows:
                                                                        '42px 1fr',
                                                                }}
                                                            >
                                                                {/* SUBJECT */}
                                                                <div
                                                                    style={{
                                                                        borderBottom:
                                                                            '2px solid black',
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                        fontWeight:
                                                                            '900',
                                                                        fontSize:
                                                                            '18px',
                                                                    }}
                                                                >
                                                                    {
                                                                        sched
                                                                            .subject
                                                                            ?.code
                                                                    }
                                                                </div>

                                                                {/* LOWER */}
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            'grid',
                                                                        gridTemplateColumns:
                                                                            '1fr 1fr',
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            background:
                                                                                getDisplayRoom(
                                                                                    sched,
                                                                                    type,
                                                                                )
                                                                                    ?.toUpperCase()
                                                                                    ?.includes(
                                                                                        'ONLINE',
                                                                                    )
                                                                                    ? '#fff176'
                                                                                    : '#b9f6ca',
                                                                            borderRight:
                                                                                '2px solid black',
                                                                            display:
                                                                                'flex',
                                                                            alignItems:
                                                                                'center',
                                                                            justifyContent:
                                                                                'center',
                                                                            fontSize:
                                                                                '15px',
                                                                            fontWeight:
                                                                                'bold',
                                                                        }}
                                                                    >
                                                                        {getDisplayRoom(
                                                                            sched,
                                                                            type,
                                                                        )}
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            background:
                                                                                '#f8fafc',
                                                                            display:
                                                                                'flex',
                                                                            alignItems:
                                                                                'center',
                                                                            justifyContent:
                                                                                'center',
                                                                            fontSize:
                                                                                '15px',
                                                                            fontWeight:
                                                                                'bold',
                                                                        }}
                                                                    >
                                                                        {type ===
                                                                        'section'
                                                                            ? sched
                                                                                  .teacher
                                                                                  ?.code ||
                                                                              sched
                                                                                  .teacher
                                                                                  ?.name
                                                                            : sched
                                                                                  .section
                                                                                  ?.name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>

                            {/* TOTALS */}
                            {type === 'teacher' && (
                                <tfoot>
                                    <tr>
                                        <td
                                            style={{
                                                border: '2px solid black',
                                                padding: '10px',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            TOTAL ({totalHours})
                                        </td>

                                        {dayTotals.map((total, index) => (
                                            <td
                                                key={index}
                                                style={{
                                                    border: '2px solid black',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {total}
                                            </td>
                                        ))}
                                    </tr>
                                </tfoot>
                            )}
                        </table>

                        {/* SUMMARY */}
                        {type === 'teacher' && (
                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    marginTop: '6px',
                                }}
                            >
                                <thead>
                                    <tr>
                                        {[
                                            'Subject Code',
                                            'Description',
                                            'Unit',
                                            'Sections',
                                            'Hours',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                style={{
                                                    border: '2px solid black',
                                                    padding: '8px',
                                                    background: '#f3f3f3',
                                                }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {summarySubjects.map((sub, i) => (
                                        <tr key={i}>
                                            <td
                                                style={{
                                                    border: '1px solid black',
                                                    padding: '8px',
                                                }}
                                            >
                                                {sub.code}
                                            </td>
                                            <td
                                                style={{
                                                    border: '1px solid black',
                                                    padding: '8px',
                                                }}
                                            >
                                                {sub.description}
                                            </td>
                                            <td
                                                style={{
                                                    border: '1px solid black',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {sub.units}
                                            </td>
                                            <td
                                                style={{
                                                    border: '1px solid black',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {sub.sections}
                                            </td>
                                            <td
                                                style={{
                                                    border: '1px solid black',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {sub.hours}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* FOOTER */}
                        {type === 'teacher' && (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 220px 220px',
                                    borderTop: '2px solid black',
                                    fontWeight: 'bold',
                                }}
                            >
                                <div style={{ padding: '14px' }}>
                                    Updated as of {new Date().toLocaleString()}
                                </div>

                                <div
                                    style={{
                                        borderLeft: '2px solid black',
                                        padding: '14px',
                                    }}
                                >
                                    TOTAL SECTIONS:
                                    <br />
                                    {summarySubjects.reduce(
                                        (sum, s) => sum + s.sections,
                                        0,
                                    )}
                                </div>

                                <div
                                    style={{
                                        borderLeft: '2px solid black',
                                        padding: '14px',
                                    }}
                                >
                                    TOTAL HOURS:
                                    <br />
                                    {totalHours}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        },
    ),
);

export default PrintableSchedule;
