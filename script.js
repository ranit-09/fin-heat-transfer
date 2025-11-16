(function () {
  "use strict";

  let chart = null;
  let linearChart = null;

  window.calculate = function () {
    const inputPoints = parseInt(
      document.getElementById("inputPoints").value,
      10
    );
    const xLength = document
      .getElementById("xVals")
      .value.split(",")
      .map((s) => Number(s.trim()));
    const temperatureValues = document
      .getElementById("tempValues")
      .value.split(",")
      .map((s) => Number(s.trim()));
    const ambientTemperature = parseFloat(document.getElementById("Ta").value);
    const diameter = parseFloat(document.getElementById("D").value);
    const conductivityK = parseFloat(document.getElementById("k").value);

    if (!Number.isInteger(inputPoints) || inputPoints <= 0) {
      alert("Enter a valid positive integer for number of points.");
      return;
    }

    if (
      xLength.length !== inputPoints ||
      temperatureValues.length !== inputPoints
    ) {
      alert("Error: Number of x values and temperature values must equal N.");
      return;
    }

    for (let i = 0; i < inputPoints; i++) {
      if (!isFinite(xLength[i]) || !isFinite(temperatureValues[i])) {
        alert("x and T must be valid numbers.");
        return;
      }
      if (temperatureValues[i] <= ambientTemperature) {
        alert("Temperatures must be greater than Ta.");
        return;
      }
    }

    const y = temperatureValues.map((T) => Math.log(T - ambientTemperature));

    const sumX = xLength.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = xLength.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
    const sumX2 = xLength.map((xi) => xi * xi).reduce((a, b) => a + b, 0);

    const denom = inputPoints * sumX2 - sumX * sumX;
    if (Math.abs(denom) < 1e-12) {
      alert("Regression failed: check x values.");
      return;
    }

    const m_neg = (inputPoints * sumXY - sumX * sumY) / denom;
    const c = (sumY - m_neg * sumX) / inputPoints;

    const m = -m_neg;
    const Tb = Math.exp(c) + ambientTemperature;

    const A = (Math.PI * diameter * diameter) / 4;
    const P = Math.PI * diameter;
    const h = (m * m * conductivityK * A) / P;

    document.getElementById("output").innerHTML = `
      <h3 class="font-semibold text-lg text-purple-700 mb-2">Results</h3>
      <p><b>Fin parameter (m):</b> ${m.toFixed(4)} 1/m</p>
      <p><b>Base temperature (Tb):</b> ${Tb.toFixed(2)} °C</p>
      <p><b>Convective heat transfer coefficient (h):</b> ${h.toFixed(
        2
      )} W/m²·K</p>
    `;

    plotData(xLength, temperatureValues, ambientTemperature, Tb, m);
    plotLinearFit(xLength, temperatureValues, ambientTemperature, m, c);
  };

  function plotData(xLength, temperatureValues, ambientTemperature, Tb, m) {
    const fitT = xLength.map(
      (xi) => ambientTemperature + (Tb - ambientTemperature) * Math.exp(-m * xi)
    );

    const ctx = document.getElementById("chart").getContext("2d");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: xLength,
        datasets: [
          {
            label: "Measured Temperature",
            data: temperatureValues,
            borderColor: "#e44d4d",
            backgroundColor: "#e44d4d",
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.15,
            showLine: false,
          },
          {
            label: "Fitted Temperature",
            data: fitT,
            borderColor: "#2b78e6",
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.25,
            fill: false,
          },
        ],
      },
      options: {
        animation: { duration: 700, easing: "easeOutQuart" },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "x (m)" } },
          y: { title: { display: true, text: "Temperature (°C)" } },
        },
      },
    });
  }

  function plotLinearFit(xLength, temperatureValues, ambientTemperature, m, c) {
    const y = temperatureValues.map((T) => Math.log(T - ambientTemperature));
    const fitY = xLength.map((x) => c - m * x);

    const ctx2 = document.getElementById("chart2").getContext("2d");
    if (linearChart) linearChart.destroy();

    linearChart = new Chart(ctx2, {
      type: "line",
      data: {
        labels: xLength,
        datasets: [
          {
            label: "ln(Tx - Ta) Data",
            data: y,
            borderColor: "#14b8a6",
            borderDash: [6, 4],
            borderWidth: 3,
            pointRadius: 4,
            fill: false,
          },
          {
            label: "Best Fit Line",
            data: fitY,
            borderColor: "#a855f7",
            borderWidth: 3,
            fill: false,
          },
        ],
      },
      options: {
        animation: { duration: 700, easing: "easeOutQuart" },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "x (m)" } },
          y: { title: { display: true, text: "ln(T - Ta)" } },
        },
      },
    });
  }
})();
