"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Application = {
  id: string;
  stage: string;
  candidate: { id: string; name: string; email: string };
};

const STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED"];

export function PipelineBoard({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function moveStage(applicationId: string, nextStage: string) {
    setLoadingId(applicationId);
    const res = await fetch(`/api/applications/${applicationId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage }),
    });
    setLoadingId(null);
    if (!res.ok) {
      push("Could not move candidate", "destructive");
      return;
    }
    push(`Moved to ${nextStage}`);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {STAGES.map((stage) => {
        const inStage = applications.filter((a) => a.stage === stage);
        const nextIdx = STAGES.indexOf(stage) + 1;
        const nextStage = STAGES[nextIdx];

        return (
          <div key={stage} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
              {stage} ({inStage.length})
            </h3>
            {inStage.map((app) => (
              <Card key={app.id} className="p-3">
                <Link href={`/candidates/${app.candidate.id}`} className="text-sm font-medium hover:underline">
                  {app.candidate.name}
                </Link>
                <p className="text-xs text-muted-foreground">{app.candidate.email}</p>
                {nextStage && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    disabled={loadingId === app.id}
                    onClick={() => moveStage(app.id, nextStage)}
                  >
                    Move to {nextStage}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        );
      })}
    </div>
  );
}
