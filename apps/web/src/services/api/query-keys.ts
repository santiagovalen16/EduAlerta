export const queryKeys = {
  territorial: {
    overview: ["territorial", "overview"] as const
  },
  alerts: {
    list: (filters: Record<string, string>) => ["alerts", filters] as const
  },
  monitoring: {
    overview: (filters: Record<string, string>) => ["monitoring", filters] as const
  },
  attendance: {
    all: ["attendance"] as const
  },
  observations: {
    all: ["observations"] as const
  }
};
