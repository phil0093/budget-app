import {
    chargerDossiers,
    ajouterDossier
}
from "../services/document-folder.js";

import {
    masquerZones
}
from "../utils.js";

let dossiers = [];
let dossierActif = null;

window.afficherDocuments =
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

    dossiers =
        await chargerDossiers();

    if (dossierActif) {

        const dossier =
            dossiers.find(
                d => d.id === dossierActif
            );
    
        const sousDossiers =
            dossiers
            .filter(
                d => d.parent === dossierActif
            )
            .map(d => `
                <div
                    class="carteDossier"
                    onclick="
                        ouvrirDossier(
                            '${d.id}'
                        )
                    "
                >
                    📁 ${d.nom}
                </div>
            `)
            .join("");
    
        document
            .getElementById(
                "contenu"
            )
            .innerHTML = `
    
                <h2>
                    📁 ${dossier.nom}
                </h2>
    
                <button
                    class="btnNouvelleListe"
                    onclick="
                        retourDocuments()
                    "
                >
                    ⬅ Retour
                </button>
    
                <button
                    class="btnNouvelleListe"
                    onclick="
                        nouveauSousDossier()
                    "
                >
                    ➕ Sous-dossier
                </button>
    
                <button
                    class="btnNouvelleListe"
                    onclick="
                        nouveauDocument()
                    "
                >
                    📤 Ajouter un document
                </button>
    
                ${sousDossiers}
    
            `;
    
        return;
    
    }
    
    const htmlDossiers =
        dossiers
        .filter(
            d => !d.parent
        )
        .map(dossier => `
            <div
                class="carteDossier"
                onclick="
                    ouvrirDossier(
                        '${dossier.id}'
                    )
                "
            >
                📁 ${dossier.nom}
            </div>
        `)
        .join("");
    
    document
        .getElementById(
            "contenu"
        )
        .innerHTML = `
    
            <h2>
                📁 Documents
            </h2>
    
            <button
                class="btnNouvelleListe"
                onclick="
                    nouveauDossier()
                "
            >
                ➕ Nouveau dossier
            </button>
    
            ${htmlDossiers}
    
        `;
};

window.nouveauDossier =
async function() {

    const nom =
        prompt(
            "Nom du dossier"
        );

    if (!nom) {
        return;
    }

    await ajouterDossier(
        nom
    );

    afficherDocuments();

};

window.nouveauSousDossier =
async function() {

    const nom =
        prompt(
            "Nom du sous-dossier"
        );

    if (!nom) {
        return;
    }

    await ajouterDossier(
        nom,
        dossierActif
    );

    afficherDocuments();

};

window.ouvrirDossier =
async function(dossierId) {

    dossierActif =
        dossierId;

    afficherDocuments();

};

window.retourDocuments =
function() {

    dossierActif = null;

    afficherDocuments();

};

window.nouveauDocument =
function() {

    if (!dossierActif) {

        alert(
            "Sélectionnez un dossier."
        );

        return;

    }

    alert(
        "Ajout de document à venir."
    );

};
