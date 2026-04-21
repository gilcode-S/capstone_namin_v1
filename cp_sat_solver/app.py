from ortools.sat.python import cp_model
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/solve', methods=['POST'])
def solve_schedule():
    data = request.json
    candidates = data.get("candidates", [])

    print("RECEIVED:", len(candidates))

    if not candidates:
        return jsonify([])

    model = cp_model.CpModel()
    x = {}

    for i in range(len(candidates)):
        x[i] = model.NewBoolVar(f"x_{i}")

    # ROOM CONFLICT
    room_map = {}
    for i, c in enumerate(candidates):
        key = (c["room_id"], c["timeslot_id"])
        room_map.setdefault(key, []).append(x[i])

    for vars in room_map.values():
        model.Add(sum(vars) <= 1)

    # FACULTY CONFLICT
    faculty_map = {}
    for i, c in enumerate(candidates):
        key = (c["faculty_id"], c["timeslot_id"])
        faculty_map.setdefault(key, []).append(x[i])

    for vars in faculty_map.values():
        model.Add(sum(vars) <= 1)

    # SECTION CONFLICT
    section_map = {}
    for i, c in enumerate(candidates):
        key = (c["section_id"], c["timeslot_id"])
        section_map.setdefault(key, []).append(x[i])

    for vars in section_map.values():
        model.Add(sum(vars) <= 1)

    # 🔥 ensure each session gets assigned
    session_map = {}
    for i, c in enumerate(candidates):
        key = (c["section_id"], c["subject_id"], c["session_index"])
        session_map.setdefault(key, []).append(x[i])

    for vars in session_map.values():
        model.Add(sum(vars) == 1)

    model.Maximize(sum(x[i] for i in range(len(candidates))))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10

    status = solver.Solve(model)

    result = []

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        for i, c in enumerate(candidates):
            if solver.Value(x[i]) == 1:
                result.append(c)

    print("RESULT SIZE:", len(result))

    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5001, debug=True)