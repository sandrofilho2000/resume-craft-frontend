export type AiChatRole = 'user' | 'assistant';

export type AiChatMessage = {
  role: AiChatRole;
  content: string;
};

type SendAiChatMessageParams = {
  message: string;
  history: AiChatMessage[];
  file?: File | null;
};

type BackendAiChatResponse = {
  answer?: string;
  message?: string;
  output_text?: string;
};

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://127.0.0.1:3000';
const rawEnv = import.meta.env as unknown as Record<string, string | undefined>;
const BACKEND_CHAT_PATH = rawEnv.VITE_AI_CHAT_PATH ?? '/ai/chat';

async function callBackendProxy(message: string, history: AiChatMessage[], file?: File | null) {
  const formData = new FormData();
  formData.append('message', message);
  formData.append('history', JSON.stringify(history.slice(-12)));
  if (file) formData.append('file', file);

  const response = await fetch(`${API_URL}${BACKEND_CHAT_PATH.startsWith('/') ? BACKEND_CHAT_PATH : `/${BACKEND_CHAT_PATH}`}`, {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json().catch(() => ({}))) as BackendAiChatResponse;

  if (!response.ok) {
    const err = data?.message || data?.answer || 'Falha ao chamar o endpoint /ai/chat.';
    throw new Error(`[${response.status}] ${err}`);
  }

  const answer = (data.answer || data.output_text || '').trim();
  if (!answer) {
    throw new Error('A resposta da IA veio vazia.');
  }

  return answer;
}

export async function sendAiChatMessage({ message, history, file }: SendAiChatMessageParams) {
  try {
    return await callBackendProxy(message, history, file);
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Falha ao chamar o chat IA.';
    if (description.includes('404')) {
      throw new Error('Endpoint de chat nao encontrado. Verifique se o NestJS esta rodando e se a rota POST /ai/chat existe.');
    }
    throw error;
  }
}
