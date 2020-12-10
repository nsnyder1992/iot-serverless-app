$(document).ready(() => {
  const corsProxy = "https://cors-anywhere.herokuapp.com/";
  const baseUrl =
    "https://iot-portfolio-app.azurewebsites.net/api/HttpTrigger1?code=l72Ca3JksC7iCbCGzIgDIAVLbHi57D1ub1vp81Hk0T9oXGgJAdwAnw==";
  const lastUpdate = "&lastUpdate=true";

  const devInsert = document.getElementById("device-insert");

  let getLastUpdate = async () => {
    await fetch(corsProxy + baseUrl + lastUpdate)
      .then((res) => res.json())
      .then((json) => displayDevices(json));
  };

  function displayDevices(devices) {
    localStorage.setItem("devices", "JSON.stringify(devices)");

    if (!(devices instanceof Object)) devices = JSON.parse(devices);

    let devTime = devices.time;

    devices.devices.forEach((dev) => {
      const deviceContent = document.createElement("div");
      const card = document.createElement("div");
      const cardBody = document.createElement("div");
      const header = document.createElement("h1");
      const sensorList = document.createElement("div");

      deviceContent.className = "device-data";
      card.className = "card";
      cardBody.className = "card-header";
      header.className = "device-name lead";
      sensorList.className = "list-group list-group-flush";

      header.innerText = dev.name;

      cardBody.appendChild(header);
      card.appendChild(cardBody);
      card.appendChild(sensorList);
      deviceContent.appendChild(card);

      // deviceContent.appendChild(hr);

      dev.sensors.forEach((sensor) => {
        const sensorContent = document.createElement("div");
        const para = document.createElement("p");
        const pTime = document.createElement("p");
        const span = document.createElement("span");

        sensorContent.className = "sensor-data list-group-item text-center";
        para.className = "sensor-name lead";
        pTime.className = "sensor-time";
        span.className = "sensor-value";

        para.innerText = sensor.sensor;
        pTime.innerText = devTime;
        span.innerText = sensor.value;

        sensorContent.appendChild(para);
        sensorContent.appendChild(span);
        card.appendChild(sensorContent);
      });

      devInsert.appendChild(deviceContent);
    });
  }

  let timeInt = 5000;
  let timeOut = 3600000;
  let canRefresh = localStorage.getItem("refresh") || true;
  let time = parseInt(localStorage.getItem("time")) || 0;

  console.log(typeof canRefresh, canRefresh);
  let devices = localStorage.getItem("devices") || "";

  if (canRefresh == "true") {
    getLastUpdate();
    localStorage.setItem("refresh", false);
  } else {
    if (devices !== "") displayDevices(devices);
  }

  window.setInterval(() => {
    time = parseInt(localStorage.getItem("time"));
    time += timeInt;
    localStorage.setItem("time", time);
  }, timeInt);

  if (time >= timeOut) {
    localStorage.setItem("refresh", true);
    localStorage.setItem("time", 0);
  }
});
