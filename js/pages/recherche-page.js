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
                    onblur="
                        effectuerRecherche(
                            true
                        )
                    "
                    autofocus
                >

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

    const texte =
        document
        .getElementById(
            "champRecherche"
        )
        .value
        .trim();
        .toLowerCase();
    if (
        !forcerRecherche &&
        texte.length < 4
    ) {
    
        return;
    
    }
        
    const zone =
        document.getElementById(
            "resultatsRecherche"
        );

    if (
        texte === ""
    ) {

        zone.innerHTML = "";

        return;

    }

    let html = "";

        const documents =
        await chargerDocuments();

    documents
    .filter(doc =>
        normaliserTexte(
            doc.titre
        ).includes(
            normaliserTexte(
                texte
            )
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

            📄 ${doc.titre}

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
            recette.titre || ""
        ).includes(
            normaliserTexte(texte)
        )
    
        ||
    
        normaliserTexte(
            recette.recette || ""
        ).includes(
            normaliserTexte(texte)
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
    
                ouvrirRecetteLecture(
                    '${recette.id}'
                );
            "
        >
    
            🍝 ${recette.titre}
    
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
    
                afficherNotes();
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
    
            💰 ${depense.libelle}
    
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

    if (
        texte.length >= 4
    ) {

        effectuerRecherche();

    }

};
