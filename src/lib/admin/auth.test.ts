import { describe, expect, it } from "vitest";
import { isAuthorizedAdmin } from "./auth";

const basic = (user: string, pw: string) => `Basic ${btoa(`${user}:${pw}`)}`;

describe("isAuthorizedAdmin", () => {
  it("accepts the right password with any username", () => {
    expect(isAuthorizedAdmin(basic("admin", "s3cret"), "s3cret")).toBe(true);
    expect(isAuthorizedAdmin(basic("", "s3cret"), "s3cret")).toBe(true);
  });

  it("rejects wrong or missing credentials", () => {
    expect(isAuthorizedAdmin(basic("admin", "nope"), "s3cret")).toBe(false);
    expect(isAuthorizedAdmin(basic("admin", "s3cret!"), "s3cret")).toBe(false);
    expect(isAuthorizedAdmin(null, "s3cret")).toBe(false);
    expect(isAuthorizedAdmin("Bearer abc", "s3cret")).toBe(false);
    expect(isAuthorizedAdmin("Basic !!!", "s3cret")).toBe(false);
  });

  it("is closed when no admin password is configured", () => {
    expect(isAuthorizedAdmin(basic("admin", ""), null)).toBe(false);
    expect(isAuthorizedAdmin(basic("admin", ""), "")).toBe(false);
  });
});
