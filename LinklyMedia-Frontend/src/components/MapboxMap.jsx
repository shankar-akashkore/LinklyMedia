import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";


console.log("MAPBOX TOKEN:", import.meta.env.VITE_MAPBOX_TOKEN);
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapboxMap({ lat, lng }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (lat == null || lng == null) return;
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 16,
    });

    mapRef.current.scrollZoom.disable();

    mapRef.current.on("click", () => {
      mapRef.current.scrollZoom.enable();
    });

    mapRef.current.on("mouseleave", () => {
      mapRef.current.scrollZoom.disable();
    });

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        "<h5 style='margin:0;font-size:14px;'>Location</h5>"
      );

    
    new mapboxgl.Marker({ color: "#507c88" })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(mapRef.current);

    return () => mapRef.current?.remove();
  }, [lat, lng]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[450px] rounded-xl overflow-hidden shadow-lg"
    />
  );
}