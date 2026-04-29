# =====================================================
# VALID TIMESLOT FILTER
# PURPOSE:
# ✔ 4th year evening priority
# ✔ Shift preference
# ✔ Fallback safety
# =====================================================
def get_valid_timeslots(
    unit,
    data
):

    year_level = unit.get(
        "year_level"
    )

    preferred_shift = unit.get(
        "preferred_shift"
    )

    # =================================================
    # HARD RULE:
    # 4TH YEAR → EVENING
    # =================================================
    if year_level == 4:

        evening_slots = [
            ts for ts in data["timeslots"]
            if ts.get("shift") == "evening"
        ]

        if evening_slots:
            return evening_slots

    # =================================================
    # PREFERRED SHIFT
    # =================================================
    if preferred_shift:

        preferred_slots = [
            ts for ts in data["timeslots"]
            if ts.get("shift") == preferred_shift
        ]

        if preferred_slots:
            return preferred_slots

    # =================================================
    # FALLBACK
    # =================================================
    return data["timeslots"]


# =====================================================
# VARIABLE BUILDER
# PURPOSE:
# unit × valid room × valid timeslot
# Laravel already pre-assigns teacher
# =====================================================
def build_assignment_variables(
    model,
    data
):

    assignments = {}

    for unit in data["class_units"]:

        valid_rooms = data["rooms"]

        valid_timeslots = get_valid_timeslots(
            unit,
            data
        )

        for room in valid_rooms:
            for ts in valid_timeslots:

                key = (
                    unit["id"],
                    room["id"],
                    ts["id"]
                )

                assignments[key] = (
                    model.NewBoolVar(
                        f"x_{unit['id']}_{room['id']}_{ts['id']}"
                    )
                )

    return assignments