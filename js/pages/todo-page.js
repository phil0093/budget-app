import {
    chargerTodo,
    ajouterTodo,
    supprimerTodo
}
from "../services/todo.js";

window.afficherTodo =
async function() {

    document
        .getElementById("sidebar")
        .classList
        .remove("open");

    document.getElementById(
        "zoneBudget"
    ).style.display = "none";

    document.getElementById(
        "budgetActions"
    ).style.display = "none";

    const todos =
        await chargerTodo();

    const lignes =
        todos.map(t => `

            <div class="ligneTodo">

                <input
                    type="checkbox"
                    onchange="
                        terminerTodo(
                            '${t.id}'
                        )
                    ">

                <span>
                    ${t.texte}
                </span>

            </div>

        `).join("");

    document.getElementById(
        "contenu"
    ).innerHTML = `

        <h2>
            To Do List
        </h2>

        <input
            id="nouveauTodo"
            placeholder="Nouvelle tâche"
            onkeydown="
                ajouterTodoEntree(
                    event
                )
            ">

        <div class="todoContainer">

            ${lignes}

        </div>

    `;

};

window.ajouterTodoEntree =
async function(event) {

    if (event.key !== "Enter") {
        return;
    }

    const zone =
        document.getElementById(
            "nouveauTodo"
        );

    const texte =
        zone.value.trim();

    if (!texte) {
        return;
    }

    await ajouterTodo(
        texte
    );

    await afficherTodo();

};

window.terminerTodo =
async function(id) {

    await supprimerTodo(
        id
    );

    await afficherTodo();

};
