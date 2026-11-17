import {
    RAYONS
}
from "./constants/rayons.js";

export function creerStructureCourses() {

    const structure = {};

    RAYONS.forEach(rayon => {

        structure[rayon] = [

            {
                produit: "",
                quantite: 1,
                coche: false
            }

        ];

    });

    return structure;

}
