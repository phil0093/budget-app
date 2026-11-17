import {
    chargerDossiers,
    ajouterDossier
}
from "../services/document-folder.js";

import {
    chargerDocuments,
    ajouterDocument
}
from "../services/document.js";

import { storage } from "../firebase-config.js";
import { masquerZones } from "../utils.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";


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

    const aujourdHui =
        new Date()
        .toISOString()
        .split("T")[0];

    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            id="popupDocument"
            class="popupFond"
        >

            <div
                class="popupContenu"
            >

                <h3>
                    Ajouter un document
                </h3>

                <input
                    id="titreDocument"
                    type="text"
                    placeholder="Titre"
                >

                <input
                    id="dateDocument"
                    type="date"
                    value="${aujourdHui}"
                >

                <input
                    id="fichierDocument"
                    type="file"
                    accept="
                        .pdf,
                        .jpg,
                        .jpeg,
                        .png,
                        .heic
                    "
                >

                <button
                    onclick="
                        enregistrerDocument()
                    "
                >
                    Enregistrer
                </button>

                <button
                    onclick="
                        document
                        .getElementById(
                            'popupDocument'
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

window.enregistrerDocument =
async function() {

    const titre =
        document
            .getElementById(
                "titreDocument"
            )
            .value
            .trim();

    const date =
        document
            .getElementById(
                "dateDocument"
            )
            .value;

    const fichier =
        document
            .getElementById(
                "fichierDocument"
            )
            .files[0];

    if (
        !titre ||
        !fichier
    ) {

        alert(
            "Titre et fichier obligatoires."
        );

        return;

    }

    const cheminStorage =
        `documents/${dossierActif}/${Date.now()}-${fichier.name}`;

    const storageRef =
        ref(
            storage,
            cheminStorage
        );

    await uploadBytes(
        storageRef,
        fichier
    );

    const url =
        await getDownloadURL(
            storageRef
        );

    await ajouterDocument({
    
        titre,
    
        date,
    
        dossierId:
            dossierActif,
    
        type:
            fichier.type,
    
        nomFichier:
            fichier.name,
    
        url
    
    });

    document
        .getElementById(
            "popupDocument"
        )
        .remove();

    afficherDocuments();

};
