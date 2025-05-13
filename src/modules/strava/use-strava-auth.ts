import { match, P } from "ts-pattern";

export const useStravaAuth = () => {
  const strava = localStorage.getItem("Strava");
  if (!strava) {
    return null;
  }
  try {
    const stravaAuth = JSON.parse(strava);
    const parsedStravaAuth = match(stravaAuth)
      .with(
        {
          ["Key-Pair-Id"]: P.string,
          ["Policy"]: P.string,
          ["Signature"]: P.string,
        },
        (value) => value
      )
      .otherwise(() => null);
    return parsedStravaAuth;
  } catch (e) {
    return null;
  }
};
