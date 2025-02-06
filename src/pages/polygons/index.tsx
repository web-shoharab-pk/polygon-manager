import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { deletePolygon, updatePolygon } from "../../store/slices/polygonSlice";
import { RootState } from "../../store/store";
import styles from "./../../styles/pages/Polygons.module.scss";

type EditFormInputs = {
  name: string;
  fillColor: string;
  borderColor: string;
};

const PolygonsPage = () => {
  const polygons = useSelector((state: RootState) => state.polygon.polygons);
  const dispatch = useDispatch();
  const [selectedPolygon, setSelectedPolygon] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EditFormInputs>();
  console.log("values", watch("fillColor"));
  const onSubmit = (data: EditFormInputs) => {
    if (!selectedPolygon) return;

    const polygon = polygons.find((p) => p.id === selectedPolygon);
    if (polygon) {
      dispatch(
        updatePolygon({
          ...polygon,
          name: data.name,
          fillColor: data.fillColor,
          borderColor: data.borderColor,
        })
      );
      setSelectedPolygon(null);
      reset();
    }
  };

  const handleCancel = () => {
    setSelectedPolygon(null);
    reset();
  };

  const filteredPolygons = polygons.filter(
    (polygon) =>
      polygon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      polygon.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Polygon Manager</h1>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="🔍 Search polygons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {polygons.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            No polygons found. Draw a polygon on the map to get started! ✨
          </p>
        </div>
      ) : (
        <div className={styles.polygonGrid}>
          {filteredPolygons.map((polygon) => (
            <div key={polygon.id} className={styles.polygonCard}>
              {selectedPolygon === polygon.id ? (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className={styles.editForm}
                >
                  <div>
                    <input
                      className={`${styles.input} ${
                        errors.name ? styles.inputError : ""
                      }`}
                      placeholder={polygon.name}
                      autoFocus
                      {...register("name", {
                        required: "Name is required",
                        minLength: {
                          value: 3,
                          message: "Name must be at least 3 characters",
                        },
                      })}
                    />
                    {errors.name && (
                      <span className={styles.errorMessage}>
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  <div className={styles.colorSection}>
                    <div className={styles.colorField}>
                      <label htmlFor="fillColor">🎨 Fill Color</label>
                      <div className={styles.colorInputGroup}>
                        <input
                          type="color"
                          id="fillColor"
                          defaultValue={polygon.fillColor}
                          {...register("fillColor", {
                            pattern: {
                              value: /^#[0-9A-F]{6}$/i,
                              message: "Invalid color format",
                            },
                          })}
                          className={styles.colorPicker}
                          onChange={(e) =>
                            setValue("fillColor", e.target.value)
                          }
                        />
                        <input
                          type="text"
                          placeholder="#RRGGBB"
                          className={`${styles.hexInput} ${
                            errors.fillColor ? styles.inputError : ""
                          }`}
                          {...register("fillColor", {
                            pattern: {
                              value: /^#[0-9A-F]{6}$/i,
                              message: "Invalid color format",
                            },
                          })}
                          onChange={(e) =>
                            setValue("fillColor", e.target.value)
                          }
                        />
                      </div>

                      {errors?.fillColor && (
                        <span className={styles.errorMessage}>
                          {errors.fillColor.message}
                        </span>
                      )}
                    </div>

                    <div className={styles.colorField}>
                      <label htmlFor="borderColor">✏️ Border Color</label>
                      <div className={styles.colorInputGroup}>
                        <input
                          type="color"
                          id="borderColor"
                          defaultValue={polygon.borderColor}
                          {...register("borderColor", {
                            pattern: {
                              value: /^#[0-9A-F]{6}$/i,
                              message: "Invalid color format",
                            },
                          })}
                          className={styles.colorPicker}
                          onChange={(e) =>
                            setValue("borderColor", e.target.value)
                          }
                        />
                        <input
                          type="text"
                          placeholder="#RRGGBB"
                          className={`${styles.hexInput} ${
                            errors.borderColor ? styles.inputError : ""
                          }`}
                          {...register("borderColor", {
                            pattern: {
                              value: /^#[0-9A-F]{6}$/i,
                              message: "Invalid color format",
                            },
                          })}
                          onChange={(e) =>
                            setValue("borderColor", e.target.value)
                          }
                        />
                      </div>

                      {errors.borderColor && (
                        <span className={styles.errorMessage}>
                          {errors.borderColor.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.buttonGroup}>
                    <button
                      type="submit"
                      className={`${styles.button} ${styles.saveButton}`}
                    >
                      ✅ Save Changes
                    </button>
                    <button
                      type="button"
                      className={`${styles.button} ${styles.cancelButton}`}
                      onClick={handleCancel}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.polygonContent}>
                  <div className={styles.polygonHeader}>
                    <h3 className={styles.polygonName}>{polygon.name}</h3>
                    <div className={styles.colorPreviewGroup}>
                      <div
                        className={styles.colorPreview}
                        style={{
                          backgroundColor: polygon.fillColor,
                          border: `2px solid ${polygon.borderColor}`,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                        title={`Fill: ${polygon.fillColor}\nBorder: ${polygon.borderColor}`}
                      />
                    </div>
                  </div>
                  <div className={styles.polygonInfo}>
                    <span>📐 Area: {polygon.area.toFixed(2)} km²</span>
                    <span>🔑 ID: {polygon.id}</span>
                  </div>
                  <div className={styles.buttonGroup}>
                    <button
                      className={`${styles.button} ${styles.editButton}`}
                      onClick={() => {
                        setSelectedPolygon(polygon.id);
                        setValue("name", polygon.name);
                        setValue("fillColor", polygon.fillColor);
                        setValue("borderColor", polygon.borderColor);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className={`${styles.button} ${styles.deleteButton}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this polygon?"
                          )
                        ) {
                          dispatch(deletePolygon(polygon.id));
                        }
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PolygonsPage;
