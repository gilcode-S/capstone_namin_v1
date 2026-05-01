# =====================================================
# SMART TIMESLOT FILTER
# =====================================================
def get_valid_timeslots(unit, data):

    year_level = unit.get("year_level")
    preferred_shift = unit.get("preferred_shift")

    timeslots = data["timeslots"]

    # ❌ 1st year no evening
    if year_level == 1:
        timeslots = [ts for ts in timeslots if ts.get("shift") != "evening"]

    # ✅ 4th year evening priority
    elif year_level == 4:
        evening = [ts for ts in timeslots if ts.get("shift") == "evening"]
        if evening:
            timeslots = evening

    # ✅ preferred shift
    if preferred_shift:
        pref = [ts for ts in timeslots if ts.get("shift") == preferred_shift]
        if pref:
            timeslots = pref

    # ✅ smart limit (NOT global slice)
    return timeslots[:8]


# =====================================================
# VARIABLE BUILDER (SMART DOMAIN PRUNING)
# =====================================================
def build_assignment_variables(model, data):

    assignments = {}
    domain_map = {}

    for unit in data["class_units"]:

        # ✅ match room type
        valid_rooms = [
            r for r in data["rooms"]
            if r.get("type") == unit.get("room_type")
        ]

        # fallback but LIMIT only slightly
        if not valid_rooms:
            valid_rooms = data["rooms"][:10]

        # ✅ timeslots
        valid_timeslots = get_valid_timeslots(unit, data)

        vars_for_unit = []

        for room in valid_rooms[:10]:   # ✅ allow more rooms (NOT 5)
            for ts in valid_timeslots:

                key = (unit["id"], room["id"], ts["id"])

                var = model.NewBoolVar(
                    f"x_{unit['id']}_{room['id']}_{ts['id']}"
                )

                assignments[key] = var
                vars_for_unit.append(var)

        domain_map[unit["id"]] = vars_for_unit

    return assignments, domain_map