let binFileInput;
var nodeConsole = require('console');
var EspOTA = require('esp-ota');


var console = new nodeConsole.Console(process.stdout, process.stderr);
var binFileData;
var binPath;

function preload() {
  logoImage = loadImage('data/trigUpdaterImage.png');
}

function setup() {
  //createCanvas(windowWidth, windowHeight);
  createCanvas(500, 350);
  noStroke();
  background(255);
  //logoImage = loadImage('data/trigUpdaterImage.png');
  image(logoImage, 0, 0, 778/2, 166/2);

  //console.log('starting app');

  chooseBinFileText = createElement('h4', 'Select BIN File from your Computer');
  chooseBinFileText.position(15, 60);
  latestBinFileButton = createButton('Can Download Latest BIN File HERE');
  latestBinFileButton.position(chooseBinFileText.x + chooseBinFileText.size().width+5, chooseBinFileText.y+chooseBinFileText.size().height+2);
  latestBinFileButton.mousePressed(latestBinFileButtonFunction);

  binFileInput = createFileInput(handleFile);
  binFileInput.position(50, chooseBinFileText.y+chooseBinFileText.size().height+25);
  binFileInput.id('binFileInputID');
  

  chooseIPText = createElement('h4', 'Enter IP Address for trigBoard');
  chooseIPText.position(15, binFileInput.y+binFileInput.size().height);
  ipInput = createInput('192.168.0.133');
  ipInput.position(50, chooseIPText.y+chooseIPText.size().height+25); 
  ipInput.size(100);

  startButton = createButton('START OTA UPDATE');
  startButton.position(50, ipInput.y+ipInput.size().height+25);
  startButton.style('color', color(255));
  startButton.style('background-color', color(61, 127, 78));
  startButton.mousePressed(startOTA);
  startButton.hide();

  statusText = createElement('h5', 'dg');
  statusText.position(15, startButton.y+10);
  statusText.id('statusTextID');

  document.getElementById("statusTextID").innerHTML = "Make sure trigBoard is connected to WiFi and<br> OTA has been initialized from the Configurator";

  creditsText = createElement('sub', 'References:<br>esp-ota powered by this library: https://github.com/bitfocus/esp-ota<br>p5.js template: https://github.com/garciadelcastillo/p5js-electron-templates');
  creditsText.position(15, windowHeight-50);


}

function draw() {

}

function handleFile(file) {
  console.log(file.subtype);
  if(file.subtype != 'macbinary'){
    alert("Wrong File Type!  Must be a .bin file");
    return;
  }
  binFileData = file;
  binPath = document.getElementById("binFileInputID").files[0].path;
  //document.getElementById("statusTextID").innerHTML = "Loaded " + binPath;
  startButton.show();
}

function startOTA(){

var esp = new EspOTA(); // Optional arguments in this order: (bindAddress, bindPort, chunkSize, secondsTimeout)


  sanitize = checkUserIPaddress(ipInput.value());
  if (sanitize!=null) {
    ipInput.value(sanitize);
    return;
  }else{
    startButton.show();
  }
  sanitizer = checkUserString(ipInput.value(), 50);
  if (sanitize!=null) {
    ipInput.value(sanitize);
    return;

  }else{
    startButton.show();
  }



startButton.hide();

document.getElementById("statusTextID").innerHTML = "Starting OTA";

esp.on('state', function (state) {
  console.log("Current state of transfer: ", state);
  document.getElementById("statusTextID").innerHTML = "Current state of transfer:  " + state;
});

esp.on('progress', function (current, total) {
  console.log("Transfer progress: " + Math.round(current / total * 100) + "%");
  document.getElementById("statusTextID").innerHTML = "Transfer progress: " + Math.round(current / total * 100) + "%";
});

// If you need to authenticate, uncomment the following and change the password
// esp.setPassword('admin');

var transfer = esp.uploadFile(binPath, ipInput.value(), 3232, EspOTA.FLASH);

transfer
.then(function () {
  console.log("Done");
  document.getElementById("statusTextID").innerHTML = "Done";
  startButton.show();
})
.catch(function (error) {
  console.error("Transfer error: ", error);
  document.getElementById("statusTextID").innerHTML = "Transfer error: " + error;
  startButton.show();
});
}

function latestBinFileButtonFunction(){
  //window.open('https://krdarrah.github.io/trigBoardConfigurator/');
  window.open('https://github.com/krdarrah/trigBoardV8_BaseFirmware/releases');
}

function checkUserIPaddress(userIP) {
  let splitNumbers = split(userIP, '.');
  if (splitNumbers.length>4 || splitNumbers.length<4) {
    return 'error not valid';
  }
  for (let i=0; i<4; i++) {
    if (isNaN(splitNumbers[i])) {
      return 'error not valid';
    }
    if (splitNumbers[i]>255 || splitNumbers[i]<0) {
      return 'error not valid';
    }
  }
  return null;
}
function checkUserString(userString, lengthCheck) {
  if (match(userString, "#") != null || match(userString, ",") != null) {
    return 'error no # or comma';
  }
  if (userString.length >=lengthCheck) {
    return 'error too long';
  }
  return null;
}
