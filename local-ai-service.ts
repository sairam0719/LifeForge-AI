// Runs only on the backend. No paid API credentials or cloud endpoints.
export class LocalAIError extends Error {
  constructor(message: string, public status = 503) { super(message); }
}
function localUrl(value: string | undefined, fallback: string) {
  const url = new URL(value || fallback);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.protocol !== 'http:') {
    throw new LocalAIError('Local AI URLs must use http://localhost or http://127.0.0.1.', 400);
  }
  return url.origin;
}
export async function generateText(text: string, options: { system?: string; history?: {role: string; content: string}[]; json?: boolean; image?: { data: string; mimeType: string } } = {}) {
  const base = localUrl(process.env.OLLAMA_URL, 'http://127.0.0.1:11434');
  const model = options.image ? process.env.OLLAMA_VISION_MODEL : process.env.OLLAMA_MODEL || 'qwen2.5:3b';
  if (!model) throw new LocalAIError('Food-photo analysis needs an optional local vision model. Follow README.md to enable it. Chat and voice do not need it.');
  try {
    const response = await fetch(`${base}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, stream: false, keep_alive: options.image ? 0 : '5m',
        ...(options.json ? { format: 'json' } : {}),
        options: { temperature: 0.2, num_ctx: 4096, num_predict: 700 },
        messages: [...(options.system ? [{ role: 'system', content: options.system }] : []),
          ...(options.history || []).filter(m=>['user','assistant'].includes(m.role)).slice(-6).map(m=>({role:m.role,content:m.content.slice(0,500)})),
          { role: 'user', content: text, ...(options.image ? { images: [options.image.data] } : {}) }],
      }), signal: AbortSignal.timeout(180000),
    });
    if (!response.ok) {
      if (response.status === 404) throw new LocalAIError(`Local model not installed. Run: ollama pull ${model}`);
      throw new LocalAIError(`Ollama returned HTTP ${response.status}. Check its terminal.`);
    }
    const result = await response.json() as any;
    if (!result.message?.content) throw new LocalAIError('Local model returned no reply. Please retry.', 502);
    return result.message.content as string;
  } catch (err: any) {
    if (err instanceof LocalAIError) throw err;
    throw new LocalAIError(err.name === 'TimeoutError' ? 'Local model took too long. Retry with a shorter command or a smaller model.' : 'Ollama is not running. Open Ollama, install the model, then try again.');
  }
}
export async function transcribeAudio(audioBase64: string, mimeType: string) {
  const base = localUrl(process.env.LOCAL_SPEECH_URL, 'http://127.0.0.1:8001');
  try {
    const response = await fetch(`${base}/transcribe`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType }), signal: AbortSignal.timeout(180000),
    });
    const result = await response.json() as any;
    if (!response.ok) throw new LocalAIError(result.error || 'Local transcription failed.', response.status);
    return result.transcript || '';
  } catch (err: any) {
    if (err instanceof LocalAIError) throw err;
    throw new LocalAIError(err.name === 'TimeoutError' ? 'Transcription took too long. Use a shorter recording.' : 'Local speech server is not running. Run start-local.bat or the speech command in README.md.');
  }
}
