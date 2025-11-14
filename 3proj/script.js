function calculate() {
  const inputPoints = parseInt(document.getElementById("inputPoints").value);
  const xLength = document.getElementById("xVals").value.split(",").map(Number);
  const temperatureValues = document.getElementById("tempValues").value.split(",").map(Number);
  const ambientTemperature = parseFloat(document.getElementById("Ta").value);
  const diameter = parseFloat(document.getElementById("D").value);
  const conductivityK = parseFloat(document.getElementById("k").value);

  if (xLength.length !== inputPoints || temperatureValues.length !== inputPoints) {
    alert("Error: Number of xLength and temperature values must equal inputPoints.");
    return;
  }

  const y = [];
  for (let i = 0; i < inputPoints; i++) {
    if (temperatureValues[i] <= ambientTemperature) {
      alert("Error: Temperature must be greater than ambient temperature at all points.");
      return;
    }
    y.push(Math.log(temperatureValues[i] - ambientTemperature));
  }

  const sumX = xLength.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = xLength.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
  const sumX2 = xLength.map((xi) => xi * xi).reduce((a, b) => a + b, 0);

  const m_neg = (inputPoints * sumXY - sumX * sumY) /
                (inputPoints * sumX2 - sumX * sumX);
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
    <p><b>Convective heat transfer coefficient (h):</b> ${h.toFixed(2)} W/m²·K</p>
  `;

  plotData(xLength, temperatureValues, ambientTemperature, Tb, m);
}

let chart;

function plotData(xLength, temperatureValues, ambientTemperature, Tb, m) {
  const fitT = xLength.map((xi) =>
    ambientTemperature + (Tb - ambientTemperature) * Math.exp(-m * xi)
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
          borderColor: "red",
          borderWidth: 2,
          pointRadius: 4,
          fill: false,
        },
        {
          label: "Fitted Temperature",
          data: fitT,
          borderColor: "blue",
          borderDash: [6, 4],
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "x (m)" } },
        y: { title: { display: true, text: "Temperature (°C)" } },
      },
    },
  });
}
