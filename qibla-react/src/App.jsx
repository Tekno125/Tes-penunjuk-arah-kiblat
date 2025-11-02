import { useEffect, useState } from "react";
import useCompass from "./hooks/useCompass";

export default function App() {
  const [location, setLocation] = useState(null);
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const { heading, permissionGranted } = useCompass();

  // 1️⃣ Dapatkan lokasi pengguna
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setLocation({ lat, lon });
        },
        (err) => console.warn("Lokasi tidak diizinkan:", err)
      );
    }
  }, []);

  // 2️⃣ Hitung arah kiblat
  useEffect(() => {
    if (!location) return;
    const kaabaLat = 21.4225 * Math.PI / 180;
    const kaabaLon = 39.8262 * Math.PI / 180;
    const userLat = location.lat * Math.PI / 180;
    const userLon = location.lon * Math.PI / 180;
    const deltaLon = kaabaLon - userLon;

    const y = Math.sin(deltaLon);
    const x =
      Math.cos(userLat) * Math.tan(kaabaLat) -
      Math.sin(userLat) * Math.cos(deltaLon);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    if (bearing < 0) bearing += 360;

    setQiblaAngle(bearing);
  }, [location]);

  // 3️⃣ Hitung rotasi panah relatif ke utara
  const rotation = heading !== null && qiblaAngle !== null
    ? qiblaAngle - heading
    : 0;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-2xl font-bold mb-4">🧭 Penunjuk Arah Kiblat</h1>

      {!permissionGranted && (
        <p className="text-red-600 mb-4">Izin sensor belum diberikan</p>
      )}

      {location ? (
        <>
          <p>Lokasi Anda: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
          <p>Arah Kiblat: {qiblaAngle?.toFixed(2)}°</p>
          <p>Arah Utara (HP): {heading ? heading.toFixed(2) + "°" : "..."}</p>
          <div
            className="mt-10 w-32 h-32 border-4 border-gray-300 rounded-full flex items-center justify-center"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-[24px] border-l-transparent border-r-transparent border-b-green-600"></div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Putar HP agar panah menunjuk arah kiblat</p>
        </>
      ) : (
        <p>Mendapatkan lokasi...</p>
      )}
    </div>
  );
}
