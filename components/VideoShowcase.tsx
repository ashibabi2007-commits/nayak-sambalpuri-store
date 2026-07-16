'use client';

import { PlayCircle, Sparkles } from 'lucide-react';

const videos = [
  {
    title: 'Sambalpuri Saree Collection',
    subtitle: 'Add your shop collection video here',
    src: '/videos/collection-1.mp4',
    poster: '/videos/poster-1.jpg',
  },
  {
    title: 'Cotton & Silk Saree Designs',
    subtitle: 'Show pallu, border, fabric and colour details',
    src: '/videos/collection-2.mp4',
    poster: '/videos/poster-2.jpg',
  },
];

export default function VideoShowcase() {
  return (
    <section className="section video-section">
      <div className="container">
        <div className="section-title">
          <div>
            <span className="badge"><Sparkles size={16}/> Video Gallery</span>
            <h2>Watch Our Saree Collection</h2>
          </div>
        </div>
        <div className="video-grid">
          {videos.map((video, index) => (
            <div className="video-card" key={video.src}>
              <div className="video-frame">
                <video controls preload="metadata" poster={video.poster}>
                  <source src={video.src} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
                <div className="video-fallback">
                  <PlayCircle size={52}/>
                  <strong>Video {index + 1}</strong>
                  <small>Add file: public{video.src}</small>
                </div>
              </div>
              <div className="video-info">
                <h3>{video.title}</h3>
                <p>{video.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="video-help">To show videos, add MP4 files in <strong>public/videos</strong> with names <strong>collection-1.mp4</strong> and <strong>collection-2.mp4</strong>.</p>
      </div>
    </section>
  );
}
