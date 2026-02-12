import { NextRequest, NextResponse } from "next/server";
import { callTool } from "@/lib/mcp-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, input } = body as { tool: string; input: unknown };

    if (!tool) {
      return NextResponse.json({ error: "Missing 'tool' field" }, { status: 400 });
    }

    const result = callTool(tool, input ?? {});
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
