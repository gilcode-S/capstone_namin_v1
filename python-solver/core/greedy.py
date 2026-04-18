def greedy_function(assignment, timeslots, rule_engine):

    valid = []

    for t in timeslots:
        if rule_engine.can_schedule(assignment, t):
            valid.append(t)

    return valid