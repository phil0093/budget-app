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



