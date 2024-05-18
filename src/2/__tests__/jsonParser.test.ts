import fs from "fs";
import path from "path";
import { JSONParser } from "../typescript";

jest.mock("fs");

describe("JSONParser", () => {
  const originalExit = process.exit;

  beforeAll(() => {
    (process.exit as unknown) = jest.fn();
  });

  afterAll(() => {
    process.exit = originalExit;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not throw an error for valid JSON", () => {
    const validFilePath = path.resolve(__dirname, "../tests/step1/valid.json");
    const mockData = fs.readFileSync(validFilePath, "utf-8");

    expect(() => {
      new JSONParser(mockData);
    }).not.toThrow();
  });

  it("should throw an error for invalid JSON", () => {
    const invalidFilePath = path.resolve(
      __dirname,
      "../tests/step1/invalid.json"
    );
    const mockData = fs.readFileSync(invalidFilePath, "utf-8");
    new JSONParser(mockData);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
