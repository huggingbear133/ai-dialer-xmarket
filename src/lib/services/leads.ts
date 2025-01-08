/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultClient } from '@/lib/supabase/client';
import type { Lead } from '@/lib/supabase/types';

export type LeadStatus = "pending" | "calling" | "no_answer" | "scheduled" | "not_interested" | "error";

export class LeadsService {
  private supabase: SupabaseClient;
  
  constructor(supabaseClient: SupabaseClient = defaultClient) {
    this.supabase = supabaseClient;
  }

  async getLeads(
    options: {
      sortBy?: { column: keyof Lead | null; ascending: boolean };
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{ data: Lead[] | null; error: any; count: number }> {
    const { data, error: authError } = await this.supabase.auth.getSession();
    const user = data?.session?.user;
  
    if (authError || !user) {
      return {
        data: null,
        error: { message: 'User is not authenticated' },
        count: 0
      };
    }
  
    const { sortBy, page, pageSize } = options;
    
    try {
      let query = this.supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
  
      if (sortBy?.column) {
        query = query.order(sortBy.column, {
          ascending: sortBy.ascending
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }
  
      if (typeof page === 'number' && typeof pageSize === 'number') {
        const start = (page - 1) * pageSize;
        query = query.range(start, start + pageSize - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        return {
          data: null,
          error: {
            message: error.message || 'Failed to fetch leads',
            details: error
          },
          count: 0
        };
      }

      return {
        data,
        error: null,
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching leads:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: error
        },
        count: 0
      };
    }
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<{ success: boolean; data?: Lead | null; error?: any }> {
    try {
      const { data, error } = await this.supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error updating lead:', error);
      return {
        success: false,
        error
      };
    }
  }

  async deleteLead(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await this.supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting lead:', error);
      return {
        success: false,
        error
      };
    }
  }

  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Lead | null; error?: any }> {
    try {
      const { data: sessionData, error: authError } = await this.supabase.auth.getSession();
      const user = sessionData?.session?.user;
  
      if (authError || !user) {
        return {
          data: null,
          error: { message: 'User is not authenticated' },
        };
      }
  
      const { data, error } = await this.supabase
        .from('leads')
        .insert([ 
          { 
            ...lead,
            user_id: user.id,
            status: 'pending',
            call_attempts: 0,
            follow_up_email_sent: false
          }
        ])
        .select()
        .single();
  
      if (error) throw error;
  
      return {
        data
      };
    } catch (error) {
      console.error('Error creating lead:', error);
      return {
        data: null,
        error
      };
    }
  }

  async updateLeadStatus(ids: string[], status: LeadStatus): Promise<{ success: boolean; data?: Lead[] | null; error?: any }> {
    try {
      const { data, error } = await this.supabase
        .from('leads')
        .update({ status })
        .in('id', ids)
        .select();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error updating lead status:', error);
      return {
        success: false,
        error
      };
    }
  }

  async updateCallStatus(phoneNumber: string, status: LeadStatus): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await this.supabase
        .from('leads')
        .update({ 
          status,
          last_called_at: new Date().toISOString()
        })
        .eq('phone', phoneNumber);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating call status:', error);
      return { success: false, error };
    }
  }

  async fetchPendingLeads(maxCallsBatch: number, retryInterval: number, maxAttempts: number): Promise<{ 
    success: boolean; 
    leads?: Lead[] | null; 
    error?: any 
  }> {
    try {
      const { count: activeCallsCount, error: countError } = await this.supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'calling');

      if (countError) throw countError;

      const availableSlots = Math.max(0, maxCallsBatch - (activeCallsCount || 0));

      if (availableSlots === 0) {
        return {
          success: true,
          leads: []
        };
      }

      const { data: leads, error } = await this.supabase
        .from('leads')
        .select('*')
        .eq('status', 'pending')
        .or(`last_called_at.is.null,last_called_at.lt.${new Date(Date.now() - retryInterval * 60 * 1000).toISOString()}`)
        .lt('call_attempts', maxAttempts)
        .order('last_called_at', { ascending: true, nullsFirst: true })
        .limit(availableSlots);

      if (error) throw error;

      return {
        success: true,
        leads
      };
    } catch (error) {
      console.error('Error fetching pending leads:', error);
      return {
        success: false,
        error
      };
    }
  }

  async updateLeadWithCallAttempt(leadId: string, currentAttempts: number): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await this.supabase
        .from('leads')
        .update({ 
          call_attempts: currentAttempts + 1,
          last_called_at: new Date().toISOString(),
          status: 'calling'
        })
        .eq('id', leadId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating lead call attempt:', error);
      return { success: false, error };
    }
  }
}

export const leadsService = new LeadsService();
