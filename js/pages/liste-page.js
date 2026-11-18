import {
    chargerListes,
    sauvegarderListe,
    supprimerListe,
    renommerListe
}
from "../services/liste.js";
import {masquerZones} from "../utils.js";

let listes = [];
let listeActive = "";

window.afficherListe = async function() {
    document
        .getElementById("sidebar")
        .classList
        .remove("open");

    masquerZones(
        "zoneConnexion",
        "zoneBudget",
        "budgetActions"
    );

    if (listes.length === 0) {

        document.getElementById(
            "contenu"
        ).innerHTML = `
    
            <h2>
                📝 Listes
            </h2>
    
            <button
                class="btnNouvelleListe"
                onclick="
                    nouvelleListe()
                "
            >
                ➕ Nouvelle liste
            </button>
    
        `;
    
        return;
    
    }
    
    listes = await chargerListes();

    if (!listeActive) {
        listeActive = listes[0].nom;
    }

    dessinerListe();

};

function dessinerListe() {

    const liste = 
        listes.find(x => x.nom === listeActive);
    
    if (!liste) {
        return;
    }

    const options =
        listes.map(l => `

            <option
                value="${l.nom}"
                ${l.nom === listeActive ? "selected" : ""}>
                ${l.nom}
            </option>

        `).join("");

    const lignes =
        liste.lignes.map((ligne, index) => {

            const texte =
                ligne?.texte || "";

            const coche =
                ligne?.coche || false;

            const vide =
                texte.trim() === "";
            
            const niveau =
                ligne?.niveau || 0;
            return `

                <div class="ligneListe" style="padding-left: ${niveau * 25}px;">

                    ${
                        !vide
                        ? `
                            <input
                                type="checkbox"
                                id="check-${index}"
                                ${coche ? "checked" : ""}
                                onchange="toggleListe(${index})">
                          `
                        : ""
                    }

                   <textarea
                        id="ligne-${index}"
                        data-niveau="${niveau}"
                        class="
                            ${vide ? "ligneVide" : ""}
                            ${coche ? "listeCochee" : ""}
                        "
                        style="
                            font-size:${niveau ? "0.9em" : "1em"};
                        "
                        oninput="majAffichageLigne(${index})"
                        onblur="sauvegarderListeActive()"
                        onkeydown="
                            gererEntreeListe(
                                event,
                                ${index}
                            )
                        "
                    >${texte}</textarea>
                </div>

            `;

        }).join("");

    document.getElementById(
        "contenu"
    ).innerHTML = `

        <h2>Listes</h2>

        <button
            class="btnNouvelleListe"
            onclick="nouvelleListe()">
        
            ➕ Nouvelle liste
        
        </button>
        
        <div class="enteteCourses">
        
            <select
                class="selectListe"
                onchange="
                    changerListe(
                        this.value
                    )
                ">
                ${options}
            </select>
        
            <button
                class="btnModifierListe"
                onclick="
                    renommerListeActive()
                "
                title="Renommer la liste"
            >
                ✏️
            </button>
        
            <button
                class="btnCorbeilleListe"
                onclick="
                    supprimerListeActive()
                "
                title="Supprimer la liste"
            >
                🗑️
            </button>
        
        </div>

        <div class="listeContainer">

            ${lignes}

        </div>

    `;
}

window.toggleListe = async function(index) {

    const checkbox =
        document.getElementById(`check-${index}`);

    const zone =
        document.getElementById(`ligne-${index}`);

    zone.classList.toggle("listeCochee", checkbox.checked);

    await sauvegarderListeActive();

    listes = await chargerListes();
    
    dessinerListe();
    
    await verifierSuppressionAuto();

};

window.gererEntreeListe = function(event, index) {

    const zone =
        document.getElementById(`ligne-${index}`);

    if (event.key === " " && zone.value === "") {
    
        event.preventDefault();
    
        zone.dataset.niveau = "1";

        zone.closest(".ligneListe").style.paddingLeft = "25px";
        
        zone.style.fontSize = "0.9em";

        majAffichageLigne(index);
        sauvegarderListeActive();
        
        return;
    
    }
    
    if (event.key === "Enter") {

        event.preventDefault();

        const lignes =
            document.querySelectorAll("[id^='ligne-']");

        const nouveauIndex =
            lignes.length;

        const div =
            document.createElement("div");

        div.className =
            "ligneListe";

        div.innerHTML = `
            <textarea
                id="ligne-${nouveauIndex}"
                oninput="majAffichageLigne(${nouveauIndex})"
                onblur="sauvegarderListeActive()"
                onkeydown="
                    gererEntreeListe(
                        event,
                        ${nouveauIndex}
                    )
                "
            ></textarea>
        `;

        zone
            .closest(".ligneListe")
            .after(div);

        document
            .getElementById(
                `ligne-${nouveauIndex}`
            )
            .focus();

        return;
    }

    if (event.key === "Backspace" && zone.value.trim() === "") {

        const ligne =
            zone.closest(".ligneListe");

        const toutesLesLignes =
            document.querySelectorAll(".ligneListe");

        if (toutesLesLignes.length <= 1) {
            return;
        }

        event.preventDefault();

        const precedente =
            ligne.previousElementSibling;

        ligne.remove();

        if (precedente && precedente.querySelector("textarea")) {
            precedente
                .querySelector("textarea")
                .focus();
        }

        sauvegarderListeActive();
    }

};

window.changerListe = function(nom) {

    listeActive = nom;

    dessinerListe();

};

window.nouvelleListe = async function() {

    const nom =
        prompt("Nom de la liste");

    if (!nom) return;

    await sauvegarderListe(nom, [{texte: "", coche: false}]);
    
    listes =
        await chargerListes();

    listeActive =
        nom;

    dessinerListe();

};

window.sauvegarderListeActive = async function() {

    const lignes = [];

    document
        .querySelectorAll("[id^='ligne-']")
        .forEach((zone, index) => {

            const checkbox =
                document.getElementById(`check-${index}`);

            lignes.push({
                texte: zone.value,
                coche:
                    checkbox
                    ? checkbox.checked
                    : false,
                niveau:
                    parseInt(
                        zone.dataset.niveau || 0
                    )
            });

        });

    await sauvegarderListe(listeActive, lignes);
    listes = await chargerListes();

};

window.majAffichageLigne = function(index) {

    const zone =
        document.getElementById(`ligne-${index}`);

    const ligne =
        zone.closest(".ligneListe");

    let checkbox =
        document.getElementById(`check-${index}`);

    const texte =
        zone.value.trim();

    if (texte !== "" && !checkbox) {

        checkbox = document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.id = `check-${index}`;

        checkbox.onchange = () => toggleListe(index);

        ligne.insertBefore(checkbox, zone);

    }

    if (texte === "" && checkbox) {
        checkbox.remove();
    }

    sauvegarderListeActive();
};

window.supprimerListeActive = async function(confirmer = true) {

    if (confirmer) {

        const confirmation =
            confirm(`Supprimer la liste "${listeActive}" ?`);

        if (!confirmation) {
            return;
        }

    }

    await supprimerListe(listeActive);

    listes =
        await chargerListes();

    if (listes.length === 0) {

        listeActive = "";
    
        afficherListe();
    
        return;
    
    }

    listeActive =listes[0].nom;

    dessinerListe();

};

async function verifierSuppressionAuto() {

    const lignes = [];

    document
        .querySelectorAll("[id^='ligne-']")
        .forEach((zone, index) => {

            const texte =
                zone.value.trim();

            if (texte === "") {
                return;
            }

            const checkbox =
                document.getElementById(`check-${index}`);

            lignes.push(checkbox && checkbox.checked);

        });

    if (lignes.length === 0) {
        return;
    }

    const toutesCochees =
        lignes.every(x => x === true);

    if (!toutesCochees) {
        return;
    }

    const confirmation =
        confirm("Tous les articles sont cochés.\n\nSupprimer la liste ?");

    if (!confirmation) {
        return;
    }

    await supprimerListeActive(false);

}

window.renommerListeActive =
async function() {

    const nouveauNom =
        prompt(
            "Nouveau nom de la liste",
            listeActive
        );

    if (
        !nouveauNom ||
        nouveauNom === listeActive
    ) {
        return;
    }

    const existe =
        listes.some(
            l =>
                l.nom ===
                nouveauNom
        );

    if (existe) {

        alert(
            "Une liste porte déjà ce nom."
        );

        return;

    }

    await renommerListe(
        listeActive,
        nouveauNom
    );

    listes =
        await chargerListes();

    listeActive =
        nouveauNom;

    dessinerListe();

};
