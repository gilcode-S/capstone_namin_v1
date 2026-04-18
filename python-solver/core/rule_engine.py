from collections import defaultdict


class RuleEngine:

    def __init__(self):
        # section_schedule[section][day] = list of timeslots
        self.section_schedule = defaultdict(lambda: defaultdict(list))

        # faculty_schedule[faculty][day] = list of timeslots
        self.faculty_schedule = defaultdict(lambda: defaultdict(list))

        self.teacher_load = defaultdict(int)

        # 🔥 optional cache (very important for CP-SAT loops)
        self.cache = {}

    # -----------------------------
    # FAST OVERLAP CHECK
    # -----------------------------
    def _overlap(self, t1, t2):
        return max(t1["start_min"], t2["start_min"]) < min(t1["end_min"], t2["end_min"])

    # -----------------------------
    # PURE CHECK (OPTIMIZED)
    # -----------------------------
    def can_schedule(self, assignment, timeslot):

        key = (assignment["id"], timeslot["id"])
        if key in self.cache:
            return self.cache[key]

        section = assignment["section_id"]
        faculty = assignment.get("faculty_id")
        day = timeslot["day_of_week"]

        # -----------------------------
        # 1. LOAD CHECK (EARLY EXIT)
        # -----------------------------
        if faculty:
            max_load = assignment.get("max_load", 18)
            if self.teacher_load[faculty] >= max_load:
                self.cache[key] = False
                return False

        # -----------------------------
        # 2. SECTION CONFLICT (FAST LOOP)
        # -----------------------------
        section_day_list = self.section_schedule[section][day]

        for used in section_day_list:
            if self._overlap(used, timeslot):
                self.cache[key] = False
                return False

        # -----------------------------
        # 3. FACULTY CONFLICT
        # -----------------------------
        if faculty:
            faculty_day_list = self.faculty_schedule[faculty][day]

            for used in faculty_day_list:
                if self._overlap(used, timeslot):
                    self.cache[key] = False
                    return False

        self.cache[key] = True
        return True

    # -----------------------------
    # APPLY RESULT (NO LOGIC HERE)
    # -----------------------------
    def assign(self, assignment, timeslot):

        section = assignment["section_id"]
        faculty = assignment.get("faculty_id")
        day = timeslot["day_of_week"]
        units = assignment.get("units", 3)

        self.section_schedule[section][day].append(timeslot)

        if faculty:
            self.faculty_schedule[faculty][day].append(timeslot)
            self.teacher_load[faculty] += units

        # invalidate cache (IMPORTANT!)
        self.cache.clear()

        return True

    # -----------------------------
    # RESET (useful for re-generate)
    # -----------------------------
    def reset(self):
        self.section_schedule.clear()
        self.faculty_schedule.clear()
        self.teacher_load.clear()
        self.cache.clear()