import fs from "fs";
import path from "path";

const FAILURE_EXIT_CODE = 1;
const SUCCESS_EXIT_CODE = 0;

export class JSONParser {
  private input?: string;

  constructor(input: string) {
    if (!input) {
      process.exit(1);
    }
  }
}
const run = async () => {
  const validFilePath = path.resolve(__dirname, "../tests/step1/valid.json");
  const contentFromPath = fs.readFileSync(validFilePath, "utf-8");
  const parser = new JSONParser(contentFromPath);
};

run();
