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

import {
    moisExiste,
    creerMois,
    ajouterMouvementMois,
    chargerMouvementsMois,
    modifierMouvement
} from "./mois.js";

import {
    chargerMenus,
    sauverMenu,
    supprimerMenusAnciens
}
from "./menus.js";

import {
    chargerListesCourses,
    sauvegarderListeCourses,
    supprimerListeCourses
}
from "./courses.js";

import {
    chargerTodo,
    ajouterTodo,
    supprimerTodo
}
from "./todo.js";

import {
    chargerRdvJour,
    ajouterRdv,
    modifierRdv,
    supprimerRdv
}
from "./calendrier.js";

let nbDepensesAffichees = 30;
let recurrentesInitialisation = [];
let listesCourses = [];
let listeCourseActive = "";
let moisCalendrier =
    new Date();

const moisCourant =
    new Date()
    .toISOString()
    .substring(0, 7);

let moisGestion =
    moisCourant;

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

window.afficherMenus =
    async function() {
    
        document
            .getElementById("sidebar")
            .classList
            .remove("open");
    
        document
            .getElementById("zoneBudget")
            .style.display =
            "none";

        document.getElementById(
            "budgetActions"
        ).style.display = "none";
        
        await supprimerMenusAnciens();
    
        const menus =
            await chargerMenus();
    
        const jours = [];
    
        const date =
            new Date();
    
        for (
            let i = 0;
            i < 8;
            i++
        ) {
    
            const d =
                new Date(date);
    
            d.setDate(
                d.getDate() + i
            );
    
            jours.push(
                d
            );
    
        }
    
        const lignes =
            jours.map(d => {
    
                const dateIso =
                    d.toISOString()
                    .split("T")[0];
    
                const menu =
                    menus[dateIso] || {};
    
                const jour =
                    d.toLocaleDateString(
                        "fr-FR",
                        {
                            weekday:
                            "long"
                        }
                    );
    
                return `
    
    <tr>
    
    <td>${jour}</td>
    
    <td>
    
        <textarea
            id="midi-${dateIso}"
            onblur="sauvegarderMenuLigne('${dateIso}')"
        >${menu.midi || ""}</textarea>

    </td>
    
    <td>
    
        <textarea
            id="soir-${dateIso}"
            onblur="sauvegarderMenuLigne('${dateIso}')"
        >${menu.soir || ""}</textarea>

    </td>
    
    </tr>
    
    `;
    
            }).join("");
    
        document
            .getElementById(
                "contenu"
            ).innerHTML = `
    
    <h2>Menus</h2>
    
    <table class="tableMenus">
    
    <thead>
    
    <tr>
    
    <th>Jour</th>
    <th>Midi</th>
    <th>Soir</th>
    
    </tr>
    
    </thead>
    
    <tbody>
    
    ${lignes}
    
    </tbody>
    
    </table>
    
    `;
    
};

window.sauvegarderMenuLigne =
async function(date) {

    const midi =
        document
        .getElementById(
            `midi-${date}`
        )
        .value;

    const soir =
        document
        .getElementById(
            `soir-${date}`
        )
        .value;

    await sauverMenu(
        date,
        midi,
        soir
    );

};

window.afficherCourses =
async function() {

    document
        .getElementById("sidebar")
        .classList
        .remove("open");

    document.getElementById(
        "zoneBudget"
    ).style.display = "none";

    document.getElementById(
        "budgetActions"
    ).style.display = "none";
    
    listesCourses =
        await chargerListesCourses();

    if (listesCourses.length === 0) {

        await sauvegarderListeCourses(
            "Ma liste",
            Array(20).fill("")
        );

        listesCourses =
            await chargerListesCourses();

    }

    if (!listeCourseActive) {

        listeCourseActive =
            listesCourses[0].nom;

    }

    afficherListeCourses();

};

window.afficherTodo =
async function() {

    document
        .getElementById("sidebar")
        .classList
        .remove("open");

    document.getElementById(
        "zoneBudget"
    ).style.display = "none";

    document.getElementById(
        "budgetActions"
    ).style.display = "none";

    const todos =
        await chargerTodo();

    const lignes =
        todos.map(t => `

            <div class="ligneTodo">

                <input
                    type="checkbox"
                    onchange="
                        terminerTodo(
                            '${t.id}'
                        )
                    ">

                <span>
                    ${t.texte}
                </span>

            </div>

        `).join("");

    document.getElementById(
        "contenu"
    ).innerHTML = `

        <h2>
            To Do List
        </h2>

        <input
            id="nouveauTodo"
            placeholder="Nouvelle tâche"
            onkeydown="
                ajouterTodoEntree(
                    event
                )
            ">

        <div class="todoContainer">

            ${lignes}

        </div>

    `;

};

window.afficherCalendrier =
async function() {

    document
        .getElementById("sidebar")
        .classList
        .remove("open");

    document.getElementById(
        "zoneBudget"
    ).style.display = "none";

    document.getElementById(
        "budgetActions"
    ).style.display = "none";
    
    dessinerCalendrier();

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

function dessinerCalendrier() {

    const annee =
        moisCalendrier.getFullYear();

    const mois =
        moisCalendrier.getMonth();

    const premierJour =
        new Date(
            annee,
            mois,
            1
        );

    let decalage =
        premierJour.getDay();

    decalage =
        decalage === 0
            ? 6
            : decalage - 1;

    const nbJours =
        new Date(
            annee,
            mois + 1,
            0
        ).getDate();

    const aujourdHui =
        new Date();

    let html = "";

    const joursSemaine = [
        "Lun",
        "Mar",
        "Mer",
        "Jeu",
        "Ven",
        "Sam",
        "Dim"
    ];

    joursSemaine.forEach(jour => {

        html += `
            <div class="numeroJour">
                ${jour}
            </div>
        `;

    });

    for (
        let i = 0;
        i < decalage;
        i++
    ) {

        html += "<div></div>";

    }

    for (
        let jour = 1;
        jour <= nbJours;
        jour++
    ) {

        const date =
            new Date(
                annee,
                mois,
                jour
            );

        const passe =
            date <
            new Date(
                aujourdHui.getFullYear(),
                aujourdHui.getMonth(),
                aujourdHui.getDate()
            );

        const dateIso =
            date.toISOString()
                .split("T")[0];
        
        html += `
        
            <div
                class="
                    jourCalendrier
                    ${passe ? "jourPassee" : ""}
                "
                onclick="ouvrirRdv('${dateIso}')"
            >
        
                <div class="numeroJour">
                    ${jour}
                </div>
        
                <div
                    id="rdv-${dateIso}"
                    class="zoneRdvs">
                </div>
        
            </div>
        
        `;

    }

    document.getElementById(
        "contenu"
    ).innerHTML = `
        
        <div class="calendrierHeader">

            <button onclick="moisPrecedent()">
                ◀
            </button>

            <h2>

                ${moisCalendrier.toLocaleDateString(
                    "fr-FR",
                    {
                        month: "long",
                        year: "numeric"
                    }
                )}

            </h2>

            <button onclick="moisSuivant()">
                ▶
            </button>

        </div>

        <div class="grilleCalendrier">

            ${html}

        </div>

    `;

    chargerRdvsCalendrier();
}

async function chargerRdvsCalendrier() {

    const annee =
        moisCalendrier.getFullYear();

    const mois =
        moisCalendrier.getMonth();

    const nbJours =
        new Date(
            annee,
            mois + 1,
            0
        ).getDate();

    for (
        let jour = 1;
        jour <= nbJours;
        jour++
    ) {

        const dateIso =
            new Date(
                annee,
                mois,
                jour
            )
            .toISOString()
            .split("T")[0];

        const rdvs =
            await chargerRdvJour(
                dateIso
            );

        const html =
            rdvs.map(r => `

                <div
                    class="miniRdv"
                    onclick="
                        event.stopPropagation()
                    ">

                    ${r.nom}

                </div>

            `).join("");

        const zone =
            document.getElementById(
                `rdv-${dateIso}`
            );

        if (zone) {

            zone.innerHTML =
                html;

        }

    }

}

window.moisPrecedent =
function() {

    moisCalendrier.setMonth(
        moisCalendrier.getMonth() - 1
    );

    dessinerCalendrier();

};

window.moisSuivant =
function() {

    moisCalendrier.setMonth(
        moisCalendrier.getMonth() + 1
    );

    dessinerCalendrier();

};

window.ouvrirRdv = function(date) {

    const html = `

        <div
            id="modalRdv"
            class="modalCalendrier">

            <div
                class="modalCalendrierContenu">

                <h2>
                    📅 Rendez-vous
                </h2>

                <label>
                    Nom
                </label>

                <input
                    id="rdvNom">

                <label>
                    Date début
                </label>

                <input
                    type="date"
                    id="rdvDateDebut"
                    value="${date}">

                <label>
                    Heure début
                </label>

                <input
                    type="time"
                    id="rdvHeureDebut">

                <label>
                    Date fin
                </label>

                <input
                    type="date"
                    id="rdvDateFin"
                    value="${date}">

                <label>
                    Heure fin
                </label>

                <input
                    type="time"
                    id="rdvHeureFin">

                <label>
                    Lieu
                </label>

                <input
                    id="rdvLieu">

                <div class="participants">

                    <label>
                        <input
                            type="checkbox"
                            id="philippe">
                        Philippe
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            id="marion">
                        Marion
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            id="louis">
                        Louis
                    </label>

                </div>

                <div class="actionsRdv">

                    <button
                        onclick="sauverRdv('${date}')">

                        Enregistrer

                    </button>

                    <button
                        onclick="fermerRdv()">

                        Annuler

                    </button>

                </div>

            </div>

        </div>

    `;

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );

};

window.fermerRdv = function() {

    document
        .getElementById(
            "modalRdv"
        )
        ?.remove();

};

function afficherListeCourses() {

    const liste =
        listesCourses.find(
            x => x.nom === listeCourseActive
        );

    const options =
        listesCourses.map(l => `

            <option
                value="${l.nom}"
                ${l.nom === listeCourseActive ? "selected" : ""}>
                ${l.nom}
            </option>

        `).join("");

    const lignes =
        liste.lignes.map((ligne, index) => {

            const texte =
                ligne?.texte || "";

            const coche =
                ligne?.coche || false;

            const vide =
                texte.trim() === "";

            return `

                <div class="ligneCourse">

                    ${
                        !vide
                        ? `
                            <input
                                type="checkbox"
                                id="check-${index}"
                                ${coche ? "checked" : ""}
                                onchange="toggleCourse(${index})">
                          `
                        : ""
                    }

                    <textarea
                        id="ligne-${index}"
                        class="
                            ${vide ? "ligneVide" : ""}
                            ${coche ? "courseCochee" : ""}
                        "
                        oninput="majAffichageLigne(${index})"
                        onblur="sauvegarderCourses()"
                        onkeydown="
                            gererEntreeCourse(
                                event,
                                ${index}
                            )
                        "
                    >${texte}</textarea>
                </div>

            `;

        }).join("");

    document.getElementById(
        "contenu"
    ).innerHTML = `

        <h2>Liste de courses</h2>

        <select
            class="selectListeCourses"
            onchange="changerListe(this.value)">

            ${options}

        </select>

        <button
            class="btnNouvelleListe"
            onclick="nouvelleListeCourses()">

            ➕ Nouvelle liste

        </button>

        <button
            class="btnSupprimerListe"
            onclick="supprimerListeActive()">
        
            🗑️ Supprimer la liste
        
        </button>

        <div class="listeCoursesContainer">

            ${lignes}

        </div>

    `;
}

window.toggleCourse =
async function(index) {

    const checkbox =
        document.getElementById(
            `check-${index}`
        );

    const zone =
        document.getElementById(
            `ligne-${index}`
        );

    zone.classList.toggle(
        "courseCochee",
        checkbox.checked
    );

    await sauvegarderCourses();
    await verifierSuppressionAuto();

};

window.gererEntreeCourse =
function(event, index) {

    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();

    const zone =
        document.getElementById(
            `ligne-${index}`
        );

    const lignes =
        document.querySelectorAll(
            "[id^='ligne-']"
        );

    const nouveauIndex =
        lignes.length;

    const div =
        document.createElement("div");

    div.className =
        "ligneCourse";

    div.innerHTML = `

        <textarea
            id="ligne-${nouveauIndex}"
            oninput="majAffichageLigne(${nouveauIndex})"
            onblur="sauvegarderCourses()"
            onkeydown="
                gererEntreeCourse(
                    event,
                    ${nouveauIndex}
                )
            "></textarea>
    
    `;

    zone
        .closest(".ligneCourse")
        .after(div);

    document
        .getElementById(
            `ligne-${nouveauIndex}`
        )
        .focus();

};

window.changerListe =
function(nom) {

    listeCourseActive =
        nom;

    afficherListeCourses();

};

window.nouvelleListeCourses =
async function() {

    const nom =
        prompt(
            "Nom de la liste"
        );

    if (!nom) return;

    await sauvegarderListeCourses(
        nom,
        [""]
    );

    listesCourses =
        await chargerListesCourses();

    listeCourseActive =
        nom;

    afficherListeCourses();

};

window.sauvegarderCourses =
async function() {

    const lignes = [];

    document
        .querySelectorAll(
            "[id^='ligne-']"
        )
        .forEach((zone, index) => {

            const checkbox =
                document.getElementById(
                    `check-${index}`
                );

            lignes.push({
                texte: zone.value,
                coche:
                    checkbox
                    ? checkbox.checked
                    : false
            });

        });

    await sauvegarderListeCourses(
        listeCourseActive,
        lignes
    );

};

window.majAffichageLigne = function(index) {

    const zone =
        document.getElementById(
            `ligne-${index}`
        );

    const ligne =
        zone.closest(".ligneCourse");

    let checkbox =
        document.getElementById(
            `check-${index}`
        );

    const texte =
        zone.value.trim();

    if (texte !== "" && !checkbox) {

        checkbox =
            document.createElement(
                "input"
            );

        checkbox.type = "checkbox";

        checkbox.id =
            `check-${index}`;

        checkbox.onchange =
            () => toggleCourse(index);

        ligne.insertBefore(
            checkbox,
            zone
        );

    }

    if (texte === "" && checkbox) {

        checkbox.remove();

    }

    sauvegarderCourses();
};

window.supprimerListeActive =
async function(confirmer = true) {

    if (confirmer) {

        const confirmation =
            confirm(
                `Supprimer la liste "${listeCourseActive}" ?`
            );

        if (!confirmation) {
            return;
        }

    }

    await supprimerListeCourses(
        listeCourseActive
    );

    listesCourses =
        await chargerListesCourses();

    if (listesCourses.length === 0) {

        await sauvegarderListeCourses(
            "Ma liste",
            [
                {
                    texte: "",
                    coche: false
                }
            ]
        );

        listesCourses =
            await chargerListesCourses();

    }

    listeCourseActive =
        listesCourses[0].nom;

    afficherListeCourses();

};

async function verifierSuppressionAuto() {

    const lignes = [];

    document
        .querySelectorAll(
            "[id^='ligne-']"
        )
        .forEach((zone, index) => {

            const texte =
                zone.value.trim();

            if (texte === "") {
                return;
            }

            const checkbox =
                document.getElementById(
                    `check-${index}`
                );

            lignes.push(
                checkbox &&
                checkbox.checked
            );

        });

    if (lignes.length === 0) {
        return;
    }

    const toutesCochees =
        lignes.every(
            x => x === true
        );

    if (!toutesCochees) {
        return;
    }

    const confirmation =
        confirm(
            "Tous les articles sont cochés.\n\nSupprimer la liste ?"
        );

    if (!confirmation) {
        return;
    }

    await supprimerListeActive(false);

}

window.ajouterTodoEntree =
async function(event) {

    if (event.key !== "Enter") {
        return;
    }

    const zone =
        document.getElementById(
            "nouveauTodo"
        );

    const texte =
        zone.value.trim();

    if (!texte) {
        return;
    }

    await ajouterTodo(
        texte
    );

    await afficherTodo();

};

window.terminerTodo =
async function(id) {

    await supprimerTodo(
        id
    );

    await afficherTodo();

};

window.sauverRdv =
async function(date) {

    const participants = [];

    if (
        document.getElementById(
            "philippe"
        ).checked
    ) {

        participants.push(
            "Philippe"
        );

    }

    if (
        document.getElementById(
            "marion"
        ).checked
    ) {

        participants.push(
            "Marion"
        );

    }

    if (
        document.getElementById(
            "louis"
        ).checked
    ) {

        participants.push(
            "Louis"
        );

    }

    const rdv = {

        nom:
            document.getElementById(
                "rdvNom"
            ).value,

        dateDebut:
            document.getElementById(
                "rdvDateDebut"
            ).value,

        heureDebut:
            document.getElementById(
                "rdvHeureDebut"
            ).value,

        dateFin:
            document.getElementById(
                "rdvDateFin"
            ).value,

        heureFin:
            document.getElementById(
                "rdvHeureFin"
            ).value,

        lieu:
            document.getElementById(
                "rdvLieu"
            ).value,

        participants

    };

    await ajouterRdv(
        date,
        rdv
    );

    fermerRdv();

    dessinerCalendrier();

};
