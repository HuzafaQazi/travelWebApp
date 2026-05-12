// components/LogoCarousel.js

import styles from './partnersCarousal.module.css';
import { useEffect } from 'react';

const logos = [
  '/img/PartnersLogos/bigbasket.png', 
  '/img/PartnersLogos/ieto.png', 
  '/img/PartnersLogos/Mustek.png', 
  '/img/PartnersLogos/newland.png', 
  '/img/PartnersLogos/Portwell.png',  
  '/img/PartnersLogos/quinta.png',  
  '/img/PartnersLogos/indutch.png',  
  '/img/PartnersLogos/Posiflex.png', 
  '/img/PartnersLogos/QPOS.png',  
];
const LogoCarousel = () => {
  useEffect(() => {
    const track = document.querySelector(`.${styles.carouselTrack}`);
    const trackWidth = track.scrollWidth;
    track.style.setProperty('--track-width', `${trackWidth}px`);
  }, []);

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carouselTrack}>
        {logos.concat(logos).map((logo, index) => (
          <div key={index} className={styles.logo}>
            <img src={logo} alt={`Logo ${index}`} style={{ width: '100px' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoCarousel;
