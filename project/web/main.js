document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8000/data";
  let map; // Глобальна змінна для карти
  
  async function fetchData() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Помилка завантаження даних");
      }
      const result = await response.json();
      updateDashboard(result.data);
    } catch (error) {
      console.error("Помилка отримання даних:", error);
    }
  }

  function updateDashboard(data) {
    updateInfoCards(data);
    updateBarChart(data);
    updateMap(data);
    drawForecastChart();
  }

  function updateInfoCards(data) {
    const infoCards = document.getElementById("info-cards");
    infoCards.innerHTML = "";

    // Агрегуємо дані по локаціях
    const locationSummary = {};
    data.forEach((entry) => {
      if (!locationSummary[entry.location]) {
        locationSummary[entry.location] = 0;
      }
      locationSummary[entry.location] += entry.data_field;
    });

    // Відображаємо картки
    Object.entries(locationSummary).forEach(([location, total]) => {
      const card = document.createElement("div");
      card.className = "info-box";
      card.innerHTML = `<strong>Напрям ${location}</strong>: ${total}`;
      infoCards.appendChild(card);
    });
  }

  function updateBarChart(data) {
    const labels = [...new Set(data.map(item => item.date))]; // Унікальні дати
    const locations = [...new Set(data.map(item => item.location))]; // Унікальні локації

    // Визначаємо базовий колір через складові rgb
    const baseColor = { r: 77, g: 70, b: 52 };

    // Початковий рівень прозорості та крок
    const startAlpha = 0.8;
    const alphaStep = 0.25;

    const datasets = locations.map((location, index) => {
        // Обчислюємо прозорість (не більше 1)
        let alpha = Math.max(startAlpha - index * alphaStep, .2);

        return {
            label: `напрям ${location}`,
            data: labels.map(date => {
                const found = data.find(entry => entry.date === date && entry.location === location);
                return found ? found.data_field : 0;
            }),
            backgroundColor: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha})`,
            borderColor: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 1)`,
            borderWidth: 1,
        };
    });

    const ctx = document.getElementById("chart1").getContext("2d");
    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets,
        },
        options: {
            responsive: true,
            scales: {
                x: { stacked: true },
                y: { beginAtZero: true, stacked: true },
            },
        },
    });
}


  function updateMap() {
    if (!map) {
      const map = L.map("map").setView([48.3794, 31.1656], 6); // Центр України
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        map
      );

      // Приклад маркерів для груп (можна замінити реальними даними)
      const locations = [
        { coords: [50.9149, 34.7977], group: "Напрям A" }, // Київ
        { coords: [48.4380, 35.0906], group: "Напрям B" }, // Львів
        { coords: [46.6370, 32.6131], group: "Напрям C" }, // Одеса
      ];

      locations.forEach((loc) => {
        L.marker(loc.coords).addTo(map).bindPopup(loc.group);
      });
    }  
    };

   
  
    async function drawForecastChart() {
      const response = await fetch('forecast.json'); // Path to your JSON file
      const data = await response.json();
  
      // Extract labels and values
      const labels = Object.keys(data);
      const values = Object.values(data);
  
      // Create Chart.js bar chart
      const ctx = document.getElementById('prediction').getContext('2d');
  
      new Chart(ctx, {
          type: 'bar',
          data: {
              labels: labels,
              datasets: [{
                  label: 'на 7 днів',
                  data: values,
                  backgroundColor: 'rgba(77, 70, 52, 0.7)',
                  borderColor: 'rgba(77, 70, 52, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              responsive: true,
              scales: {
                  x: {
                      title: {
                          display: true,
                          text: '29.03.2025'
                      }
                  },
                  y: {
                      title: {
                          display: true,
                          text: 'значення'
                      },
                      beginAtZero: false
                  }
              },
              plugins: {
                  title: {
                      display: true,
                      text: 'прогноз'
                  }
              }
          }
      });
  }
  
  drawForecastChart();

  fetchData();
  setInterval(fetchData, 30000); // Оновлення кожні 30 секунд
});