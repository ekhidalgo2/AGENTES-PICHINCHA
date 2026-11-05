import { describe, expect, it } from "vitest";
import { classifyComplexity } from "../../src/shared/domain";

describe("classifyComplexity", () => {
  it.each([
    [{ activities: 20, roles: 3, areas: 1, hasSubprocesses: false }, "simple"],
    [{ activities: 21, roles: 3, areas: 1, hasSubprocesses: false }, "medium"],
    [{ activities: 30, roles: 3, areas: 1, hasSubprocesses: false }, "medium"],
    [{ activities: 31, roles: 1, areas: 1, hasSubprocesses: false }, "complex"],
    [{ activities: 1, roles: 3, areas: 1, hasSubprocesses: false }, "simple"],
    [{ activities: 1, roles: 4, areas: 1, hasSubprocesses: false }, "medium"],
    [{ activities: 1, roles: 6, areas: 1, hasSubprocesses: false }, "medium"],
    [{ activities: 1, roles: 7, areas: 1, hasSubprocesses: false }, "complex"],
    [{ activities: 1, roles: 1, areas: 2, hasSubprocesses: false }, "medium"],
    [{ activities: 1, roles: 1, areas: 3, hasSubprocesses: false }, "medium"],
    [{ activities: 1, roles: 1, areas: 4, hasSubprocesses: false }, "complex"],
    [{ activities: 1, roles: 1, areas: 1, hasSubprocesses: true }, "complex"],
    [{ activities: 21, roles: 7, areas: 1, hasSubprocesses: false }, "complex"],
  ] as const)("classifies %o as %s", (input, expected) => {
    expect(classifyComplexity(input)).toBe(expected);
  });
});
