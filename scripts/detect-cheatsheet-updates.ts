/**
 * Script to detect new flags/commands from releases and report untracked items
 * Run: npx tsx scripts/detect-cheatsheet-updates.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import { detectNewFlags } from "../src/lib/cheatsheet-detector";

interface Release {
  version: string;
  body: string;
  date: string;
  url: string;
}

interface Tool {
  id: string;
  name: string;
  releases?: Release[];
}

interface DetectionReport {
  tool: string;
  timestamp: string;
  detectedItems: {
    type: string;
    name: string;
    confidence: number;
    release: string;
  }[];
  recommendations: string[];
}

async function detectAllCheatsheets(): Promise<DetectionReport[]> {
  const releasesDir = join(process.cwd(), "src/content/releases");
  const cheatsheetsDir = join(process.cwd(), "src/content/cheatsheets-json");

  const reports: DetectionReport[] = [];

  // Read all release JSON files
  const fs = await import("fs");
  const releaseFiles = fs.readdirSync(releasesDir).filter((f) => f.endsWith(".json"));

  for (const file of releaseFiles) {
    const toolId = file.replace(".json", "");
    const releaseData = JSON.parse(readFileSync(join(releasesDir, file), "utf-8")) as {
      releases: Release[];
    };

    // Load existing cheatsheet
    let cheatsheet: any = null;
    try {
      const cheatsheetData = readFileSync(join(cheatsheetsDir, `${toolId}.json`), "utf-8");
      cheatsheet = JSON.parse(cheatsheetData);
    } catch {
      console.warn(`⚠️  No cheatsheet found for ${toolId}, skipping...`);
      continue;
    }

    const detectedItems: Array<{
      type: string;
      name: string;
      confidence: number;
      release: string;
    }> = [];

    // Scan releases from newest
    for (const release of releaseData.releases) {
      const detected = detectNewFlags(release.body, toolId);

      // Filter to only untracked items
      const trackedFlags = new Set((cheatsheet.cliFlags || []).map((f: any) => f.name));
      const trackedCommands = new Set((cheatsheet.slashCommands || []).map((c: any) => c.name));

      for (const item of detected) {
        if (item.type === "flag" && !trackedFlags.has(item.name)) {
          detectedItems.push({
            type: "flag",
            name: item.name,
            confidence: item.confidence,
            release: release.version,
          });
        } else if (item.type === "command" && !trackedCommands.has(item.name)) {
          detectedItems.push({
            type: "command",
            name: item.name,
            confidence: item.confidence,
            release: release.version,
          });
        }
      }
    }

    // Generate report
    const recommendations = [];
    const highConfidence = detectedItems.filter((item) => item.confidence >= 0.8);
    if (highConfidence.length > 0) {
      recommendations.push(
        `Found ${highConfidence.length} high-confidence items needing cheatsheet updates`
      );
    }

    if (detectedItems.length > 0) {
      reports.push({
        tool: toolId,
        timestamp: new Date().toISOString(),
        detectedItems,
        recommendations,
      });
    }
  }

  return reports;
}

async function main() {
  console.log("🔍 Detecting cheatsheet updates from release notes...\n");

  const reports = await detectAllCheatsheets();

  if (reports.length === 0) {
    console.log("✅ All cheatsheets are up to date!\n");
    return;
  }

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    totalToolsWithUpdates: reports.length,
    toolReports: reports,
  };

  console.log(`⚠️  Found updates needed for ${reports.length} tool(s):\n`);

  for (const toolReport of reports) {
    console.log(`📦 ${toolReport.tool}`);
    console.log(`   Detected ${toolReport.detectedItems.length} items:`);

    // Group by type
    const byType: Record<string, any[]> = {};
    for (const item of toolReport.detectedItems) {
      if (!byType[item.type]) byType[item.type] = [];
      byType[item.type].push(item);
    }

    for (const [type, items] of Object.entries(byType)) {
      console.log(`   • ${type} (${items.length})`);
      for (const item of items.slice(0, 3)) {
        console.log(`     - ${item.name} (${item.release}, confidence: ${(item.confidence * 100).toFixed(0)}%)`);
      }
      if (items.length > 3) {
        console.log(`     ... and ${items.length - 3} more`);
      }
    }
    console.log();
  }

  // Write JSON report
  const reportPath = join(process.cwd(), "scripts/detection-report.json");
  await import("fs").then((fs) =>
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  );

  console.log(`📄 Full report saved to: scripts/detection-report.json\n`);
  console.log(
    "💡 Tip: Review these detections and update the cheatsheets manually to maintain quality.\n"
  );
}

main().catch(console.error);
