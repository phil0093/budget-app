import {
    chargerRdvsMois,
    ajouterRdv,
    modifierRdv,
    supprimerRdv
}
from "../services/calendrier.js";

import {
    formatDateLocale,
    numeroSemaine,
    masquerZones
}
from "../utils.js";

let moisCalendrier =
    new Date();

window.afficherCalendrier =
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
    
    dessinerCalendrier();

};

function dessinerCalendrier() {

    const annee =
        moisCalendrier.getFullYear();

    const mois =
        moisCalendrier.getMonth();

    const aujourdHui =
        new Date();

    let html = "";

    html += `
        <div class="semaineHeader">
            S.
        </div>
    `;

    [
        "Lun",
        "Mar",
        "Mer",
        "Jeu",
        "Ven",
        "Sam",
        "Dim"
    ].forEach(jour => {

        html += `
            <div class="numeroJour">
                ${jour}
            </div>
        `;

    });

    const premierJour =
        new Date(
            annee,
            mois,
            1
        );

    const dernierJour =
        new Date(
            annee,
            mois + 1,
            0
        );

    const debutCalendrier =
        new Date(premierJour);

    const decalageDebut =
        debutCalendrier.getDay() === 0
            ? 6
            : debutCalendrier.getDay() - 1;

    debutCalendrier.setDate(
        debutCalendrier.getDate() -
        decalageDebut
    );

    const finCalendrier =
        new Date(dernierJour);

    const decalageFin =
        finCalendrier.getDay() === 0
            ? 0
            : 7 - finCalendrier.getDay();

    finCalendrier.setDate(
        finCalendrier.getDate() +
        decalageFin
    );

    const dateCourante =
        new Date(debutCalendrier);

    while (
        dateCourante <= finCalendrier
    ) {

        html += `
            <div class="numeroSemaine">
                ${numeroSemaine(dateCourante)}
            </div>
        `;

        for (
            let i = 0;
            i < 7;
            i++
        ) {

            const date =
                new Date(dateCourante);

            const horsMois =
                date.getMonth() !== mois;

            const passe =
                date <
                new Date(
                    aujourdHui.getFullYear(),
                    aujourdHui.getMonth(),
                    aujourdHui.getDate()
                );

            const dateIso =
                formatDateLocale(date);

            html += `

                <div
                    class="
                        jourCalendrier
                        ${passe ? "jourPassee" : ""}
                        ${horsMois ? "jourHorsMois" : ""}
                    "
                    onclick="
                        ouvrirRdv(
                            '${dateIso}'
                        )
                    "
                >

                    <div class="numeroJour">
                        ${date.getDate()}
                    </div>

                    <div
                        id="rdv-${dateIso}"
                        class="zoneRdvs">
                    </div>

                </div>

            `;

            dateCourante.setDate(
                dateCourante.getDate() + 1
            );

        }

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

    const rdvsMois =
        await chargerRdvsMois();

    for (
        let jour = 1;
        jour <= nbJours;
        jour++
    ) {

        const dateIso =
            formatDateLocale(
                new Date(
                    annee,
                    mois,
                    jour
                )
            );

        const rdvs =
            rdvsMois[dateIso] || [];

        rdvs.sort((a, b) =>
            a.heureDebut.localeCompare(
                b.heureDebut
            )
        );

        const rdvsVisibles =
            rdvs.slice(0, 3);

        let html =
            rdvsVisibles.map(r => `

                <div
                    class="miniRdv"
                    onclick="
                        event.stopPropagation();
                        modifierRdvCalendrier(
                            '${dateIso}',
                            '${r.id}'
                        );
                    "
                >

                    ${r.nom}

                </div>

            `).join("");

        if (rdvs.length > 3) {

            html += `

                <div
                    class="miniRdvPlus"
                    onclick="
                        event.stopPropagation();
                        afficherTousLesRdvs(
                            '${dateIso}'
                        );
                    "
                >

                    +${rdvs.length - 3}

                </div>

            `;

        }

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

window.afficherTousLesRdvs =
async function(date) {

    const rdvs =
        await chargerRdvJour(date);

    rdvs.sort((a, b) =>
        a.heureDebut.localeCompare(
            b.heureDebut
        )
    );

    const liste =
        rdvs.map(r => `

            <div
                class="miniRdv"
                onclick="
                    modifierRdvCalendrier(
                        '${date}',
                        '${r.id}'
                    )
                "
            >
                ${r.heureDebut}
                -
                ${r.nom}
            </div>

        `).join("");

    document.body.insertAdjacentHTML(
        "beforeend",
        `
        <div
            id="modalListeRdvs"
            class="modalCalendrier">

            <div
                class="modalCalendrierContenu">

                <h2>
                    RDV du ${date}
                </h2>

                ${liste}

                <br>

                <button
                    onclick="
                        document
                            .getElementById(
                                'modalListeRdvs'
                            )
                            .remove()
                    ">
                    Fermer
                </button>

            </div>

        </div>
        `
    );

};

window.modifierRdvCalendrier =
async function(date, id) {

    const rdvs =
        await chargerRdvJour(date);

    const rdv =
        rdvs.find(
            r => r.id === id
        );

    if (!rdv) {
        return;
    }

    ouvrirRdv(date, rdv);

};

window.moisPrecedent =
function() {

    moisCalendrier =
        new Date(
            moisCalendrier.getFullYear(),
            moisCalendrier.getMonth() - 1,
            1
        );

    dessinerCalendrier();

};
window.moisSuivant =
function() {

    moisCalendrier =
        new Date(
            moisCalendrier.getFullYear(),
            moisCalendrier.getMonth() + 1,
            1
        );

    dessinerCalendrier();

};

window.ouvrirRdv = function(date, rdv = null) {

    if (
        document.getElementById(
            "modalRdv"
        )
    ) {
        return;
    }
    
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
                    id="rdvNom"
                    value="${rdv?.nom || ""}">

                <label>
                    Date début
                </label>

                <input
                    type="date"
                    id="rdvDateDebut"
                    value="${rdv?.dateDebut || date}">

                <label>
                    Heure début
                </label>

                <input
                    type="time"
                    id="rdvHeureDebut"
                    value="${rdv?.heureDebut || ""}">
                    
                <label>
                    Date fin
                </label>

                <input
                    type="date"
                    id="rdvDateFin"
                    value="${rdv?.dateFin || date}">

                <label>
                    Heure fin
                </label>

                <input
                    type="time"
                    id="rdvHeureFin"
                    value="${rdv?.heureFin || ""}">

                <label>
                    Lieu
                </label>

                <input
                    id="rdvLieu"
                    value="${rdv?.lieu || ""}">

                <div class="participants">

                    <label>
                        <input
                            type="checkbox"
                            id="philippe"
                            ${
                                rdv?.participants?.includes("Philippe")
                                    ? "checked"
                                    : ""
                            }>
                        Philippe
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            id="marion"
                            ${
                                rdv?.participants?.includes("Marion")
                                    ? "checked"
                                    : ""
                            }>
                        Marion
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            id="louis"
                            ${
                                rdv?.participants?.includes("Louis")
                                    ? "checked"
                                    : ""
                            }>
                        Louis
                    </label>

                </div>

                <div class="actionsRdv">

                    <button
                        onclick="
                            sauverRdv(
                                '${date}',
                                '${rdv?.id || ""}'
                            )
                        ">
                    
                        Enregistrer
                    
                    </button>

                    ${
                        rdv
                        ? `
                            <button
                                onclick="
                                    supprimerRdvCalendrier(
                                        '${date}',
                                        '${rdv.id}'
                                    )
                                ">
                                🗑️ Supprimer
                            </button>
                          `
                        : ""
                    }

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

window.sauverRdv =
async function(date, id="") {

    const nom =
        document.getElementById(
            "rdvNom"
        ).value.trim();

    const dateDebut =
        document.getElementById(
            "rdvDateDebut"
        ).value;

    const heureDebut =
        document.getElementById(
            "rdvHeureDebut"
        ).value;

    const dateFin =
        document.getElementById(
            "rdvDateFin"
        ).value;

    const heureFin =
        document.getElementById(
            "rdvHeureFin"
        ).value;

    if (!nom) {

        alert(
            "Le nom du rendez-vous est obligatoire."
        );

        return;
    }

    if (!dateDebut) {

        alert(
            "La date de début est obligatoire."
        );

        return;
    }

    if (!heureDebut) {

        alert(
            "L'heure de début est obligatoire."
        );

        return;
    }

    if (!dateFin) {

        alert(
            "La date de fin est obligatoire."
        );

        return;
    }

    if (!heureFin) {

        alert(
            "L'heure de fin est obligatoire."
        );

        return;
    }

    const debut =
        new Date(
            `${dateDebut}T${heureDebut}`
        );

    const fin =
        new Date(
            `${dateFin}T${heureFin}`
        );

    if (fin < debut) {

        alert(
            "La date/heure de fin doit être postérieure à la date/heure de début."
        );

        return;
    }

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

        nom,
    
        dateDebut,
    
        heureDebut,
    
        dateFin,
    
        heureFin,
    
        lieu:
            document.getElementById(
                "rdvLieu"
            ).value,
    
        participants
    
    };

    if (id) {

            await modifierRdv(
                date,
                id,
                rdv
            );
        
        } else {
        
            await ajouterRdv(
                date,
                rdv
            );
        
        }

    fermerRdv();

    dessinerCalendrier();

};

window.supprimerRdvCalendrier =
async function(date, id) {

    if (
        !confirm(
            "Supprimer ce rendez-vous ?"
        )
    ) {
        return;
    }

    await supprimerRdv(
        date,
        id
    );

    fermerRdv();

    dessinerCalendrier();

};
