"use client"

import React, { useEffect, useState } from "react";
import { settingsService } from "@/lib/services/settings";
import { leadsService } from "@/lib/services/leads";
import { ClientAutomationControl } from "@/components/client-automation-control";
import { ClientLeadTable } from "@/components/client-lead-table";
import { Skeleton } from "@/components/ui/skeleton";
import { DialerHeader } from "@/components/dialer-header";

// Loading skeletons for each component
function HeaderSkeleton() {
  return (
    <div className="flex justify-between items-center">
      <Skeleton className="h-9 w-48" /> {/* For "Lead Management" text */}
      <Skeleton className="h-9 w-24" /> {/* For "Sign Out" button */}
    </div>
  );
}

function AutomationControlSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" /> {/* For "Outbound Calling" text */}
        <Skeleton className="h-4 w-64" /> {/* For status text */}
      </div>
      <Skeleton className="h-6 w-11" /> {/* For the switch */}
    </div>
  );
}

function LeadTableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="border-b px-4 py-3">
        <Skeleton className="h-8 w-full" /> {/* Table header */}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-3 border-b last:border-0">
          <Skeleton className="h-12 w-full" /> {/* Table rows */}
        </div>
      ))}
    </div>
  );
}

export default function DialerPage() {
  const [data, setData] = useState<{ leads: any[]; settings: any } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [leadsResult, settingsResult] = await Promise.all([
          leadsService.getLeads(),
          settingsService.getAgentSettings()
        ]);

        if (!leadsResult || leadsResult.error) {
          throw new Error(leadsResult?.error?.message || "Failed to fetch leads");
        }

        setData({
          leads: leadsResult.data || [],
          settings: settingsResult
        });
      } catch (error) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <AutomationControlSkeleton />
        <LeadTableSkeleton />
      </div>
    );
  }

  if (error) {
    return <div className="space-y-6">{error}</div>;
  }

  if (data) {
    return (
      <div className="space-y-6">
        <DialerHeader />
        <ClientAutomationControl initialSettings={data.settings} />
        <ClientLeadTable initialLeads={data.leads} />
      </div>
    );
  }

  return null;
}
