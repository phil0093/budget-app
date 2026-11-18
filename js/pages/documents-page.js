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
let documents = [];

function construireCheminDossier(dossierId) {

    const chemin = [];

    let courant =
        dossiers.find(
            d => d.id === dossierId
        );

    while (courant) {

        chemin.unshift(
            courant.nom
        );

        courant =
            dossiers.find(
                d => d.id === courant.parent
            );

    }

    if (chemin.length <= 2) {

        return chemin.join(
            " / "
        );
    
    }
    
    return (
        "... / " +
        chemin.slice(-2).join(
            " / "
        )
    );

}

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
    
    documents =
        await chargerDocuments();
    
    if (dossierActif) {

        const dossier =
            dossiers.find(
                d => d.id === dossierActif
            );

        const documentsDossier =
            documents
            .filter(
                d =>
                    d.dossierId ===
                    dossierActif
            )
            .map(doc => `
                <div
                    class="carteDocument"
                    onclick="
                        window.open(
                            '${doc.url}',
                            '_blank'
                        )
                    "
                >
        
                    📄 ${doc.titre}
        
                    <br>
        
                    <small>
                        ${doc.date}
                    </small>
        
                </div>
            `)
            .join("");
        
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
                    📁 / ${construireCheminDossier(
                        dossierActif
                    )}
                </h2>
    
                <div class="actionsDocuments">

                    <button
                        class="btnRetourDocument"
                        onclick="
                            retourDocuments()
                        "
                    >
                        ⬅ Retour
                    </button>
                
                    <button
                        class="btnSousDossier"
                        onclick="
                            nouveauSousDossier()
                        "
                    >
                        ➕ Sous-dossier
                    </button>
                
                    <button
                        class="btnAjoutDocument"
                        onclick="
                            nouveauDocument()
                        "
                    >
                        📤 Document
                    </button>
                
                </div>
    
                ${sousDossiers}

                ${documentsDossier}
    
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

    if (!dossierActif) {

        afficherDocuments();

        return;

    }

    const dossier =
        dossiers.find(
            d => d.id === dossierActif
        );

    if (!dossier || !dossier.parent) {

        dossierActif = null;

    }
    else {

        dossierActif =
            dossier.parent;

    }

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
