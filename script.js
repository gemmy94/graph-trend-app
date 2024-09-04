console.log("Hello world");

// import applications from './applicationName.json'  assert {type:'json'};
var applications = [];
fetch('./applicationName.json')
    .then((response) => response.json())
    .then((json) => json.forEach( (meo) => applications.push(meo) )); // push json value into applications

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


// Setup variable
var dataJson;
var timeStample = [];
var timeStample_date = [];
var timeStample_time = [];
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
var averageNumber;


// Button create
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
    const workSheet = workBook.Sheets['sn2r2']; // choose worksheet
    dataJson = XLSX.utils.sheet_to_json(workSheet);
    
    console.log(dataJson); // show dataJson

    dataJson.forEach ( (date) => {
      timeStample.push(date.TimeStamp);
      timeStample_date.push(date.TimeStamp.split(" ")[0]);
      timeStample_time.push(date.TimeStamp.split(" ")[1]);
    } );
    // console.log(timeStample);

    // Identify the indexApp
    applications.forEach( (meo,index) => {
      if ( meo.name == dataJson[0].Application ) {
        indexApp = index;
      }
    } );
    console.log("This is the indexApp value: ", indexApp);



  };
  reader.readAsArrayBuffer(file);

});

// Select parameter of the 
selectParameter.addEventListener('change', (e) => {
  parameterChosen = e.target.value;
  console.log("Parameter selected: ", parameterChosen);
  console.log(dataJson);
});

// Select date From
selectDateFrom.addEventListener('change', (e) => {
  console.log('You choose date from: ', e.target.value);
});
// Select date To
selectDateTo.addEventListener('change', (e) => {
  console.log('You choose date from: ', e.target.value);
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
// function to check number
function isNumber(value) {
  return typeof value === 'number';
}
// function to push the element
function pushElement(arrSource, arrDestination) {
  arrSource.forEach( (ele) => {
    if (isNumber(ele)) arrDestination.push(ele);
  } );
}
// function to calculate the average
function averageArr(arr) {
  var sum = 0;
  arr.forEach( (ele) => {
    sum += ele;
  } );
  return sum/arr.length
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


  dataJson.forEach( (row,rowindex) => {
    // console.log(countPodNum, countTime,rowindex);
      if ( rowindex == 0 ) {
        dataChartXDate[countTime] = timeStample_date[rowindex];
        dataChartXTime[countTime] = timeStample_time[rowindex];

        if ( row[parameterChosen] ) {
          dataChartY[countPodNum][countTime] = row[parameterChosen];
        } else {
          dataChartY[countPodNum][countTime] = 'noNumber';
        }

        if (timeStample_time[rowindex] != timeStample_time[rowindex+1]){ 
          countPodNum = 0; 
          countTime++; 
        } else { countPodNum++; }

      } else if ( rowindex != dataJson.length-1 ) {
        // Request and limit data of parameterChosen
        if (parameterChosen == 'CPU_usage') {
          if (row['CPU_requests'] && row['CPU_limits']) {
            dataRequest[countTime] = row['CPU_requests'];
            dataLimit[countTime] = row['CPU_limits'];
          } else {
            dataRequest[countTime] = 'noNumber';
            dataLimit[countTime] = 'noNumber';
          }
        } else if (parameterChosen == 'Memory_usage') {
          if (row['Memory_requests'] && row['Memory_limits']) {
            dataRequest[countTime] = row['Memory_requests'];
            dataLimit[countTime] = row['Memory_limits'];
          } else {
            dataRequest[countTime] = 'noNumber';
            dataLimit[countTime] = 'noNumber';
          }
        } // out of request, limit

        dataChartXDate[countTime] = timeStample_date[rowindex];
        dataChartXTime[countTime] = timeStample_time[rowindex];

        if ( row[parameterChosen] ) {
          dataChartY[countPodNum][countTime] = row[parameterChosen];
        } else {
          dataChartY[countPodNum][countTime] = 'noNumber';
        }

        if (timeStample_time[rowindex] != timeStample_time[rowindex+1]){ 
          countPodNum = 0; 
          countTime++;
        } else { 
          countPodNum++; }

      } else {
        dataChartXDate[countTime] = timeStample_date[rowindex];
        dataChartXTime[countTime] = timeStample_time[rowindex];

        if ( row[parameterChosen] ) {
          dataChartY[countPodNum][countTime] = row[parameterChosen];
        } else {
          dataChartY[countPodNum][countTime] = 'noNumber';
        }
      }

      
  } );

  console.log(dataChartXDate);

  // Turn string data to Number
  dataRequest = stringToNumber(dataRequest);
  dataLimit = stringToNumber(dataLimit);
  // console.log(dataLimit);
  dataThresHold = dataLimit.map( (item) => item/100*70 );
  // console.log(dataThresHold);
  
  var dataAverage = [];
  // Replace string to number
  for (let i = 0; i < applications[indexApp].maxPod; i++){
    dataChartY[i] = stringToNumber(dataChartY[i]); // Turn the data from string to number 
  }
  for (let m = 0; m < dataChartY.length; m++){
    pushElement(dataChartY[m],dataAverage);
  }
  averageNumber = averageArr(dataAverage);
  document.getElementById("show-utlization").innerHTML = averageNumber;
  
  // Turn dataDateX
  for (let i = 0; i < dataChartXDate.length; i++) {
    dateIndex.push(i);
  }
    
  console.log(dateIndex);
  console.log(dataChartY);

  for (let k = 0; k < applications[indexApp].maxPod; k++) {
    for (let m = 0; m < dateIndex.length; m++) {
        dataChartInY[k][m] = dataChartY[k][dateIndex[m]];      
    }
    
  }
  // console.log(dataChartInY);

  for (let i = 0; i < applications[indexApp].maxPod; i++) {
    dataChart[i] = {
      label: 'Pod-' + i, 
      data: dataChartY[i],
      pointRadius: 0,
      tension: 0.4,
      fill: false,
      borderColor: colorTable[i]
    }
  }

  // Insert dataRequest, limit and threshold
  if (parameterChosen == 'CPU_usage' || parameterChosen == 'Memory_usage') {
    dataChart.push({      // push dataRequest
      label: 'Request',
      data: dataRequest,
      borderColor: 'black',
      pointRadius: 0,
      tension: 0.4,
      fill: false,
      borderDash: [10,5]
    });
    dataChart.push({      // push dataLimit
      label: 'Limit',
      data: dataLimit,
      borderColor: 'red',
      pointRadius: 0,
      tension: 0.4,
      fill: false,
      borderDash: [10,5]
    });
    dataChart.push({      // push dataLimit
      label: 'Threshold 70%',
      data: dataThresHold,
      borderColor: 'green',
      pointRadius: 0,
      tension: 0.6,
      fill: false,
      borderDash: [10,5]
    });
  } 

}

const ctx = document.getElementById('myChart').getContext('2d');

function createChart(){
  // dataAverage = [];
  var unitParameter;
  parameter.forEach( (x) => { 
    if (x['name'] == parameterChosen) {unitParameter = x['unit'];}
   } );

  const data = {
    labels:  dataChartXDate,
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
                'Average of ' + parameterChosen + ' ' + averageNumber + ' (' + unitParameter + ')'
                ]
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

