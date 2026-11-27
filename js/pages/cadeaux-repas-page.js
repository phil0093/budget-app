import {
    chargerCadeauxRepas,
    ajouterCadeauRepas,
    supprimerCadeauRepas
}
from "../services/cadeaux-repas.js";
import {masquerZones} from "../utils.js";

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

function dessinerCadeauxRepas(donnees) {

    const cadeaux =
        donnees.filter(
            x => x.type === "cadeau"
        );

    const repas =
        donnees.filter(
            x => x.type === "repas"
        );

    document.getElementById(
        "contenu"
    ).innerHTML = `

        <h2>🎁 Cadeaux et repas</h2>

        <div class="actionsListes">

            <button
                class="btnNouvelleListe"
                onclick="
                    ouvrirPopupCadeauRepas(
                        'cadeau'
                    )
                "
            >
                ➕ Nouveau cadeau
            </button>

        </div>

        ${dessinerSection(
            "🎁 Cadeaux",
            cadeaux,
            "cadeau"
        )}

        <br>

        <div class="actionsListes">

            <button
                class="btnNouvelleListe"
                onclick="
                    ouvrirPopupCadeauRepas(
                        'repas'
                    )
                "
            >
                ➕ Nouveau repas
            </button>

        </div>

        ${dessinerSection(
            "🍽️ Repas",
            repas,
            "repas"
        )}

    `;

}

function dessinerSection(
    titre,
    elements
) {

    const groupes = {};

    elements.forEach(element => {

        if (
            !groupes[element.personne]
        ) {

            groupes[element.personne] = [];

        }

        groupes[element.personne].push(
            element
        );

    });

    return `

        <h3>${titre}</h3>

        ${Object.keys(groupes)
            .sort()
            .map(personne => `

                <div
                    class="enteteRecette"
                    onclick="
                        toggleCadeauxRepas(
                            '${personne}'
                        )
                    "
                >
                    ${personne}
                </div>

                <div
                    id="pers-${personne}"
                    style="
                        display:${
                            elementsOuverts.has(
                                personne
                            )
                            ? "block"
                            : "none"
                        };
                    "
                >

                    ${groupes[personne]
                        .map(item => `

                            <div
                                class="carteDocument"
                            >

                                <div>

                                    <strong>
                                        ${item.evenement}
                                    </strong>

                                    <br>

                                    <small>
                                        ${item.date}
                                    </small>

                                    <br>

                                    ${item.description}

                                </div>

                                <button
                                    class="btn-action"
                                    onclick="
                                        supprimerElementCadeauRepas(
                                            '${item.id}'
                                        )
                                    "
                                >
                                    🗑️
                                </button>

                            </div>

                        `)
                        .join("")}

                </div>

            `)
            .join("")}

    `;
}

window.toggleCadeauxRepas =
function(personne) {

    if (
        elementsOuverts.has(
            personne
        )
    ) {

        elementsOuverts.delete(
            personne
        );

    } else {

        elementsOuverts.add(
            personne
        );

    }

    afficherCadeauxRepas();

};

window.ouvrirPopupCadeauRepas =
function(type) {

    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            id="popupCadeauRepas"
            class="popupFond"
        >

            <div
                class="popupContenu"
            >

                <h3>

                    ${
                        type === "cadeau"
                        ? "🎁 Nouveau cadeau"
                        : "🍽️ Nouveau repas"
                    }

                </h3>

                <input
                    id="crPersonne"
                    placeholder="Personne"
                >

                <input
                    id="crDate"
                    type="date"
                >

                <input
                    id="crEvenement"
                    placeholder="Evènement"
                >

                <textarea
                    id="crDescription"
                    placeholder="Cadeau / Repas"
                ></textarea>

                <div class="actionsCoursePopup">

                    <button
                        class="btnAjouterCoursePopup"
                        onclick="
                            enregistrerCadeauRepas(
                                '${type}'
                            )
                        "
                    >
                        Enregistrer
                    </button>

                    <button
                        class="btnFermerCoursePopup"
                        onclick="
                            document
                                .getElementById(
                                    'popupCadeauRepas'
                                )
                                .remove()
                        "
                    >
                        Fermer
                    </button>

                </div>

            </div>

        </div>

        `
    );

};

window.enregistrerCadeauRepas =
async function(type) {

    await ajouterCadeauRepas({

        type,

        personne:
            document.getElementById(
                "crPersonne"
            ).value,

        date:
            document.getElementById(
                "crDate"
            ).value,

        evenement:
            document.getElementById(
                "crEvenement"
            ).value,

        description:
            document.getElementById(
                "crDescription"
            ).value

    });

    document
        .getElementById(
            "popupCadeauRepas"
        )
        .remove();

    afficherCadeauxRepas();

};

window.supprimerElementCadeauRepas =
async function(id) {

    if (
        !confirm(
            "Supprimer cet élément ?"
        )
    ) {
        return;
    }

    await supprimerCadeauRepas(
        id
    );

    afficherCadeauxRepas();

};

