import {
    chargerCadeauxRepas,
    ajouterCadeauRepas,
    supprimerCadeauRepas,
    modifierCadeauRepas
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

        <div class="enteteSectionCadeauxRepas">

            <h3>
                🎁 Cadeaux
            </h3>
        
            <button
                class="btnAjoutSection"
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
            "",
            cadeaux
        )}

        <br>

        <div class="enteteSectionCadeauxRepas">

            <h3>
                🍽️ Repas
            </h3>
        
            <button
                class="btnAjoutSection"
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
            "",
            repas
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

    Object.values(groupes)
        .forEach(liste => {
    
            liste.sort((a, b) =>
                (b.date || "").localeCompare(
                    a.date || ""
                )
            );
    
        });
    return `

        ${titre ? `<h3>${titre}</h3>` : ""}
    
        ${Object.keys(groupes)
            .sort()
            .map(personne => {
    
                const ouvert =
                    elementsOuverts.has(
                        personne
                    );
    
                return `
    
                    <div class="carteRecette">
    
                        <div
                            class="enteteRecette"
                            onclick="
                                toggleCadeauxRepas(
                                    '${personne}'
                                )
                            "
                        >
    
                            ${ouvert ? "▼" : "▶"}
    
                            ${personne}
    
                        </div>
    
                        ${ouvert ? `
    
                            ${groupes[personne]
                                .map(item => `
    
                                    <div
                                        class="carteDocument"
                                    >
    
                                        <div
                                            class="infosCadeauRepas"
                                        >
    
                                            <div
                                                class="titreCadeauRepas"
                                            >
    
                                                ${item.description}
    
                                            </div>
    
                                            <div
                                                class="detailsCadeauRepas"
                                            >
    
                                                ${item.date}
                                                -
                                                ${item.evenement}
    
                                            </div>
    
                                        </div>
    
                                        <div class="actionsProduitBDD">

                                            <button
                                                class="btn-action"
                                                onclick="
                                                    modifierElementCadeauRepas(
                                                        '${item.id}'
                                                    )
                                                "
                                            >
                                                ✏️
                                            </button>
                                        
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
    
                                    </div>
    
                                `)
                                .join("")}
    
                        ` : ""}
    
                    </div>
    
                `;
    
            })
            .join("")}
    
    `;
}

window.toggleCadeauxRepas =
function(personne) {

    const etaitOuvert =
        elementsOuverts.has(
            personne
        );

    elementsOuverts.clear();

    if (!etaitOuvert) {

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
                            oninput="
                                afficherSuggestionsPersonnes(
                                    this,
                                    0
                                )
                            "
                        >
                        
                        <div
                            id="suggestionsPersonnes-0"
                            class="suggestionsProduits"
                        ></div>
                
                    </div>
                
                </div>
                
                <div class="ligneInfosCadeauRepas">

                    <div>
                
                        <label>Date</label>
                
                        <input
                            id="crDate"
                            type="date"
                        >
                
                    </div>
                
                    <div>
                
                        <label>Evènement</label>
                
                        <input
                            id="crEvenement"
                            placeholder="Evènement"
                        >
                
                    </div>
                
                </div>

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

    const personnesExistantes =
        await chargerPersonnes();
    
    for (
        const personne
        of personnes
    ) {
        const existe =
            personnesExistantes.some(
                p =>
                    p.nom.toLowerCase()
                    ===
                    personne.toLowerCase()
            );
        
        if (!existe) {
        
            await ajouterPersonne(
                personne
            );
        
        }
        
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

window.modifierElementCadeauRepas =
async function(id) {

    const donnees =
        await chargerCadeauxRepas();

    const element =
        donnees.find(
            x => x.id === id
        );

    if (!element) {
        return;
    }

    const nouvelleDescription =
        prompt(
            "Cadeau / Repas",
            element.description
        );

    if (
        nouvelleDescription === null
    ) {
        return;
    }

    const nouvelEvenement =
        prompt(
            "Evènement",
            element.evenement
        );

    if (
        nouvelEvenement === null
    ) {
        return;
    }

    const nouvelleDate =
        prompt(
            "Date",
            element.date
        );

    if (
        nouvelleDate === null
    ) {
        return;
    }

    await modifierCadeauRepas(
        id,
        {
            description:
                nouvelleDescription,
            evenement:
                nouvelEvenement,
            date:
                nouvelleDate
        }
    );

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
                    oninput="
                        afficherSuggestionsPersonnes(
                            this,
                            ${nb}
                        )
                    "
                >
                
                <div
                    id="suggestionsPersonnes-${nb}"
                    class="suggestionsProduits"
                ></div>

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

    if (
        texte.length < 2
    ) {

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
