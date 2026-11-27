

let elementsOuverts =
    new Set();

window.afficherCadeauxRepas =
async function() {

    masquerZones(
        "zoneConnexion",
        "zoneBudget",
        "budgetActions"
    );

    document
        .getElementById("sidebar")
        .classList
        .remove("open");

    const donnees =
        await chargerCadeauxRepas();

    dessinerCadeauxRepas(
        donnees
    );

};
