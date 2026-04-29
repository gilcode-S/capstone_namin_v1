# =====================================================
# OBJECTIVE FUNCTION
# =====================================================
# PURPOSE:
# Maximize teacher competency score
# Higher score = better faculty-subject match
# =====================================================

def set_schedule_objective(model, assignments, data):

    objective = []

    for key, var in assignments.items():

        unit_id = key[0]

        # simple reward for assignment
        objective.append(var * 100)

    model.Maximize(sum(objective))