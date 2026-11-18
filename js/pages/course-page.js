import {
    chargerCourses,
    sauvegarderCourse,
    supprimerCourse,
    mettreAJourCoche,
    renommerCourse
}
from "../services/course.js";

import {masquerZones} from "../utils.js";
import {
    RAYONS,
    ICONES_RAYONS
} from "../constants/rayons.js";
import {creerStructureCourses} from "../utils-courses.js";

import {
    chargerProduits,
    ajouterProduit
}
from "../services/produit.js";

let courses = [];
let courseActive = "";
let produits = [];

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

    produits =
        await chargerProduits();

    if (
        courses.length === 0
    ) {
    
        document.getElementById(
            "contenu"
        ).innerHTML = `
    
            <h2>🛒 Courses</h2>
    
            <button
                class="btnNouvelleListe"
                onclick="
                    nouvelleCourse()
                "
            >
                ➕ Nouvelle liste
            </button>
    
        `;
    
        return;
    
    }
    
    if (!courseActive) {
    
        courseActive =
            courses[0].nom;
    
    }
    
    dessinerCourses();

};

function normaliserTexte(texte) {

    return texte
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}

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
            lignesAvecProduit.length === 0 ||
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
                            oninput="
                                afficherSuggestions(
                                    this,
                                    '${rayon}',
                                    '${idLigne}'
                                )
                            "
                            onblur="
                                gererLigneCourse(
                                    this,
                                    '${rayon}'
                                )
                            "
                        >
                        
                        <div
                            id="suggestions-${idLigne}"
                            class="suggestionsProduits"
                        ></div>

                        <input
                            id="quantite-${idLigne}"
                            type="number"
                            min="1"
                            value="${
                                ligne.produit
                                    ? (ligne.quantite || 1)
                                    : ""
                            }"
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

            <button
                class="btnNouvelleListe"
                onclick="
                    nouvelleCourse()
                "
            >
                ➕ Nouvelle liste
            </button>
            
            <div class="enteteCourses">

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
                    class="btnModifierListe"
                    onclick="
                        renommerCourseActive()
                    "
                    title="Renommer la liste"
                >
                    ✏️
                </button>
            
                <button
                    class="btnCorbeilleListe"
                    onclick="
                        supprimerCourseActive()
                    "
                    title="Supprimer la liste"
                >
                    🗑️
                </button>
            
            </div>

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
    
    afficherCourses();
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
    
        courseActive = "";
    
        afficherCourses();
    
        return;
    
    }
    
    courseActive =
        courses[0].nom;
    
    dessinerCourses();

};

window.renommerCourseActive =
async function() {

    const nouveauNom =
        prompt(
            "Nouveau nom de la liste",
            courseActive
        );

    if (
        !nouveauNom ||
        nouveauNom === courseActive
    ) {
        return;
    }

    const dejaExistante =
        courses.some(
            c =>
                c.nom ===
                nouveauNom
        );

    if (dejaExistante) {

        alert(
            "Une liste porte déjà ce nom."
        );

        return;

    }

    await renommerCourse(
        courseActive,
        nouveauNom
    );

    courses =
        await chargerCourses();

    courseActive =
        nouveauNom;

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

    if (valeur !== "") {

        const ligne =
            champProduit.closest(
                ".ligneCourse"
            );
    
        const quantite =
            ligne.querySelector(
                'input[type="number"]'
            );
    
        if (
            quantite &&
            quantite.value === ""
        ) {
    
            quantite.value = 1;
    
        }
    
    }
    
    const existe =
        produits.some(
            produit =>
                normaliserTexte(
                    produit.nom
                ) ===
                normaliserTexte(
                    valeur
                )
                &&
                produit.rayon === rayon
        );

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

            const rayonDiv =
                ligne.closest(
                    ".rayonCourse"
                );
            
            ligne.remove();
            
            majRayonCocheDepuisRayon(
                rayonDiv
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

    if (
        !existe
    ) {

        await ajouterProduit(
            valeur,
            rayon
        );

        produits =
            await chargerProduits();

    }

    await sauvegarderCourseActive();

};

window.toggleCourseCochee =
async function(checkbox) {

    const ligne =
        checkbox.closest(
            ".ligneCourse"
        );

    const rayon =
        ligne.dataset.rayon;

    const index =
        parseInt(
            ligne.dataset.index
        );

    await mettreAJourCoche(
        courseActive,
        rayon,
        index,
        checkbox.checked
    );

    courses =
        await chargerCourses();

    const course =
        courses.find(
            c => c.nom === courseActive
        );

    if (!course) {

        dessinerCourses();
        return;
    
    }
    
    let toutCoche = true;
    let nbProduits = 0;

    
    RAYONS.forEach(rayon => {
    
        const lignes =
            course.rayons?.[rayon] || [];
    
        lignes.forEach(ligne => {
    
            if (
                ligne.produit &&
                ligne.produit.trim() !== ""
            ) {
            
                nbProduits++;
            
                if (
                    !ligne.coche
                ) {
            
                    toutCoche = false;
            
                }
            
            }
    
        });
    
    });
    
    if (
        nbProduits > 0 &&
        toutCoche
    ) {

    
        const supprimer =
            confirm(
                `Tous les produits de "${courseActive}" sont cochés.\n\nVoulez-vous supprimer cette liste ?`
            );
    
        if (supprimer) {
    
            await supprimerCourse(
                courseActive
            );
    
            courses =
                await chargerCourses();
    
            if (
                courses.length === 0
            ) {
            
                courseActive = "";
            
                afficherCourses();
            
                return;
            
            }
    
            courseActive =
                courses[0].nom;
    
        }
    
    }
    
    dessinerCourses();


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
        total === 0 ||
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
                oninput="
                    afficherSuggestions(
                        this,
                        '${rayon}',
                        '${idLigne}'
                    )
                "
                onblur="
                    gererLigneCourse(
                        this,
                        '${rayon}'
                    )
                "
            >
            
            <div
                id="suggestions-${idLigne}"
                class="suggestionsProduits"
            ></div>

            <input
                id="quantite-${idLigne}"
                type="number"
                min="1"
                value=""
                onblur="
                    sauvegarderCourseActive()
                "
            >
            
        </div>

        `
    );

};

window.afficherSuggestions =
function(
    champProduit,
    rayon,
    idLigne
) {

    const texte =
        champProduit.value
        .trim()
        .toLowerCase();

    const conteneur =
        document.getElementById(
            `suggestions-${idLigne}`
        );

    if (
        !conteneur
    ) {
        return;
    }

    if (
        texte === ""
    ) {

        conteneur.innerHTML = "";

        return;

    }

    const recherche =
        normaliserTexte(
            texte
        );
    
    const suggestions =
        produits
        .filter(produit => {
    
            if (
                produit.rayon !== rayon
            ) {
                return false;
            }
    
            const mots =
                normaliserTexte(
                    produit.nom
                )
                .split(" ");
    
            return mots.some(
                mot =>
                    mot.startsWith(
                        recherche
                    )
            );
    
        })
        .sort(
            (a, b) =>
                a.nom.localeCompare(
                    b.nom
                )
        )
        .slice(0, 5);

    conteneur.innerHTML =
        suggestions
        .map(produit => `

            <div
                class="suggestionProduit"
                onclick="
                    choisirProduit(
                        '${idLigne}',
                        '${produit.nom.replace(/'/g, "\\'")}'
                    )
                "
            >

                ${produit.nom}

            </div>

        `)
        .join("");

};

window.choisirProduit =
function(
    idLigne,
    nomProduit
) {

    const champ =
        document.getElementById(
            `produit-${idLigne}`
        );

    if (!champ) {
        return;
    }

    champ.value =
        nomProduit;

    const suggestions =
        document.getElementById(
            `suggestions-${idLigne}`
        );

    if (suggestions) {

        suggestions.innerHTML = "";

    }

};

window.majRayonCocheDepuisRayon =
function(rayonDiv) {

    if (!rayonDiv) {
        return;
    }

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
        total === 0 ||
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
