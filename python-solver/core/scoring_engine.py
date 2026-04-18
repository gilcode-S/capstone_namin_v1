# core/scoring_engine.py

class ScoringEngine:

    def score(self, assignment, timeslot, rule_engine):

        score = 0

        faculty = assignment.get("faculty_id")

        # -----------------------------
        # 1. BASIC SAFETY BONUS
        # -----------------------------
        if rule_engine.can_schedule(assignment, timeslot):
            score += 10
        else:
            return -9999  # invalid slot

        # -----------------------------
        # 2. PREFERRED DAY
        # -----------------------------
        if assignment.get("preferred_day") == timeslot.get("day_of_week"):
            score += 20

        # -----------------------------
        # 3. PREFERRED SHIFT
        # -----------------------------
        if assignment.get("preferred_shift") == timeslot.get("shift"):
            score += 15

        # -----------------------------
        # 4. LOAD BALANCING
        # -----------------------------
        if faculty:
            load = rule_engine.teacher_load[faculty]

            if load < 6:
                score += 15
            elif load < 12:
                score += 8
            else:
                score -= 5

        # -----------------------------
        # 5. FAIR DISTRIBUTION BONUS
        # -----------------------------
        section = assignment.get("section_id")
        if len(rule_engine.section_schedule[section]) < 3:
            score += 5

        return score