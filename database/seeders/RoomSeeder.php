use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();

        if ($departments->isEmpty()) {
            $this->command->error('Run DepartmentSeeder first.');
            return;
        }

        $buildings = ['F', 'C', 'V'];
        $floors = [1, 2, 3];
        $roomsPerFloor = 4;

        foreach ($buildings as $building) {
            foreach ($floors as $floor) {
                for ($i = 1; $i <= $roomsPerFloor; $i++) {

                    $department = $departments->random();

                    $roomNumber = $floor . str_pad($i, 2, '0', STR_PAD_LEFT);
                    $roomName = $building . $roomNumber;

                    $isLab = $i % 2 == 0;

                    Room::create([
                        'department_id' => $department->id,
                        'room_name' => $roomName,
                        'room_type' => $isLab ? 'computer_lab' : 'lecture',
                        'capacity' => $isLab ? rand(25, 40) : rand(35, 60),
                        'status' => 'active'
                    ]);
                }
            }
        }
    }
}