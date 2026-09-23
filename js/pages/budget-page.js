import {
    ajouterDepenseFirestore,
    chargerDepenses,
    supprimerDepenseFirestore,
    modifierDepenseFirestore
} from "./depenses.js";

import {
    chargerRecurrentes,
    ajouterRecurrente,
    supprimerRecurrente,
    modifierRecurrente
}
from "./recurrentes.js";

import {
    moisExiste,
    creerMois,
    ajouterMouvementMois,
    chargerMouvementsMois,
    modifierMouvement
} from "./mois.js";

let nbDepensesAffichees = 30;
let recurrentesInitialisation = [];
let moisGestion =
    moisCourant;
