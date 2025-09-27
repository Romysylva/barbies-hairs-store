// "use client";
import { useEffect, useRef } from "react";

interface VideoParallaxProps {
  src: string;
  speed?: number; // how strong the parallax is
  height?: string; // section height
}

export default function VideoParallax({
  src,
  speed = 0.4,
  height = "150vh",
}: VideoParallaxProps) {
  const videoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (videoRef.current) {
        const offset = window.scrollY;
        videoRef.current.style.transform = `translateY(${offset * speed}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <main>
      {/* <div className="bhs:absolute bhs:inset-0 bhs:bg-gradient-to-r bhs:from-purple-800/60 bhs:to-pink-600/60 bhs:-z-0" /> */}
      <div className="relative overflow-hidden" style={{ height }}>
        {/* Video Wrapper */}
        <div
          ref={videoRef}
          className="bhs:absolute bhs:top-0 bhs:left-0 bhs:w-full bhs:h-full bhs:will-change-transform"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="bhs:w-full bhs:h-full bhs:object-cover"
          >
            <source src={src} type="video/mp4" />
          </video>
        </div>

        {/* Foreground Content */}
        <div className="bhs:relative bhs:z-10 bhs:flex bhs:items-center bhs:justify-center bhs:h-full"></div>
      </div>
    </main>
  );
}
