import {
    chargerCourses,
    sauvegarderCourse,
    supprimerCourse
}
from "../services/course.js";

import {masquerZones} from "../utils.js";
import {
    RAYONS,
    ICONES_RAYONS
} from "../constants/rayons.js";
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
    .map(rayon => {

        const lignesRayon =
            course.rayons?.[rayon] || [];

        const lignesAvecProduit =
            lignesRayon.filter(
                ligne =>
                    ligne.produit &&
                    ligne.produit.trim() !== ""
            );
        
        const toutesCochees =
            lignesAvecProduit.length > 0 &&
            lignesAvecProduit.every(
                ligne => ligne.coche
            );
        
        const lignesHtml =
            lignesRayon
            .map((ligne, index) => {

                const idLigne =
                    `${rayon}-${index}`;

                return `

                    <div
                        class="ligneCourse"
                        data-rayon="${rayon}"
                        data-index="${index}"
                    >

                        <div class="zoneCheckboxCourse">

                            <input
                                id="coche-${idLigne}"
                                type="checkbox"
                                ${ligne.coche ? "checked" : ""}
                                ${!ligne.produit ? "style='visibility:hidden'" : ""}
                                onchange="
                                    toggleCourseCochee(
                                        this
                                    )
                                "
                            >
                        
                        </div>

                        <input
                            id="produit-${idLigne}"
                            type="text"
                            placeholder="Produit"
                            value="${ligne.produit || ""}"
                            class="
                                ${
                                    ligne.coche
                                    ? "courseCochee"
                                    : ""
                                }
                            "
                            onblur="
                                gererLigneCourse(
                                    this,
                                    '${rayon}'
                                )
                            "
                        >

                        <input
                            id="quantite-${idLigne}"
                            type="number"
                            min="1"
                            value="${ligne.quantite || 1}"
                            onblur="
                                sauvegarderCourseActive()
                            "
                        >
                        
                    </div>

                `;

            })
            .join("");

        return `

            <div
                class="rayonCourse"
                data-rayon="${rayon}"
            >

                <h3
                    class="
                        ${
                            toutesCochees
                            ? "rayonTermine"
                            : ""
                        }
                    "
                >
                
                    ${ICONES_RAYONS[rayon]}
                    ${rayon}
                
                </h3>

                ${lignesHtml}

            </div>

        `;

    })
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

    courses =
        await chargerCourses();
    
    dessinerCourses();

};

window.sauvegarderCourseActive =
async function() {
    
    const rayons = {};

    RAYONS.forEach(rayon => {

        rayons[rayon] = [];

        document
            .querySelectorAll(
                `[data-rayon="${rayon}"]`
            )
            .forEach(ligne => {

                const index =
                    ligne.dataset.index;

                const produit =
                    document.getElementById(
                        `produit-${rayon}-${index}`
                    )?.value || "";

                const quantite =
                    parseInt(
                        document.getElementById(
                            `quantite-${rayon}-${index}`
                        )?.value || 1
                    );

                const coche =
                    document.getElementById(
                        `coche-${rayon}-${index}`
                    )?.checked || false;
                
                if (
                    produit.trim() !== ""
                ) {

                    rayons[rayon]
                    .push({
                    
                        produit,
                    
                        quantite,
                    
                        coche
                    
                    });

                }

            });

        const contientLigneVide =
            rayons[rayon]
            .some(
                l => !l.produit
            );

        if (
            !contientLigneVide
        ) {

            rayons[rayon]
            .push({

                produit: "",

                quantite: 1,

                coche: false

            });

        }

    });

    await sauvegarderCourse(
        courseActive,
        rayons
    );

    courses =
        await chargerCourses();   

};

window.gererLigneCourse =
async function(champProduit, rayon) {

    const valeur =
        champProduit.value.trim();

    if (valeur === "") {

        const ligne =
            champProduit.closest(
                ".ligneCourse"
            );
    
        const rayonDiv =
            ligne.closest(
                ".rayonCourse"
            );
    
        const lignes =
            rayonDiv.querySelectorAll(
                ".ligneCourse"
            );
    
        if (lignes.length > 1) {
    
            ligne.remove();

            majRayonCoche(
                ligne
            );
    
        }
    
        await sauvegarderCourseActive();
    
        return;
    
    }

    const ligne =
        champProduit.closest(
            ".ligneCourse"
        );

    const rayonDiv =
        ligne.closest(
            ".rayonCourse"
        );

    const lignes =
        rayonDiv.querySelectorAll(
            ".ligneCourse"
        );

    const derniereLigne =
        lignes[
            lignes.length - 1
        ];
    
    if (ligne === derniereLigne) {

        ajouterLigneVide(
            rayon
        );

    }

    const checkbox =
        ligne.querySelector(
            'input[type="checkbox"]'
        );
    
    if (checkbox) {
    
        checkbox.style.visibility =
            "visible";
    
    }

    majRayonCoche(
        ligne
    );
    
    await sauvegarderCourseActive();

};


window.toggleCourseCochee =
function(checkbox) {

    const ligne =
        checkbox.closest(
            ".ligneCourse"
        );

    const produit =
        ligne.querySelector(
            'input[type="text"]'
        );

    produit.classList.toggle(
        "courseCochee",
        checkbox.checked
    );

    majRayonCoche(
        ligne
    );

    sauvegarderCourseActive();

};

window.majRayonCoche =
function(ligne) {

    const rayonDiv =
        ligne.closest(
            ".rayonCourse"
        );

    const titreRayon =
        rayonDiv.querySelector(
            "h3"
        );

    const produits =
        rayonDiv.querySelectorAll(
            ".ligneCourse"
        );

    let total = 0;
    let coches = 0;

    produits.forEach(ligneProduit => {

        const texte =
            ligneProduit.querySelector(
                'input[type="text"]'
            );

        if (
            texte &&
            texte.value.trim() !== ""
        ) {

            total++;

            const coche =
                ligneProduit.querySelector(
                    'input[type="checkbox"]'
                );

            if (
                coche &&
                coche.checked
            ) {

                coches++;

            }

        }

    });

    if (
        total > 0 &&
        total === coches
    ) {
    
        titreRayon.classList.add(
            "rayonTermine"
        );
    
    }
    else {
    
        titreRayon.classList.remove(
            "rayonTermine"
        );
    
    }

};

window.ajouterLigneVide =
function(rayon) {
    
    const rayonDiv =
        document
            .querySelector(
                `.rayonCourse[data-rayon="${rayon}"]`
            );

    if (!rayonDiv) {
        return;
    }

    const index =
        rayonDiv.querySelectorAll(
            ".ligneCourse"
        ).length;

    const idLigne =
        `${rayon}-${index}`;

    const derniereLigne =
        rayonDiv.querySelector(
            ".ligneCourse:last-child input[type='text']"
        );
    
    if (
        derniereLigne &&
        derniereLigne.value.trim() === ""
    ) {
    
        return;
    
    }
    
    rayonDiv.insertAdjacentHTML(
        "beforeend",

        `

        <div
            class="ligneCourse"
            data-rayon="${rayon}"
            data-index="${index}"
        >

            <div class="zoneCheckboxCourse">

                <input
                    type="checkbox"
                    style="visibility:hidden"
                >

            </div>

            <input
                id="produit-${idLigne}"
                type="text"
                placeholder="Produit"
                onblur="
                    gererLigneCourse(
                        this,
                        '${rayon}'
                    )
                "
            >

            <input
                id="quantite-${idLigne}"
                type="number"
                min="1"
                value="1"
                onblur="
                    sauvegarderCourseActive()
                "
            >
            
        </div>

        `
    );

};
