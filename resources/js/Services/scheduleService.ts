import axios from "axios";

// --------------------------------------------------
// CALL FINAL GENERATION
// --------------------------------------------------
export const generateFinalSchedule = async (data: any) => {
  return await axios.post("/api/generate-final-schedule", data);
};
