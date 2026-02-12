import { Badge } from "@/components/ui/badge";

const variants: Record<string, "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge variant={variants[severity] ?? "outline"}>
      {severity}
    </Badge>
  );
}
