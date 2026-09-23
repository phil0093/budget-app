import {
    chargerTodo,
    ajouterTodo,
    supprimerTodo,
    modifierTodo
}
from "../services/todo.js";

import {masquerZones} from "./utils.js";

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

    masquerZones(
        "zoneConnexion",
        "zoneBudget",
        "budgetActions"
    );

    const todos =
        await chargerTodo();

    todos.sort((a, b) => {

        if (
            a.terminee === b.terminee
        ) {
            return 0;
        }

        return a.terminee
            ? 1
            : -1;

    });

    const philippe =
        todos.filter(
            t => t.zone === "philippe"
        );

    const marion =
        todos.filter(
            t => t.zone === "marion"
        );

    const partagee =
        todos.filter(
            t => t.zone === "partagee"
        );

    document.getElementById(
        "contenu"
    ).innerHTML = `

        <h2>
            To Do List
        </h2>

        ${construireBlocTodo(
            "👨 Philippe",
            "philippe",
            philippe
        )}

        ${construireBlocTodo(
            "👩 Marion",
            "marion",
            marion
        )}

        ${construireBlocTodo(
            "👨‍👩‍👦 Partagée",
            "partagee",
            partagee
        )}

    `;

};

function construireBlocTodo(
    titre,
    zone,
    todos
) {

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

    return `

        <h3>${titre}</h3>

        <input
            id="nouveauTodo-${zone}"
            placeholder="Nouvelle tâche"
            onkeydown="
                ajouterTodoEntree(
                    event,
                    '${zone}'
                )
            "
        >

        <div class="todoContainer">

            ${lignes}

        </div>

    `;

}

window.ajouterTodoEntree =
async function(
    event,
    zone
) {

    if (event.key !== "Enter") {
        return;
    }

    const input =
        document.getElementById(
            `nouveauTodo-${zone}`
        );

    const texte =
        input.value.trim();

    if (!texte) {
        return;
    }

    await ajouterTodo(
        texte,
        zone
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
