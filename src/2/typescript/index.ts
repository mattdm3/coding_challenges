import { TOKENS } from "./tokens";

const FAILURE_EXIT_CODE = 1;
const SUCCESS_EXIT_CODE = 0;

type Token = {
  type: TOKENS;
  value: string;
};
export class JSONParser {
  input!: string;
  private position: number = 0;
  tokens: Token[] = [];
  parsedValue: any;

  constructor(input: string) {
    if (!input) {
      this.handleError("Invalid JSON input", this.position);
    }
    this.input = input;
    this.tokenize(this.input);
    const value = this.parse(this.tokens);
    this.parsedValue = value;
    return process.exit(SUCCESS_EXIT_CODE);
  }

  private handleError(message: string, position: number): void {
    console.error(`Error: ${message} at position ${position}`);
    return process.exit(FAILURE_EXIT_CODE);
  }

  public parseObject() {
    const obj: { [key: string]: any } = {};
    this.position++; // skip open object token
    while (this.tokens[this.position].type !== TOKENS.CLOSE_OBJECT) {
      const keyToken = this.tokens[this.position];
      if (keyToken.type !== TOKENS.STRING) {
        return this.handleError(
          "Expected string for object key",
          this.position
        );
      }
      this.position++;
      const key = keyToken.value;

      if (this.tokens[this.position].type !== TOKENS.COLON) {
        return this.handleError("Expected colon for object key", this.position);
      }
      this.position++; // Skip COLON token

      const value = this.parse(this.tokens);
      obj[key] = value;

      if (
        this.tokens[this.position].type === TOKENS.COMMA &&
        this.tokens[this.position + 1].type !== TOKENS.CLOSE_OBJECT
      ) {
        this.position++; // Skip COMMA token
      } else if (this.tokens[this.position].type !== TOKENS.CLOSE_OBJECT) {
        return this.handleError(
          "Expected comma or closing brace",
          this.position
        );
      }
    }
    this.position++; // Skip CLOSE_OBJECT token
    return obj;
  }

  public parseArray() {
    const arr: any[] = [];
    this.position++; // skip open object token

    while (this.tokens[this.position].type !== TOKENS.CLOSE_ARRAY) {
      const value = this.parse(this.tokens);
      arr.push(value);
      if (this.tokens[this.position].type === TOKENS.COMMA) {
        this.position++;
      } else if (this.tokens[this.position].type !== TOKENS.CLOSE_ARRAY) {
        return this.handleError(
          "Expected comma or closing brace",
          this.position
        );
      }
    }
    this.position++;
    return arr;
  }

  public parse(tokens: Token[]) {
    const token = tokens[this.position];

    switch (token?.type) {
      case TOKENS.OPEN_OBJECT:
        return this.parseObject();
      case TOKENS.OPEN_ARRAY:
        return this.parseArray();
      case TOKENS.STRING:
        this.position++;
        return token.value;
      case TOKENS.NUMBER:
        this.position++;
        return parseFloat(token.value);
      case TOKENS.BOOLEAN:
        this.position++;
        return token.value === "true";
      case TOKENS.NULL:
        this.position++;
        return null;
      default:
        return this.handleError("Expected valid token", this.position);
    }
  }

  public tokenize(input: string): Token[] | void {
    // Implement logic to iterate over input string and produce tokens
    // Example: [{type: 'TOKENS.OPEN_OBJECT', value: '{'}, {type: 'STRING', value: '"key"'}, ...]
    const tokens: Token[] = [];

    let i = 0;

    while (i < input.length) {
      const char = input[i];
      switch (char) {
        case TOKENS.OPEN_OBJECT:
          tokens.push({ type: TOKENS.OPEN_OBJECT, value: char });
          i++;
          break;
        case TOKENS.CLOSE_OBJECT:
          tokens.push({ type: TOKENS.CLOSE_OBJECT, value: char });
          i++;
          break;
        case TOKENS.OPEN_ARRAY:
          tokens.push({ type: TOKENS.OPEN_ARRAY, value: char });
          i++;
          break;
        case TOKENS.CLOSE_ARRAY:
          tokens.push({ type: TOKENS.CLOSE_ARRAY, value: char });
          i++;
          break;
        case TOKENS.COMMA:
          tokens.push({ type: TOKENS.COMMA, value: char });
          i++;
          break;
        case TOKENS.COLON:
          tokens.push({ type: TOKENS.COLON, value: char });
          i++;
          break;
        case TOKENS.QUOTE:
          let str = "";
          i++;
          while (input[i] !== TOKENS.QUOTE && i < input.length) {
            if (input[i] === TOKENS.ESCAPE) {
              str += input[i] + input[i + 1];
              i += 2;
            } else {
              str += input[i];
              i++;
            }
          }
          i++;
          tokens.push({ type: TOKENS.STRING, value: str });
          break;
        default:
          if (/\s/.test(char)) {
            // Skip whitespace
            i++;
          } else if (/[0-9]/.test(char) || char === TOKENS.DASH) {
            // Check for integers (or signed integers)
            let num = char;
            i++;
            while (/[0-9]/.test(input[i]) || input[i] === ".") {
              num += input[i];
              i++;
            }
            tokens.push({ type: TOKENS.NUMBER, value: num });
          } else if (char === "t" && input.substr(i, 4) === "true") {
            tokens.push({ type: TOKENS.BOOLEAN, value: "true" });
            i += 4;
          } else if (char === "f" && input.substr(i, 5) === "false") {
            tokens.push({ type: TOKENS.BOOLEAN, value: "false" });
            i += 5;
          } else if (char === "n" && input.substr(i, 4) === "null") {
            tokens.push({ type: TOKENS.NULL, value: "null" });
            i += 4;
          } else {
            return this.handleError(
              `Unexpected character: ${char}`,
              this.position
            );
          }
          break;
      }
    }
    this.tokens = tokens;
    return tokens;
  }

  public currentToken(): string {
    return this.input.charAt(this.position);
  }
}
