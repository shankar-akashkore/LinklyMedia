// // utils/map.js

// export const geocodePlace = async (place) => {
//     if (!place) return null;
  
//     try {
//       const res = await fetch(
//         `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
//           place + " Bangalore Karnataka India"
//         )}.json?` +
//           `access_token=${import.meta.env.VITE_MAPBOX_TOKEN}` +
//           `&country=IN` +
//           `&proximity=77.5946,12.9716` +
//           `&limit=1`
//       );
  
//       const data = await res.json();
  
//       if (data.features?.length > 0) {
//         const [lng, lat] = data.features[0].center;
//         return { lat, lng };
//       }
  
//       return null;
//     } catch (err) {
//       console.error("Geocoding error:", err);
//       return null;
//     }
//   };





// utils/map.js

export const geocodePlace = async (place) => {

console.log("MAPBOX TOKEN:", import.meta.env.VITE_MAPBOX_TOKEN);
  if (!place) return null;

  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        place + " Bangalore Karnataka India"
      )}.json?` +
        `access_token=${import.meta.env.VITE_MAPBOX_TOKEN}` +
        `&country=IN` +
        `&proximity=77.5946,12.9716` +
        `&limit=1`
    );

    const data = await res.json();

    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }

    return null;
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
};