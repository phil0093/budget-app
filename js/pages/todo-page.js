import {
    chargerTodo,
    ajouterTodo,
    supprimerTodo,
    modifierTodo
}
from "../services/todo.js";

async function nettoyerTodosAnciennes() {

    const maintenant =
        Date.now();

    const deuxJours =
        2 * 24 * 60 * 60 * 1000;

    const todos =
        await chargerTodo();

    for (const todo of todos) {

        if (!todo.dateTerminee) {
            continue;
        }

        const dateTerminee =
            new Date(
                todo.dateTerminee
            ).getTime();

        if (
            maintenant - dateTerminee >
            deuxJours
        ) {

            await supprimerTodo(
                todo.id
            );

        }

    }

}

window.afficherTodo =
async function() {

    await nettoyerTodosAnciennes();
    
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
    
    todos.sort((a, b) => {
    
        if (
            a.terminee === b.terminee
        ) {
            return 0;
        }
    
        return a.terminee ? 1 : -1;
    
    });

    const lignes =
        todos.map(t => `

            <div class="ligneTodo">

                <input
                    type="checkbox"
                    ${t.terminee ? "checked" : ""}
                    onchange="
                        toggleTodo(
                            '${t.id}'
                        )
                    "
                >
            
                <span
                    class="${
                        t.terminee
                        ? "todoTermine"
                        : ""
                    }"
                >
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

window.toggleTodo =
async function(id) {

    const todos =
        await chargerTodo();

    const todo =
        todos.find(
            t => t.id === id
        );

    if (!todo) {
        return;
    }

    const terminee =
        !todo.terminee;

    await modifierTodo(
        id,
        {
            terminee,
            dateTerminee:
                terminee
                ? new Date().toISOString()
                : null
        }
    );

    await afficherTodo();

};
