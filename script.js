console.log("Hello world");

import applications from './applicationName.json' assert {type:'json'};

// Create the index of each application in the array of applications
applications.forEach( (app,index) => {
  // app.index = applications.indexOf(app); // first way of creation
  app.index = index; // second way of creation
} );

// Create parameter and unit
const parameter = [
  {
    "name": "CPU_usage",
    "unit": "m" 
  },
  {
    "name": "Memory_usage",
    "unit": "Mi"
  },
  {
    "name": "CPU_utilization",
    "unit": "%"
  },
  {
    "name": "Memory_utilization",
    "unit": "%"
  }
];

const colorTable = ['red', 'blue', 'green', 'black', 'yellow', 'purple', 
                    'rgba(218,124,8,1)', 'rgba(82,20,28,1)', 'rgba(84,19,227,1)', 
                    'rbga(185,92,20,1)', 'rgba(219,37,200,0.8)', 'rgba(191,138,118,0.8)', 
                    'rgba(12,240,221,0.8)', 'rgba(8,36,66,1)', 'rgba(60,105,44,1)',
                    'rgba(58,237,58,0.8)', 'rgba(39,51,79,0.8)', 'rgba(13,156,242,0.89)',
                    'rgba(220,171,244,0.89)', 'rgba(239,141,159,0.89)', 'rgba(189,61,134,0.8)',
                    'rgba(63,181,161,0.8)', 'rgba(166,181,63,0.8)', 'rgba(74,78,107,0.49)',
                    'rgba(239,12,12,0.47)', 'rgba(137,86,49,0.96)', 'rgba(56,112,191,0.93)',
                    'rgba(143,56,191,1)' ];


var dataJson;
var indexApp;
var parameterChosen;

// DataX, DataY of the chart
var dataChart = [];
var dataChartXDate = [];
var dataChartXTime = [];
var dataChartY = [];

var dataChartInXDate;
var dataChartInXTime;
var dataChartInY;

var dataRequest = [];
var dataLimit = [];
var dataThresHold = [];
var dataRequestIn = [];
var dataLimitIn = [];
var dataThresHoldIn = [];

var dataDate = [];
var dateIndex = [];

var myChart;

const selectParameter = document.getElementById('parameter-select');
const selectApp = document.getElementById('application-select');
const selectDateFrom = document.getElementById('date-from');
const selectDateTo = document.getElementById('date-to');

// Input excel file and assign data into workBook variable
document.getElementById('excel-file').addEventListener('change', function(evt) {
    
  console.log("Importing excel-file is successfully!");

  const files = evt.target.files;
  const file = files[0];

  var reader = new FileReader();
  reader.onload = function(e) {
    var data = new Uint8Array(e.target.result);
    const workBook = XLSX.read(data, {type: 'array'});

    // Turn workBook data of excel form into data of json form
    // and save it to variable dataJson
    const workSheet = workBook.Sheets['tt2r2']; // choose worksheet
    dataJson = XLSX.utils.sheet_to_json(workSheet);

    var date0 = dataJson[0].Date;
    dataDate.push(date0);
    for (let i = 1; i < dataJson.length; i++) {
      if (dataJson[i].Date != date0) {
        date0 = dataJson[i].Date;
        dataDate.push(date0);
      }
    }

    console.log(dataDate);

    // Create option for select dateFrom
    dataDate.forEach ( (date) => {
      var option = document.createElement('option');
      option.value = date;
      option.textContent = date;
      selectDateFrom.appendChild(option);
    } );
    // Create option for select dateTo
    dataDate.forEach ( (date) => {
      var option = document.createElement('option');
      option.value = date;
      option.textContent = date;
      selectDateTo.appendChild(option);
    } );

  };

  reader.readAsArrayBuffer(file);

});

// Select parameter of the 
selectParameter.addEventListener('change', (e) => {
  parameterChosen = e.target.value;
  console.log("Parameter selected: ", parameterChosen);
});

// String to Number, erase special character and make it number
function stringToNumber(arr) {
  const stringNumber = arr.map( (value) => {
      if (value.includes('m')) {
          return Number(value.replace('m',''));
      } else if (value.includes('Mi')) {
          return Number(value.replace('Mi',''));
      } else if (value.includes('%')) {
          return Number(value.replace('%',''));
      } else {
          return 0;
      }
  } );
  return stringNumber;
}


// Create function of initial data 
function createArrayData(rows) {
  var arr = new Array(rows);
  for (let i = 0; i < rows; i++ ) {
    arr[i] = [];
  }
  return arr;
}

// Create data for the chart for CPU_utilisation
function createData() {
  dataChart = [];
  dataRequest = [];
  dataLimit = [];
  dataRequestIn = [];
  dataLimitIn = [];
  dataThresHold = [];
  dataThresHoldIn = [];
  dataChartXDate = []; // 1D array
  dataChartXTime = []; // 1D array
  dataChartY = new Array(applications[indexApp].maxPod); // maxPod rows array
  for (let i = 0; i < applications[indexApp].maxPod; i++) { // setup multidimensional array of empty values
      dataChartY[i] = [];
  }

  dataChartInXDate = [];
  dataChartInXTime = [];
  dataChartInY = new Array(applications[indexApp].maxPod); // maxPod rows array
  for (let i = 0; i < applications[indexApp].maxPod; i++) { // setup multidimensional array of empty values
      dataChartInY[i] = [];
  }

  var countIn = false;
  var countPodNum = 0;
  var countTime = 0;

  // Check if string includes in an array
  function checkStrInclude(str, arr) {
    var check = false;
    if (!arr) {
      return false;
    } else {
      for (let i = 0; i < arr.length; i++) {
        if (str.includes(arr[i])) {
            check = true;
            break;
        }
      }
    }
    return check;
  }

  // Check if string not include in an array
  function checkStrNotInclude(str,arr) {
    var check = true;
    if (!arr) {
        return true;
    } else {
        for (let i = 0; i < arr.length; i++) {
            if (str.includes(arr[i])) {
                check = false;
                break;
            }
        }
    }
    return check;
}

  dataJson.forEach( (row) => {

      if (row.PodName.includes(applications[indexApp].name) || checkStrInclude(row.PodName,applications[indexApp].preName) && checkStrNotInclude(row.PodName,applications[indexApp].notName)) {
          countIn = true;
          console.log(row.PodName);
          console.log(applications[indexApp].preName);
      } else {
          if (countIn == true) countTime++;
          countIn = false;
          countPodNum = 0;
      }

      if (countIn == true) {
        // Date and Time data
        dataChartXDate[countTime] = row['Date'];  
        dataChartXTime[countTime] = row['Time'];

        // Request and limit data of parameterChosen
        if (parameterChosen == 'CPU_usage') {
          if (row['CPU_requests'] && row['CPU_limit']) {
            dataRequest[countTime] = row['CPU_requests'];
            dataLimit[countTime] = row['CPU_limit'];
          } else {
            dataRequest[countTime] = 'noNumber';
            dataLimit[countTime] = 'noNumber';
          }
        } else if (parameterChosen == 'Memory_usage') {
          if (row['Memory_requests'] && row['Memory_limit']) {
            dataRequest[countTime] = row['Memory_requests'];
            dataLimit[countTime] = row['Memory_limit'];
          } else {
            dataRequest[countTime] = 'noNumber';
            dataLimit[countTime] = 'noNumber';
          }
        }

        // parameterChosen data
        if (row[parameterChosen]) {
          // console.log('ok: ', row);  // use to check the problem date
          dataChartY[countPodNum][countTime] = row[parameterChosen];
        } else {
          dataChartY[countPodNum][countTime] = 'noNumber'; // insert data of null when there is nothing
        }

        countPodNum++;
        
      }

  } );

  // Turn string data to Number
  dataRequest = stringToNumber(dataRequest);
  dataLimit = stringToNumber(dataLimit);
  console.log(dataLimit);
  dataThresHold = dataLimit.map( (item) => item/100*70 );
  console.log(dataThresHold);
  
  // Replace string to number
  for (let i = 0; i < applications[indexApp].maxPod; i++){
    dataChartY[i] = stringToNumber(dataChartY[i]);
  }

  // Turn dataDateX
  if (selectDateFrom.value == selectDateTo.value) {
    for (let i = 0; i < dataChartXDate.length; i++) {
      if (dataChartXDate[i] == selectDateFrom.value) {
        dateIndex.push(i);
      }
    }
  } else if (selectDateFrom.value < selectDateTo.value) {
    for (let i = 0; i < dataChartXDate.length; i++) {
      if (selectDateFrom.value <= dataChartXDate[i] && dataChartXDate[i] <= selectDateTo.value) {
        dateIndex.push(i);
      }
    }
  }

  // console.log(dateIndex);
  // console.log(dataChartY);

  for (let i = 0; i < dateIndex.length; i++) {
    dataChartInXDate.push(dataChartXDate[dateIndex[i]]);
    dataChartInXTime.push(dataChartXTime[dateIndex[i]]);
    dataRequestIn.push(dataRequest[dateIndex[i]]);
    dataLimitIn.push(dataLimit[dateIndex[i]]);
    dataThresHoldIn.push(dataThresHold[dateIndex[i]]);
  }

  for (let k = 0; k < applications[indexApp].maxPod; k++) {
    for (let m = 0; m < dateIndex.length; m++) {
        dataChartInY[k][m] = dataChartY[k][dateIndex[m]];      
    }
    
  }
  // console.log(dataChartInY);

  for (let i = 0; i < applications[indexApp].maxPod; i++) {
    dataChart[i] = {
      label: 'Pod-' + i, 
      data: (selectDateFrom.value == 'no_date' || selectDateTo.value == 'no_date') ? dataChartY[i] : dataChartInY[i],
      pointRadius: 0,
      tension: 0.4,
      fill: false,
      borderColor: colorTable[i]
    }
  }

  if (parameterChosen == 'CPU_usage' || parameterChosen == 'Memory_usage') {
    dataChart.push({      // push dataRequest
      label: 'Request',
      data: (selectDateFrom.value == 'no_date' || selectDateTo.value == 'no_date') ? dataRequest : dataRequestIn,
      borderColor: 'black',
      pointRadius: 0,
      tension: 0.4,
      fill: false,
      borderDash: [10,5]
    });
    dataChart.push({      // push dataLimit
      label: 'Limit',
      data: (selectDateFrom.value == 'no_date' || selectDateTo.value == 'no_date') ? dataLimit : dataLimitIn,
      borderColor: 'red',
      pointRadius: 0,
      tension: 0.4,
      fill: false,
      borderDash: [10,5]
    });
    dataChart.push({      // push dataLimit
      label: 'Threshold 70%',
      data: (selectDateFrom.value == 'no_date' || selectDateTo.value == 'no_date') ? dataThresHold : dataThresHoldIn,
      borderColor: 'green',
      pointRadius: 0,
      tension: 0.6,
      fill: false,
      borderDash: [10,5]
    });
  } 

}


// Create option for application
applications.forEach( (app) => {
  var option = document.createElement('option');
  option.value = app.index;
  option.textContent = app.name;
  selectApp.appendChild(option);
} );

// Select application
selectApp.addEventListener('change', (e) => {
  indexApp = e.target.value;
  console.log('You choose application:', applications[indexApp].name);
});

// Select date From
selectDateFrom.addEventListener('change', (e) => {
  console.log('You choose date from: ', e.target.value);
});
// Select date To
selectDateTo.addEventListener('change', (e) => {
  console.log('You choose date from: ', e.target.value);
});


const ctx = document.getElementById('myChart').getContext('2d');

function createChart(){
  var unitParameter;
  parameter.forEach( (x) => { 
    if (x['name'] == parameterChosen) {unitParameter = x['unit'];}
   } );

  const data = {
    labels: (selectDateFrom.value == 'no_date' || selectDateTo.value == 'no_date') ? dataChartXDate : ((selectDateFrom.value == selectDateTo.value) ? dataChartInXTime : dataChartInXDate),
    datasets: dataChart
  };

  var config = {
    type: 'line',
    data,
    options: {
      title: {
        display: true,
        text: ['Application name: ' + applications[indexApp].name, 
                'Parameter: ' + parameterChosen + ' (' + unitParameter + ')',
                (selectDateFrom.value == 'no_date' || selectDateTo.value == 'no_date') ? ('Date from: ' + dataDate[0]) : ('Date from: ' + selectDateFrom.value),
                (selectDateFrom.value == 'no_date' || selectDateTo.value == 'no_date') ? ('Date to: ' + dataDate[dataDate.length-1]) : ('Date to: ' + selectDateTo.value) ]
      },
      scales: {
        yAxes: [
          {
            display: true,
            ticks: {
              min: 0
            }
          }
        ]
      }
    }
  };

  myChart = new Chart(ctx, config);

  function maxScale (chart) {
    if (parameterChosen == 'CPU_usage' || parameterChosen == 'Memory_usage') {
      chart.config.options.scales.yAxes[0].ticks.max = Math.max(...dataLimit);
      chart.update();
    }
    console.log(chart);
  }

}


// Display button to 
document.getElementById('display-button').addEventListener('click', function () {
  dateIndex = [];
  if(myChart) {myChart.destroy();}
  createData();
  createChart();
});
