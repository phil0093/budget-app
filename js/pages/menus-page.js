import {
    chargerMenus,
    sauverMenu,
    supprimerMenusAnciens
}
from "../services/menus.js";

import {
    formatDateLocale
}
from "../utils.js";

window.afficherMenus =
    async function() {
    
        document
            .getElementById("sidebar")
            .classList
            .remove("open");
    
        document
            .getElementById("zoneBudget")
            .style.display =
            "none";

        document.getElementById(
            "budgetActions"
        ).style.display = "none";
        
        await supprimerMenusAnciens();
    
        const menus =
            await chargerMenus();
    
        const jours = [];
    
        const date =
            new Date();
    
        for (
            let i = 0;
            i < 8;
            i++
        ) {
    
            const d =
                new Date(date);
    
            d.setDate(
                d.getDate() + i
            );
    
            jours.push(
                d
            );
    
        }
    
        const lignes =
            jours.map(d => {
    
                const dateIso =
                    formatDateLocale(d);
    
                const menu =
                    menus[dateIso] || {};
    
                const jour =
                    d.toLocaleDateString(
                        "fr-FR",
                        {
                            weekday:
                            "short"
                        }
                    );
    
                return `
    
    <tr>
    
    <td>${jour}</td>
    
    <td>
    
        <textarea
            id="midi-${dateIso}"
            onblur="sauvegarderMenuLigne('${dateIso}')"
        >${menu.midi || ""}</textarea>

    </td>
    
    <td>
    
        <textarea
            id="soir-${dateIso}"
            onblur="sauvegarderMenuLigne('${dateIso}')"
        >${menu.soir || ""}</textarea>

    </td>
    
    </tr>
    
    `;
    
            }).join("");
    
        document
            .getElementById(
                "contenu"
            ).innerHTML = `
    
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

window.sauvegarderMenuLigne =
async function(date) {

    const midi =
        document
        .getElementById(
            `midi-${date}`
        )
        .value;

    const soir =
        document
        .getElementById(
            `soir-${date}`
        )
        .value;

    await sauverMenu(
        date,
        midi,
        soir
    );

};
