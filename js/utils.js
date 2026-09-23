export function formatDateLocale(date) {

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

export function masquerZones(...ids) {

    ids.forEach(id => {

        document.getElementById(
            id
        ).style.display = "none";

    });

}
