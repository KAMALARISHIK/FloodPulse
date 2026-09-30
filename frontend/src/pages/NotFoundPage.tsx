import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-6px)] bg-cream-bg text-ink-primary flex items-center justify-center p-6">
      <Card variant="surface" padding="lg" className="max-w-md w-full text-center space-y-4 shadow-card">
        <span className="font-mono text-xs text-terracotta uppercase tracking-widest font-bold">
          404 &middot; Not Found
        </span>
        <h2 className="text-3xl font-serif font-medium text-ink-primary">
          Page does not exist
        </h2>
        <p className="text-sm text-ink-secondary leading-relaxed">
          The requested coordinate or module path could not be found.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
