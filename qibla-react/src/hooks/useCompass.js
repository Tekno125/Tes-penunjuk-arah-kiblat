import { useEffect, useState } from "react";

export default function useCompass() {
  const [heading, setHeading] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    let handleOrientation = (event) => {
      if (event.absolute && event.alpha !== null) {
        const headingValue = 360 - event.alpha; // rotasi searah jarum jam
        setHeading(headingValue % 360);
      }
    };

    async function init() {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          const response = await DeviceOrientationEvent.requestPermission();
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
            setPermissionGranted(true);
          } else {
            setPermissionGranted(false);
          }
        } catch {
          setPermissionGranted(false);
        }
      } else {
        // Browser non-iOS
        window.addEventListener("deviceorientationabsolute", handleOrientation);
        setPermissionGranted(true);
      }
    }

    init();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("deviceorientationabsolute", handleOrientation);
    };
  }, []);

  return { heading, permissionGranted };
}
