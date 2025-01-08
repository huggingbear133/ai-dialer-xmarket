import { SupabaseClient } from '@supabase/supabase-js'
import { supabase as defaultClient } from '@/lib/supabase/client'

export type AgentSettings = {
  automation_enabled: boolean
  max_calls_batch: number
  retry_interval: number
  max_attempts: number
  agent_name?: string
  gender?: string
  position?: string
  first_message?: string
  last_message?: string
  languages?: string[]
  voice?: string
  voice_avatar?: string
  emotion_detection?: boolean
  hipaa_protection?: boolean
  faqs?: any[]
  rebuttals?: any[]
}

export const DEFAULT_SETTINGS: AgentSettings = {
  automation_enabled: false,
  max_calls_batch: 10,
  retry_interval: 15,
  max_attempts: 3,
  gender: 'male',
  position: 'Sales Representative',
  languages: ['English'],
  emotion_detection: false,
  hipaa_protection: false,
  faqs: [],
  rebuttals: []
}

class SettingsService {
  private supabase: SupabaseClient

  constructor(supabaseClient: SupabaseClient = defaultClient) {
    this.supabase = supabaseClient
  }

  async getAgentSettings(): Promise<AgentSettings> {
    try {
      const { data, error } = await this.supabase
        .from('agent_settings')
        .select('*')
        .eq('user_id', (await this.supabase.auth.getUser())?.data?.user?.id)
        .single()

      if (error) {
        // For any errors, return defaults to prevent blocking the UI
        console.log('Using default settings due to error:', error.message)
        return DEFAULT_SETTINGS
      }

      // Return data with fallback to defaults for any missing fields
      return {
        automation_enabled: data?.automation_enabled ?? DEFAULT_SETTINGS.automation_enabled,
        max_calls_batch: data?.max_calls_batch ?? DEFAULT_SETTINGS.max_calls_batch,
        retry_interval: data?.retry_interval ?? DEFAULT_SETTINGS.retry_interval,
        max_attempts: data?.max_attempts ?? DEFAULT_SETTINGS.max_attempts,
        agent_name: data?.agent_name,
        gender: data?.gender ?? DEFAULT_SETTINGS.gender,
        position: data?.position ?? DEFAULT_SETTINGS.position,
        first_message: data?.first_message,
        last_message: data?.last_message,
        languages: data?.languages ?? DEFAULT_SETTINGS.languages,
        voice: data?.voice,
        voice_avatar: data?.voice_avatar,
        emotion_detection: data?.emotion_detection ?? DEFAULT_SETTINGS.emotion_detection,
        hipaa_protection: data?.hipaa_protection ?? DEFAULT_SETTINGS.hipaa_protection,
        faqs: data?.faqs ?? DEFAULT_SETTINGS.faqs,
        rebuttals: data?.rebuttals ?? DEFAULT_SETTINGS.rebuttals
      }
    } catch (err) {
      // Catch any other errors and return defaults
      console.log('Error fetching settings, using defaults:', err)
      return DEFAULT_SETTINGS
    }
  }

  async updateAutomationEnabled(enabled: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.supabase.auth.getUser()
      const userId = user.data.user?.id

      if (!userId) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await this.supabase
        .from('agent_settings')
        .upsert({ 
          automation_enabled: enabled,
          user_id: userId
        })

      if (error) {
        console.log('Error updating automation enabled:', error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'Failed to update settings'
      
      console.log('Error updating automation settings:', errorMessage)
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  async updateAllSettings(settings: AgentSettings): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.supabase.auth.getUser()
      const userId = user.data.user?.id

      if (!userId) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await this.supabase
        .from('agent_settings')
        .upsert({
          ...settings,
          user_id: userId
        })

      if (error) {
        console.log('Error updating all settings:', error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'Failed to update settings'
      
      console.log('Error updating automation settings:', errorMessage)
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }
}

// Export a singleton instance with the default client for client-side use
export const settingsService = new SettingsService()

// Export the class for server-side use with different clients
export { SettingsService }