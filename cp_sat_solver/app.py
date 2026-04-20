from ortools.sat.python import cp_model
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/solve', methods=['POST'])
def solve_schedule():
    data = request.json

    candidates = data["candidates"]

    model = cp_model.CpModel()

    x = {}

    for i, c in enumerate(candidates):
        x[i] = model.NewBoolVar(f"x_{i}")

    # ROOM CONFLICT
    slot_map = {}
    for i, c in enumerate(candidates):
        key = (c["room_id"], c["timeslot_id"])
        slot_map.setdefault(key, []).append(x[i])

    for vars in slot_map.values():
        model.Add(sum(vars) <= 1)

    # TEACHER CONFLICT
    teacher_map = {}
    for i, c in enumerate(candidates):
        key = (c["teacher_id"], c["timeslot_id"])
        teacher_map.setdefault(key, []).append(x[i])

    for vars in teacher_map.values():
        model.Add(sum(vars) <= 1)

    # MAXIMIZE SCORE
    objective = []
    for i, c in enumerate(candidates):
        score = int(c["score"] * 1000)
        objective.append(x[i] * score)

    model.Maximize(sum(objective))

    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    result = []

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        for i, c in enumerate(candidates):
            if solver.Value(x[i]) == 1:
                result.append(c)

    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5001, debug=True)