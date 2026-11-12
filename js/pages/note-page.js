import {
    chargerNotes,
    ajouterNote,
    modifierNote,
    supprimerNote
}
from "../services/note.js";

import {
    masquerZones
}
from "../utils.js";

let notes = [];

window.afficherNotes =
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

    notes =
        await chargerNotes();

    dessinerNotes();

};

function dessinerNotes() {

    const html =
        notes.map(note => `

            <div class="carteNote">

                <input
                    class="titreNote"
                    value="${note.titre || ""}"
                    onblur="
                        sauverNote(
                            '${note.id}'
                        )
                    "
                    id="titre-${note.id}"
                    placeholder="Titre"
                >

                <textarea
                    class="contenuNote"
                    id="contenu-${note.id}"
                    onblur="
                        sauverNote(
                            '${note.id}'
                        )
                    "
                    placeholder="Votre note..."
                >${note.contenu || ""}</textarea>

                <button
                    class="btnSupprimerNote"
                    onclick="
                        supprimerNoteInterface(
                            '${note.id}'
                        )
                    "
                >

                    🗑️ Supprimer

                </button>

            </div>

        `).join("");

    document.getElementById(
        "contenu"
    ).innerHTML = `

        <h2>
            Notes
        </h2>

        <button
            class="btnNouvelleNote"
            onclick="
                creerNote()
            "
        >

            ➕ Nouvelle note

        </button>

        ${html}

    `;

}

window.creerNote =
async function() {

    await ajouterNote();

    notes =
        await chargerNotes();

    dessinerNotes();

};

window.sauverNote =
async function(id) {

    const titre =
        document.getElementById(
            `titre-${id}`
        ).value;

    const contenu =
        document.getElementById(
            `contenu-${id}`
        ).value;

    await modifierNote(
        id,
        {
            titre,
            contenu
        }
    );

};

window.supprimerNoteInterface =
async function(id) {

    if (
        !confirm(
            "Supprimer cette note ?"
        )
    ) {
        return;
    }

    await supprimerNote(id);

    notes =
        await chargerNotes();

    dessinerNotes();

};
