//urls
const baseUrl =
  "https://iot-portfolio-app.azurewebsites.net/api/HttpTrigger1?code=l72Ca3JksC7iCbCGzIgDIAVLbHi57D1ub1vp81Hk0T9oXGgJAdwAnw==";

//api queries
const lastUpdate = "&lastUpdate=true";

//get insert point into document
const devInsert = document.getElementById("device-insert");
const azureBtn = $("#azure-btn");
const cloud = $("#azure-cloud");

//onClick
azureBtn.click(() => checkRefresh());

//parameters
//date refresh and multiple of 10min refresh
let date = new Date();
let storageDate = new Date(localStorage.getItem("date")) || new Date();

//first visit refresh
let canRefresh = localStorage.getItem("refresh") === "true" || true;

//get local storage of devices
let devices = localStorage.getItem("devices") || "";

//fetch the last sensor data
let getLastUpdate = async () => {
  //remove children
  cloud.remove();
  while (devInsert.firstChild) {
    devInsert.removeChild(devInsert.firstChild);
  }

  //loading
  const loading = document.createElement("div");
  const srOnly = document.createElement("span");
  loading.className = "spinner-border text-secondary";
  loading.role = "status";
  loading.id = "azure-loading";
  srOnly.className = "sr-only";
  srOnly.innerText = "Loading...";

  loading.appendChild(srOnly);
  devInsert.appendChild(loading);

  //fetch
  await fetch(baseUrl + lastUpdate)
    .then((res) => res.json())
    .then((json) => {
      json = JSON.stringify(json);
      $("#azure-min").text(minsLeft());
      displayDevices(json);
    })
    .catch((err) => {
      console.log(err);

      //on fail clean up loading and append cloud
      while (devInsert.firstChild) {
        devInsert.removeChild(devInsert.firstChild);
      }
      $("device-insert").append(cloud);
    });
};

//display devices
function displayDevices(devices) {
  //remove children
  cloud.remove();
  while (devInsert.firstChild) {
    devInsert.removeChild(devInsert.firstChild);
  }
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
function formatDate(date, timeOfDay = true, twelveHour = true) {
  let d = new Date(date);
  let hour = d.getHours();
  if (twelveHour) {
    hour =
      d.getHours() > 12
        ? d.getHours() - 12
        : d.getHours() == 0
        ? 12
        : d.getHours();
  }

  hour = hour < 10 ? "0" + hour : hour;
  let min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
  let sec = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
  let am_pm;
  timeOfDay ? (am_pm = d.getHours() > 12 ? "pm" : "am") : (am_pm = "");

  return hour + ":" + min + ":" + sec + am_pm;
}

function checkRefresh() {
  //first visit refresh
  canRefresh = localStorage.getItem("refresh") === "true";

  //date refresh and multiple of 10min refresh
  storageDate = new Date(localStorage.getItem("date")) || new Date();
  date = new Date();
  let dateRefresh = date >= storageDate;

  //if refresh send request if not display local storage
  if (canRefresh || dateRefresh) {
    //set refresh to false
    localStorage.setItem("refresh", false);

    //format next available refresh date
    date.setMinutes(Math.floor(date.getMinutes() / 10) * 10 + 10);
    date.setSeconds(30);

    //create a string containing next date
    let dateStr = date.toDateString();
    dateStr += " " + formatDate(date, false, false);

    //store date for later
    localStorage.setItem("date", dateStr);

    //get update
    getLastUpdate();

    //update next available refresh date
    $("#azure-min").text(minsLeft());
  } else {
    $("#azure-min").text(minsLeft());
  }
}

let minsLeft = () => {
  //update minutes left
  date = new Date();
  let mins = Math.floor((storageDate - date) / 60000);
  mins = mins < 0 ? "Refresh now!" : mins < 1 ? "<1min" : mins + "mins";

  return mins;
};

//delete cloud on load if devices
if (devices !== "") {
  displayDevices(devices);
  $("#azure-button").text(minsLeft());
} else {
  $("#azure-min").text(minsLeft());
}

//auto-update mins left
$("#azure-min").text(minsLeft());
window.setInterval(() => $("#azure-min").text(minsLeft()), 30000);
