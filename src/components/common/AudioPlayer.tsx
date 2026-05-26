import React, { useState, useEffect, useRef, useCallback } from 'react';
import PlayArrowOutlined from '@mui/icons-material/PlayArrowOutlined';
import PauseOutlined from '@mui/icons-material/PauseOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import Replay10Outlined from '@mui/icons-material/Replay10Outlined';
import Forward10Outlined from '@mui/icons-material/Forward10Outlined';
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined';
import VolumeMuteOutlined from '@mui/icons-material/VolumeMuteOutlined';

// ── Helpers ───────────────────────────────────────────────────────────────
function fmtTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Deterministic waveform heights from text seed
function seedBars(text: string, n = 40): number[] {
  const bars: number[] = [];
  for (let i = 0; i < n; i++) {
    const c = text.charCodeAt(i % text.length) + i * 7;
    bars.push(20 + (c % 60));
  }
  return bars;
}

// Simulate TTS duration: ~150 words per minute, ~5 chars per word
function estimateDuration(text: string): number {
  return Math.max(20, Math.round((text.replace(/<[^>]+>/g, '').length / 5 / 150) * 60));
}

// ── Waveform bars component ───────────────────────────────────────────────
const Waveform: React.FC<{
  bars: number[];
  progress: number; // 0–1
  isPlaying: boolean;
  onSeek: (ratio: number) => void;
}> = ({ bars, progress, isPlaying, onSeek }) => {
  const ref = useRef<HTMLDivElement>(null);

  function handleClick(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    onSeek((e.clientX - rect.left) / rect.width);
  }

  const played = Math.round(progress * bars.length);

  return (
    <div ref={ref} className="aup-waveform" onClick={handleClick} title="Click to seek">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`aup-bar${i < played ? ' aup-bar--played' : ''}${isPlaying && Math.abs(i - played) <= 1 ? ' aup-bar--active' : ''}`}
          style={{ height: h * 0.55 + '%' }}
        />
      ))}
    </div>
  );
};

// ── Props ────────────────────────────────────────────────────────────────
export interface AudioPlayerProps {
  text: string;          // Text to "read aloud" (we simulate TTS)
  title?: string;        // Brief title / message label
  onClose: () => void;
  variant?: 'bar' | 'card'; // 'bar' = compact bottom bar, 'card' = inline card
}

// ── Component ────────────────────────────────────────────────────────────
export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  text,
  title = 'AI Audio',
  onClose,
  variant = 'card',
}) => {
  const duration = estimateDuration(text);
  const bars = seedBars(text);

  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setElapsed(prev => {
      const next = prev + 0.25 * speed;
      if (next >= duration) {
        setIsPlaying(false);
        return duration;
      }
      return next;
    });
  }, [speed, duration]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(tick, 250);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, tick]);

  // Auto-play on mount
  useEffect(() => {
    setIsPlaying(true);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function handleSeek(ratio: number) {
    setElapsed(ratio * duration);
  }

  function handleSkip(delta: number) {
    setElapsed(prev => Math.max(0, Math.min(duration, prev + delta)));
  }

  const progress = elapsed / duration;
  const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

  if (variant === 'bar') {
    return (
      <div className="aup-bar-player">
        <div className="aup-bar-left">
          <div className="aup-bar-icon-wrap">
            {isPlaying
              ? <span className="aup-soundwave"><span/><span/><span/><span/></span>
              : <span className="aup-soundwave aup-soundwave--paused"><span/><span/><span/><span/></span>
            }
          </div>
          <div className="aup-bar-info">
            <span className="aup-bar-title">{title}</span>
            <span className="aup-bar-time">{fmtTime(elapsed)} / {fmtTime(duration)}</span>
          </div>
        </div>

        <div className="aup-bar-waveform">
          <Waveform bars={bars} progress={progress} isPlaying={isPlaying} onSeek={handleSeek} />
        </div>

        <div className="aup-bar-controls">
          <button className="aup-ctrl" onClick={() => handleSkip(-10)} title="Back 10s">
            <Replay10Outlined sx={{ fontSize: 18 }} />
          </button>
          <button className="aup-ctrl aup-ctrl--play" onClick={() => setIsPlaying(p => !p)}>
            {isPlaying ? <PauseOutlined sx={{ fontSize: 22 }} /> : <PlayArrowOutlined sx={{ fontSize: 22 }} />}
          </button>
          <button className="aup-ctrl" onClick={() => handleSkip(10)} title="Forward 10s">
            <Forward10Outlined sx={{ fontSize: 18 }} />
          </button>
          <div className="aup-speed-wrap">
            <button className="aup-ctrl aup-ctrl--speed" onClick={() => setShowSpeedMenu(m => !m)}>
              {speed}×
            </button>
            {showSpeedMenu && (
              <div className="aup-speed-menu">
                {SPEEDS.map(s => (
                  <button key={s} className={`aup-speed-opt${speed === s ? ' aup-speed-opt--active' : ''}`}
                    onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}>
                    {s}×
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="aup-ctrl" onClick={() => setMuted(m => !m)} title={muted ? 'Unmute' : 'Mute'}>
            {muted ? <VolumeMuteOutlined sx={{ fontSize: 18 }} /> : <VolumeUpOutlined sx={{ fontSize: 18 }} />}
          </button>
          <button className="aup-ctrl aup-ctrl--close" onClick={onClose} title="Close">
            <CloseOutlined sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <div className="aup-card">
      <div className="aup-card-header">
        <div className="aup-card-badge">
          {isPlaying
            ? <span className="aup-soundwave aup-soundwave--sm"><span/><span/><span/><span/></span>
            : <span className="aup-soundwave aup-soundwave--sm aup-soundwave--paused"><span/><span/><span/><span/></span>
          }
          <span className="aup-card-badge-text">Audio</span>
        </div>
        <span className="aup-card-title">{title}</span>
        <button className="aup-card-close" onClick={onClose}>
          <CloseOutlined sx={{ fontSize: 15 }} />
        </button>
      </div>

      <div className="aup-card-waveform-row">
        <span className="aup-card-time aup-card-time--elapsed">{fmtTime(elapsed)}</span>
        <Waveform bars={bars} progress={progress} isPlaying={isPlaying} onSeek={handleSeek} />
        <span className="aup-card-time aup-card-time--total">{fmtTime(duration)}</span>
      </div>

      {/* Progress track */}
      <div className="aup-card-track" onClick={e => {
        const r = e.currentTarget.getBoundingClientRect();
        handleSeek((e.clientX - r.left) / r.width);
      }}>
        <div className="aup-card-track-fill" style={{ width: `${progress * 100}%` }} />
        <div className="aup-card-track-thumb" style={{ left: `${progress * 100}%` }} />
      </div>

      <div className="aup-card-controls">
        <button className="aup-ctrl" onClick={() => handleSkip(-10)} title="Back 10s">
          <Replay10Outlined sx={{ fontSize: 18 }} />
        </button>
        <button className="aup-ctrl aup-ctrl--play" onClick={() => setIsPlaying(p => !p)}>
          {isPlaying ? <PauseOutlined sx={{ fontSize: 24 }} /> : <PlayArrowOutlined sx={{ fontSize: 24 }} />}
        </button>
        <button className="aup-ctrl" onClick={() => handleSkip(10)} title="Forward 10s">
          <Forward10Outlined sx={{ fontSize: 18 }} />
        </button>

        <div style={{ flex: 1 }} />

        <button className="aup-ctrl" onClick={() => setMuted(m => !m)}>
          {muted ? <VolumeMuteOutlined sx={{ fontSize: 18 }} /> : <VolumeUpOutlined sx={{ fontSize: 18 }} />}
        </button>
        <div className="aup-speed-wrap">
          <button className="aup-ctrl aup-ctrl--speed" onClick={() => setShowSpeedMenu(m => !m)}>
            {speed}×
          </button>
          {showSpeedMenu && (
            <div className="aup-speed-menu">
              {SPEEDS.map(s => (
                <button key={s} className={`aup-speed-opt${speed === s ? ' aup-speed-opt--active' : ''}`}
                  onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}>
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="aup-card-note">Audio preview · Simulated TTS for mobile showcase</p>
    </div>
  );
};
