export default function MasterGrid({
    SHIFTS,
    displayRooms,
    filters,
    getMasterGridSchedule,
    handleDrop,
    handleDragStart,
    setEditingSchedule,
    getProgramColor,
}) {
    return (
        <div className="mt-6 overflow-hidden bg-white">
            <div
                className="w-full overflow-x-auto overflow-y-auto pb-8"
                style={{ maxHeight: '75vh' }}
            >
                {Object.entries(SHIFTS).map(([shiftName, times]) => {
                    if (
                        filters.shift !== 'All Shift' &&
                        filters.shift !== shiftName
                    )
                        return null;

                    return (
                        <div
                            key={shiftName}
                            className="mb-10 min-w-max px-2"
                        >
                            <table className="w-full border-collapse border-2 border-black text-center text-sm">
                                <thead>
                                    <tr>
                                        <th className="w-28 border-2 border-black bg-gray-100 px-2 py-2 text-sm font-black tracking-widest text-gray-900 uppercase">
                                            {shiftName}
                                        </th>

                                        {displayRooms.map((room) => (
                                            <th
                                                key={room.id}
                                                className="min-w-[140px] border-2 border-black bg-gray-50 p-3 font-bold tracking-wide text-gray-800 uppercase"
                                            >
                                                {room.generated_name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {times.map((time) => (
                                        <tr
                                            key={time}
                                            className="transition-colors hover:bg-blue-50"
                                        >
                                            <td className="w-40 border-2 border-black bg-white px-2 py-1 font-bold whitespace-nowrap text-gray-800">
                                                {time}
                                            </td>

                                            {displayRooms.map((room) => {
                                                const sched =
                                                    getMasterGridSchedule(
                                                        time,
                                                        room.id,
                                                        filters.day,
                                                    );

                                                return (
                                                    <td
                                                        key={`${time}-${room.id}`}
                                                        onDragOver={(e) =>
                                                            e.preventDefault()
                                                        }
                                                        onDrop={(e) =>
                                                            handleDrop(
                                                                e,
                                                                room.id,
                                                                time,
                                                                filters.day,
                                                            )
                                                        }
                                                        className={`h-16 border-2 border-black p-2 align-middle transition-all ${
                                                            !sched
                                                                ? 'hover:bg-blue-50/30'
                                                                : ''
                                                        } ${
                                                            sched?.is_fallback
                                                                ? 'bg-orange-50'
                                                                : 'bg-white'
                                                        }`}
                                                    >
                                                        {sched ? (
                                                            <div
                                                                draggable
                                                                onDragStart={(
                                                                    e,
                                                                ) =>
                                                                    handleDragStart(
                                                                        e,
                                                                        sched.id,
                                                                    )
                                                                }
                                                                onClick={() =>
                                                                    setEditingSchedule(
                                                                        sched,
                                                                    )
                                                                }
                                                                className={`flex h-full w-full cursor-move flex-col justify-between rounded-xl border-2 p-3 transition-all ${
                                                                    sched.is_fallback
                                                                        ? 'border-orange-400 bg-orange-50'
                                                                        : getProgramColor(
                                                                              sched
                                                                                  .section
                                                                                  ?.program,
                                                                          )
                                                                } hover:-translate-y-1 hover:shadow-lg`}
                                                            >
                                                                <div>
                                                                    <div className="text-[10px] font-black text-gray-400 uppercase">
                                                                        {
                                                                            sched
                                                                                .subject
                                                                                ?.code
                                                                        }
                                                                    </div>

                                                                    <div className="mt-1 text-sm leading-tight font-black">
                                                                        {
                                                                            sched
                                                                                .teacher
                                                                                ?.name
                                                                        }
                                                                    </div>

                                                                    <div className="text-[11px] font-bold text-gray-600 uppercase">
                                                                        {
                                                                            sched
                                                                                .section
                                                                                ?.name
                                                                        }
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={`self-end rounded-full px-2 py-0.5 text-[10px] font-black ${
                                                                        sched
                                                                            .section
                                                                            ?.capacity >
                                                                        room.capacity
                                                                            ? 'bg-red-100 text-red-600'
                                                                            : 'bg-gray-100 text-gray-500'
                                                                    }`}
                                                                >
                                                                    {(sched
                                                                        .section
                                                                        ?.capacity ||
                                                                        60) +
                                                                        '/' +
                                                                        (room.capacity ||
                                                                            0)}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-full w-full rounded-xl border-2 border-dashed border-gray-100"></div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}