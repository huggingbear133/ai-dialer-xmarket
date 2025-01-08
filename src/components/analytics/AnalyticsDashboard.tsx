// 'use client' directive
'use client'

import { useEffect, useState, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UpcomingAppointments } from "@/components/analytics/UpcomingAppointments"; // Client-side component
import { CallStatsChart } from "@/components/analytics/CallStatsChart"; // Client-side graph component
import { AnalyticsHeader } from "../analytics-header";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { supabase } from "@/lib/supabase/client";

// Define the types for your state
interface Data {
  stats: {
    totalCalls: number;
    totalMinutes: number;
    totalCredits: number;
    endOfCallReasons: Record<string, number>;
  };
  appointments: Array<{ id: string; title: string; date: string }>;
}

export default function AnalyticsDashboard({ initialData }: { initialData: Data }) {
  const [activeTab, setActiveTab] = useState("Outbound");
  const [data, setData] = useState<Data | null>(initialData);  // Initialize state with the SSR data

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch calls data from Supabase based on agent type
        const { data: callsData, error: callsError } = await supabase
          .from('calls')
          .select('*')
          .eq('agent_type', activeTab);

        if (callsError) throw callsError;

        // Calculate stats from calls data
        const totalCalls = callsData.length;
        const totalMinutes = callsData.reduce((acc, call) => acc + (call.duration || 0), 0);
        const totalCredits = callsData.reduce((acc, call) => acc + (call.credits_used || 0), 0);

        // Calculate end of call reasons
        const endOfCallReasons = callsData.reduce((acc, call) => {
          const status = call.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .eq('agent_type', activeTab)
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true });

        if (appointmentsError) throw appointmentsError;

        const formattedAppointments = appointmentsData.map(apt => ({
          id: apt.id,
          title: apt.title || `Meeting with ${apt.contact_name}`,
          date: apt.date
        }));

        setData({
          stats: {
            totalCalls,
            totalMinutes,
            totalCredits,
            endOfCallReasons,
          },
          appointments: formattedAppointments,
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    fetchData(); // Always fetch fresh data when tab changes
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Suspense wrapper for client-side components */}
      <Suspense fallback={<Skeleton className="h-9 w-48" />}>
        <AnalyticsHeader />
      </Suspense>

      <div className="tabs">
        <button
          onClick={() => setActiveTab("Outbound")}
          className={`tab ${activeTab === "Outbound" ? "border-2 rounded-lg border-green-700 hover:border-green-300 dark:border-gray-700 dark:hover:border-green-700 px-4 py-2 mx-2" : "border-2 rounded-lg border-green-700 hover:border-green-300 dark:border-gray-700 dark:hover:border-green-700 px-4 py-2 mx-2"}`}
        >
          Outbound
        </button>
        <button
          onClick={() => setActiveTab("Inbound")}
          className={`tab ${activeTab === "Inbound" ? "border-2 rounded-lg border-green-700 hover:border-green-300 dark:border-gray-700 dark:hover:border-green-700 px-4 py-2 mx-2" : "border-2 rounded-lg border-green-700 hover:border-green-300 dark:border-gray-700 dark:hover:border-green-700 px-4 py-2 mx-2"}`}
        >
          Inbound
        </button>
      </div>

      {data ? (
        <>
        <Card className="mx-2 my-4">
          <CardHeader>
            <CardTitle className="text-semibold text-2xl">Call Stats ({activeTab})</CardTitle>
            <div className="grid grid-cols-3 gap-4 px-10 py-6">
                <div className="stat">
                  <h3>Total Calls</h3>
                  <p>{data.stats.totalCalls}</p>
                </div>
                <div className="stat">
                  <h3>Total Minutes</h3>
                  <p>{data.stats.totalMinutes}</p>
                </div>
                <div className="stat">
                  <h3>Total Credits Used</h3>
                  <p>{data.stats.totalCredits}</p>
                </div>
            </div>
          </CardHeader>
          
        </Card>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Card className="mx-2 my-4">
              <CallStatsChart data={data.stats.endOfCallReasons} />
            </Card>
          </div>
          <Card className="mx-2 my-4">
            <CardHeader>
              <CardTitle className="text-semibold text-2xl">Upcoming Appointments</CardTitle>
            </CardHeader>
            <UpcomingAppointments appointments={data.appointments} />
          </Card>
        </div>
        </>
      ) : (
        <Skeleton className="h-32 w-full" />
      )}
    </div>
  );
}
