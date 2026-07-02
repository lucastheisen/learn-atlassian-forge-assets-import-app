import { describe, expect, it } from "vitest";
import { parse } from "./index";
import { BadRequestError, BadRequestValidationError } from "./errors";

describe("webtrigger parse", () => {
  it("parses upload-new", () => {
    expect(
      parse(JSON.stringify({
        type: "upload-new",
        uploadId: "smoke-users",
      })),
    ).toEqual({
      type: "upload-new",
      uploadId: "smoke-users",
      testing: false,
    });
  });

  it("parses upload-new with testing true", () => {
    expect(
      parse(JSON.stringify({
        type: "upload-new",
        uploadId: "smoke-users",
        testing: true,
      })),
    ).toEqual({
      type: "upload-new",
      uploadId: "smoke-users",
      testing: true,
    });
  });

  it("parses upload-data", () => {
    expect(
      parse(JSON.stringify({
        type: "upload-data",
        uploadId: "smoke-users",
        index: 0,
        data: {
          users: [
            {
              name: "Smoke User 001",
              active: true,
              first_name: "Smoke",
              last_name: "User001",
              email: "smoke-user-001@example.invalid",
              phone: "555-0101",
              title: "Engineer",
            },
          ],
        },
      })),
    ).toEqual({
      type: "upload-data",
      uploadId: "smoke-users",
      index: 0,
      data: {
        users: [
          {
            name: "Smoke User 001",
            active: true,
            first_name: "Smoke",
            last_name: "User001",
            email: "smoke-user-001@example.invalid",
            phone: "555-0101",
            title: "Engineer",
          },
        ],
      },
    });
  });

  it("parses upload-complete", () => {
    expect(
      parse(JSON.stringify({
        type: "upload-complete",
        uploadId: "smoke-users",
      })),
    ).toEqual({
      type: "upload-complete",
      uploadId: "smoke-users",
    });
  });

  it("parses upload-abort", () => {
    expect(
      parse(JSON.stringify({
        type: "upload-abort",
        uploadId: "smoke-users",
      })),
    ).toEqual({
      type: "upload-abort",
      uploadId: "smoke-users",
    });
  });

  it("parses upload-smoke-assert-latest", () => {
    expect(
      parse(JSON.stringify({
        type: "upload-smoke-assert-latest",
        expectedKeys: 4,
        expectedRecords: 20,
        expectedTopLevelKey: "users",
      })),
    ).toEqual({
      type: "upload-smoke-assert-latest",
      expectedKeys: 4,
      expectedRecords: 20,
      expectedTopLevelKey: "users",
    });
  });

  it("throws BadRequestError for missing request body", () => {
    expect(() => parse(undefined)).toThrow(BadRequestError);
  });

  it("throws BadRequestError for malformed JSON", () => {
    expect(() => parse("{")).toThrow(BadRequestError);
  });

  it("throws BadRequestValidationError for upload-new without uploadId", () => {
    expect(() =>
      parse(JSON.stringify({
        type: "upload-new",
      })),
    ).toThrow(BadRequestValidationError);
  });

  it("throws BadRequestValidationError for upload-data with negative index", () => {
    expect(() =>
      parse(JSON.stringify({
        type: "upload-data",
        uploadId: "smoke-users",
        index: -1,
        data: {
          users: [],
        },
      })),
    ).toThrow(BadRequestValidationError);
  });

  it("throws BadRequestValidationError for upload-smoke-assert-latest with negative expectedRecords", () => {
    expect(() =>
      parse(JSON.stringify({
        type: "upload-smoke-assert-latest",
        expectedKeys: 4,
        expectedRecords: -1,
      })),
    ).toThrow(BadRequestValidationError);
  });

  it("throws BadRequestValidationError for unknown command type", () => {
    expect(() =>
      parse(JSON.stringify({
        type: "not-a-real-command",
      })),
    ).toThrow(BadRequestValidationError);
  });
});
