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
        document.getElementById("contenu").innerHTML =
            "<h2>Liste des dépenses</h2><p>Aucune dépense ce mois-ci.</p>";
        return;
    }

    const lignes = depenses.map(d =>
        `<li>${d.date} — ${d.libelle} : ${d.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</li>`
    ).join("");

    document.getElementById("contenu").innerHTML =
        `<h2>Liste des dépenses</h2><ul>${lignes}</ul>`;
};

window.afficherRecurrentes =
function () {

    document.getElementById(
        "contenu"
    ).innerHTML =
    "<h2>Dépenses récurrentes</h2>";
};

majSolde();
