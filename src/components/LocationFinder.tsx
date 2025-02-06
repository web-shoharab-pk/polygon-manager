import { useMap } from "react-leaflet";
type LocationFinderProps = {
  userLocation: [number, number];
  setUserLocation: (location: [number, number]) => void;
  error: string | null;
  setError: (error: string | null) => void;
};
const LocationFinder = ({
  userLocation,
  setUserLocation,
  setError,
}: LocationFinderProps) => {
  const map = useMap();

  const centerOnLocation = () => {
    if (userLocation) {
      map.setView(userLocation, 14);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = [
            position.coords.latitude,
            position.coords.longitude,
          ] as [number, number];
          setUserLocation(newLocation);
          map.setView(newLocation, 14);
        },
        (error) => {
          setError("Unable to get location: " + error.message);
          setTimeout(() => setError(null), 3000);
        }
      );
    }
  };

  return (
    <button
      onClick={centerOnLocation}
      style={{
        position: "absolute",
        top: "140px",
        right: "10px",
        zIndex: 1000,
        padding: "5px",
        backgroundColor: "white",
        border: "2px solid rgba(0,0,0,0.2)",
        borderRadius: "4px",
        color: "black",
      }}
    >
      📍 My Location
    </button>
  );
};

export default LocationFinder;
