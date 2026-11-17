import {
    chargerMenus,
    sauverMenu,
    supprimerMenusAnciens
}
from "../services/menus.js";

import {
    chargerRecettes
}
from "../services/recette.js";

import {
    chargerCourses,
    sauvegarderCourse
}
from "../services/course.js";

import {
    chargerProduits
}
from "../services/produit.js";

import {
    formatDateLocale,
    masquerZones
}
from "../utils.js";

let recettes = [];
let recettesLieesMenus = {};
let produitsPopup = [];
let listesCoursesPopup = [];
let produitSelectionne = null;

window.afficherMenus = async function() {
    
    document
        .getElementById("sidebar")
        .classList
        .remove("open");

    masquerZones(
        "zoneConnexion",
        "zoneBudget",
        "budgetActions"
    );
        
    await supprimerMenusAnciens();

    const menus =
        await chargerMenus();

    recettes =
        await chargerRecettes();
    
    const jours = [];

    const date =
        new Date();

    for (let i = 0; i < 10; i++) {

        const d =
            new Date(date);

        d.setDate(d.getDate() + i);

        jours.push(d);

    }
    
    const lignes =
        jours.map(d => {

    const dateIso =
        formatDateLocale(d);
    
    const menu =
        menus[dateIso] || {};

    const aRecettesMidi =
        (menu.recettesMidi || [])
            .length > 0;
    
    const aRecettesSoir =
        (menu.recettesSoir || [])
            .length > 0;
            
    recettesLieesMenus[
        `${dateIso}-midi`
    ] =
        menu.recettesMidi || [];
    
    recettesLieesMenus[
        `${dateIso}-soir`
    ] =
        menu.recettesSoir || [];
    
    const jour =
        d.toLocaleDateString(
            "fr-FR",
            {
                weekday: "short"
            }
        );
            
    return `
    
        <tr>
        
            <td
                class="jourMenu"
                onclick="
                    ouvrirPopupAjoutCourse()
                "
            >
                ${jour}
            </td>
        
            <td class="caseMenu">

                ${
                    aRecettesMidi
                    ? `
                        <button
                            class="btnRecetteMenu"
                            onclick="
                                afficherRecettesMenu(
                                    '${dateIso}',
                                    'midi'
                                )
                            "
                        >
                            📖
                        </button>
                    `
                    : ""
                }
            
                <textarea
                    id="midi-${dateIso}"
                    oninput="
                        rechercherRecettes(
                            this,
                            '${dateIso}',
                            'midi'
                        )
                    "
                    onblur="sauvegarderMenuLigne('${dateIso}')"
                >${menu.midi || ""}</textarea>
                <div
                    id="suggestions-midi-${dateIso}"
                    class="suggestionsRecettes"
                ></div>

            </td>
            
            <td class="caseMenu">

                ${
                    aRecettesSoir
                    ? `
                        <button
                            class="btnRecetteMenu"
                            onclick="
                                afficherRecettesMenu(
                                    '${dateIso}',
                                    'soir'
                                )
                            "
                        >
                            📖
                        </button>
                    `
                    : ""
                }
            
                <textarea
                    id="soir-${dateIso}"
                    oninput="
                        rechercherRecettes(
                            this,
                            '${dateIso}',
                            'soir'
                        )
                    "
                    onblur="sauvegarderMenuLigne('${dateIso}')"
                >${menu.soir || ""}</textarea>

                <div
                    id="suggestions-soir-${dateIso}"
                    class="suggestionsRecettes"
                ></div>

            </td>
        
        </tr>
    
    `;
    
            }).join("");
    
        document.getElementById("contenu").innerHTML = `
    
            <h2>Menus</h2>
            
            <table class="tableMenus">
            
                <thead>
                
                    <tr>
                    
                        <th>Jour</th>
                        <th>Midi</th>
                        <th>Soir</th>
                    
                    </tr>
                
                </thead>
                
                <tbody>
                
                    ${lignes}
                
                </tbody>
            
            </table>
        
        `;
    
};

window.afficherRecettesMenu =
function(date, repas) {

    const recettesLiees =
        recettesLieesMenus[
            `${date}-${repas}`
        ] || [];

    if (
        recettesLiees.length === 0
    ) {

        alert(
            "Aucune recette liée."
        );

        return;

    }

    const contenu =
        recettesLiees
        .map(recetteLiee => {

            const recette =
                recettes.find(
                    r =>
                        r.id ===
                        recetteLiee.id
                );

            if (!recette) {
                return "";
            }

            const ingredients =
                (recette.ingredients || [])
                .map(ing => `

                    <tr>

                        <td>
                            ${ing.quantite || ""}
                        </td>

                        <td>
                            ${ing.ingredient || ""}
                        </td>

                    </tr>

                `)
                .join("");

            return `

                <div class="blocRecetteMenu">

                    <h2>
                        ${recette.nom}
                    </h2>

                    <p>
                        <b>Type :</b>
                        ${recette.type || ""}
                    </p>

                    <div class="infosRecettePopup">

                        <span>
                            👥 ${recette.portions || ""}
                        </span>
                    
                        <span>
                            ⏱️ ${recette.tempsPreparation || 0} min
                        </span>
                    
                        <span>
                            🔥 ${recette.tempsCuisson || 0} min
                        </span>
                    
                    </div>

                    <h3>
                        🛒 Ingrédients
                    </h3>

                    <table
                        class="tableIngredients"
                    >

                        ${ingredients}

                    </table>

                    <h3>
                        👨‍🍳 Étapes
                    </h3>

                    <div
                        class="lectureRecette"
                    >

                        ${(recette.etapes || "")
                            .replaceAll(
                                "\n",
                                "<br>"
                            )}

                    </div>

                </div>

            `;

        })
        .join("<hr>");

    document.body.insertAdjacentHTML(
        "beforeend",

        `

        <div
            id="popupRecette"
            class="modalCalendrier"
        >

            <div
                class="modalCalendrierContenu"
            >

                ${contenu}

                <br>

                <button
                    onclick="
                        document
                            .getElementById(
                                'popupRecette'
                            )
                            .remove()
                    "
                >

                    Fermer

                </button>

            </div>

        </div>

        `
    );

};

window.rechercherRecettes =
function(zone, date, repas) {

    const lignes =
        zone.value
            .split("\n");

    const texte =
        lignes[
            lignes.length - 1
        ]
        .trim()
        .toLowerCase();

    const suggestions =
        recettes.filter(r =>
    
            r.nom &&
            texte.length >= 2 &&
    
            r.nom
                .toLowerCase()
                .includes(texte)
    
        );

    const div =
        document.getElementById(
            `suggestions-${repas}-${date}`
        );

    if (
        !texte ||
        suggestions.length === 0
    ) {

        div.innerHTML = "";

        return;

    }

    div.innerHTML =
        suggestions
            .slice(0, 5)
            .map(r => `

                <div
                    class="suggestionRecette"
                    onclick="
                        choisirRecette(
                            '${date}',
                            '${repas}',
                            '${r.nom}',
                            '${r.id}'
                        )
                    "
                >

                    🍝 ${r.nom}

                </div>

            `)
            .join("");

};

window.choisirRecette =
async function(date, repas, nom, recetteId) {

    const zone =
        document.getElementById(
            `${repas}-${date}`
        );

    const lignes =
        zone.value.split("\n");

    lignes.pop();

    lignes.push(nom);

    zone.value =
        lignes.join("\n");

    const cle =
        `${date}-${repas}`;

    if (
        !recettesLieesMenus[cle]
    ) {

        recettesLieesMenus[cle] = [];

    }

    const dejaPresent =
        recettesLieesMenus[cle]
        .some(
            r => r.id === recetteId
        );

    if (!dejaPresent) {

        recettesLieesMenus[cle]
        .push({
            id: recetteId,
            nom
        });

    }

    document.getElementById(
        `suggestions-${repas}-${date}`
    ).innerHTML = "";

    await sauvegarderMenuLigne(date);

    const menus =
        await chargerMenus();
    
    recettes =
        await chargerRecettes();
    
    afficherMenus();

};


window.sauvegarderMenuLigne =
async function(date) {

    const midi =
        document.getElementById(
            `midi-${date}`
        ).value;

    const soir =
        document.getElementById(
            `soir-${date}`
        ).value;

    const lignesMidi =
        midi
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean);
    
    const lignesSoir =
        soir
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean);
    
    recettesLieesMenus[
        `${date}-midi`
    ] =
        (
            recettesLieesMenus[
                `${date}-midi`
            ] || []
        )
        .filter(recette =>
            lignesMidi.includes(
                recette.nom
            )
        );
    
    recettesLieesMenus[
        `${date}-soir`
    ] =
        (
            recettesLieesMenus[
                `${date}-soir`
            ] || []
        )
        .filter(recette =>
            lignesSoir.includes(
                recette.nom
            )
        );
    
    await sauverMenu(
        date,
        {

            midi,

            soir,

            recettesMidi:
                recettesLieesMenus[
                    `${date}-midi`
                ] || [],

            recettesSoir:
                recettesLieesMenus[
                    `${date}-soir`
                ] || []

        }
    );

    afficherMenus();

};

window.ouvrirPopupAjoutCourse =
async function(jour) {

    const popupExistant =
        document.getElementById(
            "popupAjoutCourse"
        );
    
    if (popupExistant) {
    
        popupExistant.remove();
    
    }
    
    produitsPopup =
        await chargerProduits();

    listesCoursesPopup =
        await chargerCourses();

    produitSelectionne =
        null;

    const options =
        listesCoursesPopup
        .map(course => `
            <option
                value="${course.nom}"
            >
                ${course.nom}
            </option>
        `)
        .join("");

    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            id="popupAjoutCourse"
            class="popupFond"
        >

            <div
                class="popupContenu"
            >

                <h3>
                    Ajouter à une liste
                </h3>

                <select
                    id="listeCoursePopup"
                >
                    ${options}
                </select>

                <input
                    id="produitPopup"
                    type="text"
                    placeholder="Produit"
                    oninput="
                        rechercherProduitPopup(
                            this.value
                        )
                    "
                >

                <div
                    id="suggestionsPopup"
                ></div>

                <input
                    id="quantitePopup"
                    type="number"
                    min="1"
                    value="1"
                >

                <button
                    onclick="
                        ajouterProduitListePopup()
                    "
                >
                    Ajouter
                </button>

                <button
                    onclick="
                        document
                            .getElementById(
                                'popupAjoutCourse'
                            )
                            .remove()
                    "
                >
                    Fermer
                </button>

            </div>

        </div>

        `
    );

};

function normaliserTexte(texte) {

    return texte
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}

window.rechercherProduitPopup =
function(texte) {

    const recherche =
        normaliserTexte(
            texte
        );

    const suggestions =
        produitsPopup
        .filter(produit =>

            normaliserTexte(
                produit.nom
            )
            .includes(
                recherche
            )

        )
        .slice(0, 10);

    document
        .getElementById(
            "suggestionsPopup"
        )
        .innerHTML = suggestions
        .map(produit => `

            <div
                class="suggestionProduit"
                onclick="
                    choisirProduitPopup(
                        '${produit.nom.replace(/'/g, "\\'")}',
                        '${produit.rayon}'
                    )
                "
            >

                ${produit.nom}
                -
                ${produit.rayon}

            </div>

        `)
        .join("");

};

window.choisirProduitPopup =
function(
    nom,
    rayon
) {

    produitSelectionne = {

        nom,

        rayon

    };

    document.getElementById(
        "produitPopup"
    ).value = nom;

    document.getElementById(
        "suggestionsPopup"
    ).innerHTML = "";

};

window.ajouterProduitListePopup =
async function() {

    if (
        !produitSelectionne
    ) {

        alert(
            "Choisissez un produit existant."
        );

        return;

    }

    const nomListe =
        document.getElementById(
            "listeCoursePopup"
        ).value;

    const quantite =
        parseInt(
            document.getElementById(
                "quantitePopup"
            ).value
        );

    const course =
        listesCoursesPopup.find(
            c => c.nom === nomListe
        );

    if (!course) {
        return;
    }

    course.rayons[
        produitSelectionne.rayon
    ].push({

        produit:
            produitSelectionne.nom,

        quantite,

        coche: false

    });

    await sauvegarderCourse(
        nomListe,
        course.rayons
    );

    document
        .getElementById(
            "popupAjoutCourse"
        )
        .remove();

};
