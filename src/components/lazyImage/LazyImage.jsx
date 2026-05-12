import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const LazyImage = ({ src, alt, width, height, className }) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "100px" }
    );

    if (imgRef.current && !isLoaded) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [isLoaded]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  if (isLoaded) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isInView ? (
        <>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleImageLoad}
            className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"}`}
            style={{ transition: "opacity 0.3s" }}
          />
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </>
      ) : (
        <div className={`${className} bg-gray-200`} />
      )}
    </div>
  );
};

export default LazyImage;
