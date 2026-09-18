import { calculerBudget } from "./budget.js";
import { ajouterDepenseFirestore, chargerDepenses } from "./depenses.js";

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


window.modifierDepense = function(id) {

    alert("Modification : " + id);

};

window.supprimerDepense = function(id) {

    if (!confirm("Supprimer cette dépense ?")) {
        return;
    }

    alert("Suppression : " + id);

};
`
majSolde();
