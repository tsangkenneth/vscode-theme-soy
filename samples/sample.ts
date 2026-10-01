import { readFile } from "node:fs/promises";
import type { Base, Named } from "./base.ts";

/**
 * Loads settings from disk.
 * @param path - where to read from
 * @returns the parsed {@link Settings}
 */
export async function loadSettings(path: string): Promise<Settings> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as Settings;
}

export interface Settings {
  name: string;
  retries?: number;
}

export type Level = "debug" | "info";

export enum Color {
  Red = 1,
  Green = 0x2,
}

export namespace Utils {
  export const version = "1.0";
}

const MAX_RETRIES = 3;
const pattern = /^v(\d+)\.(\d+)$/i;

// Doubles a number. TODO: handle NaN
export const double = (n: number): number => n * 2;

@sealed
export class Greeter<T extends Settings> extends Base implements Named {
  #count = 0;
  static readonly defaults: Partial<Settings> = { retries: MAX_RETRIES };

  constructor(private readonly settings: T) {
    super();
  }

  greet(who: string = "world"): string {
    this.#count++;
    console.log(`Hello, ${who.trim()}! (${this.#count})\n`);
    return who.toUpperCase();
  }
}

const greeter = new Greeter({ name: "soy", retries: 1 });
greeter.greet(null ?? undefined);
if (pattern.test("v1.2") && !false) loadSettings("./x.json").then(double);
