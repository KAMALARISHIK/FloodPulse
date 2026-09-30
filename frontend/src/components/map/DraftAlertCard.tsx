import React, { useState } from "react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { SAMPLE_DRAFT_ALERT } from "@/mocks/sample";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { BellRing, Send, CheckCircle2 } from "lucide-react";

export const DraftAlertCard: React.FC = () => {
  const alert = SAMPLE_DRAFT_ALERT;
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [isApproving, setIsApproving] = useState(false);
  const [approved, setApproved] = useState(alert.approved);

  // Role check: Only operators and admins can see and interact with "Approve and send"
  const canApprove = user && (user.role === "admin" || user.role === "operator");

  const handleApprove = async () => {
    setIsApproving(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsApproving(false);
    setApproved(true);
    addToast("Alert approval will connect to the backend", "info");
  };

  return (
    <Card variant="surface" padding="md" className="space-y-3.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-hairline pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-status-warning" />
            <h3 className="font-serif text-base font-medium text-ink-primary">
              Draft Situational Alert
            </h3>
          </div>
          <p className="text-xs text-ink-secondary mt-0.5">{alert.targetZone}</p>
        </div>
        <Badge variant="sample" size="sm">
          Sample data
        </Badge>
      </div>

      {/* Alert Content */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Badge variant="danger" size="sm" dot>
            Urgency: {alert.urgency}
          </Badge>
          <span className="text-[11px] font-mono text-ink-muted">
            Lead time: +{alert.leadTimeHours}h
          </span>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed bg-cream-subtle p-3 rounded-control border border-hairline">
          {alert.summary}
        </p>

        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted block">
            Recommended Interventions
          </span>
          <ul className="text-xs text-ink-secondary space-y-1 pl-4 list-disc">
            {alert.actions.map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Role-based Action Footer */}
      <div className="pt-2 border-t border-hairline flex items-center justify-between">
        <span className="text-[11px] text-ink-muted">
          {approved ? "Status: Approved (Preview)" : "Status: Pending Approval"}
        </span>

        {canApprove && (
          <Button
            size="sm"
            variant={approved ? "subtle" : "primary"}
            isLoading={isApproving}
            onClick={handleApprove}
            disabled={approved}
            leftIcon={approved ? <CheckCircle2 className="w-3.5 h-3.5 text-status-success" /> : <Send className="w-3.5 h-3.5" />}
          >
            {approved ? "Approved" : "Approve and send"}
          </Button>
        )}

        {!canApprove && (
          <span className="text-[11px] text-ink-muted italic">
            Viewer role: Read-only access
          </span>
        )}
      </div>
    </Card>
  );
};
