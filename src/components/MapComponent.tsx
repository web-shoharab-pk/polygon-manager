import L, { LatLngExpression } from "leaflet";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  FeatureGroup,
  MapContainer,
  Marker,
  Polygon,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  addPolygon,
  deletePolygon,
  setPolygons,
} from "../store/slices/polygonSlice";
import { RootState } from "../store/store";
import styles from "./MapComponent.module.scss";

const MapComponent = () => {
  const dispatch = useDispatch();
  const polygons = useSelector((state: RootState) => state.polygon.polygons);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    // Get user's location when component mounts
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          setError("Unable to get location: " + error.message);
          setTimeout(() => setError(null), 3000);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setTimeout(() => setError(null), 3000);
    }
  }, []);

  const calculatePolygonCenter = (coordinates: number[][]) => {
    const latSum = coordinates.reduce((sum, coord) => sum + coord[0], 0);
    const lngSum = coordinates.reduce((sum, coord) => sum + coord[1], 0);
    return [latSum / coordinates.length, lngSum / coordinates.length];
  };

  const calculatePolygonArea = (coordinates: number[][]) => {
    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      area += coordinates[i][1] * coordinates[j][0];
      area -= coordinates[j][1] * coordinates[i][0];
    }
    area = Math.abs(area) / 2;

    const R = 6371;
    const areaInKm2 =
      area *
      (Math.PI / 180) *
      (Math.PI / 180) *
      R *
      R *
      Math.cos((coordinates[0][0] * Math.PI) / 180);

    return areaInKm2.toFixed(4);
  };

  const checkPolygonIntersection = (
    newPolygon: number[][],
    existingPolygons: any[]
  ) => {
    for (const polygon of existingPolygons) {
      // Use turf.js or a similar library for proper polygon intersection check
      // This is a simplified check
      const bounds1 = getBounds(newPolygon);
      const bounds2 = getBounds(polygon.coordinates);
      if (boundsIntersect(bounds1, bounds2)) {
        return true;
      }
    }
    return false;
  };

  const getBounds = (coordinates: number[][]) => {
    const lats = coordinates.map((c) => c[0]);
    const lngs = coordinates.map((c) => c[1]);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  };

  const boundsIntersect = (bounds1: any, bounds2: any) => {
    return !(
      bounds1.minLat > bounds2.maxLat ||
      bounds1.maxLat < bounds2.minLat ||
      bounds1.minLng > bounds2.maxLng ||
      bounds1.maxLng < bounds2.minLng
    );
  };

  const handleCreate = (e: any) => {
    const { layer } = e;
    const latlngs = layer
      .getLatLngs()[0]
      .map((latlng: any) => [latlng.lat, latlng.lng]);

    if (checkPolygonIntersection(latlngs, polygons)) {
      setError("Error: New polygon intersects with existing polygons!");
      layer.remove();
      setTimeout(() => setError(null), 3000);
      return;
    }

    dispatch(
      addPolygon({
        id: uuidv4(),
        coordinates: latlngs,
        fillColor: "#FF0000",
        borderColor: "#000000",
        name: `Polygon ${polygons.length + 1}`,
        area: Number(calculatePolygonArea(latlngs)),
      })
    );
  };

  const handleDelete = (e: any) => {
    e.layers.eachLayer((layer: any) => {
      const layerLatLngs = layer
        .getLatLngs()[0]
        .map((latlng: any) => [latlng.lat, latlng.lng]);

      const polygonToDelete = polygons.find(
        (polygon) =>
          JSON.stringify(polygon.coordinates) === JSON.stringify(layerLatLngs)
      );

      if (polygonToDelete) {
        dispatch(deletePolygon(polygonToDelete.id));
      }
    });
  };

  const exportPolygons = () => {
    const dataStr = JSON.stringify(polygons, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.download = "polygons.json";
    link.href = url;
    link.click();
  };

  const importPolygons = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedPolygons = JSON.parse(e.target?.result as string);
          const polygons = importedPolygons?.features.map((feature: any) => ({
            id: feature.properties.FID,
            coordinates: feature.geometry.coordinates[0].map((coord: any) => [
              coord[1],
              coord[0],
            ]),
            fillColor: "#FF0000",
            borderColor: "#000000",
            name: feature.properties.Name,
            area: feature.properties.LFlaeche,
          }));
          dispatch(setPolygons(polygons));
        } catch (err: any) {
          setError("Error importing file: Invalid format" + err?.message);
          setTimeout(() => setError(null), 3000);
        }
      };

      reader.readAsText(file);
    }
  };

  const LocationFinder = () => {
    const map = useMap();

    const centerOnLocation = () => {
      if (userLocation) {
        map.setView(userLocation, 14);
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation: [number, number] = [
              position.coords.latitude,
              position.coords.longitude,
            ];
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

  const filteredPolygons = polygons.filter(
    (polygon) =>
      polygon?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      polygon?.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search polygons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <button onClick={exportPolygons} className={styles.actionButton}>
          Export
        </button>
        <input
          type="file"
          accept=".json"
          onChange={importPolygons}
          className={styles.fileInput}
          id="import-input"
        />
        <label htmlFor="import-input">
          <button
            onClick={() => document.getElementById("import-input")?.click()}
            className={styles.actionButton}
          >
            Import
          </button>
        </label>
      </div>

      {error && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            backgroundColor: "#ff4444",
            color: "white",
            padding: "10px",
            borderRadius: "4px",
            zIndex: 1000,
          }}
        >
          {error}
        </div>
      )}

      <MapContainer
        center={userLocation || [48.351, 12.545]}
        zoom={14}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationFinder />

        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreate}
            onDeleted={handleDelete}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: "#e1e100",
                  message: "<strong>Polygon would intersect!</strong>",
                },
              },
            }}
          />
        </FeatureGroup>

        {filteredPolygons?.map((polygon) => (
          <Polygon
            key={polygon?.id}
            positions={polygon?.coordinates}
            color={polygon?.borderColor}
            fillColor={polygon?.fillColor}
          >
            <Marker
              position={
                calculatePolygonCenter(polygon?.coordinates) as LatLngExpression
              }
              icon={
                new L.Icon({
                  iconUrl: "/marker-icon.png",
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                  className: "polygon-marker",
                })
              }
            >
              <Tooltip
                permanent={false}
                direction="top"
                offset={[0, -10]}
                opacity={0.9}
                className="polygon-tooltip"
              >
                <div style={{ padding: "4px 8px" }}>
                  <strong>{polygon?.name}</strong>
                  <br />
                  Area: {polygon.area.toFixed(2)} km²
                </div>
              </Tooltip>
            </Marker>
          </Polygon>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
