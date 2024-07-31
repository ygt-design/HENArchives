let selectedItems = {
  tag: new Set(),
  title: new Set(),
};

const createMenu = (tags, titles, channelNames) => {
  const menu = d3.select("body").append("div").attr("class", "menu");

  // Add search bar
  const searchBarContainer = menu
    .append("div")
    .attr("class", "search-bar-container");
  const searchBar = searchBarContainer
    .append("input")
    .attr("type", "text")
    .attr("class", "search-bar")
    .attr("placeholder", "Search Nodes");

  const itemsContainerWrapper = menu
    .append("div")
    .attr("class", "items-container-wrapper");
  const itemsContainer = itemsContainerWrapper
    .append("div")
    .attr("class", "items-container");

  const addItem = (item, type) => {
    const menuItem = itemsContainer
      .append("div")
      .attr("class", "menu-item")
      .text(item)
      .on("click", function () {
        toggleSelection(type, item, this);
      })
      .on("mouseover", function () {
        if (!selectedItems[type].has(item)) {
          d3.select(this).style("background-color", "rgb(0, 255, 0)");
        }
        highlightHover(item, type);
      })
      .on("mouseout", function () {
        if (!selectedItems[type].has(item)) {
          d3.select(this).style("background-color", "#e4e4e4");
        }
        highlightNodes();
      });

    if (selectedItems[type].has(item)) {
      menuItem.style("background-color", "rgb(0, 255, 0)");
    }
  };

  tags.forEach((tag) => addItem(tag, "tag"));
  titles.forEach((title) => addItem(title, "title"));

  itemsContainer
    .append("button")
    .attr("class", "clear-btn")
    .text("Clear")
    .on("click", clearSelections);

  // Add "View the Map" button
  menu
    .append("button")
    .attr("class", "view-map-btn")
    .text("View the Map")
    .on("click", async function () {
      try {
        const locations = await getLocationData();
        showMap(locations);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    });

  // Initialize jQuery UI autocomplete
  $(document).ready(function () {
    $(".search-bar").autocomplete({
      source: channelNames,
      select: function (event, ui) {
        highlightSearch(ui.item.value);
      },
    });

    // Call highlightSearch on input event
    $(".search-bar").on("input", function () {
      highlightSearch(this.value);
    });
  });
};

const toggleSelection = (type, value, element) => {
  if (selectedItems[type].has(value)) {
    selectedItems[type].delete(value);
    d3.select(element).style("background-color", "#e4e4e4");
  } else {
    selectedItems[type].add(value);
    d3.select(element).style("background-color", "rgb(0, 255, 0)");
  }
  highlightNodes();
};

const highlightNodes = () => {
  d3.selectAll(".node")
    .style("fill", "white")
    .style("stroke", "white")
    .style("stroke-opacity", 1)
    .style("opacity", 1);
  d3.selectAll(".link").style("stroke", "white").style("opacity", 1);
  d3.selectAll(".label-text").style("fill", "white").style("opacity", 1);
  d3.selectAll(".label-bg").style("stroke", "none").style("opacity", 1);

  const matchingNodes = nodes.filter((node) => {
    const blocks = node.blocks;
    const matchesTag = Array.from(selectedItems.tag).some((tag) => {
      const tagBlock = blocks.find(
        (block) => block.title.toLowerCase() === "tag"
      );
      return (
        tagBlock &&
        tagBlock.content
          .split(",")
          .map((el) => el.trim())
          .includes(tag)
      );
    });
    const matchesTitle = Array.from(selectedItems.title).some((title) => {
      const titleBlock = blocks.find(
        (block) => block.title.toLowerCase() === "title"
      );
      return (
        titleBlock &&
        titleBlock.content
          .split(",")
          .map((el) => el.trim())
          .includes(title)
      );
    });
    return matchesTag || matchesTitle;
  });

  if (matchingNodes.length === 0) {
    d3.selectAll(".node").style("opacity", 1).style("stroke-opacity", 1);
    d3.selectAll(".link").style("opacity", 1);
    d3.selectAll(".label-text").style("opacity", 1);
    d3.selectAll(".label-bg").style("opacity", 1);
    return;
  }

  d3.selectAll(".node").style("opacity", 0.2).style("stroke-opacity", 0.2);
  d3.selectAll(".link").style("opacity", 0.2);
  d3.selectAll(".label-text").style("opacity", 0.2);
  d3.selectAll(".label-bg").style("opacity", 0.2);

  matchingNodes.forEach((node) => {
    d3.selectAll(".node")
      .filter((n) => n.id === node.id)
      .style("fill", "rgb(0, 255, 0)")
      .style("stroke", "rgb(0, 255, 0)")
      .style("opacity", 1)
      .style("stroke-opacity", 1);

    d3.selectAll(".label-text")
      .filter((n) => n.id === node.id)
      .style("fill", "rgb(0, 255, 0)")
      .style("opacity", 1);

    d3.selectAll(".label-bg")
      .filter((n) => n.id === node.id)
      .style("stroke", "rgb(0, 255, 0)")
      .style("opacity", 1);

    links.forEach((link) => {
      if (link.source.id === node.id || link.target.id === node.id) {
        d3.selectAll(".link")
          .filter((l) => l.source.id === node.id || l.target.id === node.id)
          .style("stroke", "rgb(0, 255, 0)")
          .style("opacity", 1);
      }
    });
  });
};

const highlightHover = (value, type) => {
  const matchingNodes = nodes.filter((node) => {
    const blocks = node.blocks;
    const matchesTag =
      type === "tag" &&
      blocks.some((block) => {
        return (
          block.title.toLowerCase() === "tag" &&
          block.content
            .split(",")
            .map((el) => el.trim())
            .includes(value)
        );
      });
    const matchesTitle =
      type === "title" &&
      blocks.some((block) => {
        return (
          block.title.toLowerCase() === "title" &&
          block.content
            .split(",")
            .map((el) => el.trim())
            .includes(value)
        );
      });
    return matchesTag || matchesTitle;
  });

  d3.selectAll(".node").style("opacity", 0.2).style("stroke-opacity", 0.2);
  d3.selectAll(".link").style("opacity", 0.2);
  d3.selectAll(".label-text").style("opacity", 0.2);

  matchingNodes.forEach((node) => {
    d3.selectAll(".node")
      .filter((n) => n.id === node.id)
      .style("fill", "white")
      .style("stroke", "white")
      .style("opacity", 1)
      .style("stroke-opacity", 1);

    d3.selectAll(".label-text")
      .filter((n) => n.id === node.id)
      .style("fill", "white")
      .style("opacity", 1);

    d3.selectAll(".label-bg")
      .filter((n) => n.id === node.id)
      .style("stroke", "white")
      .style("opacity", 1);

    links.forEach((link) => {
      if (link.source.id === node.id || link.target.id === node.id) {
        d3.selectAll(".link")
          .filter((l) => l.source.id === node.id || l.target.id === node.id)
          .style("stroke", "white")
          .style("opacity", 1);
      }
    });
  });
};

const highlightSearch = (searchTerm) => {
  const matchingNodes = nodes.filter((node) => {
    return node.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  d3.selectAll(".node").style("opacity", 0.2).style("stroke-opacity", 0.2);
  d3.selectAll(".link").style("opacity", 0.2);
  d3.selectAll(".label-text").style("opacity", 0.2);

  matchingNodes.forEach((node) => {
    d3.selectAll(".node")
      .filter((n) => n.id === node.id)
      .style("fill", "white")
      .style("stroke", "white")
      .style("opacity", 1)
      .style("stroke-opacity", 1);

    d3.selectAll(".label-text")
      .filter((n) => n.id === node.id)
      .style("fill", "white")
      .style("opacity", 1);

    d3.selectAll(".label-bg")
      .filter((n) => n.id === node.id)
      .style("stroke", "none")
      .style("opacity", 1);

    links.forEach((link) => {
      if (link.source.id === node.id || link.target.id === node.id) {
        d3.selectAll(".link")
          .filter((l) => l.source.id === node.id || l.target.id === node.id)
          .style("stroke", "white")
          .style("opacity", 1);
      }
    });
  });
};

const clearSelections = () => {
  selectedItems = { tag: new Set(), title: new Set() };
  d3.selectAll(".menu-item").style("background-color", "#e4e4e4");
  highlightNodes();
};
