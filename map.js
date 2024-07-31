const apiKey = "30498760168a48f394e936e401403854"; // Replace with your actual OpenCage API key

const showMap = async (locations) => {
  const mapDiv = d3.select("body").append("div").attr("class", "map-div");

  mapDiv
    .transition()
    .duration(500)
    .style("display", "block")
    .style("width", "80%")
    .style("height", "80%");

  const closeButton = mapDiv
    .append("button")
    .attr("class", "close-btn")
    .text("x")
    .style("background-color", "rgb(0, 255, 0)")
    .style("color", "black")
    .style("border", "none")
    .style("padding", "5px 10px")
    .style("margin", "5px 10px")
    .style("cursor", "pointer")
    .on("click", function () {
      mapDiv
        .transition()
        .duration(500)
        .style("width", "0%")
        .style("height", "0%");
      setTimeout(() => mapDiv.remove(), 500);
    });

  closeButton.node().style.zIndex = 1000; // Ensure the close button has the highest z-index

  const svg = mapDiv.append("svg").attr("width", "100%").attr("height", "100%");

  const projection = d3
    .geoNaturalEarth1()
    .scale(200)
    .translate([svg.node().clientWidth / 2, svg.node().clientHeight / 2]);

  const path = d3.geoPath().projection(projection);

  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      svg.attr("transform", event.transform);
    });

  svg.call(zoom);

  try {
    const world = await d3.json(
      "https://raw.githubusercontent.com/andybarefoot/andybarefoot-www/master/maps/mapdata/custom50.json"
    );

    if (!world || !world.features) {
      throw new Error("Invalid world map data structure");
    }

    svg
      .selectAll("path")
      .data(world.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "rgb(13, 13, 13)")
      .attr("stroke", "#e4e4e4")
      .attr("stroke-width", 0.5);

    const locationPromises = locations.map(async (location) => {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          location
        )}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const coords = data.results[0].geometry;
        return { location, coords };
      } else {
        console.warn(`No results found for location: ${location}`);
        return null;
      }
    });

    const locationData = await Promise.all(locationPromises);

    const nodes = svg
      .selectAll("circle")
      .data(locationData)
      .enter()
      .append("circle")
      .attr("cx", (d) => projection([d.coords.lng, d.coords.lat])[0])
      .attr("cy", (d) => projection([d.coords.lng, d.coords.lat])[1])
      .attr("r", 5)
      .attr("fill", "rgb(0, 255, 0)")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .style("cursor", "crosshair")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 7);
        this.style.zIndex = 1001; // Increase z-index on hover

        console.log(d.location);

        const tooltip = svg
          .append("text")
          .attr("x", projection([d.coords.lng, d.coords.lat])[0])
          .attr("y", projection([d.coords.lng, d.coords.lat])[1] - 10)
          .attr("class", "tooltip")
          .attr("fill", "white")
          .attr("text-anchor", "middle")
          .text(`${d.location}`);

        d3.select(this).on("mouseout", function () {
          d3.select(this).attr("r", 5);
          d3.select(this).style.zIndex = null; // Reset z-index on mouseout
          tooltip.remove();
        });
      });
  } catch (error) {
    console.error("Error loading world map:", error);
  }
};

const getLocationData = async () => {
  const locations = [];
  for (const node of nodes) {
    const placeBlock = node.blocks.find(
      (block) => block.title.toLowerCase() === "place"
    );
    if (placeBlock) {
      const places = placeBlock.content.split(",").map((place) => place.trim());
      places.forEach((place) => {
        if (place) {
          locations.push(place);
        }
      });
    }
  }
  return locations;
};

// Fetch city data from are.na, get coordinates and update JSON file
const fetchCityDataAndUpdateJSON = async () => {
  const locations = await getLocationData();
  const locationPromises = locations.map(async (location) => {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        location
      )}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.results.length > 0) {
      const coords = data.results[0].geometry;
      return { name: location, lat: coords.lat, lng: coords.lng };
    } else {
      console.warn(`No results found for location: ${location}`);
      return null;
    }
  });

  const locationData = await Promise.all(locationPromises);
  const validLocationData = locationData.filter((data) => data !== null);

  // Update JSON file (this part will need to be handled on the server-side or using a file system module in Node.js)
  console.log(JSON.stringify(validLocationData, null, 2));
};

// Call this function to fetch city data and update the JSON file
fetchCityDataAndUpdateJSON();
