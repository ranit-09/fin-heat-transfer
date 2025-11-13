function calculate() {
  const N = parseInt(document.getElementById("N").value);
  const x = document.getElementById("xVals").value.split(",").map(Number);
  const T = document.getElementById("tVals").value.split(",").map(Number);
  const Ta = parseFloat(document.getElementById("Ta").value);
  const D = parseFloat(document.getElementById("D").value);
  const L = parseFloat(document.getElementById("L").value);
  const k = parseFloat(document.getElementById("k").value);

  if (x.length !== N || T.length !== N) {
    alert("Error: Number of x and T values must equal N.");
    return;
  }

  const y = [];
  for (let i = 0; i < N; i++) {
    if (T[i] <= Ta) {
      alert("Error: Ti must be greater than Ta at all points.");
      return;
    }
    y.push(Math.log(T[i] - Ta));
  }

  // Linear regression y = c - m*x
  const sumX = x.reduce((a,b) => a+b, 0);
  const sumY = y.reduce((a,b) => a+b, 0);
  const sumXY = x.map((xi, i) => xi * y[i]).reduce((a,b) => a+b, 0);
  const sumX2 = x.map(xi => xi*xi).reduce((a,b) => a+b, 0);

  const m_neg = (N * sumXY - sumX * sumY) / (N * sumX2 - sumX * sumX);
  const c = (sumY - m_neg * sumX) / N;

  const m = -m_neg;
  const Tb = Math.exp(c) + Ta;

  // Geometry
  const A = Math.PI * D * D / 4;
  const P = Math.PI * D;
  const h = (m * m * k * A) / P;

  document.getElementById("output").innerHTML = `
    <h3 class="font-semibold text-lg text-blue-700 mb-2">Results</h3>
    <p><b>Fin parameter (m):</b> ${m.toFixed(4)} 1/m</p>
    <p><b>Base temperature (Tb):</b> ${Tb.toFixed(2)} °C</p>
    <p><b>Convective heat transfer coefficient (h):</b> ${h.toFixed(2)} W/m²·K</p>
  `;

  plotData(x, T, Ta, Tb, m);
}

let chart; // global chart reference

function plotData(x, T, Ta, Tb, m) {
  const fitT = x.map(xi => Ta + (Tb - Ta) * Math.exp(-m * xi));

  const ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy(); // clear old plot

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: x,
      datasets: [
        {
          label: "Measured T(x)",
          data: T,
          borderColor: "red",
          borderWidth: 2,
          pointRadius: 4,
          fill: false,
        },
        {
          label: "Fitted T(x)",
          data: fitT,
          borderColor: "blue",
          borderDash: [6, 4],
          borderWidth: 2,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "x (m)" } },
        y: { title: { display: true, text: "Temperature (°C)" } }
      }
    }
  });
}
