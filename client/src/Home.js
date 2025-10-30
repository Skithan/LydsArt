import React from 'react';
import './App.css';

const Home = () => (
  <section id="home" className="home-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
    <img 
      src={process.env.PUBLIC_URL + '/Headshot.jpeg'} 
      alt="Lydia Paterson Headshot" 
      style={{ width: '220px', height: '220px', objectFit: 'cover', borderRadius: '50%', boxShadow: '0 4px 24px #0004', marginBottom: '2rem' }}
    />
    <div className="biography-text" style={{ maxWidth: '600px', textAlign: 'center', fontSize: '1.25rem', color: '#333333', background: '#f7f7f0dd', padding: '2rem', borderRadius: '1rem', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)' }}>
      My practice, rooted primarily in oil and acrylic painting, explores themes of childhood, nostalgia, and the
contradictions of change. I draw inspiration from the everyday--people, places, and connections that shape
our experiences. My work reflects an attentiveness to both the small details and the expansive: the softness
of light stretching across the sky, the sharp vibrancy of spring, and the fleeting moments that hold emotion
in their simplest forms.
<br></br>
As my practice continues to evolve, I’ve come to recognize how its themes echo past joys and the
elements of childhood I revisit as I move into adulthood. Much like my surroundings and experiences,
both past and present, my work mirrors this change, prompting shifts in style, theme, and subject.
    </div>
  </section>
);

export default Home;
