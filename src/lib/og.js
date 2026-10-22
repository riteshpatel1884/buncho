import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = 'image/png';

const GREEN = '#34d67b';
const DARK = '#04140a';

const DIFF_COLOR = { Easy: '#34d67b', Medium: '#f5b942', Hard: '#ff6b6b' };

function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          borderRadius: 14,
          background: GREEN,
          color: DARK,
          fontSize: 40,
          fontWeight: 800,
          marginRight: 16,
        }}
      >
        b
      </div>
      <div style={{ display: 'flex', fontSize: 38, fontWeight: 800, color: '#eff1f6' }}>
        buncho<span style={{ color: GREEN }}>.</span>
      </div>
    </div>
  );
}

/**
 * Branded 1200x630 share card. `chips` is a list of short labels (topic, difficulty, time).
 * Used for the site default, every topic and every problem so shared links on X always have a preview.
 */
export function renderOg({ eyebrow, title, subtitle, chips = [] }) {
  const size = title.length > 90 ? 52 : title.length > 55 ? 62 : 74;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #0b1f14 0%, #1a1a1a 55%, #1a1a1a 100%)',
          color: '#eff1f6',
          fontFamily: 'sans-serif',
        }}
      >
        <Brand />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {eyebrow && (
            <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: GREEN, letterSpacing: 2, textTransform: 'uppercase' }}>
              {eyebrow}
            </div>
          )}
          <div style={{ display: 'flex', marginTop: 18, fontSize: size, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1.5 }}>{title}</div>
          {subtitle && <div style={{ display: 'flex', marginTop: 22, fontSize: 30, color: '#9aa3b2', lineHeight: 1.35 }}>{subtitle}</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {chips.map((c) => (
            <div
              key={c}
              style={{
                display: 'flex',
                marginRight: 14,
                padding: '10px 22px',
                borderRadius: 999,
                fontSize: 26,
                fontWeight: 700,
                background: '#2f2f2f',
                color: DIFF_COLOR[c] ?? '#eff1f6',
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}