function getParameters () {
    let listOfCurrencies = document.getElementsByName("currency");
    let checkedCurrencies = [];
    for (const item of listOfCurrencies) {
        if(item.checked) {
            checkedCurrencies.push(item.value);
        }
    }
    let currentDate = new Date();
    currentDate = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate();
    let startDate = document.getElementById("start_date").value || currentDate;
    let endDate = document.getElementById("end_date").value || currentDate;
    return {checkedCurrencies : checkedCurrencies, startDate : startDate, endDate : endDate};
}

async function makeRequest(parameters) {

    let checkedCurrencies = parameters.checkedCurrencies;
    let infoList = [];
  
    for(let item of checkedCurrencies) {
        let url = new URL(`http://www.nbrb.by/API/ExRates/Rates/Dynamics/${item}`);
        url.searchParams.set('startDate', parameters.startDate);
        url.searchParams.set('endDate', parameters.endDate);

      let info = fetch(url).then(
        successResponse => {
          if (successResponse.status != 200) {
            return null;
          } else {
            return successResponse.json();
          }
        },
        failResponse => {
          return null;
        }
      );
      infoList.push(info);
    }
  
    let results = await Promise.all(infoList);
  
    return results.flat().groupBy("Date");
  }

  function showResults() {
      let parameters = getParameters();

      makeRequest(parameters).then(results => {
        let existTable = document.getElementById("myTable");
        if(existTable) {
          existTable.parentNode.removeChild(existTable);
        }

        let table = document.createElement("table");
        table.setAttribute("id", "myTable");
        document.body.appendChild(table);
  
        let firstRow = createTableRow("myTable");
        createTableColumn("th", "Дата", firstRow);

        const firstResult = Object.keys(results)[0];
        for (const currency of results[firstResult]) {
          let name = currencyDictionary[currency.Cur_ID];
          createTableColumn("th", name, firstRow);
        }

        for (const date in results) {
          const currencyInfo = results[date];
          let dateFormatted = new Date(date);
          dateFormatted = dateFormatted.getDate() + "." + (dateFormatted.getMonth() + 1) + "." + dateFormatted.getFullYear();
          let row = createTableRow("myTable");
          createTableColumn("td", dateFormatted, row);

          for (const currency of currencyInfo) {
            createTableColumn("td", currency.Cur_OfficialRate, row);
          }
        }
      });    
  }

  function createTableRow(tableID){
    let row = document.createElement("tr");
    document.getElementById(tableID).appendChild(row);
    return row;
  }
  function createTableColumn(typeOfElement, textNode, row){
    let column = document.createElement(typeOfElement);
    let dateNode = document.createTextNode(textNode);
    column.appendChild(dateNode);
    row.appendChild(column);
  }

  Array.prototype.groupBy = function(property) {
    return this.reduce(function(groups, item) {
      let value = item[property];
      groups[value] = groups[value] || [];
      groups[value].push(item);
      return groups;
    }, {});
  }
  
  const currencyDictionary = {
    145: "USD",
    292: "EUR",
    298: "RUB",
    302: "TRY",
    305: "CZK",
    293: "PLN"
  };
