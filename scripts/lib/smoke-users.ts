// Field names must match the configured import mappings (see docs/DEVELOPMENT.md).
export function buildUsersChunk(
  chunkIndex: number,
  count: number,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    users: Array.from({ length: count }, (_, userIndex) => {
      const id = `${chunkIndex + 1}-${String(userIndex + 1).padStart(3, "0")}`;
      return {
        active: true,
        email: `smoke-user-${id}@example.invalid`,
        first_name: "Smoke",
        last_name: `User${id}`,
        name: `Smoke User ${id}`,
        phone: "555-0101",
        title: "Engineer",
        ...overrides,
      };
    }),
  };
}
