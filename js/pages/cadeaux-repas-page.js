import {
    chargerCadeauxRepas,
    ajouterCadeauRepas,
    supprimerCadeauRepas
}
from "../services/cadeaux-repas.js";

import {
    chargerPersonnes,
    ajouterPersonne
}
from "../services/personnes.js";

import {masquerZones} from "../utils.js";

let elementsOuverts =
    new Set();
let personnes = [];

window.afficherCadeauxRepas =
async function() {

    masquerZones(
        "zoneConnexion",
        "zoneBudget",
        "budgetActions"
    );

    document
        .getElementById("sidebar")
        .classList
        .remove("open");

    const donnees =
        await chargerCadeauxRepas();

    personnes =
        await chargerPersonnes();
    
    dessinerCadeauxRepas(
        donnees
    );

};

function dessinerCadeauxRepas(donnees) {

    const cadeaux =
        donnees.filter(
            x => x.type === "cadeau"
        );

    const repas =
        donnees.filter(
            x => x.type === "repas"
        );

    document.getElementById(
        "contenu"
    ).innerHTML = `

        <h2>🎁 Cadeaux et repas</h2>

        <div class="actionsListes">

            <button
                class="btnNouvelleListe"
                onclick="
                    ouvrirPopupCadeauRepas(
                        'cadeau'
                    )
                "
            >
                ➕ Nouveau cadeau
            </button>

        </div>

        ${dessinerSection(
            "🎁 Cadeaux",
            cadeaux,
            "cadeau"
        )}

        <br>

        <div class="actionsListes">

            <button
                class="btnNouvelleListe"
                onclick="
                    ouvrirPopupCadeauRepas(
                        'repas'
                    )
                "
            >
                ➕ Nouveau repas
            </button>

        </div>

        ${dessinerSection(
            "🍽️ Repas",
            repas,
            "repas"
        )}

    `;

}

function dessinerSection(
    titre,
    elements
) {

    const groupes = {};

    elements.forEach(element => {

        if (
            !groupes[element.personne]
        ) {

            groupes[element.personne] = [];

        }

        groupes[element.personne].push(
            element
        );

    });

    return `

        <h3>${titre}</h3>

        ${Object.keys(groupes)
            .sort()
            .map(personne => `

                <div
                    class="enteteRecette"
                    onclick="
                        toggleCadeauxRepas(
                            '${personne}'
                        )
                    "
                >
                    ${personne}
                </div>

                <div
                    id="pers-${personne}"
                    style="
                        display:${
                            elementsOuverts.has(
                                personne
                            )
                            ? "block"
                            : "none"
                        };
                    "
                >

                    ${groupes[personne]
                        .map(item => `

                            <div
                                class="carteDocument"
                            >

                                <div>

                                    <strong>
                                        ${item.evenement}
                                    </strong>

                                    <br>

                                    <small>
                                        ${item.date}
                                    </small>

                                    <br>

                                    ${item.description}

                                </div>

                                <button
                                    class="btn-action"
                                    onclick="
                                        supprimerElementCadeauRepas(
                                            '${item.id}'
                                        )
                                    "
                                >
                                    🗑️
                                </button>

                            </div>

                        `)
                        .join("")}

                </div>

            `)
            .join("")}

    `;
}

window.toggleCadeauxRepas =
function(personne) {

    if (
        elementsOuverts.has(
            personne
        )
    ) {

        elementsOuverts.delete(
            personne
        );

    } else {

        elementsOuverts.add(
            personne
        );

    }

    afficherCadeauxRepas();

};

window.ouvrirPopupCadeauRepas =
function(type) {

    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            id="popupCadeauRepas"
            class="popupFond"
        >

            <div
                class="popupContenu"
            >

                <h3>

                    ${
                        type === "cadeau"
                        ? "🎁 Nouveau cadeau"
                        : "🍽️ Nouveau repas"
                    }

                </h3>

                <div class="entetePersonnes">

                    <label>
                        Personne(s)
                    </label>
                
                    <button
                        class="btnAjouterPersonne"
                        type="button"
                        onclick="ajouterChampPersonne()"
                    >
                        +
                    </button>
                
                </div>
                
                <div id="listePersonnes">
                
                    <div class="lignePersonne">
                
                        <input
                            id="personne-0"
                            placeholder="Personne"
                        >
                
                    </div>
                
                </div>
                
                <label>
                    Date
                </label>
                
                <input
                    id="crDate"
                    type="date"
                >
                
                <label>
                    Evènement
                </label>
                
                <input
                    id="crEvenement"
                    placeholder="Evènement"
                >

                <label>
                    Cadeau / Repas
                </label>
                
                <textarea
                    id="crDescription"
                    class="descriptionCadeauRepas"
                    placeholder="Description"
                ></textarea>

                <div class="actionsCoursePopup">

                    <button
                        class="btnAjouterCoursePopup"
                        onclick="
                            enregistrerCadeauRepas(
                                '${type}'
                            )
                        "
                    >
                        Enregistrer
                    </button>

                    <button
                        class="btnFermerCoursePopup"
                        onclick="
                            document
                                .getElementById(
                                    'popupCadeauRepas'
                                )
                                .remove()
                        "
                    >
                        Fermer
                    </button>

                </div>

            </div>

        </div>

        `
    );

};

window.enregistrerCadeauRepas =
async function(type) {

    const personnes =
        [
            ...new Set(
                [
                    ...document.querySelectorAll(
                        "#listePersonnes input"
                    )
                ]
                .map(x => x.value.trim())
                .filter(x => x !== "")
            )
        ];


    if (
        personnes.length === 0
    ) {
    
        alert(
            "Veuillez saisir au moins une personne."
        );
    
        return;
    
    }
    
    for (
        const personne
        of personnes
    ) {
    
        await ajouterCadeauRepas({
    
            type,
    
            personne,
    
            date:
                document.getElementById(
                    "crDate"
                ).value,
    
            evenement:
                document.getElementById(
                    "crEvenement"
                ).value,
    
            description:
                document.getElementById(
                    "crDescription"
                ).value
    
        });
    
    }

    document
        .getElementById(
            "popupCadeauRepas"
        )
        .remove();

    afficherCadeauxRepas();

};

window.supprimerElementCadeauRepas =
async function(id) {

    if (
        !confirm(
            "Supprimer cet élément ?"
        )
    ) {
        return;
    }

    await supprimerCadeauRepas(
        id
    );

    afficherCadeauxRepas();

};

window.ajouterChampPersonne =
function() {

    const nb =
        document.querySelectorAll(
            ".lignePersonne"
        ).length;

    document
        .getElementById(
            "listePersonnes"
        )
        .insertAdjacentHTML(
            "beforeend",
            `

            <div
                class="lignePersonne"
                style="
                    margin-top:8px;
                "
            >

                <input
                    id="personne-${nb}"
                    placeholder="Personne"
                >

            </div>

            `
        );

};

window.afficherSuggestionsPersonnes =
function(
    champ,
    index
) {

    const texte =
        champ.value
        .trim()
        .toLowerCase();

    const conteneur =
        document.getElementById(
            `suggestionsPersonnes-${index}`
        );

    if (!conteneur) {
        return;
    }

    if (texte === "") {

        conteneur.innerHTML = "";

        return;

    }

    const suggestions =
        personnes
        .filter(
            p =>
                p.nom
                .toLowerCase()
                .startsWith(
                    texte
                )
        )
        .slice(0, 5);

    conteneur.innerHTML =
        suggestions
        .map(p => `

            <div
                class="suggestionProduit"
                onclick="
                    choisirPersonne(
                        ${index},
                        '${p.nom.replace(/'/g, "\\'")}'
                    )
                "
            >

                ${p.nom}

            </div>

        `)
        .join("");

};

window.choisirPersonne =
function(
    index,
    nom
) {

    document.getElementById(
        `personne-${index}`
    ).value = nom;

    document.getElementById(
        `suggestionsPersonnes-${index}`
    ).innerHTML = "";

};
