import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const NavigationLoader = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let currentPath = router.asPath;

    const handleStart = (nextPath) => {
      // Don't show loader if navigating to the same path
      if (nextPath === currentPath) {
        return;
      }
      setLoading(true);
    };

    const handleComplete = (nextPath) => {
      currentPath = nextPath;
      setLoading(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  if (!loading) return null;

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 w-full bg-gray-200">
          <div className="h-full bg-blue-600 transition-all duration-300 animate-[progressWidth_2s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Overlay */}
      <div className="fixed inset-0 bg-white/30 z-40 pointer-events-auto" />

      {/* Add required keyframes */}
      <style jsx global>{`
        @keyframes progressWidth {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default NavigationLoader;
