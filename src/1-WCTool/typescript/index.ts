import * as fs from "fs";
import * as readline from "readline";

const getByteSize = (filePath: string): number => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.error(`Error reading the file: ${error}`);
    return -1;
  }
};

async function getLineCount(filePath: string): Promise<number> {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
  }

  return lineCount;
}

async function getWordCount(filePath: string): Promise<number> {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let wordCount = 0;
  for await (const line of rl) {
    // Split the line into words using a regular expression,
    // which finds sequences of characters separated by spaces or punctuation
    const words = line.split(/\W+/).filter(Boolean);
    wordCount += words.length;
  }

  return wordCount;
}

function countCharacters(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let charCount = 0;
    const stream = fs.createReadStream(filePath, { encoding: "utf8" });

    stream.on("data", (chunk) => {
      charCount += chunk.length;
    });

    stream.on("end", () => {
      resolve(charCount);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}

const handler = async (option: string | null, filePath: string) => {
  switch (option) {
    case "-w":
      return getWordCount(filePath);
    case "-c":
      return getByteSize(filePath);
    case "-l":
      return await getLineCount(filePath);
    case "-m":
      return await countCharacters(filePath);
    default:
      const byteSize = getByteSize(filePath);
      const [wordCount, lineCount] = await Promise.all([
        getWordCount(filePath),
        getLineCount(filePath),
      ]);
      return `${byteSize} ${lineCount} ${wordCount}`;
  }
};

function countCharactersFromStdin(
  stream: NodeJS.ReadableStream | fs.ReadStream
): Promise<number> {
  return new Promise((resolve, reject) => {
    let charCount = 0;

    stream.on("data", (chunk: string) => {
      charCount += chunk.length;
    });

    stream.on("end", () => {
      resolve(charCount);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}

function processStdin(stdIn: fs.ReadStream | NodeJS.ReadableStream) {
  countCharactersFromStdin(stdIn)
    .then((charCount) => {
      console.log(`Standard Input has ${charCount} characters.`);
    })
    .catch((error) => {
      console.error(`An error occurred: ${error}`);
    });
}

const main = async (
  processArgv: string[],
  stdIn: NodeJS.ReadStream | fs.ReadStream
) => {
  const [_, __, option, filePath] = processArgv;
  if (!filePath && option.includes(".")) {
    let filePath = option;
    const result = await handler(null, filePath);
    return console.log(`${result} ${filePath}`);
  }
  if (!filePath) {
    console.log({ stdIn });
    processStdin(stdIn);
    return;
  }
  const result = await handler(option, filePath);
  return console.log(`${result} ${filePath}`);
};

main(process.argv, process.stdin);
