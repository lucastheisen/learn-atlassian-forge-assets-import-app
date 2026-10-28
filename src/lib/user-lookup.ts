import { route } from "@forge/api";
import { referenceRequest } from "./reference-api";
import type { UserLookup } from "./reference-types";

interface JiraUser {
  accountId: string;
  accountType?: string;
  active?: boolean;
}
interface UserEmail {
  accountId: string;
  email?: string;
}
const PAGE_SIZE = 100;

export const lookupUserByEmail: UserLookup = async (fields, budget) => {
  const values = fields.Email ?? [];
  if (values.length === 0 || (values.length === 1 && values[0] === "")) {
    return { status: "unresolved", reason: "missing_identity" };
  }
  if (values.length !== 1 || typeof values[0] !== "string") {
    return { status: "unresolved", reason: "invalid_identity" };
  }
  const email = values[0].trim().toLowerCase();
  if (!email) return { status: "unresolved", reason: "missing_identity" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "unresolved", reason: "invalid_identity" };
  }

  const matches = new Set<string>();
  const seen = new Set<string>();
  let hiddenEmail = false;
  let inactiveMatch = false;
  for (let startAt = 0; startAt < 1000; startAt += PAGE_SIZE) {
    const users = await referenceRequest<JiraUser[]>(
      route`/rest/api/3/user/search?query=${email}&startAt=${startAt}&maxResults=${PAGE_SIZE}`,
      budget,
    );
    if (!Array.isArray(users))
      throw new Error("Invalid Jira user search response");
    for (const user of users) {
      if (!user.accountId || seen.has(user.accountId)) continue;
      seen.add(user.accountId);
      if (user.accountType !== "atlassian") continue;
      const confirmed = await referenceRequest<UserEmail>(
        route`/rest/api/3/user/email?accountId=${user.accountId}`,
        budget,
      );
      if (confirmed.accountId !== user.accountId || !confirmed.email) {
        hiddenEmail = true;
      } else if (confirmed.email.trim().toLowerCase() === email) {
        if (user.active === true) matches.add(user.accountId);
        else inactiveMatch = true;
      }
    }
    if (matches.size > 1) return { status: "unresolved", reason: "ambiguous" };
    if (users.length < PAGE_SIZE) {
      if (hiddenEmail)
        return { status: "unresolved", reason: "email_unavailable" };
      const accountId = [...matches][0];
      if (accountId) return { status: "matched", accountId };
      return {
        status: "unresolved",
        reason: inactiveMatch ? "inactive_account" : "unmatched",
      };
    }
  }
  return { status: "unresolved", reason: "ambiguous" };
};
