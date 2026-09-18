import { calculerBudget } from "./budget.js";
import {
    ajouterDepenseFirestore,
    chargerDepenses,
    supprimerDepenseFirestore,
    modifierDepenseFirestore
} from "./depenses.js";

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

window.afficherDepenses = async function () {

    const depenses = await chargerDepenses(moisCourant);

    if (depenses.length === 0) {

        document.getElementById("contenu").innerHTML = `
            <h2>Liste des dépenses</h2>
            <p>Aucune dépense ce mois-ci.</p>
        `;

        return;
    }

    const html = depenses.map(d => `

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

    document.getElementById("contenu").innerHTML = `
        <h2>Liste des dépenses</h2>
        <div class="liste-depenses">
            ${html}
        </div>
    `;
};
window.afficherRecurrentes =
function () {

    document.getElementById(
        "contenu"
    ).innerHTML =
    "<h2>Dépenses récurrentes</h2>";
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

majSolde();
