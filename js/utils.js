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

export function numeroSemaine(date) {

    const d =
        new Date(date);

    d.setHours(
        0, 0, 0, 0
    );

    d.setDate(
        d.getDate() +
        4 -
        (d.getDay() || 7)
    );

    const debutAnnee =
        new Date(
            d.getFullYear(),
            0,
            1
        );

    return Math.ceil(
        (
            (
                d - debutAnnee
            ) / 86400000 + 1
        ) / 7
    );

}

export function masquerZones(...ids) {

    ids.forEach(id => {

        document.getElementById(
            id
        ).style.display = "none";

    });

}
