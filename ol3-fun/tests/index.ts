export function run() {
    let l = window.location;
    let path = `${l.origin}${l.pathname}?run=ol3-fun/tests/`;
    let labs = `
    html
    `;

    let styles = document.createElement("style");
    document.head.appendChild(styles);

    styles.innerText += `
    #map {
        display: none;
    }
    .test {
        margin: 20px;
    }
    `;

    let labDiv = document.createElement("div");
    document.body.appendChild(labDiv);

    labDiv.innerHTML = labs
        .split(/ /)
        .map(v => v.trim())
        .filter(v => !!v)
        //.sort()
        .map(lab => `<div class='test'><a href='${path}${lab}&debug=1'>${lab}</a></div>`)
        .join("\n");

};