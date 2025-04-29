import dotenv from "dotenv";
import { getAccessToken } from "./auth";
import { updateActivities } from "./cron-job";

dotenv.config();

export const STRAVA_API = "https://www.strava.com/api/v3";

const run = async () => {
  const token = await getAccessToken();

  await updateActivities(token);

  console.log("CRON job completed successfully!");
};

run().catch((err) => {
  console.error(JSON.stringify(err));
});
