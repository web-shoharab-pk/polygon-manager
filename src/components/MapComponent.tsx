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
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useDispatch, useSelector } from "react-redux";
import {
  addPolygon,
  deletePolygon,
  setPolygons,
  updatePolygon,
} from "../store/slices/polygonSlice";
import { RootState } from "../store/store";
import styles from "./../styles/components/MapComponent.module.scss";
import LocationFinder from "./LocationFinder";
import { checkPolygonIntersection } from "@/utils/utils";

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
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        if (
          permissionStatus.state === "granted" ||
          permissionStatus.state === "prompt"
        ) {
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
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            }
          );
        } else {
          setError("Location permission denied");
          setTimeout(() => setError(null), 3000);
        }
      })
      .catch((err) => {
        console.error("Error checking location permissions:", err);
        setError("Error checking location permissions");
        setTimeout(() => setError(null), 3000);
      });
  }, []);

  const calculatePolygonCenter = (coordinates: number[][]) => {
    const latSum = coordinates.reduce((sum, coord) => sum + coord[0], 0);
    const lngSum = coordinates.reduce((sum, coord) => sum + coord[1], 0);
    return [latSum / coordinates.length, lngSum / coordinates.length];
  };

  const calculatePolygonArea = (coordinates: number[][]) => {
    // Handle case where coordinates are in {lat, lng} format
    const formattedCoords = Array.isArray(coordinates[0])
      ? coordinates
      : coordinates.map((coord: any) => [coord.lat, coord.lng]);

    let area = 0;
    for (let i = 0; i < formattedCoords.length; i++) {
      const j = (i + 1) % formattedCoords.length;
      area += formattedCoords[i][1] * formattedCoords[j][0];
      area -= formattedCoords[j][1] * formattedCoords[i][0];
    }
    area = Math.abs(area) / 2;

    const R = 6371; // Earth's radius in km
    const centerLat =
      formattedCoords.reduce((sum, coord) => sum + coord[0], 0) /
      formattedCoords.length;

    const areaInKm2 =
      area *
      (Math.PI / 180) *
      (Math.PI / 180) *
      R *
      R *
      Math.cos((centerLat * Math.PI) / 180);

    return areaInKm2.toFixed(4);
  };

 

  const handleCreate = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const latlngs = layer
        .getLatLngs()[0]
        .map((latlng: any) => [latlng.lat, latlng.lng]);

      if (checkPolygonIntersection(latlngs, polygons)) {
        setError("Error: Polygon overlaps with existing polygons!");
        layer.remove();
        setTimeout(() => setError(null), 3000);
        return;
      }

      const polygonData = {
        id: layer._leaflet_id,
        coordinates: latlngs,
        fillColor: "#FF0000",
        borderColor: "#000000",
        name: `Polygon ${polygons.length + 1}`,
        area: Number(calculatePolygonArea(latlngs)),
      };
      dispatch(addPolygon(polygonData));
    }
  };

  const handleEdit = (e: any) => {
    const { layers } = e;

    layers.eachLayer((layer: any) => {
      const latlngs = layer
        .getLatLngs()[0]
        .map((latlng: any) => [latlng.lat, latlng.lng]);

      // Check for intersection with other polygons
      const otherPolygons = polygons.filter((p) => p.id !== layer._leaflet_id);
      if (checkPolygonIntersection(latlngs, otherPolygons)) {
        setError("Error: Edited polygon overlaps with existing polygons!");
        setTimeout(() => setError(null), 3000);
        // Revert the edit by refreshing the map
        window.location.reload();
        return;
      }

      const polygonToUpdate = polygons.find(
        (polygon) => polygon.id === layer._leaflet_id
      );

      if (polygonToUpdate) {
        dispatch(
          updatePolygon({
            ...polygonToUpdate,
            coordinates: latlngs,
            area: Number(calculatePolygonArea(latlngs)),
          })
        );
      }
    });
  };

  const handleDelete = (e: any) => {
    try {
      const { layers } = e;

      layers.getLayers().forEach((layer: any) => {
        const id = layer._leaflet_id;
        if (id) {
          dispatch(deletePolygon(id));
        }
      });
    } catch (error) {
      console.error("Error in handleDelete:", error);
      setError("Failed to delete polygon");
      setTimeout(() => setError(null), 3000);
    }
  };

  const exportPolygons = () => {
    try {
      const dataStr = JSON.stringify(polygons, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.download = "polygons.json";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url); // Clean up
    } catch (err) {
      console.error("Error in exportPolygons:", err);
      setError("Failed to export polygons");
      setTimeout(() => setError(null), 3000);
    }
  };

  const importPolygons = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (e.g., limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB");
      setTimeout(() => setError(null), 3000);
      return;
    }

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

    reader.onerror = () => {
      setError("Error reading file");
      setTimeout(() => setError(null), 3000);
    };

    reader.readAsText(file);
  };

  const filteredPolygons = polygons.filter(
    (polygon) =>
      polygon?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      polygon?.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
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
        className={styles.mapContainer}
      >
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreate}
            onDeleted={handleDelete}
            onEdited={handleEdit}
            draw={{
              rectangle: false,
              polyline: false,
              circle: false,
              circlemarker: false,
              marker: false,
            }}
          />
        </FeatureGroup>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationFinder
          userLocation={userLocation || [48.351, 12.545]}
          setUserLocation={setUserLocation}
          error={error}
          setError={setError}
        />
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
                  Area: {polygon?.area?.toFixed(2)} km²
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
