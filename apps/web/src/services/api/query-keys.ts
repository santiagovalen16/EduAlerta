export const queryKeys = {
  territorial: {
    overview: ["territorial", "overview"] as const
  },
  alerts: {
    list: (filters: Record<string, string>) => ["alerts", filters] as const
  },
  cases: {
    list: (filters: Record<string, string>) => ["cases", filters] as const
  },
  monitoring: {
    overview: (filters: Record<string, string>) => ["monitoring", filters] as const
  },
  students: {
    options: ["students", "options"] as const
  },
  attendance: {
    all: ["attendance"] as const
  },
  observations: {
    all: ["observations"] as const
  }
};
