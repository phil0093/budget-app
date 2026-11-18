import {
    chargerDossiers,
    ajouterDossier
}
from "../services/document-folder.js";

import {
    chargerDocuments,
    ajouterDocument,
    modifierDocument,
    supprimerDocument
}
from "../services/document.js";

import { storage } from "../firebase-config.js";
import { masquerZones } from "../utils.js";

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
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
                <div class="carteDocument">

                    <div
                        class="documentInfos"
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
                
                    <div class="documentActions">
                
                        <button
                            class="btn-action"
                            onclick="
                                modifierDocumentUI(
                                    '${doc.id}'
                                )
                            "
                        >
                            ✏️
                        </button>
                
                        <button
                            class="btn-action"
                            onclick="
                                supprimerDocumentUI(
                                    '${doc.id}'
                                )
                            "
                        >
                            🗑️
                        </button>
                
                    </div>
                
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

    await afficherDocuments();

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

    await afficherDocuments();

};

window.ouvrirDossier =
async function(dossierId) {

    dossierActif =
        dossierId;

    await afficherDocuments();

};

window.retourDocuments =
async function() {

    if (!dossierActif) {

        await afficherDocuments();

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

    await afficherDocuments();

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
                
                <div class="ligneDocumentPopup">
                
                    <input
                        id="titreDocument"
                        class="titreDocumentPopup"
                        type="text"
                        placeholder="Titre"
                    >
                
                    <input
                        id="dateDocument"
                        class="dateDocumentPopup"
                        type="date"
                        value="${aujourdHui}"
                    >
                
                </div>
                
                <div class="zoneFichierDocument">
                
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
                
                </div>
                
                <div class="actionsCoursePopup">
                
                    <button
                        class="btnAjouterCoursePopup"
                        onclick="
                            enregistrerDocument()
                        "
                    >
                        ✅ Enregistrer
                    </button>
                
                    <button
                        class="btnFermerCoursePopup"
                        onclick="
                            document
                                .getElementById(
                                    'popupDocument'
                                )
                                .remove()
                        "
                    >
                        ❌ Fermer
                    </button>
                
                </div>
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
    
        url,
    
        cheminStorage
    
    });

    document
        .getElementById(
            "popupDocument"
        )
        .remove();

    await afficherDocuments();

};

window.supprimerDocumentUI =
async function(id) {

    const confirmation =
        confirm(
            "Supprimer ce document ?"
        );

    if (!confirmation) {
        return;
    }

    const docActuel =
        documents.find(
            d => d.id === id
        );
    
    if (
        docActuel?.cheminStorage
    ) {
    
        try {
    
            await deleteObject(
                ref(
                    storage,
                    docActuel.cheminStorage
                )
            );
    
        }
        catch (e) {
    
            console.warn(
                "Impossible de supprimer le fichier Storage",
                e
            );
    
        }
    
    }
    
    await supprimerDocument(
        id
    );
    await afficherDocuments();

};

window.modifierDocumentUI =
async function(id) {

    const docActuel =
        documents.find(
            d => d.id === id
        );

    if (!docActuel) {
        return;
    }

    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            id="popupModificationDocument"
            class="popupFond"
        >
        
            <div
                class="popupContenu"
            >
        
                <h3>
                    Modifier le document
                </h3>
                
                <div class="ligneDocumentPopup">
                
                    <input
                        id="modTitreDocument"
                        class="titreDocumentPopup"
                        type="text"
                        value="${docActuel.titre}"
                    >
                
                    <input
                        id="modDateDocument"
                        class="dateDocumentPopup"
                        type="date"
                        value="${docActuel.date}"
                    >
                
                </div>
                
                <div class="zoneFichierDocument">
                
                    <input
                        id="modFichierDocument"
                        type="file"
                        accept="
                            .pdf,
                            .jpg,
                            .jpeg,
                            .png,
                            .heic
                        "
                    >
                
                    <div class="nomFichierActuel">
                
                        📄 ${docActuel.nomFichier || "Document actuel"}
                
                    </div>
                
                </div>
                
                <div class="actionsCoursePopup">
                
                    <button
                        class="btnAjouterCoursePopup"
                        onclick="
                            validerModificationDocument(
                                '${id}'
                            )
                        "
                    >
                        ✅ Enregistrer
                    </button>
                
                    <button
                        class="btnFermerCoursePopup"
                        onclick="
                            document
                                .getElementById(
                                    'popupModificationDocument'
                                )
                                .remove()
                        "
                    >
                        ❌ Fermer
                    </button>
                
                </div>
            </div>
        </div>

        `
    );

};

window.validerModificationDocument =
async function(id) {

    const docActuel =
        documents.find(
            d => d.id === id
        );

    if (!docActuel) {
        return;
    }

    const titre =
        document
            .getElementById(
                "modTitreDocument"
            )
            .value
            .trim();

    const date =
        document
            .getElementById(
                "modDateDocument"
            )
            .value;

    const fichier =
        document
            .getElementById(
                "modFichierDocument"
            )
            .files[0];

    const donnees = {

        titre,
        date

    };

    if (fichier) {

        const cheminStorage =
            `documents/${dossierActif}/${Date.now()}-${fichier.name}`;

        const storageRef =
            ref(
                storage,
                cheminStorage
            );

        if (
            docActuel.cheminStorage
        ) {
        
            try {
        
                await deleteObject(
                    ref(
                        storage,
                        docActuel.cheminStorage
                    )
                );
        
            }
            catch (e) {
        
                console.warn(
                    "Ancien fichier non supprimé",
                    e
                );
        
            }
        
        }
        
        await uploadBytes(
            storageRef,
            fichier
        );

        donnees.url =
            await getDownloadURL(
                storageRef
            );

        donnees.nomFichier =
            fichier.name;

        donnees.type =
            fichier.type;

        donnees.cheminStorage =
            cheminStorage;

    }

    await modifierDocument(
        id,
        donnees
    );

    document
        .getElementById(
            "popupModificationDocument"
        )
        .remove();

    await afficherDocuments();

};
