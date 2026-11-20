import { useRef, useState } from 'react';
import './FlexCarousel.css';

export default function FlexCarousel({ items = [] }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ x: 0, left: 0 });

  const startDrag = event => {
    setDragging(true);
    drag.current = {
      x: event.clientX,
      left: trackRef.current.scrollLeft
    };
  };

  const moveDrag = event => {
    if (!dragging) return;
    trackRef.current.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
  };

  const stopDrag = () => setDragging(false);

  return (
    <div
      ref={trackRef}
      className={`flex-carousel${dragging ? ' is-dragging' : ''}`}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={stopDrag}
      onPointerLeave={stopDrag}
    >
      {items.map(item => (
        <article className="flex-card" key={item.title}>
          <img src={item.src} alt={item.alt} draggable="false" />
          <div className="flex-card__caption">
            <strong>{item.title}</strong>
            <span>{item.subtitle}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
