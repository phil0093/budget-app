import {
    chargerRecettes,
    ajouterRecette,
    modifierRecette,
    supprimerRecette
}
from "../services/recette.js";

import {
    masquerZones
}
from "../utils.js";

let recettes = [];

window.afficherRecettes =
async function() {

    document
        .getElementById("sidebar")
        .classList
        .remove("open");

    masquerZones(
        "zoneConnexion",
        "zoneBudget",
        "budgetActions"
    );

    recettes =
        await chargerRecettes();

    dessinerRecettes();

};

function dessinerRecettes() {

    const html =
        recettes.map(recette => {

            const ingredients =
                (recette.ingredients?.length
                    ? recette.ingredients
                    : [{
                        quantite: "",
                        ingredient: ""
                    }]
                )
                .map((ing, index) => `

                    <div
                        class="ligneIngredient"
                        data-recette="${recette.id}"
                    >

                        <input
                            class="ingredientQuantite"
                            placeholder="Qté"
                            value="${ing.quantite || ""}"
                            onblur="
                                sauverRecette(
                                    '${recette.id}'
                                )
                            "
                        >

                        <input
                            class="ingredientNom"
                            placeholder="Ingrédient"
                            value="${ing.ingredient || ""}"
                            onblur="
                                sauverRecette(
                                    '${recette.id}'
                                )
                            "
                        >

                    </div>

                `).join("");

            return `

                <div class="carteRecette">

                    <input
                        class="titreRecette"
                        id="nom-${recette.id}"
                        value="${recette.nom || ""}"
                        placeholder="Nom de la recette"
                        onblur="
                            sauverRecette(
                                '${recette.id}'
                            )
                        "
                    >

                    <div class="infosRecette">

                        <div class="infoRecette">

                            👥

                            <input
                                type="number"
                                min="1"
                                id="portions-${recette.id}"
                                value="${recette.portions || ""}"
                                placeholder="Portions"
                                onblur="
                                    sauverRecette(
                                        '${recette.id}'
                                    )
                                "
                            >

                        </div>

                        <div class="infoRecette">

                            ⏱️

                            <input
                                type="number"
                                min="0"
                                id="prep-${recette.id}"
                                value="${recette.tempsPreparation || ""}"
                                placeholder="Préparation"
                                onblur="
                                    sauverRecette(
                                        '${recette.id}'
                                    )
                                "
                            >

                        </div>

                        <div class="infoRecette">

                            🔥

                            <input
                                type="number"
                                min="0"
                                id="cuisson-${recette.id}"
                                value="${recette.tempsCuisson || ""}"
                                placeholder="Cuisson"
                                onblur="
                                    sauverRecette(
                                        '${recette.id}'
                                    )
                                "
                            >

                        </div>

                    </div>

                    <h3>
                        🛒 Ingrédients
                    </h3>

                    ${ingredients}

                    <button
                        onclick="
                            ajouterIngredient(
                                '${recette.id}'
                            )
                        "
                    >
                        ➕ Ingrédient
                    </button>

                    <h3>
                        👨‍🍳 Étapes
                    </h3>

                    <textarea
                        class="zoneRecette"
                        id="etapes-${recette.id}"
                        onblur="
                            sauverRecette(
                                '${recette.id}'
                            )
                        "
                    >${recette.etapes || ""}</textarea>

                    <button
                        onclick="
                            supprimerRecetteInterface(
                                '${recette.id}'
                            )
                        "
                    >
                        🗑️ Supprimer
                    </button>

                </div>

            `;

        }).join("");

    document.getElementById(
        "contenu"
    ).innerHTML = `

        <h2>
            🍝 Recettes
        </h2>

        <button
            onclick="creerRecette()"
        >
            ➕ Nouvelle recette
        </button>

        ${html}

    `;

}

window.creerRecette =
async function() {

    await ajouterRecette();

    recettes =
        await chargerRecettes();

    dessinerRecettes();

};

window.ajouterIngredient =
async function(id) {

    const recette =
        recettes.find(
            r => r.id === id
        );

    if (!recette) {
        return;
    }

    recette.ingredients =
        recette.ingredients || [];

    recette.ingredients.push({
        quantite: "",
        ingredient: ""
    });

    await modifierRecette(
        id,
        {
            ingredients:
                recette.ingredients
        }
    );

    recettes =
        await chargerRecettes();

    dessinerRecettes();

};

window.sauverRecette =
async function(id) {

    const ingredients = [];

    document
        .querySelectorAll(
            `[data-recette="${id}"]`
        )
        .forEach(ligne => {

            ingredients.push({

                quantite:
                    ligne
                        .querySelector(
                            ".ingredientQuantite"
                        )
                        .value,

                ingredient:
                    ligne
                        .querySelector(
                            ".ingredientNom"
                        )
                        .value

            });

        });

    await modifierRecette(
        id,
        {

            nom:
                document.getElementById(
                    `nom-${id}`
                ).value,

            portions:
                document.getElementById(
                    `portions-${id}`
                ).value,

            tempsPreparation:
                document.getElementById(
                    `prep-${id}`
                ).value,

            tempsCuisson:
                document.getElementById(
                    `cuisson-${id}`
                ).value,

            ingredients,

            etapes:
                document.getElementById(
                    `etapes-${id}`
                ).value

        }
    );

};

window.supprimerRecetteInterface =
async function(id) {

    if (
        !confirm(
            "Supprimer cette recette ?"
        )
    ) {
        return;
    }

    await supprimerRecette(id);

    recettes =
        await chargerRecettes();

    dessinerRecettes();

};
