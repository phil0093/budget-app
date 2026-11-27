import "./pages/menus-page.js";
import "./pages/liste-page.js";
import "./pages/todo-page.js";
import "./pages/calendrier-page.js";
import "./pages/budget-page.js";
import "./pages/note-page.js";
import "./pages/recette-page.js";
import "./pages/course-page.js";
import "./pages/documents-page.js";
import "./pages/cadeaux-repas-page.js";
import "./pages/recherche-page.js";
import {masquerZones} from "./utils.js";
import {initialiserNotifications} from "./services/notifications.js";
import { chargerRdvsMois } from "./services/calendrier.js";

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("./sw.js")
    
}

initialiserNotifications();

window.toggleMenu = function() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const ouverture =
        !sidebar.classList.contains(
            "open"
        );

    if (ouverture) {

        document
            .querySelectorAll(
                ".sousMenu"
            )
            .forEach(menu => {

                menu.classList.remove(
                    "open"
                );

            });

    }

    sidebar.classList.toggle(
        "open"
    );

};

window.toggleSousMenu =
function(type) {

    const menu =
        document.getElementById(
            `sousMenu${
                type.charAt(0).toUpperCase()
                + type.slice(1)
            }`
        );

    menu.classList.toggle(
        "open"
    );

};

window.replierTousSousMenus =
function() {

    document
        .querySelectorAll(".sousMenu")
        .forEach(menu => {

            menu.classList.remove(
                "open"
            );

        });

};

window.afficherAccueil =
async function() {

    document.getElementById(
        "zoneConnexion"
    ).style.display = "block";

    document.getElementById(
        "zoneBudget"
    ).style.display = "block";

    masquerZones("budgetActions");
    
    document.getElementById(
        "searchButton"
    ).style.display = "block";
    
    const rdvsMois =
        await chargerRdvsMois();

    const tousLesRdvs =
        Object.values(rdvsMois)
        .flat();

    const aujourdHui =
        new Date();
    
    aujourdHui.setHours(
        0,
        0,
        0,
        0
    );
    
    const dans7Jours =
        new Date(
            aujourdHui
        );
    
    dans7Jours.setDate(
        dans7Jours.getDate() + 7
    );

    const maintenant =
        new Date();

    const aujourdHuiTexte =
                maintenant.getFullYear() +
                "-" +
                String(
                    maintenant.getMonth() + 1
                ).padStart(2, "0") +
                "-" +
                String(
                    maintenant.getDate()
                ).padStart(2, "0");

    const rdvsAVenir =
        tousLesRdvs
        .filter(rdv => {
    
            const dateDebut =
                new Date(
                    rdv.dateDebut +
                    "T00:00:00"
                );
    
            if (
                dateDebut < aujourdHui ||
                dateDebut > dans7Jours
            ) {
                return false;
            }
            
            const estAujourdHui =
                rdv.dateDebut === aujourdHuiTexte;
    
            if (!estAujourdHui) {
                return true;
            }

            if (
                rdv.heureFin === "00:00"
            ) {
                return true;
            }
    
            const finRdv =
                new Date(
                    `${rdv.dateDebut}T${rdv.heureFin}:00`
                );
    
            return finRdv >= maintenant;
    
        })
        .sort((a, b) => {

            const dateA =
                `${a.dateDebut} ${a.heureDebut}`;
    
            const dateB =
                `${b.dateDebut} ${b.heureDebut}`;
    
            return dateA.localeCompare(
                dateB
            );
    
        });
    
    const htmlRdvs =
        rdvsAVenir
        .map(rdv => `

            <div
                class="rdvAccueil"
                onclick="
                    ouvrirRdvLectureSeule(
                        '${rdv.id}'
                    )
                "
            >

                <div class="enteteRdvAccueil">

                    <span
                        class="
                            pastilleRdv
                            ${couleurRdv(rdv)}
                        "
                    ></span>
                
                    <strong>
                        ${new Date(
                            rdv.dateDebut
                        ).toLocaleDateString(
                            "fr-FR"
                        )}
                        -
                        ${rdv.heureDebut}
                    </strong>
                
                </div>
                
                <div class="nomRdvAccueil">
                    ${rdv.nom}
                </div>

            </div>

        `)
        .join("");

    document.getElementById(
        "contenu"
    ).innerHTML = `

        <h2>
            📅 Prochains rendez-vous
        </h2>

        ${
            htmlRdvs ||
            "<p>Aucun rendez-vous sur les 7 prochains jours.</p>"
        }

    `;

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

    masquerZones("zoneConnexion");
        
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

window.addEventListener("load", () => {

    afficherAccueil();

});

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
