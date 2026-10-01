import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

// Finds an installed Chrome, Chromium or Edge for rendering images headlessly
export const findChrome = (): string | undefined => {
  const { LOCALAPPDATA, ProgramFiles, PATH = "" } = process.env;
  const candidates = process.platform === "darwin"
    ? [
      "Google Chrome.app/Contents/MacOS/Google Chrome",
      "Chromium.app/Contents/MacOS/Chromium",
      "Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ].map((app) => `/Applications/${app}`)
    : process.platform === "win32"
    ? [
      `${ProgramFiles}/Google/Chrome/Application/chrome.exe`,
      `${LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
      `${ProgramFiles} (x86)/Microsoft/Edge/Application/msedge.exe`,
    ]
    : ["google-chrome", "chromium", "chromium-browser", "microsoft-edge"]
      .flatMap((name) =>
        PATH.split(path.delimiter).map((dir) => path.join(dir, name))
      );
  return candidates.find((file) => existsSync(file));
};
