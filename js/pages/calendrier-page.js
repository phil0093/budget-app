import {
    chargerRdvJour,
    ajouterRdv,
    modifierRdv,
    supprimerRdv
}
from "../services/calendrier.js";

let moisCalendrier =
    new Date();

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
            formatDateLocale(date);
        
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
            formatDateLocale(
                new Date(
                    annee,
                    mois,
                    jour
                )
            );

        const rdvs =
            await chargerRdvJour(
                dateIso
            );

        const html =
            rdvs.map(r => `

                <div
                    class="miniRdv"
                    onclick="
                        event.stopPropagation();
                        modifierRdvCalendrier(
                            '${dateIso}',
                            '${r.id}'
                        );
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

window.ouvrirRdv = function(date, rdv = null) {

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
