import { calculerBudget } from "./budget.js";

import {
    ajouterDepenseFirestore,
    chargerDepenses,
    supprimerDepenseFirestore,
    modifierDepenseFirestore
} from "./depenses.js";

import {
    chargerRecurrentes,
    ajouterRecurrente,
    supprimerRecurrente,
    modifierRecurrente
}
from "./recurrentes.js";

let nbDepensesAffichees = 30;

const moisCourant =
    new Date()
    .toISOString()
    .substring(0, 7);

async function majSolde() {

    const solde =
        await calculerBudget(moisCourant);

    document.getElementById(
        "resteADepenser"
    ).innerHTML =
        solde.toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 2
            }
        ) + " €";
}

window.ajouterDepense =
async function () {

    const libelle =
        document.getElementById(
            "libelle"
        ).value;

    const date =
        document.getElementById(
            "dateDepense"
        ).value;

    const montant =
        parseFloat(
            document.getElementById(
                "montant"
            ).value
        );

    await ajouterDepenseFirestore({
        libelle,
        date,
        montant,
        mois: moisCourant
    });

    await majSolde();
};

window.afficherDepenses = async function(reset = true) {

    if (reset) {
    nbDepensesAffichees = 30;
    }
    
    const depenses =
        await chargerDepenses(moisCourant);

    if (depenses.length === 0) {

        document.getElementById("contenu").innerHTML = `
            <h2>Liste des dépenses</h2>
            <p>Aucune dépense ce mois-ci.</p>
        `;

        return;
    }

    const depensesAfficher =
        depenses.slice(0, nbDepensesAffichees);

    const html = depensesAfficher.map(d => `

        <div class="depense-ligne">

            <div class="depense-infos">

                <div class="depense-libelle">
                    ${d.libelle}
                </div>

                <div class="depense-details">
                    ${d.date}
                </div>

            </div>

            <div class="depense-montant">
                ${d.montant.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2
                })} €
            </div>

            <div class="depense-actions">

                <button
                    class="btn-action"
                    onclick="modifierDepense('${d.id}')">
                    ✏️
                </button>

                <button
                    class="btn-action"
                    onclick="supprimerDepense('${d.id}')">
                    🗑️
                </button>

            </div>

        </div>

    `).join("");

    let boutonPlus = "";

    if (depenses.length > nbDepensesAffichees) {

        boutonPlus = `
            <div class="bouton-plus-container">

                <button
                    class="btn-plus"
                    onclick="chargerPlusDepenses()">

                    ⬇️ Afficher 30 de plus

                </button>

            </div>
        `;
    }

    document.getElementById("contenu").innerHTML = `
        <h2>Liste des dépenses</h2>

        <div class="liste-depenses">
            ${html}
        </div>

        ${boutonPlus}
    `;
};

window.afficherRecurrentes = async function() {

    const recurrentes =
        await chargerRecurrentes();

    const html = recurrentes.map(r => `

        <div class="depense-ligne">

            <div class="depense-infos">

                <div class="depense-libelle">
                    ${r.libelle}
                </div>

                <div class="depense-details">

                    ${r.type === "recette"
                        ? "💰 Recette"
                        : "💸 Dépense"}

                    •

                    ${r.actif
                        ? "✅ Active"
                        : "⛔ Désactivée"}

                </div>

            </div>

            <div class="depense-montant">

                ${r.montantDefaut.toLocaleString(
                    "fr-FR",
                    {
                        minimumFractionDigits: 2
                    }
                )} €

            </div>

            <div class="depense-actions">

                <button
                    class="btn-action"
                    onclick="modifierRecurrenteUI('${r.id}')">
                    ✏️
                </button>

                <button
                    class="btn-action"
                    onclick="toggleRecurrente('${r.id}')">

                    ${r.actif ? "⏸️" : "▶️"}

                </button>

                <button
                    class="btn-action"
                    onclick="supprimerRecurrenteUI('${r.id}')">
                    🗑️
                </button>

            </div>

        </div>

    `).join("");

    document.getElementById("contenu").innerHTML = `

        <h2>Dépenses récurrentes</h2>

        <button
            onclick="ajouterRecurrenteUI()"
            class="btn-plus">

            ➕ Ajouter une récurrence

        </button>

        <br><br>

        <div class="liste-depenses">

            ${html}

        </div>

    `;
};

window.ajouterRecurrenteUI =
async function() {

    const libelle =
        prompt("Libellé");

    if (!libelle) return;

    const montant =
        parseFloat(
            prompt(
                "Montant"
            )
        );

    const type =
        prompt(
            "Type (recette/depense)"
        );

    await ajouterRecurrente({

        libelle,

        montantDefaut: montant,

        type,

        actif: true

    });

    await afficherRecurrentes();

};

window.modifierRecurrenteUI =
async function(id) {

    const recurrentes =
        await chargerRecurrentes();

    const r =
        recurrentes.find(
            x => x.id === id
        );

    const libelle =
        prompt(
            "Libellé",
            r.libelle
        );

    if (libelle === null)
        return;

    const montant =
        prompt(
            "Montant",
            r.montantDefaut
        );

    await modifierRecurrente(
        id,
        {
            libelle,
            montantDefaut:
                parseFloat(
                    montant
                )
        }
    );

    await afficherRecurrentes();

};

window.toggleRecurrente =
async function(id) {

    const recurrentes =
        await chargerRecurrentes();

    const r =
        recurrentes.find(
            x => x.id === id
        );

    await modifierRecurrente(
        id,
        {
            actif:
                !r.actif
        }
    );

    await afficherRecurrentes();

};

window.supprimerRecurrenteUI =
async function(id) {

    if (
        !confirm(
            "Supprimer cette récurrence ?"
        )
    ) {
        return;
    }

    await supprimerRecurrente(id);

    await afficherRecurrentes();

};

window.modifierDepense = async function(id) {

    const depenses =
        await chargerDepenses(
            moisCourant
        );

    const depense =
        depenses.find(
            d => d.id === id
        );

    if (!depense) {
        return;
    }

    const nouveauLibelle =
        prompt(
            "Libellé :",
            depense.libelle
        );

    if (nouveauLibelle === null) {
        return;
    }

    const nouveauMontant =
        prompt(
            "Montant :",
            depense.montant
        );

    if (nouveauMontant === null) {
        return;
    }

    await modifierDepenseFirestore(
        moisCourant,
        id,
        {
            libelle: nouveauLibelle,
            montant:
                parseFloat(
                    nouveauMontant
                )
        }
    );

    await majSolde();

    await afficherDepenses();

};

window.supprimerDepense = async function(id) {

    const confirmation =
        confirm(
            "Supprimer cette dépense ?"
        );

    if (!confirmation) {
        return;
    }

    try {

        await supprimerDepenseFirestore(
            moisCourant,
            id
        );

        await majSolde();

        await afficherDepenses();

    } catch (e) {

        console.error(e);

        alert(
            "Erreur lors de la suppression."
        );

    }

};

window.chargerPlusDepenses = async function () {

    nbDepensesAffichees += 30;

    await afficherDepenses();

};

window.chargerPlusDepenses = async function() {

    nbDepensesAffichees += 30;

    await afficherDepenses(false);

};

majSolde();
