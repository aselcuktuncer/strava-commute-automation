import dotenv from "dotenv";
import { STRAVA_API } from "./main";

dotenv.config();

export interface Activity {
  id: number;
  name: string;
  commute: boolean;
  gear_id: string | null;
  type: string;
}

const GEAR_ID = process.env.STRAVA_COMMUTE_BIKE_ID;

const getActivities = async (accessToken: string): Promise<Activity[]> => {
  // after querying activity start time
  // commutes typically last <1h, but add 12h buffer for sync/cron delays
  const bufferMinutes = 720;
  const afterTimestamp = Math.floor(Date.now() / 1000) - bufferMinutes * 60;

  const res = await fetch(
    `${STRAVA_API}/athlete/activities?per_page=30&after=${afterTimestamp}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch activities: ${res.status} - ${text}`);
  }

  return (await res.json()) as Activity[];
};

const updateActivityById = async (
  accessToken: string,
  id: number,
  update: { gear_id?: string; hide_from_home?: boolean }
) => {
  const res = await fetch(`${STRAVA_API}/activities/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(update),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update activity ${id}: ${res.status} - ${text}`);
  }
};

export const updateActivities = async (token: string) => {
  const activities = await getActivities(token);

  let updatedCount = 0;
  let failedCount = 0;

  for (const act of activities) {
    // update only commute rides without assigned bike - pending cron processing
    if (act.commute && act.type === "Ride" && !act.gear_id) {
      const updates = { gear_id: GEAR_ID, hide_from_home: true };

      try {
        console.log(`Updating ${act.name} (${act.id})`);
        await updateActivityById(token, act.id, updates);
        updatedCount++;
      } catch (err) {
        failedCount++;
        console.error(
          `Failed to update ${act.name} (${act.id}):`,
          JSON.stringify(err)
        );
      }
    }
  }

  if (updatedCount === 0) {
    console.log("No activities to update.");
  } else {
    console.log(`Updated ${updatedCount} activities.`);
  }

  if (failedCount > 0) {
    console.warn(`Failed to update ${failedCount} activities.`);
  }
};
