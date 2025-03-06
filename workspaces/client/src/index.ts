import type { IcewallUser } from "icewall/schema";

export const getUser = async (endpoint: string | URL): Promise<IcewallUser | undefined> => {
  const ep = typeof endpoint === "string" ? new URL(endpoint) : endpoint;

  const res = await fetch(`https://${ ep.hostname }${ ep.pathname }/user`);

  if (res.status === 200) {
    const user = await res.json() as IcewallUser;
    return user;
  } else if (res.status === 401) {
    return undefined;
  } else {
    throw new Error(`Unexpected HTTP status code ${ res.status }`);
  }
};
