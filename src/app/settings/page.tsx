"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Switch } from "@/components/ui/switch"
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

// Settings interface for automation configuration
interface AutomationSettings {
  automation_enabled: boolean
  email: string;
  phone: string;
  name: string;
  username: string;
  companyName: string;
  companyWebsite: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  billingAddress: string;
  niche: string;
  companySize: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  youtube: string;
  calendarLink: string;
  twitter: string;
  tiktok: string;
  agentName: string;
  agentGender: 'male' | 'female';
  agentPosition: string;
  agentFirstMessage: string;
  agentLastMessage: string;
  agentLanguages: string[];
  agentVoice: string;
  enableEmotionDetection: boolean;
  enableHIPPAProtection: boolean;
  agentVoiceAvatar: string;
  faqs: any[];
  rebuttals: any[];
  max_calls_batch?: number;
  retry_interval?: number;
  max_attempts?: number;
}

interface AccountSettings {
  email: string
  phone: string
  name: string
  username: string
  companyName: string
  companyWebsite: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  billingAddress: string
  niche: string
  companySize: string
  linkedin: string
  facebook: string
  instagram: string
  youtube: string
  calendarLink: string
  twitter: string
  tiktok: string
}

interface AgentSettings {
  agentName: string
  gender: 'male' | 'female'
  position: string
  firstMessage: string
  lastMessage: string
  languages: string[]
  voice: string
  emotionDetection: boolean
  hipaaProtection: boolean
  agentVoiceAvatar: string
  faqs: any[]
  rebuttals: any[]
}

const sidebarItems = [
  { key: "account", label: "Account Settings" },
  { key: "dialer", label: "Dialer Settings" },
  { key: "ai-agent", label: "AI Agent Settings" }
] as const;

export default function SettingsPage() {
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<typeof sidebarItems[number]['key']>("account");
  const [accountSettings, setAccountSettings] = useState<AccountSettings>(initializeAccountSettings());
  const [agentSettings, setAgentSettings] = useState<AgentSettings>(initializeAgentSettings());
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  function initializeAccountSettings(): AccountSettings {
    return {
      email: '',
      phone: '',
      name: '',
      username: '',
      companyName: '',
      companyWebsite: '',
      companyEmail: '',
      companyPhone: '',
      companyAddress: '',
      billingAddress: '',
      niche: '',
      companySize: '',
      linkedin: '',
      facebook: '',
      instagram: '',
      youtube: '',
      calendarLink: '',
      twitter: '',
      tiktok: ''
    };
  }

  function initializeAgentSettings(): AgentSettings {
    return {
      agentName: "",
      gender: "male",
      position: "Sales",
      firstMessage: "",
      lastMessage: "",
      languages: ["english"],
      voice: "",
      emotionDetection: false,
      hipaaProtection: false,
      agentVoiceAvatar: '',
      faqs: [],
      rebuttals: []
    };
  }

  async function loadSettings() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authenticated session');
      }

      // Enable RLS policies for the settings table
      const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code === '42501') {
        // Handle permission denied error
        showToast(
          'Permission Error',
          'Please check database permissions and RLS policies',
          'destructive'
        );
        return;
      }

      if (error) throw error;

      if (!settings) {
        // Create default settings for new user
        const defaultSettings = {
          user_id: session.user.id,
          automation_enabled: false,
          ...initializeAccountSettings(),
          ...initializeAgentSettings()
        };

        const { error: insertError } = await supabase
          .from('settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError && insertError.code === '42501') {
          showToast(
            'Permission Error',
            'Unable to create settings - please check database permissions',
            'destructive'
          );
          return;
        }

        if (insertError) throw insertError;

        const typedDefaultSettings = {
          ...defaultSettings,
          agentGender: defaultSettings.gender,
          agentPosition: defaultSettings.position,
          agentFirstMessage: defaultSettings.firstMessage,
          agentLastMessage: defaultSettings.lastMessage,
          agentLanguages: defaultSettings.languages,
          agentVoice: defaultSettings.voice,
          enableEmotionDetection: defaultSettings.emotionDetection
        } as unknown as AutomationSettings;

        setSettings(typedDefaultSettings);
        setAccountSettings(mapAccountSettings(typedDefaultSettings));
        setAgentSettings(mapAgentSettings(typedDefaultSettings));
        return;
      }
      
      // Cast settings to AutomationSettings
      const typedSettings = settings as AutomationSettings;
      setSettings(typedSettings);
      setAccountSettings(mapAccountSettings(typedSettings));
      setAgentSettings(mapAgentSettings(typedSettings));
    } catch (error) {
      console.error('Failed to load settings:', error);
      showToast(
        'Error loading settings',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'destructive'
      );
    }
  }

  function mapAccountSettings(settings: AutomationSettings): AccountSettings {
    return {
      email: settings.email || '',
      phone: settings.phone || '',
      name: settings.name || '',
      username: settings.username || '',
      companyName: settings.companyName || '',
      companyWebsite: settings.companyWebsite || '',
      companyEmail: settings.companyEmail || '',
      companyPhone: settings.companyPhone || '',
      companyAddress: settings.companyAddress || '',
      billingAddress: settings.billingAddress || '',
      niche: settings.niche || '',
      companySize: settings.companySize || '',
      linkedin: settings.linkedin || '',
      facebook: settings.facebook || '',
      instagram: settings.instagram || '',
      youtube: settings.youtube || '',
      calendarLink: settings.calendarLink || '',
      twitter: settings.twitter || '',
      tiktok: settings.tiktok || ''
    };
  }

  function mapAgentSettings(settings: AutomationSettings): AgentSettings {
    return {
      agentName: settings.agentName || '',
      gender: settings.agentGender || 'male',
      position: settings.agentPosition || 'Sales',
      firstMessage: settings.agentFirstMessage || '',
      lastMessage: settings.agentLastMessage || '',
      languages: settings.agentLanguages || ['english'],
      voice: settings.agentVoice || '',
      emotionDetection: settings.enableEmotionDetection || false,
      hipaaProtection: settings.enableHIPPAProtection || false,
      agentVoiceAvatar: settings.agentVoiceAvatar || '',
      faqs: settings.faqs || [],
      rebuttals: settings.rebuttals || []
    };
  }

  function showToast(title: string, description: string, variant: 'default' | 'destructive' | 'success') {
    toast({
      title,
      description,
      variant,
    });
  }

  function handleAccountChange(field: keyof AccountSettings, value: string) {
    setAccountSettings(prev => ({ ...prev, [field]: value }));
  }

  async function saveSettings() {
    if (!settings) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authenticated session');
      }

      const updatedSettings: AutomationSettings = {
        ...settings,
        ...accountSettings,
        agentName: agentSettings.agentName,
        agentGender: agentSettings.gender,
        agentPosition: agentSettings.position,
        agentFirstMessage: agentSettings.firstMessage,
        agentLastMessage: agentSettings.lastMessage,
        agentLanguages: agentSettings.languages,
        agentVoice: agentSettings.voice,
        enableEmotionDetection: agentSettings.emotionDetection,
        enableHIPPAProtection: agentSettings.hipaaProtection,
        agentVoiceAvatar: agentSettings.agentVoiceAvatar,
        faqs: agentSettings.faqs,
        rebuttals: agentSettings.rebuttals,
        max_calls_batch: settings.max_calls_batch || 10,
        retry_interval: settings.retry_interval ?? 60,
        max_attempts: settings.max_attempts ?? 3,
        automation_enabled: settings.automation_enabled ?? false
      };

      const { error } = await supabase
        .from('settings')
        .upsert({ ...updatedSettings, user_id: session.user.id });

      if (error) throw error;

      showToast("Success", "Settings updated successfully", "success");
      await loadSettings(); // Reload settings to ensure sync
    } catch (error) {
      showToast(
        "Error",
        error instanceof Error ? error.message : "Failed to update settings",
        "destructive"
      );
    } finally {
      setLoading(false);
    }
  }

  const voices = [
    { voiceId: "1", voiceName: "Voice 1" },
    { voiceId: "2", voiceName: "Voice 2" },
    { voiceId: "3", voiceName: "Voice 3" },
  ] as const;

  function handleBlur(e: React.FocusEvent<HTMLInputElement>, field: keyof AutomationSettings, min = 0) {
    if (!settings) return;
    const input = e.target;
    const value = input.value.trim();
    if (value === '') {
      input.value = String(settings[field]);
      return;
    }
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      input.value = String(settings[field]);
      return;
    }
    const finalValue = Math.max(min, numValue);
    setSettings(prevSettings => prevSettings ? {
      ...prevSettings,
      [field]: finalValue
    } : null);
    input.value = finalValue.toString();
  }

  if (!settings || typeof settings !== 'object') {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10 flex max-w-6xl">
      <aside className="w-1/4 pr-6">
        <div className="space-y-4">
          {sidebarItems.map(item => (
            <Button
              key={item.key}
              variant={activeSection === item.key ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActiveSection(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </aside>
      <div className="w-3/4">
        {activeSection === "dialer" && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-semibold text-2xl">AI Dialer Settings</CardTitle>
                <CardDescription className="text-semibold text-md">Configure your automated calling system parameters.<br></br><b>Note: </b>These settings only affect <b>Outbound Agents</b>.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardContent className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="max-calls-batch">Maximum Calls per Batch</Label>
                  <Input
                    id="max-calls-batch"
                    type="number"
                    min={1}
                    value={settings.max_calls_batch ?? 10}
                    onBlur={(e) => handleBlur(e, 'max_calls_batch', 10)}
                  />
                  <p className="text-sm text-gray-500">
                    Sets the maximum number of calls to be made in each batch.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retry-interval">Retry Interval (minutes)</Label>
                  <Input
                    id="retry-interval"
                    type="number"
                    min={0}
                    value={settings.retry_interval || 15}
                    onBlur={(e) => handleBlur(e, 'retry_interval', 15)}
                  />
                  <p className="text-sm text-gray-500">
                    Defines the waiting time (in minutes) before retrying a failed call.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Maximum Attempts per Lead</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    min={1}
                    value={settings.max_attempts || 2}
                    onBlur={(e) => handleBlur(e, 'max_attempts', 2)}
                  />
                  <p className="text-sm text-gray-500">
                    Limits the number of call attempts that can be made per lead.
                  </p>
                </div>
                <Button 
                  className="w-full" 
                  onClick={saveSettings}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {activeSection === "account" && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-semibold text-2xl">Account Settings</CardTitle>
                <CardDescription className="text-semibold text-md">Manage your account details, company information, and social presence. Ensure this information is accurate to avoid communication issues.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Account & User Information</CardTitle>
                <CardDescription>Update your basic information <b>(your AI agent won't use this information)</b>.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="example@domain.com" value={accountSettings.email} onChange={(e) => handleAccountChange('email', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input placeholder="Username for login" value={accountSettings.username} onChange={(e) => handleAccountChange('username', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="John Doe" value={accountSettings.name} onChange={(e) => handleAccountChange('name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input placeholder="Username for login" value={accountSettings.phone} onChange={(e) => handleAccountChange('phone', e.target.value)} />
                  </div>
                </div>
                <Button className="w-full" onClick={saveSettings} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Account Settings'}
                </Button>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your company information for your AI Agent to use.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input placeholder="Company Inc." value={accountSettings.companyName} onChange={(e) => handleAccountChange('companyName', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Email</Label>
                    <Input placeholder="info@domain.com" value={accountSettings.companyEmail} onChange={(e) => handleAccountChange('companyEmail', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Phone</Label>
                    <Input placeholder="Insert Company Number" value={accountSettings.companyPhone} onChange={(e) => handleAccountChange('companyPhone', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Legal Address</Label>
                    <Input placeholder="Company Address / Physical Location" value={accountSettings.companyAddress} onChange={(e) => handleAccountChange('companyAddress', e.target.value)} />
                  </div>
                </div>
                <Button className="w-full" onClick={saveSettings} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Account Settings'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {activeSection === "ai-agent" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>AI Agent Settings</CardTitle>
              <CardDescription>Configure your AI agent's personality and behavior.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Agent Name</Label>
                  <Input
                    value={agentSettings.agentName}
                    onChange={(e) => setAgentSettings({ ...agentSettings, agentName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={agentSettings.gender}
                    onValueChange={(value) => setAgentSettings({ ...agentSettings, gender: value as "male" | "female" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={agentSettings.position}
                    onValueChange={(value) => setAgentSettings({ ...agentSettings, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Customer Service">Customer Service</SelectItem>
                      <SelectItem value="Appointment Setter">Appointment Setter</SelectItem>
                      <SelectItem value="Receptionist">Receptionist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Agent First Message</Label>
                  <Input
                    value={agentSettings.firstMessage}
                    onChange={(e) => setAgentSettings({ ...agentSettings, firstMessage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Agent Last Message</Label>
                  <Input
                    value={agentSettings.lastMessage}
                    onChange={(e) => setAgentSettings({ ...agentSettings, lastMessage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <Select
                    value={agentSettings.languages[0]}
                    onValueChange={(value) => setAgentSettings({ ...agentSettings, languages: [value] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Voice</Label>
                  <Select
                    value={agentSettings.voice}
                    onValueChange={(value) => setAgentSettings({ ...agentSettings, voice: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map(voice => (
                        <SelectItem key={voice.voiceId} value={voice.voiceId}>
                          {voice.voiceName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full items-center justify-between">
                  <div className="text-center space-x-4 py-1">
                    <Label>Emotion Detection</Label>
                    <Switch
                      checked={agentSettings.emotionDetection}
                      onCheckedChange={(checked) => setAgentSettings({ ...agentSettings, emotionDetection: checked })}
                    />
                  </div>
                  <div className="text-center space-x-4 py-1">
                    <Label>HIPAA Protection</Label>
                    <Switch
                      checked={agentSettings.hipaaProtection}
                      onCheckedChange={(checked) => setAgentSettings({ ...agentSettings, hipaaProtection: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}