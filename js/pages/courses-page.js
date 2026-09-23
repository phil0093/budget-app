import {
    chargerListesCourses,
    sauvegarderListeCourses,
    supprimerListeCourses
}
from "../services/courses.js";
import {masquerZones} from "../utils.js";

let listesCourses = [];
let listeCourseActive = "";

window.afficherCourses =
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
    
    listesCourses =
        await chargerListesCourses();

    if (listesCourses.length === 0) {

        await sauvegarderListeCourses(
            "Ma liste",
            Array(20).fill().map(
                () => ({
                    texte: "",
                    coche: false
                })
            )
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

function afficherListeCourses() {

    const liste =
        listesCourses.find(
            x => x.nom === listeCourseActive
        );
    if (!liste) {
        return;
    }

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
        [
            {
                texte: "",
                coche: false
            }
        ]
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
