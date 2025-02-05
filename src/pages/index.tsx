import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
});

const Home = () => {
  return (
    <>
      <MapComponent />
    </>
  );
};

export default Home;
