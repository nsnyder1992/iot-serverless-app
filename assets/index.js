$(document).ready(() => {
  //urls
  const corsProxy = "https://cors-anywhere.herokuapp.com/";
  const baseUrl =
    "https://iot-portfolio-app.azurewebsites.net/api/HttpTrigger1?code=l72Ca3JksC7iCbCGzIgDIAVLbHi57D1ub1vp81Hk0T9oXGgJAdwAnw==";
  const lastUpdate = "&lastUpdate=true";

  //get insert point into document
  const devInsert = document.getElementById("device-insert");

  //fetch the last sensor date
  let getLastUpdate = async () => {
    await fetch(corsProxy + baseUrl + lastUpdate)
      .then((res) => res.json())
      .then((json) => {
        json = JSON.stringify(json);
        displayDevices(json);
        localStorage.setItem("time", Date.now());
      })
      .catch((err) => console.log(err));
  };

  //display devices
  function displayDevices(devices) {
    //set devices
    localStorage.setItem("devices", devices);

    //if not object parse JSON to javascript object
    if (!(devices instanceof Object)) devices = JSON.parse(devices);

    //get timestamp
    let devTime = devices.time;

    //for each device create a card with device information
    devices.devices.forEach((dev) => {
      //create html elements
      const deviceContent = document.createElement("div");
      const card = document.createElement("div");
      const cardBody = document.createElement("div");
      const header = document.createElement("h1");
      const sensorList = document.createElement("div");

      //set css classes
      deviceContent.className = "device-data";
      card.className = "card";
      cardBody.className = "card-header";
      header.className = "device-name lead";
      sensorList.className = "list-group list-group-flush";

      //set name of device to header of card
      header.innerText = dev.name;

      //append card children
      cardBody.appendChild(header);
      card.appendChild(cardBody);
      card.appendChild(sensorList);
      deviceContent.appendChild(card);

      //for each sensor create a list item and display data
      dev.sensors.forEach((sensor) => {
        //create html elements
        const sensorContent = document.createElement("div");
        const para = document.createElement("p");
        const pTime = document.createElement("p");
        const span = document.createElement("span");

        //set css classes
        sensorContent.className = "sensor-data list-group-item text-center";
        para.className = "sensor-name lead";
        pTime.className = "timestamp";
        span.className = "sensor-value";

        //text attributes
        para.innerText = sensor.sensor;
        pTime.innerText = "Timestamp: Today " + formatDate(devTime); //format date and return
        span.innerText = sensor.value;

        //append sensor data to card
        sensorContent.appendChild(para);
        sensorContent.appendChild(span);
        sensorContent.appendChild(pTime);
        card.appendChild(sensorContent);
      });

      //insert devices to specified point
      devInsert.appendChild(deviceContent);
    });
  }

  //format timestamp on sensor data
  function formatDate(date) {
    let d = new Date(date);
    let hour =
      d.getHours() > 12
        ? d.getHours() - 12
        : d.getHours() == 0
        ? 12
        : d.getHours();
    let min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
    let sec = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
    let am_pm = d.getHours() > 12 ? "pm" : "am";

    return hour + ":" + min + ":" + sec + am_pm;
  }

  //timeout refresh
  let timeOut = 600000;
  let time = parseInt(localStorage.getItem("time")) || 0;

  //first visit refresh
  let canRefresh = localStorage.getItem("refresh") === "true" || true;

  //date refresh and multiple of 10min refresh
  let date = new Date();
  let storageDate = Date(localStorage.getItem("date")) || new Date();
  let dateRefresh = date > storageDate && date.getMinutes() % 10 === 0;

  //get local storage of devices
  let devices = localStorage.getItem("devices") || "";

  //if refresh send request if not display local storage
  if (Date.now() - time > timeOut || canRefresh || dateRefresh) {
    getLastUpdate();
    localStorage.setItem("refresh", false);
    localStorage.setItem("date", date);
    console.log("fetch");
  } else {
    if (devices !== "") displayDevices(devices);
    console.log(
      Math.floor(timeOut / 60000 - (Date.now() - time) / 60000) +
        " min remaining"
    );
  }
});
