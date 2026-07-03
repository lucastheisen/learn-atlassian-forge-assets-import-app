// Field names here are load-bearing: they must match the mapping configured
// against the real and Smoke Test import sources (see docs/DEVELOPMENT.md).
export function buildUsersChunk(
  chunkIndex: number,
  count: number,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    users: Array.from({ length: count }, (_, userIndex) => {
      const id = String(chunkIndex * 10 + userIndex + 1).padStart(3, "0");
      return {
        name: `Smoke User ${id}`,
        active: true,
        first_name: "Smoke",
        last_name: `User${id}`,
        email: `smoke-user-${id}@example.invalid`,
        phone: "555-0101",
        title: "Engineer",
        ...overrides,
      };
    }),
  };
}
