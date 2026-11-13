import {
    chargerMenus,
    sauverMenu,
    supprimerMenusAnciens
}
from "../services/menus.js";

import {
    chargerRecettes
}
from "../services/recette.js";

import {
    formatDateLocale,
    masquerZones
}
from "../utils.js";

let recettes = [];

window.afficherMenus = async function() {
    
    document
        .getElementById("sidebar")
        .classList
        .remove("open");

    masquerZones(
        "zoneConnexion",
        "zoneBudget",
        "budgetActions"
    );
        
    await supprimerMenusAnciens();

    const menus =
        await chargerMenus();

    recettes =
        await chargerRecettes();
    
    const jours = [];

    const date =
        new Date();

    for (let i = 0; i < 10; i++) {

        const d =
            new Date(date);

        d.setDate(d.getDate() + i);

        jours.push(d);

    }
    
    const lignes =
        jours.map(d => {

    const dateIso =
        formatDateLocale(d);

    const menu =
        menus[dateIso] || {};

    const jour =
        d.toLocaleDateString("fr-FR",{weekday: "short"});

    return `
    
        <tr>
        
            <td>${jour}</td>
        
            <td>
            
                <textarea
                    id="midi-${dateIso}"
                    oninput="
                        rechercherRecettes(
                            this,
                            '${dateIso}',
                            'midi'
                        )
                    "
                    onblur="sauvegarderMenuLigne('${dateIso}')"
                >${menu.midi || ""}</textarea>
                <div
                    id="suggestions-midi-${dateIso}"
                    class="suggestionsRecettes"
                ></div>

            </td>
            
            <td>

                <textarea
                    id="soir-${dateIso}"
                    oninput="
                        rechercherRecettes(
                            this,
                            '${dateIso}',
                            'soir'
                        )
                    "
                    onblur="sauvegarderMenuLigne('${dateIso}')"
                >${menu.soir || ""}</textarea>

                <div
                    id="suggestions-soir-${dateIso}"
                    class="suggestionsRecettes"
                ></div>

            </td>
        
        </tr>
    
    `;
    
            }).join("");
    
        document.getElementById("contenu").innerHTML = `
    
            <h2>Menus</h2>
            
            <table class="tableMenus">
            
                <thead>
                
                    <tr>
                    
                        <th>Jour</th>
                        <th>Midi</th>
                        <th>Soir</th>
                    
                    </tr>
                
                </thead>
                
                <tbody>
                
                    ${lignes}
                
                </tbody>
            
            </table>
        
        `;
    
};

window.rechercherRecettes =
function(zone, date, repas) {

    const lignes =
        zone.value
            .split("\n");

    const texte =
        lignes[
            lignes.length - 1
        ]
        .trim()
        .toLowerCase();

    const suggestions =
        recettes.filter(r =>
    
            r.nom &&
            texte.length >= 2 &&
    
            r.nom
                .toLowerCase()
                .includes(texte)
    
        );

    const div =
        document.getElementById(
            `suggestions-${repas}-${date}`
        );

    if (
        !texte ||
        suggestions.length === 0
    ) {

        div.innerHTML = "";

        return;

    }

    div.innerHTML =
        suggestions
            .slice(0, 5)
            .map(r => `

                <div
                    class="suggestionRecette"
                    onclick="
                        choisirRecette(
                            '${date}',
                            '${repas}',
                            '${r.nom}',
                            '${r.id}'
                        )
                    "
                >

                    🍝 ${r.nom}

                </div>

            `)
            .join("");

};

window.sauvegarderMenuLigne =async function(date) {

    const midi =
        document.getElementById(`midi-${date}`).value;
    
    const soir =
        document.getElementById(`soir-${date}`).value;
    
    await sauverMenu(date, midi, soir);

};
