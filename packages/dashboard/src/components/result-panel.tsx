"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultPanelProps {
  title: string;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export function ResultPanel({ title, loading, error, children }: ResultPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-sm animate-pulse">Analyzing...</p>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
