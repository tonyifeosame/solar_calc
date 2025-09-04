async function calculateSystem() {
  const load = parseFloat(document.getElementById("load").value);
  const hours = parseFloat(document.getElementById("hours").value);
  const days = parseFloat(document.getElementById("days").value);
  const systemV = parseFloat(document.getElementById("systemV").value);
  const panelW = parseFloat(document.getElementById("panelW").value);
  const batteryV = parseFloat(document.getElementById("batteryV").value);
  const batteryAh = parseFloat(document.getElementById("batteryAh").value);
  const dod = parseFloat(document.getElementById("dod").value) / 100;
  const city = document.getElementById("city").value;

  if (isNaN(load) || isNaN(hours) || isNaN(days) || isNaN(systemV) ||
      isNaN(panelW) || isNaN(batteryV) || isNaN(batteryAh) || isNaN(dod) || !city) {
    alert("Please fill in all fields including city.");
    return;
  }

  const sunHours = 8;
  const diversityFactor = 1.25;
  const adjustedLoad = load / diversityFactor;
  const dailyEnergy = adjustedLoad * hours;
  const totalEnergy = dailyEnergy * days;

  const seriesBatteries = Math.ceil(systemV / batteryV);
  const groupCapacityWh = batteryAh * systemV * dod;
  const parallelGroups = Math.ceil(totalEnergy / groupCapacityWh);
  const totalBatteries = seriesBatteries * parallelGroups;

  const inverterSize = Math.ceil(adjustedLoad * 1.2);
  const totalSolarWatt = dailyEnergy / sunHours;
  const numPanels = Math.ceil(totalSolarWatt / panelW);

  document.getElementById("results").innerHTML = `
    <h2 class="text-lg font-bold mb-2">System Results</h2>
    <p><strong>Adjusted Load:</strong> ${adjustedLoad.toFixed(2)} W</p>
    <p><strong>Daily Energy:</strong> ${dailyEnergy.toFixed(2)} Wh/day</p>
    <p><strong>Total Energy (for ${days} days):</strong> ${totalEnergy.toFixed(2)} Wh</p>
    <p><strong>Batteries Needed:</strong> ${totalBatteries} (${seriesBatteries} series × ${parallelGroups} parallel)</p>
    <p><strong>Inverter Size:</strong> ${inverterSize} W</p>
    <p><strong>Solar Panels:</strong> ${numPanels} × ${panelW} Wp</p>
  `;
  document.getElementById("results").classList.remove("hidden");

  // Fetch shops from backend
  try {
    const resp = await fetch(`/find-solar-shops?city=${encodeURIComponent(city)}`);
    const data = await resp.json();

    if (data.shops && data.shops.length > 0) {
      let shopList = "<h2 class='font-semibold mb-2'>Nearby Shops</h2><ul class='list-disc ml-5'>";
      data.shops.forEach(s => {
        shopList += `<li><strong>${s.name}</strong> – ${s.address}</li>`;
      });
      shopList += "</ul>";
      document.getElementById("shops").innerHTML = shopList;
    } else {
      document.getElementById("shops").innerHTML = "<p>No shops found.</p>";
    }
    document.getElementById("shops").classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("Error fetching shops.");
  }
}
