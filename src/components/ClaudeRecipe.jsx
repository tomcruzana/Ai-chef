import React from "react";
import ReactMarkdown from "react-markdown";

export default function ClaudeRecipe(props) {
  return (
    <section className="suggested-recipe-container" aria-live="polite">
      <div class="recipe">
        <h2>A.i Chef Recommends:</h2>
        <ReactMarkdown>{props.recipe}</ReactMarkdown>
      </div>
    </section>
  );
}
