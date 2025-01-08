// CallAnalyticsService.ts
export class CallAnalyticsService {
    constructor(private supabase: any) {}
  
    async getAgentStats(agentType: string) {
      // Fetching statistics based on inbound or outbound
      const { data, error } = await this.supabase
        .from("call_analytics")
        .select("*")
        .eq("agent_type", agentType);
  
      return { data, error };
    }
  
    async getUpcomingAppointments() {
      // Fetch upcoming appointments from Cal.com API (or internal DB if available)
      const response = await fetch("https://cal.com/api/appointments/upcoming");
      const appointments = await response.json();
      return { data: appointments, error: null };
    }
  }
  