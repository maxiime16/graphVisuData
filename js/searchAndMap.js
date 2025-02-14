// --------------------------------------------------------------------
// PARTIE 2 : RECHERCHE CIBLÉE AVEC PAGINATION LOCALE (50 par page)
// --------------------------------------------------------------------
const searchBtn = document.getElementById("searchBtn");
const resultsTable = document.getElementById("resultsTable");
const resultsTbody = resultsTable.querySelector("tbody");
const paginationDiv = document.querySelector(".pagination");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");
const foundCountEl = document.getElementById("foundCount");

// Variables globales pour la recherche
let allSearchResults = []; // Toutes les lignes récupérées
let currentSearchPage = 0; // Page courante (0-based)
const PAGE_SIZE = 50; // 50 résultats par page

searchBtn.addEventListener("click", async () => {
  const nom = document.getElementById("searchNom").value.trim().toUpperCase();
  const prenom = document.getElementById("searchPrenom").value.trim().toUpperCase();
  const annee = document.getElementById("searchAnnee").value.trim();
  const dep = document.getElementById("searchDep").value.trim();

  const filters = [];
  if (nom) filters.push(`nom:"${nom}"`);
  if (prenom) filters.push(`prenom:"${prenom}"`);
  if (annee)
    filters.push(`(date_mort:>=${annee}-01-01 AND date_mort:<=${annee}-12-31)`);
  if (dep) filters.push(`code_actuel_departement_deces:${dep}`);

  const qsString = filters.join(" AND ");
  console.log("QS final =", qsString);

  allSearchResults = await fetchAllSearchData(qsString);

  if (allSearchResults.length === 0) {
    foundCountEl.style.display = "none";
  } else {
    foundCountEl.style.display = "block";
    foundCountEl.textContent = `${allSearchResults.length} personnes trouvées après la recherche.`;
  }

  currentSearchPage = 0; // Réinitialiser la page courante
  renderSearchPage(currentSearchPage); // Afficher la première page
  updateMapWithLocalData(allSearchResults); // Mettre à jour la carte
});

async function fetchAllSearchData(qsString) {
  let url = `https://opendata.koumoul.com/data-fair/api/v1/datasets/fichier-personnes-decedees/lines?size=1000`;
  if (qsString) url += `&qs=${encodeURIComponent(qsString)}`;
  url +=
    "&select=nom,prenom,age_deces,date_naissance,date_mort,nom_actuel_ville_deces,nom_actuel_departement_deces,code_actuel_departement_deces";

  let results = [];
  while (url) {
    console.log("Fetching SEARCH:", url);
    const response = await fetch(url);
    if (!response.ok) break;

    const data = await response.json();
    results = results.concat(data.results);
    url = data.next || null;
  }

  console.log("TOTAL SEARCH RESULTS:", results.length);
  return results;
}

function renderSearchPage(pageIndex) {
  const start = pageIndex * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageResults = allSearchResults.slice(start, end);

  resultsTbody.innerHTML = "";

  if (allSearchResults.length === 0) {
    resultsTable.style.display = "none";
    paginationDiv.style.display = "none";
    alert("Aucun résultat trouvé.");
    return;
  }

  resultsTable.style.display = "table";
  paginationDiv.style.display = "block";

  for (const row of pageResults) {
    const tr = document.createElement("tr");
    [
      "nom",
      "prenom",
      "age_deces",
      "date_naissance",
      "date_mort",
      "nom_actuel_ville_deces",
      "nom_actuel_departement_deces",
    ].forEach((key) => {
      const td = document.createElement("td");
      td.textContent = row[key] || "";
      tr.appendChild(td);
    });
    resultsTbody.appendChild(tr);
  }

  prevPageBtn.disabled = pageIndex === 0;
  const maxPage = Math.floor((allSearchResults.length - 1) / PAGE_SIZE);
  nextPageBtn.disabled = pageIndex >= maxPage;

  pageInfo.textContent = `Page ${pageIndex + 1} / ${maxPage + 1}`;
}

prevPageBtn.addEventListener("click", () => {
  if (currentSearchPage > 0) {
    currentSearchPage--;
    renderSearchPage(currentSearchPage);
  }
});

nextPageBtn.addEventListener("click", () => {
  const maxPage = Math.floor((allSearchResults.length - 1) / PAGE_SIZE);
  if (currentSearchPage < maxPage) {
    currentSearchPage++;
    renderSearchPage(currentSearchPage);
  }
});

// --------------------------------------------------------------------
// PARTIE 3 : Carte de France, agrégation locale
// --------------------------------------------------------------------
let map = null;
let departementsLayer = null;
let geojsonData = null;
let departementCounts = {}; // { '75': 123, '59': 42, ... }

function initMap() {
  map = L.map("map", {
    center: [46.8, 2.2], // Centrer sur la France
    zoom: 7, // Zoom initial
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
}

async function loadDepartementsGeoJSON() {
  const geojsonUrl =
    "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson";
  const resp = await fetch(geojsonUrl);
  if (!resp.ok) return null;
  return await resp.json();
}

function aggregateByDepartement(results) {
  const mapCounts = {};
  for (const row of results) {
    const codeDep = row.code_actuel_departement_deces;
    if (!codeDep) continue;
    mapCounts[codeDep] = (mapCounts[codeDep] || 0) + 1;
  }
  return mapCounts;
}

function styleFeature(feature) {
  const codeDep = feature.properties.code;
  const count = departementCounts[codeDep] || 0;
  return {
    color: "#666",
    weight: 1,
    fillColor: getColor(count),
    fillOpacity: 0.7,
  };
}

function getColor(count) {
  if (!count) return "#ffffff";
  else if (count < 10) return "#cccccc";
  else if (count < 50) return "#aaaaaa";
  else if (count < 200) return "#888888";
  else if (count < 1000) return "#555555";
  return "#222222";
}

function updateMapWithLocalData(results) {
  departementCounts = aggregateByDepartement(results);

  if (departementsLayer) map.removeLayer(departementsLayer);

  departementsLayer = L.geoJSON(geojsonData, {
    style: styleFeature,
    onEachFeature: (feature, layer) => {
      const codeDep = feature.properties.code;
      const nomDep = feature.properties.nom;
      const count = departementCounts[codeDep] || 0;
      layer.bindPopup(
        `${nomDep} (code: ${codeDep})<br>Décès filtrés : ${count}`
      );
    },
  }).addTo(map);

  map.fitBounds(departementsLayer.getBounds());
}

window.addEventListener("DOMContentLoaded", async () => {
  initMap();
  geojsonData = await loadDepartementsGeoJSON();
  if (geojsonData) {
    departementsLayer = L.geoJSON(geojsonData, {
      style: styleFeature,
      onEachFeature: (feature, layer) => {
        const codeDep = feature.properties.code;
        const nomDep = feature.properties.nom;
        layer.bindPopup(`${nomDep} (code: ${codeDep})`);
      },
    }).addTo(map);
    map.fitBounds(departementsLayer.getBounds());
  }
});
