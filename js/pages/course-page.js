import {
    chargerCourses,
    sauvegarderCourse,
    supprimerCourse
}
from "../services/course.js";

import {masquerZones} from "../utils.js";
import {RAYONS} from "../constants/rayons.js";
import {creerStructureCourses} from "../utils-courses.js";

let courses = [];
let courseActive = "";

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

    courses =
        await chargerCourses();

    if (
        courses.length === 0
    ) {

        await sauvegarderCourse(
            "Ma liste",
            creerStructureCourses()
        );

        courses =
            await chargerCourses();

    }

    if (!courseActive) {

        courseActive =
            courses[0].nom;

    }

    dessinerCourses();

};

function dessinerCourses() {

    const course =
        courses.find(
            x => x.nom === courseActive
        );

    if (!course) {
        return;
    }

    const options =
        courses
        .map(c => `

            <option
                value="${c.nom}"
                ${
                    c.nom === courseActive
                    ? "selected"
                    : ""
                }
            >

                ${c.nom}

            </option>

        `)
        .join("");

    const rayonsHtml =
        RAYONS
        .map(rayon => `

            <div class="rayonCourse">

                <h3>
                    ${rayon}
                </h3>

            </div>

        `)
        .join("");

    document
        .getElementById(
            "contenu"
        )
        .innerHTML = `

            <h2>
                🛒 Courses
            </h2>

            <select
                class="selectListe"
                onchange="
                    changerCourse(
                        this.value
                    )
                "
            >

                ${options}

            </select>

            <button
                class="btnNouvelleListe"
                onclick="
                    nouvelleCourse()
                "
            >

                ➕ Nouvelle liste

            </button>

            <button
                class="btnSupprimerListe"
                onclick="
                    supprimerCourseActive()
                "
            >

                🗑️ Supprimer la liste

            </button>

            ${rayonsHtml}

        `;

}

window.changerCourse =
function(nom) {

    courseActive = nom;

    dessinerCourses();

};

window.nouvelleCourse =
async function() {

    const nom =
        prompt(
            "Nom de la liste"
        );

    if (!nom) {
        return;
    }

    await sauvegarderCourse(
        nom,
        creerStructureCourses()
    );

    courses =
        await chargerCourses();

    courseActive =
        nom;

    dessinerCourses();

};

window.supprimerCourseActive =
async function() {

    const confirmation =
        confirm(
            `Supprimer "${courseActive}" ?`
        );

    if (!confirmation) {
        return;
    }

    await supprimerCourse(
        courseActive
    );

    courses =
        await chargerCourses();

    if (
        courses.length === 0
    ) {

        await sauvegarderCourse(
            "Ma liste",
            creerStructureCourses()
        );

        courses =
            await chargerCourses();

    }

    courseActive =
        courses[0].nom;

    dessinerCourses();

};
