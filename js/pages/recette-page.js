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
        recettes.map(recette => `

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

                <h3>
                    🛒 Ingrédients
                </h3>

                <textarea
                    class="zoneRecette"
                    id="ingredients-${recette.id}"
                    onblur="
                        sauverRecette(
                            '${recette.id}'
                        )
                    "
                >${recette.ingredients || ""}</textarea>

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

        `).join("");

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

window.sauverRecette =
async function(id) {

    await modifierRecette(
        id,
        {
            nom:
                document.getElementById(
                    `nom-${id}`
                ).value,

            ingredients:
                document.getElementById(
                    `ingredients-${id}`
                ).value,

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
