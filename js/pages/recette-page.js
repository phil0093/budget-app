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
let typesFiltres =
    [
        "Entrée",
        "Plat",
        "Dessert",
        "Apéritif",
        "Autre"
    ];
let recettesOuvertes =
    new Set();

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

window.toggleFiltreRecette =
function(type) {

    if (
        typesFiltres.includes(type)
    ) {

        typesFiltres =
            typesFiltres.filter(
                t => t !== type
            );

    }
    else {

        typesFiltres.push(type);

    }

    dessinerRecettes();

};

function dessinerRecettes() {

    const recettesFiltrees =
        recettes
            .filter(
                recette =>
                    !recette.type ||
                    typesFiltres.includes(
                        recette.type
                    )
            )
            .sort((a, b) => {

                if (!a.type && b.type) {
                    return -1;
                }
            
                if (a.type && !b.type) {
                    return 1;
                }
            
                return (
                    a.nom || ""
                ).localeCompare(
                    b.nom || "",
                    "fr"
                );
            
            })
    
    const html =
        recettesFiltrees.map(recette => {

            const ouverte =
                recettesOuvertes.has(
                    recette.id
                );

            const ingredientsTableau =
                Array.isArray(
                    recette.ingredients
                )
                    ? recette.ingredients
                    : [{
                        quantite: "",
                        ingredient: ""
                    }];

            const ingredients =
                ingredientsTableau
                .map((ing, index) => `

                    <div
                        class="ligneIngredient"
                        data-recette="${recette.id}"
                    >

                        <input
                            class="ingredientQuantite"
                            placeholder="Qté"
                            value="${ing.quantite || ""}"
                        >

                        <input
                            class="ingredientNom"
                            placeholder="Ingrédient"
                            value="${ing.ingredient || ""}"
                        >

                    </div>

                `).join("");

            return `

                <div class="carteRecette">

                    <div
                        class="enteteRecette"
                        onclick="
                            toggleRecette(
                                '${recette.id}'
                            )
                        "
                    >

                        ${ouverte ? "▼" : "▶"}

                        ${recette.nom || "Nouvelle recette"}

                    </div>

                    ${ouverte ? `

                        <input
                            class="titreRecette"
                            id="nom-${recette.id}"
                            value="${recette.nom || ""}"
                            placeholder="Nom de la recette"
                        >

                        <select
                            id="type-${recette.id}"
                        >

                            <option
                                value=""
                                ${!recette.type ? "selected" : ""}
                            >
                                Choisir un type...
                            </option>

                            <option
                                value="Entrée"
                                ${recette.type === "Entrée" ? "selected" : ""}
                            >
                                Entrée
                            </option>

                            <option
                                value="Plat"
                                ${recette.type === "Plat" ? "selected" : ""}
                            >
                                Plat
                            </option>

                            <option
                                value="Dessert"
                                ${recette.type === "Dessert" ? "selected" : ""}
                            >
                                Dessert
                            </option>

                            <option
                                value="Apéritif"
                                ${recette.type === "Apéritif" ? "selected" : ""}
                            >
                                Apéritif
                            </option>

                            <option
                                value="Autre"
                                ${recette.type === "Autre" ? "selected" : ""}
                            >
                                Autre
                            </option>

                        </select>

                        <div class="infosRecette">

                            <div class="infoRecette">

                                👥

                                <input
                                    type="number"
                                    min="1"
                                    id="portions-${recette.id}"
                                    value="${recette.portions || ""}"
                                    placeholder="Portions"
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
                        >${recette.etapes || ""}</textarea>

                        <br>

                        <button
                            onclick="
                                sauverRecette(
                                    '${recette.id}'
                                )
                            "
                        >
                            💾 Enregistrer
                        </button>

                        <button
                            onclick="
                                supprimerRecetteInterface(
                                    '${recette.id}'
                                )
                            "
                        >
                            🗑️ Supprimer
                        </button>

                    ` : ""}

                </div>

            `;

        }).join("");

    const filtresHtml =
        [
            "Entrée",
            "Plat",
            "Dessert",
            "Apéritif",
            "Autre"
        ]
    
        .map(type => `
    
            <label
                class="filtreRecette"
            >
    
                <input
                    type="checkbox"
    
                    ${
                        typesFiltres.includes(type)
                            ? "checked"
                            : ""
                    }
    
                    onchange="
                        toggleFiltreRecette(
                            '${type}'
                        )
                    "
                >
    
                ${type}
    
            </label>
    
        `)
        .join("");
    
    document.getElementById(
        "contenu"
    ).innerHTML = `

       <h2>
            🍝 Recettes
        </h2>
        
        <div class="zoneFiltresRecettes">
        
            ${filtresHtml}
        
        </div>
        
        <button
            onclick="creerRecette()"
        >
            ➕ Nouvelle recette
        </button>

        ${html}

    `;

}

window.toggleRecette =
function(id) {

    if (
        recettesOuvertes.has(id)
    ) {

        recettesOuvertes.delete(id);

    }
    else {

        recettesOuvertes.add(id);

    }

    dessinerRecettes();

};

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

    ingredients.push({

        quantite: "",

        ingredient: ""

    });

    await modifierRecette(
        id,
        {
            nom:
                document.getElementById(
                    `nom-${id}`
                ).value,

            type:
                document.getElementById(
                    `type-${id}`
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

    recettes =
        await chargerRecettes();

    dessinerRecettes();

};

window.sauverRecette =
async function(id) {

    const nom =
        document.getElementById(
            `nom-${id}`
        ).value.trim();
    
    const type =
        document.getElementById(
            `type-${id}`
        ).value;

    if (!nom) {

        alert(
            "Le nom de la recette est obligatoire."
        );
    
        return;
    
    }
    
    if (!type) {
    
        alert(
            "Le type de recette est obligatoire."
        );
    
        return;
    
    }

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

            nom,

            type,

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
