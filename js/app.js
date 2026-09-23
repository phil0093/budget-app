import { calculerBudget } from "./budget.js";
import "./pages/menus-page.js";
import "./pages/courses-page.js";
import "./pages/todo-page.js";
import "./pages/calendrier-page.js";




const moisCourant =
    new Date()
    .toISOString()
    .substring(0, 7);



function formatDateLocale(date) {

    const annee =
        date.getFullYear();

    const mois =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const jour =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${annee}-${mois}-${jour}`;

}

function initialiserDateDuJour() {

    const aujourdHui =
        new Date()
            .toISOString()
            .split("T")[0];

    document.getElementById("dateDepense").value =
        aujourdHui;
}

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

window.majSolde = majSolde;

window.ajouterDepense = async function () {

    const libelle =
        document.getElementById(
            "libelle"
        ).value;

    let date =
        document.getElementById(
            "dateDepense"
        ).value;
    
    if (!date) {
    
        date = new Date()
            .toISOString()
            .split("T")[0];
    
    }

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

    document.getElementById("libelle").value = "";
    document.getElementById("montant").value = "";
    
    initialiserDateDuJour();
    
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

    const recurrentes = await chargerRecurrentes();

    recurrentes.sort((a, b) => {
    
        if (a.type === b.type) {
            return a.libelle.localeCompare(b.libelle);
        }
    
        return a.type === "recette" ? -1 : 1;
    });

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

                ${r.type === "recette" ? "+" : "-"}
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

window.gererMois = async function() {

    document.getElementById("contenu").innerHTML = `

        <h2>Gestion du mois</h2>

        <div class="selection-mois">

            <label for="moisSelectionne">
                Mois :
            </label>

            <input
                type="month"
                id="moisSelectionne"
                value="${moisCourant}">

        </div>

        <br>

        <button onclick="ouvrirMoisSelectionne()">
            Ouvrir
        </button>

    `;
};

window.ouvrirMoisSelectionne = async function() {

    moisGestion =
        document.getElementById(
            "moisSelectionne"
        ).value;

    const existe =
        await moisExiste(
            moisGestion
        );

    if (!existe) {

        document.getElementById(
            "contenu"
        ).innerHTML = `

            <h2>${moisGestion}</h2>

            <p>
                Ce mois n'est pas encore initialisé.
            </p>

            <button
                class="btn-plus"
                onclick="initialiserMois()">

                Initialiser le mois

            </button>

        `;

    } else {

        document.getElementById(
            "contenu"
        ).innerHTML = `

            <h2>${moisGestion}</h2>

            <p>
                Ce mois est déjà initialisé.
            </p>

            <button
                class="btn-plus"
                onclick="modifierMois()">

                Modifier le mois

            </button>

        `;

    }

};

window.initialiserMois = async function() {

    const recurrentes =
        await chargerRecurrentes();

    recurrentesInitialisation =
        recurrentes;

    const html = recurrentes.map(r => `

        <div class="depense-ligne">

            <input
                type="checkbox"
                checked
                id="check-${r.id}">

            <div class="depense-infos">

                <div class="depense-libelle">

                    ${r.libelle}

                </div>

            </div>

            <input
                type="number"
                id="montant-${r.id}"
                value="${r.montantDefaut}"
                step="0.01">

        </div>

    `).join("");

    document.getElementById(
        "contenu"
    ).innerHTML = `

        <h2>
            Initialisation ${moisGestion}
        </h2>

        ${html}

        <br>

        <button
            class="btn-plus"
            onclick="validerInitialisationMois()">

            Créer le mois

        </button>

    `;

};

window.validerInitialisationMois =
async function() {

    await creerMois(
        moisGestion
    );

    for (const r of recurrentesInitialisation) {

        const coche =
            document.getElementById(
                `check-${r.id}`
            ).checked;

        if (!coche)
            continue;

        const montant =
            parseFloat(
                document.getElementById(
                    `montant-${r.id}`
                ).value
            );

        await ajouterMouvementMois(
            moisGestion,
            {
                libelle: r.libelle,
                montant,
                type: r.type,
                origine: "recurrente",
                dateCreation:
                    new Date()
                    .toISOString()
            }
        );

    }

    alert(
        "Mois initialisé avec succès"
    );

    await gererMois();

};

window.modifierMois = async function() {

    const mouvements =
        await chargerMouvementsMois(
            moisGestion
        );
    
    mouvements.sort((a, b) => {
    
        // Recettes avant dépenses
        if (a.type !== b.type) {
            return a.type === "recette" ? -1 : 1;
        }
    
        // Puis ordre alphabétique
        return a.libelle.localeCompare(
            b.libelle,
            "fr"
        );
    
    });


    if (mouvements.length === 0) {

        document.getElementById("contenu").innerHTML = `
            <h2>${moisGestion}</h2>
            <p>Aucun mouvement trouvé.</p>
        `;

        return;
    }

    const html = mouvements.map(m => `

        <div class="depense-ligne">

            <div class="depense-infos">

                <div class="depense-libelle">
                    ${m.libelle}
                </div>

                <div class="depense-details">

                    <span class="${m.type}">
                        ${m.type === "recette"
                            ? "💰 Recette"
                            : "💸 Dépense"}
                    </span>

                </div>

            </div>

            <div class="depense-montant ${m.type}">

                ${m.type === "recette"
                    ? "+"
                    : "-"}

                ${m.montant.toLocaleString(
                    "fr-FR",
                    {
                        minimumFractionDigits: 2
                    }
                )} €

            </div>

            <div class="depense-actions">

                <button
                    class="btn-action"
                    onclick="modifierMouvementMois('${m.id}')">

                    ✏️

                </button>

            </div>

        </div>

    `).join("");

    document.getElementById("contenu").innerHTML = `

        <h2>
            Mois ${moisGestion}
        </h2>

        ${html}

    `;
};
window.modifierMouvementMois =
async function(id) {

    const mouvements =
        await chargerMouvementsMois(
            moisGestion
        );

    const mouvement =
        mouvements.find(
            m => m.id === id
        );

    if (!mouvement) {
        return;
    }

    const nouveauMontant =
        prompt(
            `Nouveau montant pour ${mouvement.libelle}`,
            mouvement.montant
        );

    if (
        nouveauMontant === null ||
        nouveauMontant === ""
    ) {
        return;
    }

    await modifierMouvement(
        moisGestion,
        id,
        {
            montant:
                parseFloat(
                    nouveauMontant
                )
        }
    );

    await modifierMois();

    await majSolde();

};

initialiserDateDuJour();

window.addEventListener("load", () => {

    afficherAccueil();

});

window.toggleMenu = function() {

    document
        .getElementById("sidebar")
        .classList
        .toggle("open");

};

window.afficherAccueil = function() {

    document.getElementById(
        "zoneBudget"
    ).style.display = "block";

    document.getElementById(
        "budgetActions"
    ).style.display = "none";

    document.getElementById(
        "contenu"
    ).innerHTML = "";

    document
        .getElementById("sidebar")
        .classList
        .remove("open");

};

window.afficherBudget = function() {

    document
        .getElementById("sidebar")
        .classList
        .remove("open");

    document.getElementById(
        "zoneBudget"
    ).style.display = "block";

    document.getElementById(
        "budgetActions"
    ).style.display = "block";

    document.getElementById(
        "contenu"
    ).innerHTML = "";

};









document.addEventListener("click", function(event) {

    const sidebar =
        document.getElementById("sidebar");

    const menuButton =
        document.getElementById("menuButton");

    if (
        sidebar.classList.contains("open") &&
        !sidebar.contains(event.target) &&
        !menuButton.contains(event.target)
    ) {
        sidebar.classList.remove("open");
    }

});



