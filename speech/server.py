"""Local CPU speech recognition. Listens only on loopback, never sends audio to a paid API."""
import base64
import io
import os
import threading
from flask import Flask, request, jsonify
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")
from faster_whisper import WhisperModel

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024
model = None
lock = threading.Lock()

@app.get('/health')
def health():
    return jsonify(status='ready' if model else 'loading', model=os.getenv('WHISPER_MODEL', 'small'), device='cpu')

@app.post('/transcribe')
def transcribe():
    if model is None:
        return jsonify(error='Whisper is loading. Wait for the speech terminal to show Ready.'), 503
    if not lock.acquire(blocking=False):
        return jsonify(error='A recording is already being transcribed. Wait and retry.'), 429
    try:
        data = request.get_json(silent=True) or {}
        encoded = data.get('audioBase64')
        if not isinstance(encoded, str):
            return jsonify(error='Audio is required.'), 400
        if data.get('mimeType') not in ('audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg'):
            return jsonify(error='Unsupported audio format.'), 400
        try:
            audio = base64.b64decode(encoded.split(',', 1)[-1], validate=True)
        except (ValueError, TypeError):
            return jsonify(error='Invalid recording data.'), 400
        if not audio or len(audio) > 18 * 1024 * 1024:
            return jsonify(error='Recording is empty or too large. Record a shorter command.'), 400
        from faster_whisper.audio import decode_audio
        samples = decode_audio(io.BytesIO(audio), sampling_rate=16000)
        if len(samples) > 60 * 16000:
            return jsonify(error='Please record commands shorter than 60 seconds.'), 400
        # Multilingual model, no language forced. Never translate the original speech.
        segments, info = model.transcribe(samples, beam_size=3, vad_filter=True,
                                         condition_on_previous_text=False, task='transcribe')
        text = ' '.join(s.text.strip() for s in segments if s.no_speech_prob < 0.6).strip()
        return jsonify(transcript=text, language=info.language)
    except Exception:
        app.logger.exception('Local transcription failed')
        return jsonify(error='Unable to decode/transcribe recording. Try a short, clear recording.'), 400
    finally:
        lock.release()

if __name__ == '__main__':
    print('Loading multilingual Whisper model on CPU. First run downloads model files.', flush=True)
    model = WhisperModel(os.getenv('WHISPER_MODEL', 'small'), device='cpu', compute_type='int8',
                         cpu_threads=min(8, os.cpu_count() or 4))
    print('Ready: local speech server http://127.0.0.1:8001', flush=True)
    from waitress import serve
    serve(app, host='127.0.0.1', port=8001, threads=2)
