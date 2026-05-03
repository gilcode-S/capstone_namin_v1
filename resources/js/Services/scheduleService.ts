import axios from "axios";



// BUTTON 1
export const rankTeachers = (subject_id: number) => {
  return axios.post("/setup/rank-teachers", { subject_id });
};

export const fetchCurriculum = (section_id: number) => {
  return axios.post("/setup/fetch-curriculum", { section_id });
};

export const lockRooms = () => {
  return axios.post("/setup/lock-rooms");
};



// --------------------------------------------------
// CALL FINAL GENERATION
// --------------------------------------------------
export const generateFinalSchedule = async (data: any) => {
  return await axios.post("/api/generate-final-schedule", data);
};
