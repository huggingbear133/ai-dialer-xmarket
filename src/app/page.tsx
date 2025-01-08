"use client"

import React, { useEffect, useState, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import { leadsService } from "@/lib/services/leads";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type CallStatus = "pending" | "calling" | "no_answer" | "scheduled" | "not_interested" | "error";

interface Stats {
  totalCalls: number;
  totalMinutes: number;
  totalCredits: number;
  endOfCallReasons: Record<CallStatus, number>;
}

interface Appointment {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  status: CallStatus;
  call_attempts: number;
  updated_at: string;
}

interface Data {
  stats: Stats;
  appointments: Appointment[];
}

const fetchLeads = async () => {
  const leadsResult = await leadsService.getLeads();
  if (!leadsResult || leadsResult.error) {
    throw new Error(leadsResult?.error?.message || "Failed to fetch leads");
  }
  return leadsResult.data || [];
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        const leads = await fetchLeads();

        const totalCalls = leads.length;
        const totalMinutes = leads.reduce((acc, lead) => acc + lead.call_attempts * 2, 0);
        const totalCredits = leads.reduce((acc, lead) => acc + lead.call_attempts * 0.5, 0);

        const endOfCallReasons: Record<CallStatus, number> = {
          pending: 0,
          calling: 0,
          no_answer: 0,
          scheduled: 0,
          not_interested: 0,
          error: 0,
        };

        leads.forEach((lead) => {
          if (lead.status in endOfCallReasons) {
            endOfCallReasons[lead.status] += 1;
          }
        });

        const appointments = leads.filter((lead) => lead.status === "scheduled");

        setData({
          stats: {
            totalCalls,
            totalMinutes,
            totalCredits,
            endOfCallReasons,
          },
          appointments,
        });
      } catch (error) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="space-y-6">{error}</div>;
  }

  if (data) {
    return (
      <div className="space-y-6">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <AnalyticsDashboard initialData={data as any} />
        </Suspense>
      </div>
    )
  }
};
