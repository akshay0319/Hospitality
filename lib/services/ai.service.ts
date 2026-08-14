import { api, unwrap } from '@/lib/api';

export interface CopilotMessage { role: 'user' | 'assistant'; content: string }

export interface RevPoint { date: string; revenue: number; roomsSold: number }

export interface CopilotResponse {
  answer: string;
  live: boolean;
  grounded: boolean;
  toolsUsed: string[];
  model?: string;
  chart?: RevPoint[] | null;
}

export const aiService = {
  async status(): Promise<{ live: boolean }> {
    const res = await api.get('/ai/status');
    return unwrap<{ live: boolean }>(res);
  },

  async copilot(messages: CopilotMessage[], allowWrites = false): Promise<CopilotResponse> {
    const res = await api.post('/ai/copilot', { messages, allowWrites });
    return unwrap<CopilotResponse>(res);
  },
};
