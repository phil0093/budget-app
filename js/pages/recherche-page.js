import {
    chargerDocuments
}
from "../services/document.js";

import {
    chargerRecettes
}
from "../services/recette.js";

import {
    chargerNotes
}
from "../services/note.js";

import {
    chargerRdvsMois
}
from "../services/calendrier.js";

import {
    chargerDernieresDepenses
}
from "../services/depenses.js";

import {
    chargerTodo
}
from "../services/todo.js";

let timerRecherche;

function normaliserTexte(texte) {

    return (texte || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}

window.ouvrirRechercheGlobale =
async function() {

    const popupExistant =
        document.getElementById(
            "popupRecherche"
        );

    if (popupExistant) {

        popupExistant.remove();

    }

    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            id="popupRecherche"
            class="popupFond"
        >

            <div
                class="popupContenu"
            >

                <h3>
                    Recherche globale
                </h3>

                <input
                    id="champRecherche"
                    type="text"
                    placeholder="Rechercher..."
                    oninput="
                        verifierRecherche()
                    "
                    onblur=""
                    autofocus
                >

                <div
                    id="spinnerRecherche"
                    class="spinnerRecherche"
                    style="display:none;"
                ></div>

                <div
                    id="resultatsRecherche"
                    style="
                        margin-top:15px;
                        max-height:60vh;
                        overflow-y:auto;
                    "
                ></div>

                <div
                    class="actionsCoursePopup"
                >

                    <button
                        class="
                            btnFermerCoursePopup
                        "
                        onclick="
                            document
                                .getElementById(
                                    'popupRecherche'
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

window.effectuerRecherche =
async function(
    forcerRecherche = false
) {

    const zone =
        document.getElementById(
            "resultatsRecherche"
        );

    const spinner =
        document.getElementById(
            "spinnerRecherche"
        );

    const texte =
        normaliserTexte(
            document
            .getElementById(
                "champRecherche"
            )
            .value
            .trim()
        );

    if (
        !forcerRecherche &&
        texte.length < 4
    ) {

        zone.innerHTML = "";

        spinner.style.display =
            "none";

        return;

    }

    if (
        texte === ""
    ) {

        zone.innerHTML = "";

        spinner.style.display =
            "none";

        return;

    }

    spinner.style.display =
        "block";

    let html = "";

        const documents =
        await chargerDocuments();

    documents
    .filter(doc =>
    
        normaliserTexte(
            doc.titre || ""
        ).includes(
            normaliserTexte(
                texte
            )
        )
    
    )
    .sort(
        (a, b) =>
            (b.date || "")
                .localeCompare(
                    a.date || ""
                )
    )
    .forEach(doc => {
    
        html += `
    
        <div
            class="resultatRecherche"
            onclick="
                window.open(
                    '${doc.url}',
                    '_blank'
                )
            "
        >
    
            <strong>
    
                📄 ${doc.titre}
    
            </strong>
    
            <br>
    
            <small>
    
                📅 ${doc.date || ""}
    
                •
    
                📎 ${doc.nomFichier || ""}
    
                •
    
                ${
                    doc.type
                        ? doc.type
                            .replace(
                                "application/",
                                ""
                            )
                            .replace(
                                "image/",
                                ""
                            )
                            .toUpperCase()
                        : ""
                }
    
            </small>
    
        </div>
    
        `;
    
    });

    const rdvsMois =
        await chargerRdvsMois();

    const rdvs =
        Object.values(
            rdvsMois
        ).flat();

    rdvs
    .filter(rdv =>
        normaliserTexte(
            rdv.nom
        ).includes(
            normaliserTexte(
                texte
            )
        )
    )
    .forEach(rdv => {

        html += `
        
        <div
            class="resultatRecherche"
            onclick="
                document
                    .getElementById(
                        'popupRecherche'
                    )
                    .remove();
            
                ouvrirRdvLectureSeule(
                    '${rdv.id}'
                );
            "
        >

            📅 ${rdv.nom}

        </div>

        `;

    });

    const recettes =
        await chargerRecettes();
    
    recettes
    .filter(recette =>
    
        normaliserTexte(
            recette.nom || ""
        ).includes(texte)
    
        ||
    
        normaliserTexte(
            recette.etapes || ""
        ).includes(texte)
    
        ||
    
        recette.ingredients?.some(
            ingredient =>
    
                normaliserTexte(
                    ingredient.ingredient || ""
                ).includes(texte)
    
        )
    
    )
    .forEach(recette => {
    
        html += `
    
        <div
            class="resultatRecherche"
            onclick="
                document
                    .getElementById(
                        'popupRecherche'
                    )
                    .remove();
        
                afficherRecetteRecherche(
                    '${recette.id}'
                );
            "
        >
        
            🍝 ${recette.nom}
        
        </div>
    
        `;
    
    });

    const todos =
        await chargerTodo();
    
    todos
    .filter(todo =>
    
        normaliserTexte(
            todo.texte || ""
        ).includes(texte)
    
    )
    .forEach(todo => {
    
        html += `
    
        <div
            class="resultatRecherche"
        >
    
            ✅ ${todo.texte}
    
        </div>
    
        `;
    
    });
    
    const notes =
        await chargerNotes();
    
    notes
    .filter(note =>
    
        normaliserTexte(
            note.titre || ""
        ).includes(
            normaliserTexte(texte)
        )
    
        ||
    
        normaliserTexte(
            note.contenu || ""
        ).includes(
            normaliserTexte(texte)
        )
    
    )
    .forEach(note => {
    
        html += `
    
        <div
            class="resultatRecherche"
            onclick="
                document
                    .getElementById(
                        'popupRecherche'
                    )
                    .remove();
            
                afficherNoteRecherche(
                    '${note.id}'
                );
            "
        >
    
            📝 ${note.titre || "Note"}
    
        </div>
    
        `;
    
    });

    const resultatDepenses =
        await chargerDernieresDepenses(
            500
        );
    
    const depenses =
        resultatDepenses.depenses;
    
    depenses
    .sort(
        (a, b) =>
            (b.date || "")
                .localeCompare(
                    a.date || ""
                )
    )
    .filter(depense =>
    
        normaliserTexte(
            depense.libelle || ""
        ).includes(
            normaliserTexte(texte)
        )
    
    )
    .forEach(depense => {
    
        html += `
    
        <div
            class="resultatRecherche"
        >
    
            <strong>
                💰 ${depense.libelle}
            </strong>
    
            <br>
    
            <small>
    
                📅 ${
                    depense.date
                        ? new Date(
                            depense.date
                        ).toLocaleDateString(
                            "fr-FR"
                        )
                        : ""
                }
    
                •
    
                ${
                    Number(
                        depense.montant || 0
                    ).toFixed(2)
                } €
    
            </small>
    
        </div>
    
        `;
    
    });
    
    if (html === "") {

        html = `
    
            <p>
                Aucun résultat
            </p>
    
        `;
    
    }
    
    zone.innerHTML = html;
    
    spinner.style.display =
        "none";
};

window.verifierRecherche =
function() {

    const texte =
        document
        .getElementById(
            "champRecherche"
        )
        .value
        .trim();

    clearTimeout(
        timerRecherche
    );

    if (
        texte.length < 4
    ) {

        document
            .getElementById(
                "resultatsRecherche"
            )
            .innerHTML = "";

        return;

    }

    timerRecherche =
        setTimeout(
            () => {

                effectuerRecherche();

            },
            500
        );

};
