import fs from "fs";
import path from "path";
import { JSONParser } from "../typescript";

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

    new JSONParser(mockData);
    expect(process.exit).not.toHaveBeenCalledWith(1);
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

  it("should throw an error for invalid JSON in Step 2 ", () => {
    const invalidFilePath = path.resolve(
      __dirname,
      "../tests/step2/invalid.json"
    );
    const mockData = fs.readFileSync(invalidFilePath, "utf-8");
    new JSONParser(mockData);

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should not  an error for valid JSON in Step 2 (string values)", () => {
    const invalidFilePath = path.resolve(
      __dirname,
      "../tests/step2/valid.json"
    );
    const mockData = fs.readFileSync(invalidFilePath, "utf-8");
    expect(() => {
      new JSONParser(mockData);
    }).not.toThrow();
  });

  it("should not  an error for valid JSON in Step 3 (mixed values)", () => {
    const invalidFilePath = path.resolve(
      __dirname,
      "../tests/step3/valid.json"
    );
    const mockData = fs.readFileSync(invalidFilePath, "utf-8");

    new JSONParser(mockData);
    expect(process.exit).not.toHaveBeenCalledWith(1);
  });

  it("should parse an empty object and array (Step 4)", () => {
    const invalidFilePath = path.resolve(
      __dirname,
      "../tests/step4/valid.json"
    );
    const mockData = fs.readFileSync(invalidFilePath, "utf-8");
    expect(() => {
      new JSONParser(mockData);
    }).not.toThrow();
  });

  it("should parse an nested object and array (Step 4)", () => {
    const invalidFilePath = path.resolve(
      __dirname,
      "../tests/step4/valid2.json"
    );
    const mockData = fs.readFileSync(invalidFilePath, "utf-8");
    new JSONParser(mockData);
    expect(process.exit).not.toHaveBeenCalledWith(1);
  });

  it("should throw error on invalid nested object and array (Step 4)", () => {
    const invalidFilePath = path.resolve(
      __dirname,
      "../tests/step4/invalid.json"
    );
    const mockData = fs.readFileSync(invalidFilePath, "utf-8");
    new JSONParser(mockData);
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should verify the contents of step 4 are correct", () => {
    const invalidFilePath = path.resolve(
      __dirname,
      "../tests/step4/valid.json"
    );
    const mockData = fs.readFileSync(invalidFilePath, "utf-8");

    const parsedMockData = JSON.parse(mockData);
    const parserData = new JSONParser(mockData).parsedValue;
    expect(parserData).toStrictEqual(parsedMockData);
  });
});
