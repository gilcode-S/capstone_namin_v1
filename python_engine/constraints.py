# =====================================================
# UNIT ASSIGNMENT (SOFT VIA OBJECTIVE)
# =====================================================
def add_unit_assignment_constraint(model, domain_map):

    for unit_id, vars_ in domain_map.items():
        if vars_:
            model.Add(sum(vars_) == 1)


# =====================================================
# ROOM CONFLICT
# =====================================================
def add_room_conflict(model, assignments, timeslots):

    for room_id in set(k[1] for k in assignments.keys()):
        for ts in timeslots:

            vars_ = [
                v for k, v in assignments.items()
                if k[1] == room_id and k[2] == ts["id"]
            ]

            if vars_:
                model.Add(sum(vars_) <= 1)


# =====================================================
# SECTION CONFLICT
# =====================================================
def add_section_conflict(model, assignments, units, timeslots):

    unit_map = {u["id"]: u["section_id"] for u in units}

    for section_id in set(unit_map.values()):
        for ts in timeslots:

            vars_ = [
                v for k, v in assignments.items()
                if unit_map[k[0]] == section_id and k[2] == ts["id"]
            ]

            if vars_:
                model.Add(sum(vars_) <= 1)


# =====================================================
# TEACHER CONFLICT (SOFT)
# =====================================================
def add_teacher_conflict(model, assignments, units, timeslots):

    teacher_map = {u["id"]: u.get("teacher_id") for u in units}

    penalties = []

    for teacher_id in set(teacher_map.values()):

        for ts in timeslots:

            vars_ = [
                v for k, v in assignments.items()
                if teacher_map[k[0]] == teacher_id
                and k[2] == ts["id"]
            ]

            if vars_:
                overload = model.NewIntVar(0, 10, f"over_{teacher_id}_{ts['id']}")
                model.Add(sum(vars_) <= 1 + overload)
                penalties.append(overload)

    return penalties