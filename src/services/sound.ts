/**
 * Realistic Book Page Turn Sound Generator using Web Audio API
 * Synthesizes natural paper friction and rustle without requiring external audio files.
 */

class SoundService {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playPageTurn(volume = 0.5) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const duration = 0.28; // ~280ms realistic flip duration

      // Create noise buffer for paper friction
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate soft pink-ish noise with micro-textures
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0555179;
        b1 = 0.96300 * b1 + white * 0.0750759;
        b2 = 0.57000 * b2 + white * 0.1538520;
        const pink = (b0 + b1 + b2 + white * 0.5362) * 0.11;
        // Modulate with minor fiber crackles
        data[i] = pink * (0.8 + Math.random() * 0.4);
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Bandpass filter centered around 700Hz - 1800Hz for paper sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + duration * 0.4);
      filter.frequency.exponentialRampToValueAtTime(450, now + duration);
      filter.Q.setValueAtTime(1.5, now);

      // Volume envelope (quick attack, gentle rustle, smooth release)
      const gainNode = this.ctx.createGain();
      const masterVol = Math.max(0.01, Math.min(1, volume)) * 0.8;
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(masterVol, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(masterVol * 0.6, now + duration * 0.6);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Connect graph
      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch {
      // AudioContext may be blocked before first user gesture
    }
  }
}

export const soundService = new SoundService();
