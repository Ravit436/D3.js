
var margin = {top: 50, right: 50, bottom: 150, left: 50},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var	parseDate = d3.time.format("%d-%m-%Y");

var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .05);

var y = d3.scale.linear()
          .range([height, 0])
          .domain([0,100]);

var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .tickFormat(d3.time.format("%d-%m-%Y"));

var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              .ticks(10);

var check = 0;

function showBy()
{
  var xShows = null, regionname = null;
  var showing = document.getElementById("showing");
  var region = document.getElementById("region").value;
  regionname = document.getElementById("regionname").value;
  var startdate = parseDate.parse(document.getElementById("startdate").value);
  var enddate = parseDate.parse(document.getElementById("enddate").value);

  if(region == "select")
  {
    showing.innerHTML = "Please Select thr type of region";
    return 0;
  }

  var timeSpan = 0;
  if(startdate.getYear() == enddate.getYear())
    timeSpan = enddate.getDate()+1-startdate.getDate()+30*(enddate.getMonth()-startdate.getMonth());
  else
    timeSpan = enddate.getDate()+1-startdate.getDate()+30*(enddate.getMonth()+12-startdate.getMonth())+360*(enddate.getYear()-startdate.getYear()-1);
  console.log(timeSpan);

  var displayTime = chooseTime(timeSpan);
  console.log(displayTime);

  d3.json("data.json", function(data)
  {
    var searchValue = searchRegion(region,regionname,data);
    var storeData;

    if(searchValue.length > 1)
      storeData = operation(displayTime+region,searchValue,data,startdate,enddate);
    else
    {
      showing.innerHTML = searchValue[0];
      return 0;
    }
    console.log(storeData);


    x.domain(storeData.map(function(d) { return d.date; }));

    if(check++ == 0)
    {
      svg.append("g")
         .attr("class", "x axis")
         .attr("transform","translate(0,"+height+")")
         .transition().duration(2000).ease("sin-in-out")
         .call(xAxis)
         .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.5em")
          .attr("transform", "rotate(-90)" );
        }
        else {
          svg.select("g.x.axis")
          .selectAll("text")
          .transition().duration(2000).attr("y",2000);

          svg.select("g.x.axis")
          .transition().duration(2000).ease("sin-in-out")
          .call(xAxis)
          .selectAll("text")
           .style("text-anchor", "end")
           .attr("dx", "-.8em")
           .attr("dy", "-.5em")
           .attr("transform", "rotate(-90)" );
        }


    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".7em")
       .style("text-anchor", "end")
       .text("Literacy rate");

    var updateSvg = svg.selectAll("rect").data(storeData);

    updateSvg.enter().append("rect");

    updateSvg.style("fill", "steelblue")
             .attr("width", x.rangeBand())
             .attr("x", function(d) { return x(d.date); })
             .attr("y", function(d) { return y(d.literacy_rate); })
             .attr("height", function(d) { return height - y(d.literacy_rate); });

    updateSvg.exit().remove();

    showing.innerHTML = searchValue[0];


  });
}

  function chooseTime(timeSpan)
  {
    if(timeSpan > 0 && timeSpan <= 900)
      return 'month';
    else if(timeSpan > 900 && timeSpan <= 10600)
      return 'year';
    else if(timeSpan > 10600 && timeSpan <= 106000)
      return 'decade';
    else
      return 'century';
  }

  function operation (value,id,data,startdate,enddate)
  {

    function opCenturyState()
    {
      var storeData=[];
      var year = Math.floor(startdate.getYear()/100);
      var value = data.state[id[1]];
      var sum = 0,count = 0,county=0;
      for(var i=0;i < value.district[0].block[0].panchayat[0].village[0].data.length;i++)
      {
        var date = parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date);

        if(parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date) >= startdate && parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date) <= enddate)
        {
          if(Math.floor(date.getYear()/100) == year)
          {
            county++;
            for(var j=0;j < value.district.length;j++)
            {
              for (var k = 0; k < value.district[j].block.length; k++)
              {
                for (var l = 0; l < value.district[j].block[k].panchayat.length; l++)
                {
                  for (var m = 0; m < value.district[j].block[k].panchayat[l].village.length; m++)
                  {
                    sum+=value.district[j].block[k].panchayat[l].village[m].data[i].val;
                    count++;
                  }
                }
              }
            }
          }
          else
          {
              console.log("Sum "+sum+" c" +count);
              storeData.push({
                "date": parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i-county].date),
                "literacy_rate": sum/count
              });
              year++;
              sum = 0, count = 0,county=1;
              for(var j=0;j < value.district.length;j++)
              {
                for (var k = 0; k < value.district[j].block.length; k++)
                {
                  for (var l = 0; l < value.district[j].block[k].panchayat.length; l++)
                  {
                    for (var m = 0; m < value.district[j].block[k].panchayat[l].village.length; m++)
                    {
                      sum+=value.district[j].block[k].panchayat[l].village[m].data[i].val;
                      count++;
                    }
                  }
                }
              }
          }
        }
        if(parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date) > enddate)
          break;
      }
      storeData.push({
        "date": parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i-county].date),
        "literacy_rate": sum/count
      });
      return storeData;
    }

    function opDecadeState()
    {
      var storeData=[];
      var year = Math.floor(startdate.getYear()/10);
      var value = data.state[id[1]];
      var sum = 0,count = 0,county=0;
      for(var i=0;i < value.district[0].block[0].panchayat[0].village[0].data.length;i++)
      {
        var date = parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date);

        if(parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date) >= startdate && parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date) <= enddate)
        {
          if(Math.floor(date.getYear()/10) == year)
          {
            county++;
            for(var j=0;j < value.district.length;j++)
            {
              for (var k = 0; k < value.district[j].block.length; k++)
              {
                for (var l = 0; l < value.district[j].block[k].panchayat.length; l++)
                {
                  for (var m = 0; m < value.district[j].block[k].panchayat[l].village.length; m++)
                  {
                    sum+=value.district[j].block[k].panchayat[l].village[m].data[i].val;
                    count++;
                  }
                }
              }
            }
          }
          else
          {
              console.log("Sum "+sum+" c" +count);
              storeData.push({
                "date": parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i-county].date),
                "literacy_rate": sum/count
              });
              year++;
              sum = 0, count = 0,county=1;
              for(var j=0;j < value.district.length;j++)
              {
                for (var k = 0; k < value.district[j].block.length; k++)
                {
                  for (var l = 0; l < value.district[j].block[k].panchayat.length; l++)
                  {
                    for (var m = 0; m < value.district[j].block[k].panchayat[l].village.length; m++)
                    {
                      sum+=value.district[j].block[k].panchayat[l].village[m].data[i].val;
                      count++;
                    }
                  }
                }
              }
          }
        }
        if(parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date) > enddate)
          break;
      }
      storeData.push({
        "date": parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i-county].date),
        "literacy_rate": sum/count
      });
      return storeData;
    }

    function opYearState()
    {
      var storeData=[];
      var year = startdate.getYear();
      var value = data.state[id[1]];
      var sum = 0,count = 0,county=0;
      for(var i=0;i < value.district[0].block[0].panchayat[0].village[0].data.length;i++)
      {
        var date = parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date);

        if(parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date) >= startdate && parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date) <= enddate)
        {
          if(date.getYear() == year)
          {
            county++;
            for(var j=0;j < value.district.length;j++)
            {
              for (var k = 0; k < value.district[j].block.length; k++)
              {
                for (var l = 0; l < value.district[j].block[k].panchayat.length; l++)
                {
                  for (var m = 0; m < value.district[j].block[k].panchayat[l].village.length; m++)
                  {
                    sum+=value.district[j].block[k].panchayat[l].village[m].data[i].val;
                    count++;
                  }
                }
              }
            }
          }
          else
          {
              console.log("Sum "+sum+" c" +count);
              storeData.push({
                "date": parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i-county].date),
                "literacy_rate": sum/count
              });
              year++;
              sum = 0, count = 0,county=1;
              for(var j=0;j < value.district.length;j++)
              {
                for (var k = 0; k < value.district[j].block.length; k++)
                {
                  for (var l = 0; l < value.district[j].block[k].panchayat.length; l++)
                  {
                    for (var m = 0; m < value.district[j].block[k].panchayat[l].village.length; m++)
                    {
                      sum+=value.district[j].block[k].panchayat[l].village[m].data[i].val;
                      count++;
                    }
                  }
                }
              }
          }
        }
        if(parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date) > enddate)
          break;
      }
      storeData.push({
        "date": parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i-county].date),
        "literacy_rate": sum/count
      });
      return storeData;
    }

    function opMonthState()
    {
      var storeData=[];
      var value = data.state[id[1]];
      console.log(value);
      for(var i=0;i < value.district[0].block[0].panchayat[0].village[0].data.length;i++)
      {
        var date = parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date);
        var sum = 0;
        if(parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date) >= startdate && parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date) <= enddate)
        {
          for(var j=0;j < value.district.length;j++)
          {
            for (var k = 0; k < value.district[j].block.length; k++)
            {
              for (var l = 0; l < value.district[j].block[k].panchayat.length; l++)
              {
                for (var m = 0; m < value.district[j].block[k].panchayat[l].village.length; m++)
                {
                  sum+=value.district[j].block[k].panchayat[l].village[m].data[i].val;
                }
              }
            }
          }
              storeData.push({
                "date": parseDate.parse(value.district[0].block[0].panchayat[0].village[0].data[i].date),
                "literacy_rate": sum/(j*k*l*m)
              });
        }
      }
      return storeData;
    }

    function opCenturyDistrict()
    {
      var storeData=[];
      var year = Math.floor(startdate.getYear()/100);
      var value = data.state[id[1]].district[id[2]];
      var sum = 0,count = 0,county=0;
      for(var i=0;i < value.block[0].panchayat[0].village[0].data.length;i++)
      {
        var date = parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date);

        if(parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date) >= startdate && parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date) <= enddate)
        {
          if(Math.floor(date.getYear()/100) == year)
          {
            county++;
            for(var j=0;j < value.block.length;j++)
            {
              for (var k = 0; k < value.block[j].panchayat.length; k++)
              {
                for (var l = 0; l < value.block[j].panchayat[k].village.length; l++)
                {
                  sum+=value.block[j].panchayat[k].village[l].data[i].val;
                  count++;
                }
              }
            }
          }
          else
          {
              console.log("Sum "+sum+" c" +count);
              storeData.push({
                "date": parseDate.parse(value.block[0].panchayat[0].village[0].data[i-county].date),
                "literacy_rate": sum/count
              });
              year++;
              sum = 0, count = 0,county=1;
              for(var j=0;j < value.block.length;j++)
              {
                for (var k = 0; k < value.block[j].panchayat.length; k++)
                {
                  for (var l = 0; l < value.block[j].panchayat[k].village.length; l++)
                  {
                    sum+=value.block[j].panchayat[k].village[l].data[i].val;
                    count++;
                  }
                }
              }
          }
        }
        if(parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date) > enddate)
          break;
      }
      storeData.push({
        "date": parseDate.parse(value.block[0].panchayat[0].village[0].data[i-county].date),
        "literacy_rate": sum/count
      });
      return storeData;
    }

    function opDecadeDistrict()
    {
      var storeData=[];
      var year = Math.floor(startdate.getYear()/10);
      var value = data.state[id[1]].district[id[2]];
      var sum = 0,count = 0,county=0;
      for(var i=0;i < value.block[0].panchayat[0].village[0].data.length;i++)
      {
        var date = parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date);

        if(parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date) >= startdate && parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date) <= enddate)
        {
          if(Math.floor(date.getYear()/10) == year)
          {
            county++;
            for(var j=0;j < value.block.length;j++)
            {
              for (var k = 0; k < value.block[j].panchayat.length; k++)
              {
                for (var l = 0; l < value.block[j].panchayat[k].village.length; l++)
                {
                  sum+=value.block[j].panchayat[k].village[l].data[i].val;
                  count++;
                }
              }
            }
          }
          else
          {
              console.log("Sum "+sum+" c" +count);
              storeData.push({
                "date": parseDate.parse(value.block[0].panchayat[0].village[0].data[i-county].date),
                "literacy_rate": sum/count
              });
              year++;
              sum = 0, count = 0,county=1;
              for(var j=0;j < value.block.length;j++)
              {
                for (var k = 0; k < value.block[j].panchayat.length; k++)
                {
                  for (var l = 0; l < value.block[j].panchayat[k].village.length; l++)
                  {
                    sum+=value.block[j].panchayat[k].village[l].data[i].val;
                    count++;
                  }
                }
              }
          }
        }
        if(parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date) > enddate)
          break;
      }
      storeData.push({
        "date": parseDate.parse(value.block[0].panchayat[0].village[0].data[i-county].date),
        "literacy_rate": sum/count
      });
      return storeData;
    }

    function opYearDistrict()
    {
      var storeData=[];
      var year = startdate.getYear();
      var value = data.state[id[1]].district[id[2]];
      var sum = 0,count = 0,county=0;
      for(var i=0;i < value.block[0].panchayat[0].village[0].data.length;i++)
      {
        var date = parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date);

        if(parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date) >= startdate && parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date) <= enddate)
        {
          if(date.getYear() == year)
          {
            county++;
            for(var j=0;j < value.block.length;j++)
            {
              for (var k = 0; k < value.block[j].panchayat.length; k++)
              {
                for (var l = 0; l < value.block[j].panchayat[k].village.length; l++)
                {
                  sum+=value.block[j].panchayat[k].village[l].data[i].val;
                  count++;
                }
              }
            }
          }
          else
          {
              console.log("Sum "+sum+" c" +count);
              storeData.push({
                "date": parseDate.parse(value.block[0].panchayat[0].village[0].data[i-county].date),
                "literacy_rate": sum/count
              });
              year++;
              sum = 0, count = 0,county=1;
              for(var j=0;j < value.block.length;j++)
              {
                for (var k = 0; k < value.block[j].panchayat.length; k++)
                {
                  for (var l = 0; l < value.block[j].panchayat[k].village.length; l++)
                  {
                    sum+=value.block[j].panchayat[k].village[l].data[i].val;
                    count++;
                  }
                }
              }
          }
        }
        if(parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date) > enddate)
          break;
      }
      storeData.push({
        "date": parseDate.parse(value.block[0].panchayat[0].village[0].data[i-county].date),
        "literacy_rate": sum/count
      });
      return storeData;
    }

    function opMonthDistrict()
    {
      var storeData=[];
      var value = data.state[id[1]].district[id[2]];
      console.log(value);
      for(var i=0;i < value.block[0].panchayat[0].village[0].data.length;i++)
      {
        var date = parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date);
        var sum = 0;
        if(parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date) >= startdate && parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date) <= enddate)
        {
          for(var j=0;j < value.block.length;j++)
          {
            for (var k = 0; k < value.block[j].panchayat.length; k++)
            {
              for (var l = 0; l < value.block[j].panchayat[k].village.length; l++)
              {
                sum+=value.block[j].panchayat[k].village[l].data[i].val;
              }
            }
          }
              storeData.push({
                "date": parseDate.parse(value.block[0].panchayat[0].village[0].data[i].date),
                "literacy_rate": sum/(j*k*l)
              });
        }
      }
      return storeData;
    }

    function opCenturyBlock ()
    {
      var storeData=[];
      var year = Math.floor(startdate.getYear()/100);
      var value = data.state[id[1]].district[id[2]].block[id[3]];
      console.log(value);
      var sum = 0,count = 0,county=0;
      for(var i=0;i < value.panchayat[0].village[0].data.length;i++)
      {
        var date = parseDate.parse(value.panchayat[0].village[0].data[i].date);

        if(parseDate.parse(value.panchayat[0].village[0].data[i].date) >= startdate && parseDate.parse(value.panchayat[0].village[0].data[i].date) <= enddate)
        {
          if(Math.floor(date.getYear()/100) == year)
          {
            county++;
            for(var j=0;j < value.panchayat.length;j++)
            {
              for(var k=0;k < value.panchayat[j].village.length;k++)
              {
                sum+=value.panchayat[j].village[k].data[i].val;
                count++;
              }
            }
          }
          else
          {
              console.log("Sum "+sum+" c" +count);
              storeData.push({
                "date": parseDate.parse(value.panchayat[0].village[0].data[i-county].date),
                "literacy_rate": sum/count
              });
              year++;
              sum = 0, count = 0,county=1;
              for(var j=0;j < value.panchayat.length;j++)
              {
                for(var k=0;k < value.panchayat[j].village.length;k++)
                {
                  sum+=value.panchayat[j]
                        .village[k]
                        .data[i].val;
                  count++;
                }
              }
          }
        }
        if(parseDate.parse(value.panchayat[0].village[0].data[i].date) > enddate)
          break;
      }
      storeData.push({
        "date": parseDate.parse(value.panchayat[0].village[0].data[i-county].date),
        "literacy_rate": sum/count
      });
      return storeData;
    }

    function opDecadeBlock ()
    {
      var storeData=[];
      var year = Math.floor(startdate.getYear()/10);
      var value = data.state[id[1]].district[id[2]].block[id[3]];
      console.log(value);
      var sum = 0,count = 0,county=0;
      for(var i=0;i < value.panchayat[0].village[0].data.length;i++)
      {
        var date = parseDate.parse(value.panchayat[0].village[0].data[i].date);

        if(parseDate.parse(value.panchayat[0].village[0].data[i].date) >= startdate && parseDate.parse(value.panchayat[0].village[0].data[i].date) <= enddate)
        {
          if(Math.floor(date.getYear()/10) == year)
          {
            county++;
            for(var j=0;j < value.panchayat.length;j++)
            {
              for(var k=0;k < value.panchayat[j].village.length;k++)
              {
                sum+=value.panchayat[j].village[k].data[i].val;
                count++;
              }
            }
          }
          else
          {
              console.log("Sum "+sum+" c" +count);
              storeData.push({
                "date": parseDate.parse(value.panchayat[0].village[0].data[i-county].date),
                "literacy_rate": sum/count
              });
              year++;
              sum = 0, count = 0,county=1;
              for(var j=0;j < value.panchayat.length;j++)
              {
                for(var k=0;k < value.panchayat[j].village.length;k++)
                {
                  sum+=value.panchayat[j]
                        .village[k]
                        .data[i].val;
                  count++;
                }
              }
          }
        }
        if(parseDate.parse(value.panchayat[0].village[0].data[i].date) > enddate)
          break;
      }
      storeData.push({
        "date": parseDate.parse(value.panchayat[0].village[0].data[i-county].date),
        "literacy_rate": sum/count
      });
      return storeData;
    }

    function opYearBlock()
    {
        var storeData=[];
        var year = startdate.getYear();
        var value = data.state[id[1]].district[id[2]].block[id[3]];
        var sum = 0,count = 0,county=0;
        for(var i=0;i < value.panchayat[0].village[0].data.length;i++)
        {
          var date = parseDate.parse(value.panchayat[0].village[0].data[i].date);

          if(parseDate.parse(value.panchayat[0].village[0].data[i].date) >= startdate && parseDate.parse(value.panchayat[0].village[0].data[i].date) <= enddate)
          {
            if(date.getYear() == year)
            {
              county++;
              for(var j=0;j < value.panchayat.length;j++)
              {
                for(var k=0;k < value.panchayat[j].village.length;k++)
                {
                  sum+=value.panchayat[j].village[k].data[i].val;
                  count++;
                }
              }
            }
            else
            {
                console.log("Sum "+sum+" c" +count);
                storeData.push({
                  "date": parseDate.parse(value.panchayat[0].village[0].data[i-county].date),
                  "literacy_rate": sum/count
                });
                year++;
                sum = 0, count = 0,county=1;
                for(var j=0;j < value.panchayat.length;j++)
                {
                  for(var k=0;k < value.panchayat[j].village.length;k++)
                  {
                    sum+=value.panchayat[j]
                          .village[k]
                          .data[i].val;
                    count++;
                  }
                }
            }
          }
          if(parseDate.parse(value.panchayat[0].village[0].data[i].date) > enddate)
            break;
        }
        storeData.push({
          "date": parseDate.parse(value.panchayat[0].village[0].data[i-county].date),
          "literacy_rate": sum/count
        });
        return storeData;
    }

    function opMonthBlock()
    {
      var storeData=[];
      var value = data.state[id[1]].district[id[2]].block[id[3]];
      console.log(value);
      for(var i=0;i < value.panchayat[0].village[0].data.length;i++)
      {
        var date = parseDate.parse(value.panchayat[0].village[0].data[i].date);
        var sum = 0;
        if(parseDate.parse(value.panchayat[0].village[0].data[i].date) >= startdate && parseDate.parse(value.panchayat[0].village[0].data[i].date) <= enddate)
        {
          for(var j=0;j < value.panchayat.length;j++)
          {
            for (var k = 0; k < value.panchayat[j].village.length; k++)
            {
              sum+=value.panchayat[j].village[k].data[i].val;
            }
          }
              storeData.push({
                "date": parseDate.parse(value.panchayat[0].village[0].data[i].date),
                "literacy_rate": sum/(j*k)
              });
        }
      }
      return storeData;
    }


    function opCenturyPanchayat ()
    {
      var storeData=[];
      var year = Math.floor(startdate.getYear()/100);
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]];
      console.log(value);
              var sum = 0,count = 0,county=0;
      for(var i=0;i < value.village[0].data.length;i++)
      {
        var date = parseDate.parse(value.village[0].data[i].date);

        if(parseDate.parse(value.village[0].data[i].date) >= startdate && parseDate.parse(value.village[0].data[i].date) <= enddate)
        {
          if(Math.floor(date.getYear()/100) == year)
          {
            county++;
            for(var j=0;j < value.village.length;j++)
            {
                sum+=value.village[j].data[i].val;
                count++;
            }
          }
          else
          {

              console.log("Sum "+sum+" c" +count);
              storeData.push({
                "date": parseDate.parse(value.village[0].data[i-county].date),
                "literacy_rate": sum/count
              });
              year++;
              sum = 0, count = 0,county=1;
              for(var j=0;j < value.village.length;j++)
              {
                  sum+=value.village[j].data[i].val;
                  count++;
              }
          }
        }
        if(parseDate.parse(value.village[0].data[i].date) > enddate)
          break;
      }
      storeData.push({
        "date": parseDate.parse(value.village[0].data[i-county].date),
        "literacy_rate": sum/count
      });
      return storeData;
    }

    function opDecadePanchayat ()
    {

        var storeData=[];
        var year = Math.floor(startdate.getYear()/10);
        var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]];
        console.log(value);
                var sum = 0,count = 0,county=0;
        for(var i=0;i < value.village[0].data.length;i++)
        {
          var date = parseDate.parse(value.village[0].data[i].date);

          if(parseDate.parse(value.village[0].data[i].date) >= startdate && parseDate.parse(value.village[0].data[i].date) <= enddate)
          {
            if(Math.floor(date.getYear()/10) == year)
            {
              county++;
              for(var j=0;j < value.village.length;j++)
              {
                  sum+=value.village[j].data[i].val;
                  count++;
              }
            }
            else
            {

                console.log("Sum "+sum+" c" +count);
                storeData.push({
                  "date": parseDate.parse(value.village[0].data[i-county].date),
                  "literacy_rate": sum/count
                });
                year++;
                sum = 0, count = 0,county=1;
                for(var j=0;j < value.village.length;j++)
                {
                    sum+=value.village[j].data[i].val;
                    count++;
                }
            }
          }
          if(parseDate.parse(value.village[0].data[i].date) > enddate)
            break;
        }
        storeData.push({
          "date": parseDate.parse(value.village[0].data[i-county].date),
          "literacy_rate": sum/count
        });
        return storeData;
    }

    function opYearPanchayat ()
    {
      var storeData=[];
      var year = startdate.getYear();
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]];
      console.log(value);
              var sum = 0,count = 0,county=0;
      for(var i=0;i < value.village[0].data.length;i++)
      {
        var date = parseDate.parse(value.village[0].data[i].date);

        if(parseDate.parse(value.village[0].data[i].date) >= startdate && parseDate.parse(value.village[0].data[i].date) <= enddate)
        {
          if(date.getYear() == year)
          {
            county++;
            for(var j=0;j < value.village.length;j++)
            {
                sum+=value.village[j].data[i].val;
                count++;
            }
          }
          else
          {

              console.log("Sum "+sum+" c" +count);
              storeData.push({
                "date": parseDate.parse(value.village[0].data[i-county].date),
                "literacy_rate": sum/count
              });
              year++;
              sum = 0, count = 0,county=1;
              for(var j=0;j < value.village.length;j++)
              {
                  sum+=value.village[j].data[i].val;
                  count++;
              }
          }
        }
        if(parseDate.parse(value.village[0].data[i].date) > enddate)
          break;
      }
      storeData.push({
        "date": parseDate.parse(value.village[0].data[i-county].date),
        "literacy_rate": sum/count
      });
      return storeData;
    }

    function opMonthPanchayat ()
    {
      var storeData=[];
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]];
      console.log(value);
      for(var i=0;i < value.village[0].data.length;i++)
      {
        var date = parseDate.parse(value.village[0].data[i].date);
        var sum = 0;
        if(parseDate.parse(value.village[0].data[i].date) >= startdate && parseDate.parse(value.village[0].data[i].date) <= enddate)
        {
          for(var j=0;j < value.village.length;j++)
          {
              sum+=value.village[j].data[i].val;
          }
              storeData.push({
                "date": parseDate.parse(value.village[0].data[i].date),
                "literacy_rate": sum/j
              });
        }
      }
      return storeData;
    }

    function opCenturyVillage ()
    {
      var storeData=[];
      var year = Math.floor(startdate.getYear()/100);
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]].village[id[5]];
      var sum = 0, count = 0;
      for(var i=0;i < value.data.length;i++)
      {
        var date = parseDate.parse(value.data[i].date);

        if(parseDate.parse(value.data[i].date) >= startdate && parseDate.parse(value.data[i].date) <= enddate)
        {

          console.log(Math.floor(date.getYear()/100)+"   "+year);
          if(Math.floor(date.getYear()/100) == year)
          {
            sum+=value.data[i].val;
            count++;
          }
          else
          {
            console.log("Sum "+sum+" c" +count);
            storeData.push({
              "date": parseDate.parse(value.data[i-count].date),
              "literacy_rate": sum/count
            });
            year++;
            sum=value.data[i].val;
            count=1;
          }
        }
      }

        storeData.push({
          "date": parseDate.parse(value.data[i-count].date),
          "literacy_rate": sum/count
        });
      return storeData;

    }

    function opDecadeVillage ()
    {
      var storeData=[];
      var year = Math.floor(startdate.getYear()/10);
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]].village[id[5]];
      var sum = 0, count = 0;
      for(var i=0;i < value.data.length;i++)
      {
        var date = parseDate.parse(value.data[i].date);

        if(parseDate.parse(value.data[i].date) >= startdate && parseDate.parse(value.data[i].date) <= enddate)
        {

          console.log(Math.floor(date.getYear()/10)+"   "+year);
          if(Math.floor(date.getYear()/10) == year)
          {
            sum+=value.data[i].val;
            count++;
          }
          else
          {
            console.log("Sum "+sum+" c" +count);
            storeData.push({
              "date": parseDate.parse(value.data[i-count].date),
              "literacy_rate": sum/count
            });
            year++;
            sum=value.data[i].val;
            count=1;
          }
        }
      }

        storeData.push({
          "date": parseDate.parse(value.data[i-count].date),
          "literacy_rate": sum/count
        });
      return storeData;
    }

    function opYearVillage ()
    {
      var storeData=[];
      var year = startdate.getYear();
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]].village[id[5]];
      var sum = 0, count = 0;
      for(var i=0;i < value.data.length;i++)
      {
        var date = parseDate.parse(value.data[i].date);

        if(parseDate.parse(value.data[i].date) >= startdate && parseDate.parse(value.data[i].date) <= enddate)
        {
          console.log("Sum "+sum+" c" +count);
          if(date.getYear() == year)
          {
            sum+=value.data[i].val;
            count++;
          }
          else
          {

              console.log("Sum "+sum+" c" +count);
            storeData.push({
              "date": parseDate.parse(value.data[i-count].date),
              "literacy_rate": sum/count
            });
            year++;
            sum=value.data[i].val;
            count=1;
          }
        }
      }
      storeData.push({
        "date": parseDate.parse(value.data[i-count].date),
        "literacy_rate": sum/count
      });
      return storeData;

    }

    function opMonthVillage ()
    {
      var storeData=[];
      console.log(startdate.getYear()+"-"+startdate.getMonth()+"-"+startdate.getDate());
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]].village[id[5]];
      console.log(value.data.length);
      for(var i=0;i < value.data.length;i++)
      {
        if(parseDate.parse(value.data[i].date) >= startdate && parseDate.parse(value.data[i].date) <= enddate)
        {
          console.log(value.data[i].date);
          storeData.push({
            "date": parseDate.parse(value.data[i].date),
            "literacy_rate": value.data[i].val
          });
        }
      }
      return storeData;
    }

    var timeIn =
    {
      'centurystate': opCenturyState,
      'decadestate': opDecadeState,
      'yearstate': opYearState,
      'monthstate': opMonthState,
      'centurydistrict': opCenturyDistrict,
      'decadedistrict': opDecadeDistrict,
      'yeardistrict': opYearDistrict,
      'monthdistrict': opMonthDistrict,
      'centuryblock': opCenturyBlock,
      'decadeblock': opDecadeBlock,
      'yearblock': opYearBlock,
      'monthblock': opMonthBlock,
      'centurypanchayat': opCenturyPanchayat,
      'decadepanchayat': opDecadePanchayat,
      'yearpanchayat': opYearPanchayat,
      'monthpanchayat': opMonthPanchayat,
      'centuryvillage': opCenturyVillage,
      'decadevillage': opDecadeVillage,
      'yearvillage': opYearVillage,
      'monthvillage': opMonthVillage,
    };
    return timeIn[value]();
  }

  function searchRegion (name,value,data)
  {
    function searchState ()
    {
      for(var i=0;i<data.state.length;i++)
      {
        if(data.state[i].name == value)
          return ["State "+value+" is found",i];
      }
      return ["State "+value+" is not found"];
    }

    function searchDistrict ()
    {
      for(var i=0;i<data.state.length;i++)
      {
        for(var j=0;j<data.state[i].district.length;j++)
        {
          if(data.state[i].district[j].name == value)
            return ["District "+value+" is found",i,j];
        }
      }
      return ["District "+value+" is not found"];
    }

    function searchBlock ()
    {
      for(var i=0;i<data.state.length;i++)
      {
        for(var j=0;j<data.state[i].district.length;j++)
        {
          for(var k=0;k<data.state[i].district[j].block.length;k++)
          {
            if(data.state[i].district[j].block[k].name == value)
              return ["Block "+value+" is found",i,j,k];
          }
        }
      }
      return ["Block "+value+" is not found"];
    }

    function searchPanchayat ()
    {
      for(var i=0;i<data.state.length;i++)
      {
        for(var j=0;j<data.state[i].district.length;j++)
        {
          for(var k=0;k<data.state[i].district[j].block.length;k++)
          {
            for(var l=0;l<data.state[i].district[j].block[k].panchayat.length;l++)
            {
              if(data.state[i].district[j].block[k].panchayat[l].name == value)
                return ["Panchayat "+value+" is found",i,j,k,l];
            }
          }
        }
      }
      return ["Panchayat "+value+" is not found"];
    }

    function searchVillage ()
    {
      for(var i=0;i<data.state.length;i++)
      {
        for(var j=0;j<data.state[i].district.length;j++)
        {
          for(var k=0;k<data.state[i].district[j].block.length;k++)
          {
            for(var l=0;l<data.state[i].district[j].block[k].panchayat.length;l++)
            {
              for(var m=0;m<data.state[i].district[j].block[k].panchayat[l].village.length;m++)
              {
                if(data.state[i].district[j].block[k].panchayat[l].village[m].name == value)
                  return ["Village "+value+" is found",i,j,k,l,m];
              }
            }
          }
        }
      }
      return ["Village "+value+" is not found"];
    }

    var regionIn =
    {
      'state': searchState,
      'district': searchDistrict,
      'block': searchBlock,
      'panchayat': searchPanchayat,
      'village': searchVillage
    };
    return regionIn[name]();
  }
