/**
 * Generate and verify SHA-256 checksums for payloads.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

export function computeChecksum(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export function writeChecksum(filePath: string): string | null {
  try {
    if (!existsSync(filePath)) return null;
    const content = readFileSync(filePath, "utf-8");
    const checksum = computeChecksum(content);
    writeFileSync(`${filePath}.sha256`, `${checksum}  ${filePath.split("/").pop()}\n`);
    return checksum;
  } catch (err) {
    console.warn(`  ⚠️  Failed to write checksum for ${filePath}: ${(err as Error).message}`);
    return null;
  }
}

export function verifyChecksum(filePath: string): boolean {
  try {
    const checksumFile = `${filePath}.sha256`;
    if (!existsSync(checksumFile)) return true;
    const expected = readFileSync(checksumFile, "utf-8").split(" ")[0];
    const content = readFileSync(filePath, "utf-8");
    const actual = computeChecksum(content);
    return expected === actual;
  } catch (err) {
    console.warn(`  ⚠️  Failed to verify checksum for ${filePath}: ${(err as Error).message}`);
    return false;
  }
}
