import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faSliders } from "@fortawesome/free-solid-svg-icons";
import { updatePreference } from "./preferencesSlice";

export default function PreferencesPanel() {
  const dispatch = useDispatch();
  const preferences = useSelector((state) => state.preferences);

  function update(field, value) {
    dispatch(updatePreference({ field, value }));
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Recipe preferences</p>
        <h2><FontAwesomeIcon icon={faSliders} /> Personalize AI suggestions</h2>
        <p>These settings are sent with recipe generation requests.</p>
      </div>

      <div className="card form-grid two-column">
        <label>
          Cuisine
          <select value={preferences.cuisine} onChange={(event) => update("cuisine", event.target.value)}>
            <option value="any">Any</option>
            <option value="filipino">Filipino</option>
            <option value="italian">Italian</option>
            <option value="mexican">Mexican</option>
            <option value="japanese">Japanese</option>
          </select>
        </label>
        <label>
          Diet
          <select value={preferences.diet} onChange={(event) => update("diet", event.target.value)}>
            <option value="none">No restriction</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="high-protein">High protein</option>
            <option value="low-carb">Low carb</option>
          </select>
        </label>
        <label>
          Cooking time
          <input value={preferences.cookingTime} onChange={(event) => update("cookingTime", event.target.value)} />
        </label>
        <label>
          Servings
          <input type="number" min="1" max="12" value={preferences.servings} onChange={(event) => update("servings", Number(event.target.value))} />
        </label>
        <label>
          Allergies
          <input value={preferences.allergies} onChange={(event) => update("allergies", event.target.value)} placeholder="e.g. peanuts, shellfish" />
        </label>
        <label>
          Disliked ingredients
          <input value={preferences.dislikes} onChange={(event) => update("dislikes", event.target.value)} placeholder="e.g. cilantro" />
        </label>
        <label className="toggle-field">
          <span>
            Strict mode
            <small>Use only pantry ingredients. Requires at least 3 items.</small>
          </span>
          <input type="checkbox" checked={preferences.strictMode} onChange={(event) => update("strictMode", event.target.checked)} />
        </label>
      </div>

      <p className="note"><FontAwesomeIcon icon={faLock} /> Strict mode keeps suggestions limited to ingredients already in your pantry.</p>
    </div>
  );
}
