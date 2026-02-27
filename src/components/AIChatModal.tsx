import { sendAiChatMessage, type AiChatMessage } from '@/api/ai.api';
import { useToast } from '@/hooks/use-toast';
import { Bot, FileText, Paperclip, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type AIChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const INITIAL_MESSAGE: AiChatMessage = {
  role: 'assistant',
  content: 'Oi. Sou seu assistente de curriculo. Envie seu PDF ou sua pergunta para eu analisar e sugerir melhorias.',
};

export function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<AiChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSend = useMemo(
    () => (input.trim().length > 0 || !!pendingFile) && !isSending,
    [input, pendingFile, isSending],
  );

  useEffect(() => {
    if (!isOpen) return;
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages, isOpen]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isOpen, onClose]);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Arquivo invalido',
        description: 'Envie apenas arquivos PDF.',
        variant: 'destructive',
      });
      event.target.value = '';
      return;
    }

    setPendingFile(file);
    event.target.value = '';
  };

  const handleSend = async () => {
    const content = input.trim();
    if ((!content && !pendingFile) || isSending) return;

    const fileBadge = pendingFile ? `[PDF anexado: ${pendingFile.name}]` : '';
    const baseMessage = content || 'Analise meu curriculo enviado e diga o que voce acha.';
    const userVisibleMessage = fileBadge ? `${baseMessage}\n${fileBadge}` : baseMessage;
    const userMessage: AiChatMessage = { role: 'user', content: userVisibleMessage };
    const previous = messages;

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const answer = await sendAiChatMessage({
        message: content,
        history: previous,
        file: pendingFile,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
      setPendingFile(null);
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Nao foi possivel obter resposta da IA.';
      toast({
        title: 'Falha no chat',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[calc(100vw-1rem)] sm:w-[430px] h-[78vh] max-h-[700px] min-h-[500px] glass-card rounded-2xl border border-border overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full flex items-center justify-center bg-primary/20 text-primary">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Assistant</h3>
            <p className="text-[11px] text-muted-foreground">Chat style GPT</p>
          </div>
        </div>
        <button type="button" className="action-btn" onClick={onClose} aria-label="Fechar chat">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <div key={`${message.role}-${index}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={[
                  'max-w-[87%] rounded-2xl px-3 py-2 text-sm leading-6 whitespace-pre-wrap',
                  isUser
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-secondary border border-border text-foreground rounded-bl-md',
                ].join(' ')}
              >
                {!isUser && <Sparkles className="h-3.5 w-3.5 mb-1 text-primary" />}
                {message.content}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[87%] rounded-2xl rounded-bl-md px-3 py-2 text-sm leading-6 bg-secondary border border-border text-foreground">
              Digitando...
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-3 py-3 bg-background/40">
        {pendingFile && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span className="max-w-[220px] truncate">{pendingFile.name}</span>
            <button
              type="button"
              className="action-btn !p-0 h-4 w-4"
              onClick={() => {
                setPendingFile(null);
              }}
              aria-label="Remover PDF"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-secondary/40 p-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            className="w-full min-h-[80px] max-h-[160px] resize-y bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Digite sua mensagem..."
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                className="neo-button !px-2.5 !py-1.5 text-xs flex items-center gap-1.5"
                onClick={handlePickFile}
                disabled={isSending}
              >
                <Paperclip className="h-3.5 w-3.5" />
                PDF
              </button>
            </div>
            <button
              type="button"
              className="neo-button-primary !px-3 !py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
              disabled={!canSend}
              onClick={() => void handleSend()}
            >
              <Send className="h-3.5 w-3.5" />
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
