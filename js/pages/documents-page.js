import {
    masquerZones
}
from "../utils.js";

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

    document
        .getElementById(
            "contenu"
        )
        .innerHTML = `

            <h2>
                📁 Documents
            </h2>

            <button
                onclick="
                    nouveauDossier()
                "
            >
                ➕ Nouveau dossier
            </button>

            <button
                onclick="
                    nouveauDocument()
                "
            >
                📤 Ajouter un document
            </button>

            <div
                id="listeDocuments"
            ></div>

        `;

};
