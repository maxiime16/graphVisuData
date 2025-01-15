const selectEl = document.getElementById("yearSelect");
const progressBar = document.getElementById("progressBar");
const loadingInfo = document.getElementById("loadingInfo");
let myChartInstance = null;
let yearlyChartInstance = null;

// Générer les options d'années (1970 à 2024)
for (let an = 1970; an <= 2024; an++) {
  const opt = document.createElement("option");
  opt.value = an;
  opt.textContent = an;
  selectEl.appendChild(opt);
}
selectEl.value = "2005"; // Année sélectionnée par défaut

document.getElementById("fetchDataBtn").addEventListener("click", async () => {
  const year = selectEl.value;
  progressBar.value = 0;
  loadingInfo.textContent = `Chargement des données pour ${year}...`;
  console.log(`=== Début de chargement pour l'année ${year} ===`);

  const allResults = await fetchAllDataYear(year);

  console.log(`Total de lignes final pour ${year} :`, allResults.length);
  if (allResults.length === 0) {
    loadingInfo.textContent = `Aucune donnée trouvée pour l'année ${year}.`;
  } else {
    loadingInfo.textContent = `Données chargées : ${allResults.length} enregistrements.`;
  }
  buildChart(allResults, year);
});

async function fetchAllDataYear(year) {
  let url =
    "https://opendata.koumoul.com/data-fair/api/v1/datasets/fichier-personnes-decedees/lines" +
    `?qs=date_mort:>=${year}-01-01%20AND%20date_mort:<=${year}-12-31` +
    "&select=age_deces,sexe" +
    "&size=1000";

  let allResults = [];
  let pageCount = 0;

  while (url) {
    const response = await fetch(url);
    if (!response.ok) break;

    const data = await response.json();
    allResults = allResults.concat(data.results);
    pageCount++;

    progressBar.value = (pageCount / (data.total / 1000)) * 100;
    url = data.next || null;
  }

  progressBar.value = 100; // Fin
  return allResults;
}

function buildChart(allResults, year) {
  if (myChartInstance) myChartInstance.destroy();

  const countsByBracketAndSex = {};
  for (const row of allResults) {
    const age = parseInt(row.age_deces, 10);
    if (Number.isNaN(age)) continue;

    const bracketStart = Math.floor(age / 5) * 5;
    const bracketLabel = `${bracketStart}-${bracketStart + 4}`;

    if (!countsByBracketAndSex[bracketLabel]) {
      countsByBracketAndSex[bracketLabel] = { male: 0, female: 0 };
    }
    if (row.sexe === "1") countsByBracketAndSex[bracketLabel].male++;
    else if (row.sexe === "2") countsByBracketAndSex[bracketLabel].female++;
  }

  const brackets = Object.keys(countsByBracketAndSex).sort(
    (a, b) => parseInt(a.split("-")[0]) - parseInt(b.split("-")[0])
  );
  const males = brackets.map((b) => countsByBracketAndSex[b].male);
  const females = brackets.map((b) => countsByBracketAndSex[b].female);

  const ctx = document.getElementById("myChart").getContext("2d");
  myChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: brackets,
      datasets: [
        {
          label: "Hommes",
          data: males,
          backgroundColor: "rgba(10, 163, 48, 0.94)",
        },
        {
          label: "Femmes",
          data: females,
          backgroundColor: "rgba(255, 132, 0, 0.79)",
        },
      ],
    },
    options: {
      responsive: false,
      scales: {
        x: { title: { display: true, text: "Tranches d'âges (ans)" } },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Nombre de décès" },
        },
      },
      plugins: {
        title: { display: true, text: `Décès en ${year} par âge et par sexe` },
      },
    },
  });
}

async function fetchYearlyTotals() {
  const startYear = 1970;
  const endYear = 2024;
  const yearlyTotals = [];

  for (let year = startYear; year <= endYear; year++) {
    const url = `https://opendata.koumoul.com/data-fair/api/v1/datasets/fichier-personnes-decedees/values_agg?field=date_mort&metric=count&qs=date_mort:>=${year}-01-01%20AND%20date_mort:<=${year}-12-31`;
    const response = await fetch(url);
    const data = await response.json();

    yearlyTotals.push({ year, total: data.total });
  }

  return yearlyTotals;
}

async function buildYearlyChart() {
  const yearlyData = await fetchYearlyTotals();
  const years = yearlyData.map((data) => data.year);
  const totals = yearlyData.map((data) => data.total);

  const ctx = document.getElementById("yearlyChart").getContext("2d");
  if (yearlyChartInstance) yearlyChartInstance.destroy();

  yearlyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: "Nombre de décès par année",
          data: totals,
          borderColor: "rgba(10, 163, 48, 0.94)",
          backgroundColor: "rgba(10, 163, 48, 0.29)",
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Années" } },
        y: {
          title: { display: true, text: "Nombre de décès" },
          beginAtZero: true,
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Évolution des décès par année (1970-2024)",
        },
      },
    },
  });
}

buildYearlyChart();
