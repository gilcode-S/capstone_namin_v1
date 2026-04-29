# =====================================================
# UNIT MUST BE ASSIGNED EXACTLY ONCE
# =====================================================
def add_unit_assignment_constraint(
    model,
    assignments,
    data
):

    for unit in data["class_units"]:

        vars_ = [
            v for k, v in assignments.items()
            if k[0] == unit["id"]
        ]

        if vars_:
            model.Add(
                sum(vars_) == 1
            )


# =====================================================
# ROOM CONFLICT
# One room cannot host 2 classes at same time
# =====================================================
def add_room_conflict(
    model,
    assignments,
    data
):

    for room in data["rooms"]:
        for ts in data["timeslots"]:

            vars_ = [
                v for k, v in assignments.items()
                if k[1] == room["id"]
                and k[2] == ts["id"]
            ]

            if vars_:
                model.Add(
                    sum(vars_) <= 1
                )


# =====================================================
# SECTION CONFLICT
# Section + Set A/B/C only
# Set A and Set B can run simultaneously
# =====================================================
def add_section_conflict(
    model,
    assignments,
    data
):

    unit_map = {
        u["id"]: (
            u["section_id"],
            u.get("set_type", "A")
        )
        for u in data["class_units"]
    }

    unique_groups = set(
        unit_map.values()
    )

    for section_id, set_type in unique_groups:
        for ts in data["timeslots"]:

            vars_ = [
                v for k, v in assignments.items()
                if unit_map[k[0]] == (
                    section_id,
                    set_type
                )
                and k[2] == ts["id"]
            ]

            if vars_:
                model.Add(
                    sum(vars_) <= 1
                )


# =====================================================
# TEACHER CONFLICT
# One teacher cannot teach 2 classes same time
# =====================================================
def add_teacher_conflict(
    model,
    assignments,
    data
):

    teacher_map = {
        u["id"]: u.get("teacher_id")
        for u in data["class_units"]
    }

    teacher_ids = set(
        t for t in teacher_map.values()
        if t is not None
    )

    for teacher_id in teacher_ids:
        for ts in data["timeslots"]:

            vars_ = [
                v for k, v in assignments.items()
                if teacher_map[k[0]] == teacher_id
                and k[2] == ts["id"]
            ]

            if vars_:
                model.Add(
                    sum(vars_) <= 1
                )