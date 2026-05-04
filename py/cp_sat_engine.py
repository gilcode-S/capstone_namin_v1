from ortools.sat.python import cp_model
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/generate', methods=['POST'])
def generate():

    data = request.json

    teachers = data['teachers']
    curriculum = data['curriculum']
    rooms = data['rooms']

    model = cp_model.CpModel()

    assignments = {}

    # CREATE VARIABLES  
    for c in curriculum:
        for t in teachers:
            for r in rooms:

                key = (c['section_id'], c['subject_id'], t['teacher_id'], r['timeslot_id'])

                assignments[key] = model.NewBoolVar(str(key))

    # CONSTRAINT 1: One teacher per subject per section
    for c in curriculum:
        model.Add(
            sum(assignments[k]
                for k in assignments
                if k[0] == c['section_id'] and k[1] == c['subject_id']) == 1
        )

    # CONSTRAINT 2: No teacher overlap
    for t in teachers:
        for r in rooms:
            model.Add(
                sum(assignments[k]
                    for k in assignments
                    if k[2] == t['teacher_id'] and k[3] == r['timeslot_id']) <= 1
            )

    # OBJECTIVE: maximize teacher ranking score
    model.Maximize(
        sum(
            assignments[k] * next(
                (tr['score'] for tr in teachers
                 if tr['teacher_id'] == k[2]), 0
            )
            for k in assignments
        )
    )

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10

    status = solver.Solve(model)

    results = []

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:

        for key, var in assignments.items():
            if solver.Value(var) == 1:

                results.append({
                    'section_id': key[0],
                    'subject_id': key[1],
                    'teacher_id': key[2],
                    'room_id': None,
                    'timeslot_id': key[3],
                    'is_online': False,
                    'set_type': 'A',  # default, Laravel will adjust
                    'year_level': 1,  # replace with actual mapping
                    'generated_from': 'SET_A'
                })

    return jsonify({'schedule': results})
