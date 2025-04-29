import dotenv from "dotenv";
import { updateActivities } from "./activity";
import { getAccessToken } from "./auth";

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
