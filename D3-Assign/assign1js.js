

var margin = {top: 50, right: 50, bottom: 100, left: 50},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function showBy()
{
  var xShows = null, regionname = null;
  var region = document.getElementById("region").value;
  var time = document.getElementById("time").value;
  var showing = document.getElementById("showing");
  regionname = document.getElementById("regionname").value;
  xShows = showTime(time);
  var searchValue;

  d3.json("data.json", function(data)
  {
    searchValue = searchRegion(region,regionname,data);
    console.log(searchValue);



  if(region != "select" && time != "select" && regionname!=null)
  {
    showing.innerHTML = searchValue;
  }
  else {
    showing.innerHTML = "";
  }

  });
}

  function showTime (value)
  {
    var timeIn =
    {
      'century': 'centuries',
      'decade': 'decades',
      'year': 'years',
      'month': 'months',
      'day': 'days'
    };
    return timeIn[value];
  }

  function searchRegion (name,value,data)
  {
    function searchState ()
    {
      for(var i=0;i<data.state.length;i++)
      {
        //console.log(data.state[i].name+" "+value);
        if(data.state[i].name == value)
          return "state "+value+" is found";
      }
      return "state "+value+" is not found";
    }

    function searchDistrict ()
    {
      for(var i=0;i<data.state.length;i++)
      {
        for(var j=0;j<data.state[i].district.length;j++)
        {
          if(data.state[i].district[j].name == value)
            return "district "+value+" is found";
        }
      }
      return "district "+value+" is not found";
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
              return "block "+value+" is found";
          }
        }
      }
      return "block "+value+" is not found";
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
                return "panchayat "+value+" is found";
            }
          }
        }
      }
      return "panchayat "+value+" is not found";
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
                  return "village "+value+" is found";
              }
            }
          }
        }
      }
      return "village "+value+" is not found";
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
