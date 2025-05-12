import React from "react";

export default function IngredientsList(props) {
  const ingredientsListItems = props.ingredients.map((ingredient) => (
    <div>
      <li className="ingredient-element" key={ingredient}>
        - {ingredient}
      </li>
      <i className="icon-remove-sign"></i>
    </div>
  ));
  return (
    
  );
}
