import { defineConfig } from "vitest/config";
import { devices } from "playwright";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: true,
      name: "chromium",
      provider: "playwright",
      headless: false,
      isolate: true,
      providerOptions: {
        projects: [
          {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] }
          }
        ]
      }
    }
  }
});
