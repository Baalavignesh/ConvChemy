import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval("update game status",{seconds:1},internal.gameInternal.updateSessions)

export default crons