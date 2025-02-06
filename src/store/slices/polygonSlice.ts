import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Polygon = {
  id: number;
  coordinates: [number, number][];
  fillColor: string;
  borderColor: string;
  name: string;
  area: number;
  center?: [number, number];
};

type PolygonState = {
  polygons: Polygon[];
};

const initialState: PolygonState = {
  polygons: [],
};

export const polygonSlice = createSlice({
  name: "polygon",
  initialState,
  reducers: {
    setPolygons: (state, action: PayloadAction<Polygon[]>) => {
      state.polygons = action.payload;
    },
    addPolygon: (state, action: PayloadAction<Polygon>) => {
      state.polygons.push(action.payload);
    },
    updatePolygon: (state, action: PayloadAction<Polygon>) => {
      const index = state.polygons.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.polygons[index] = action.payload;
    },
    deletePolygon: (state, action: PayloadAction<number>) => {
      state.polygons = state.polygons.filter((p) => p.id !== action.payload);
    },

  },
});

export const { addPolygon, updatePolygon, deletePolygon, setPolygons } =
  polygonSlice.actions;
export default polygonSlice.reducer;
