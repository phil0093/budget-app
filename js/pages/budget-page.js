import {
    ajouterDepenseFirestore,
    chargerDepenses,
    supprimerDepenseFirestore,
    modifierDepenseFirestore
} from "../services/depenses.js";

import {
    chargerRecurrentes,
    ajouterRecurrente,
    supprimerRecurrente,
    modifierRecurrente
}
from "../services/recurrentes.js";

import {
    moisExiste,
    creerMois,
    ajouterMouvementMois,
    chargerMouvementsMois,
    modifierMouvement
} from "../services/mois.js";

let nbDepensesAffichees = 30;
let recurrentesInitialisation = [];
let moisGestion =
    moisCourant;
