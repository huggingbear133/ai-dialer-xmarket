// services/analytics.ts
import { createClient } from "@supabase/supabase-js";

export class CallAnalyticsService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  // Fetches configuration from the environment or Supabase
  async getConfiguration() {
    // Fetch configuration from Supabase for more dynamic use
    // For now, we'll rely on environment variables
    return {
      calcomApiKey: process.env.CALCOM_API_KEY,
      vapiApiKey: process.env.VAPI_API_KEY,
      vapiSecretKey: process.env.VAPI_SECRET_KEY,
    };
  }

  // Example function to fetch analytics data for Outbound or Inbound
  async getAnalyticsData(agentType: string) {
    const { data, error } = await this.supabase
      .from('call_analytics') // Table to store call analytics data
      .select('*')
      .eq('agent_type', agentType);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Simulating an API call to an external service like Cal.com
  async fetchFromCalCom() {
    const config = await this.getConfiguration();
    
    const response = await fetch("https://cal.com/api/events", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${config.calcomApiKey}`,
      },
    });

    const data = await response.json();
    return data;
  }
}
