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

  // Improved polygon intersection check using line segment intersection
  const doLineSegmentsIntersect = (
    p1: number[],
    p2: number[],
    p3: number[],
    p4: number[]
  ) => {
    const ccw = (A: number[], B: number[], C: number[]) => {
      return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
    };
    return (
      ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
    );
  };

  const checkPolygonIntersection = (
    newPolygon: number[][],
    existingPolygons: any[]
  ) => {
    // Check each existing polygon
    for (const polygon of existingPolygons) {
      const existingCoords = polygon.coordinates;

      // Check each line segment of new polygon against each line segment of existing polygon
      for (let i = 0; i < newPolygon.length; i++) {
        const i2 = (i + 1) % newPolygon.length;
        const line1Start = newPolygon[i];
        const line1End = newPolygon[i2];

        for (let j = 0; j < existingCoords.length; j++) {
          const j2 = (j + 1) % existingCoords.length;
          const line2Start = existingCoords[j];
          const line2End = existingCoords[j2];

          if (
            doLineSegmentsIntersect(line1Start, line1End, line2Start, line2End)
          ) {
            return true;
          }
        }
      }

      // Check if one polygon is completely inside the other
      const isPointInPolygon = (point: number[], polygon: number[][]) => {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const xi = polygon[i][0],
            yi = polygon[i][1];
          const xj = polygon[j][0],
            yj = polygon[j][1];
          const intersect =
            yi > point[1] !== yj > point[1] &&
            point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
          if (intersect) inside = !inside;
        }
        return inside;
      };

      // Check if any point of new polygon is inside existing polygon
      if (newPolygon.some((point) => isPointInPolygon(point, existingCoords))) {
        return true;
      }

      // Check if any point of existing polygon is inside new polygon
      if (
        existingCoords.some((point: number[]) =>
          isPointInPolygon(point, newPolygon)
        )
      ) {
        return true;
      }
    }
    return false;
  };

  const _onCreate = (e: any) => {
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

  const _onEdited = (e: any) => {
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

  const _onDeleted = (e: any) => {
    try {
      const { layers } = e;

      layers.getLayers().forEach((layer: any) => {
        const id = layer._leaflet_id;
        if (id) {
          dispatch(deletePolygon(id));
        }
      });
    } catch (error) {
      console.error("Error in _onDeleted:", error);
      setError("Failed to delete polygon");
      setTimeout(() => setError(null), 3000);
    }
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

  const filteredPolygons = polygons.filter(
    (polygon) =>
      polygon?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      polygon?.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
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
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={_onCreate}
            onDeleted={_onDeleted}
            onEdited={_onEdited}
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
