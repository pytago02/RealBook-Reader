import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { AppLogo } from "../src/components/AppLogo";

describe("AppLogo Asset & Component Verification", () => {
  it("ensures public/logo.svg and public/favicon.svg exist and are valid SVGs", () => {
    const publicLogo = path.resolve(__dirname, "../public/logo.svg");
    const publicFavicon = path.resolve(__dirname, "../public/favicon.svg");

    expect(fs.existsSync(publicLogo)).toBe(true);
    expect(fs.existsSync(publicFavicon)).toBe(true);

    const logoContent = fs.readFileSync(publicLogo, "utf-8");
    expect(logoContent).toContain("<svg");
    expect(logoContent).toContain("viewBox=\"0 0 512 512\"");
  });

  it("ensures src/assets/logo.svg exists for Vite relative bundling in Electron", () => {
    const assetLogo = path.resolve(__dirname, "../src/assets/logo.svg");
    expect(fs.existsSync(assetLogo)).toBe(true);

    const assetContent = fs.readFileSync(assetLogo, "utf-8");
    expect(assetContent).toContain("<svg");
  });

  it("exports AppLogo React component function", () => {
    expect(typeof AppLogo).toBe("function");
  });

  it("ensures Windows ICO, PNGs, and mobile icon assets exist", () => {
    const icoPath = path.resolve(__dirname, "../public/icon.ico");
    const pngPath = path.resolve(__dirname, "../public/icon.png");
    const manifestPath = path.resolve(__dirname, "../public/manifest.json");
    const mobileDir = path.resolve(__dirname, "../resources/icons");

    expect(fs.existsSync(icoPath)).toBe(true);
    expect(fs.existsSync(pngPath)).toBe(true);
    expect(fs.existsSync(manifestPath)).toBe(true);
    expect(fs.existsSync(path.join(mobileDir, "icon-512.png"))).toBe(true);
    expect(fs.existsSync(path.join(mobileDir, "icon-192.png"))).toBe(true);
    expect(fs.existsSync(path.join(mobileDir, "icon.ico"))).toBe(true);
  });
});
