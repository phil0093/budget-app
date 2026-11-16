import "./pages/menus-page.js";
import "./pages/courses-page.js";
import "./pages/todo-page.js";
import "./pages/calendrier-page.js";
import "./pages/budget-page.js";
import "./pages/note-page.js";
import "./pages/recette-page.js";
import {masquerZones} from "./utils.js";
import {initialiserNotifications} from "./services/notifications.js";

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

window.afficherAccueil = function() {

    document.getElementById(
        "zoneConnexion"
    ).style.display = "block";
    
    document.getElementById(
        "zoneBudget"
    ).style.display = "block";

    masquerZones("budgetActions");

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
