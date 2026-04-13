/**
 * AlarmAudio — Plays alarm sounds using Web Audio API oscillators.
 * Supports gradual volume ramp-up and looping until stopped.
 */

type SoundGenerator = (ctx: AudioContext, gain: GainNode) => OscillatorNode[];

const BEEP_INTERVAL_MS = 800;
const BEEP_DURATION_MS = 300;

function classicBeep(ctx: AudioContext, gain: GainNode): OscillatorNode[] {
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.value = 880;
  osc.connect(gain);
  return [osc];
}

function gentleChime(ctx: AudioContext, gain: GainNode): OscillatorNode[] {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 523.25;
  osc.connect(gain);
  return [osc];
}

function natureBirds(ctx: AudioContext, gain: GainNode): OscillatorNode[] {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 1200;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 6;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 300;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  osc.connect(gain);
  lfo.start();
  return [osc, lfo];
}

function digitalPulse(ctx: AudioContext, gain: GainNode): OscillatorNode[] {
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = 440;
  osc.connect(gain);
  return [osc];
}

const SOUND_MAP: Record<string, SoundGenerator> = {
  "classic-beep": classicBeep,
  "gentle-chime": gentleChime,
  "nature-birds": natureBirds,
  "digital-pulse": digitalPulse,
};

interface AlarmAudioHandle {
  stop: () => void;
}

export function playAlarmSound(
  soundFile: string,
  isGradualVolume: boolean,
  gradualDurationSec: number,
): AlarmAudioHandle {
  const ctx = new AudioContext();
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  const startVolume = isGradualVolume ? 0.01 : 0.8;
  const endVolume = 0.8;
  masterGain.gain.value = startVolume;

  if (isGradualVolume) {
    masterGain.gain.linearRampToValueAtTime(
      endVolume,
      ctx.currentTime + gradualDurationSec,
    );
  }

  const generator = SOUND_MAP[soundFile] ?? SOUND_MAP["classic-beep"];
  let oscillators: OscillatorNode[] = [];
  let isPlaying = true;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const playBurst = () => {
    if (!isPlaying) return;

    oscillators = generator(ctx, masterGain);
    oscillators.forEach((osc) => osc.start());

    setTimeout(() => {
      oscillators.forEach((osc) => {
        try { osc.stop(); } catch { /* already stopped */ }
      });
    }, BEEP_DURATION_MS);

    timeoutId = setTimeout(playBurst, BEEP_INTERVAL_MS);
  };

  playBurst();

  return {
    stop: () => {
      isPlaying = false;
      if (timeoutId) clearTimeout(timeoutId);
      oscillators.forEach((osc) => {
        try { osc.stop(); } catch { /* already stopped */ }
      });
      ctx.close();
    },
  };
}