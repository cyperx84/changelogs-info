import { readFileSync } from "node:fs";
import { join } from "node:path";

export async function GET({ params }: any) {
  const { id } = params;
  const cheatsheetsDir = join(process.cwd(), "src/content/cheatsheets-json");

  try {
    const raw = readFileSync(join(cheatsheetsDir, `${id}.json`), "utf-8");
    const cheatsheet = JSON.parse(raw);

    return new Response(JSON.stringify(cheatsheet, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${id}-cheatsheet.json"`,
      },
    });
  } catch (error) {
    return new Response("Cheatsheet not found", { status: 404 });
  }
}

export async function getStaticPaths() {
  const cheatsheetsDir = join(process.cwd(), "src/content/cheatsheets-json");
  const fs = await import("fs");
  const files = fs.readdirSync(cheatsheetsDir).filter((f: string) => f.endsWith(".json"));
  return files.map((f: string) => ({
    params: { id: f.replace(".json", "") },
  }));
}
