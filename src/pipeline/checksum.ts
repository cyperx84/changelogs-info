/**
 * Generate and verify SHA-256 checksums for payloads.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

export function computeChecksum(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export function writeChecksum(filePath: string): string {
  const content = readFileSync(filePath, "utf-8");
  const checksum = computeChecksum(content);
  writeFileSync(`${filePath}.sha256`, `${checksum}  ${filePath.split("/").pop()}\n`);
  return checksum;
}

export function verifyChecksum(filePath: string): boolean {
  const checksumFile = `${filePath}.sha256`;
  if (!existsSync(checksumFile)) return true; // no checksum = no verification
  
  const expected = readFileSync(checksumFile, "utf-8").split(" ")[0];
  const content = readFileSync(filePath, "utf-8");
  const actual = computeChecksum(content);
  return expected === actual;
}

/**
 * Verify all payloads in a directory.
 */
export function verifyAllPayloads(dir: string): { file: string; valid: boolean }[] {
  const { readdirSync } = require("node:fs");
  const { join } = require("node:path");
  const results: { file: string; valid: boolean }[] = [];
  
  for (const file of readdirSync(dir).filter((f: string) => f.endsWith(".json"))) {
    results.push({
      file,
      valid: verifyChecksum(join(dir, file)),
    });
  }
  return results;
}
