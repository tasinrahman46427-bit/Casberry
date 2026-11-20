import { useEffect, useRef } from 'react';
import './GlowCursor.css';

export default function GlowCursor({ children, color = '#5f8bff', clickBurst }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const move = event => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--cursor-x', `${event.clientX - rect.left}px`);
      el.style.setProperty('--cursor-y', `${event.clientY - rect.top}px`);
    };
    const burst = event => {
      if (!clickBurst) return;
      const rect = el.getBoundingClientRect();
      const dot = document.createElement('span');
      dot.className = 'glow-cursor__burst';
      dot.style.left = `${event.clientX - rect.left}px`;
      dot.style.top = `${event.clientY - rect.top}px`;
      dot.style.borderColor = color;
      el.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerdown', burst);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerdown', burst);
    };
  }, [clickBurst, color]);

  return (
    <div ref={ref} className="glow-cursor" style={{ '--glow-color': color }}>
      <div className="glow-cursor__light" />
      {children}
    </div>
  );
}
