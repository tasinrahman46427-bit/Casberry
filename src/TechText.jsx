import './TechText.css';

export default function TechText({ text = '', fontSize, fontWeight, reveal, clickKick }) {
  return (
    <div className={`tech-text${reveal ? ' tech-text--reveal' : ''}${clickKick ? ' tech-text--kick' : ''}`}
      style={{ fontSize: `${fontSize}px`, fontWeight }}
      aria-label={text}>
      {text.split('').map((character, index) => (
        <span key={`${character}-${index}`} style={{ '--letter': index }}>
          {character === ' ' ? '\u00a0' : character}
        </span>
      ))}
    </div>
  );
}
