import { setPolygons } from "@/store/slices/polygonSlice";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import styles from "./../styles/components/Header.module.scss";

const Header = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPolygons = async () => {
      try {
        const response = await fetch("/example_geojson.json");
        if (!response.ok) {
          throw new Error("Failed to fetch polygons");
        }
        const data = await response.json();
        const polygons = data.features.map((feature: any) => ({
          id: feature.properties.FID,
          coordinates: feature.geometry.coordinates[0].map(
            (coord: [number, number]) => [coord[1], coord[0]]
          ),
          fillColor: "#FF0000",
          borderColor: "#000000",
          name: feature.properties.Name,
          area: feature.properties.LFlaeche,
        }));
        dispatch(setPolygons(polygons));
      } catch (error) {
        console.error("Error fetching polygons:", error);
      }
    };

    fetchPolygons();
  }, [dispatch]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Polygon Manager
        </Link>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink} aria-current="page">
            Map
          </Link>
          <Link href="/polygons" className={styles.navLink}>
            Polygons
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
