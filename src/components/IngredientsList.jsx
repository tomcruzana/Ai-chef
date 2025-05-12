import React from "react";

export default function IngredientsList(props) {
  const ingredientsListItems = props.ingredients.map((ingredient) => (
    <div key={ingredient}>
      <li className="ingredient-element">- {ingredient}</li>
      <i className="icon-remove-sign"></i>
    </div>
  ));

  return (
    <section>
      <h2>Ingredients on hand:</h2>
      <ul className="ingredients-list" aria-live="polite">
        {ingredientsListItems}
      </ul>

      {props.ingredients.length > 3 && (
        <div className="get-recipe-container">
          <div>
            <h3>Ready for a recipe?</h3>
            <p>Generate a recipe from your list of ingredients.</p>
          </div>
          <button onClick={props.getRecipe}>
            <span>
              <i className="icon-robot"></i>
            </span>{" "}
            Generate recipe
          </button>
        </div>
      )}
    </section>
  );
}
