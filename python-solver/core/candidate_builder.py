class CandidateBuilder:

    def build(self, assignment, timeslots, rule_engine):

        candidates = []

        for t in timeslots:

            if rule_engine.can_schedule(assignment, t):
                candidates.append(t)

        return candidates