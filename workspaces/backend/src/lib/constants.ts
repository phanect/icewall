type Constants = {
  hostname: string;
};

export const constants = (serverEnv: "production" | "staging" | "development"): Constants => {
  if (serverEnv === "production") {
    return {
      hostname: "https://guildmaster.phanective.org",
    };
  } else if (serverEnv === "staging") {
    return {
      hostname: "https://guildmaster-stg.phanective.org",
    };
  } else if (serverEnv === "development") {
    return {
      hostname: "http://localhost:4000",
    };
  } else {
    throw new Error(`Unexpected serverEnv given: "${ serverEnv as string }"`);
  }
};
