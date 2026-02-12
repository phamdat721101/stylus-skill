import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const tools = [
  {
    title: "Ink Auditor",
    description: "Scan your Stylus contract for expensive WASM gas patterns and get optimization suggestions.",
    href: "/auditor",
  },
  {
    title: "Test Generator",
    description: "Generate Motsu framework unit tests from your contract's public functions.",
    href: "/tests",
  },
  {
    title: "Agent Manifest",
    description: "Generate an ERC-8004 Agent Manifest JSON for the agent economy.",
    href: "/manifest",
  },
  {
    title: "Intent Hook",
    description: "Translate natural language into ABI-encoded calldata using your manifest.",
    href: "/intent",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Stylus Architect</h2>
        <p className="text-muted-foreground mt-1">
          AI-powered tooling for Arbitrum Stylus smart contracts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
