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

    const htmlDossiers =
        dossiers
        .filter(
            d => !d.parent
        )
        .map(dossier => `
            <div
                class="carteDossier"
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

            <button
                class="btnNouvelleListe"
                onclick="
                    nouveauDocument()
                "
            >
                📤 Ajouter un document
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
