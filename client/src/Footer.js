import React from 'react';
import './App.css';

function Footer() {
  // Generate detailed savannah grass blades
  const grassBlades = Array.from({ length: 300 }).map((_, i) => {
    const height = 40 + Math.random() * 60;
    const width = 2 + Math.random() * 2;
    const left = (i * 0.34) + Math.random() * 1.2;
    const rotate = -10 + Math.random() * 20;
    const color = Math.random() > 0.5 ? '#b5a642' : '#e2c275';
    const shadow = Math.random() > 0.7 ? '0 0 6px #b5a64288' : 'none';
    return (
      <div
        key={i}
        className="savannah-grass-blade"
        style={{
          left: `${left}%`,
          height: `${height}px`,
          width: `${width}px`,
          background: color,
          boxShadow: shadow,
          transform: `rotate(${rotate}deg)`,
          opacity: 0.85 + Math.random() * 0.15,
        }}
      />
    );
  });

  return (

    <div className="savannah-grass-container">
      {grassBlades}
    </div>
  );
}

export default Footer;
