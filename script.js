const auth = "M44wKBrGObHhPXntyOHfdIjjjwMXZj0K8X4OrYtUDi0";
const accountSlug = "hen-archives";
const perPage = 20;
let highestZIndex = 100;

let nodes = [];
let links = [];

const setHighestZIndex = (element) => {
  highestZIndex++;
  element.style.zIndex = highestZIndex;
};

const createD3Visualization = (contents, container) => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  const linkDistance = 400;
  const charge = -750;

  const filteredContents = contents.filter(
    (content) => !content.channel.startsWith("!")
  );

  nodes = filteredContents.map((content) => ({
    id: content.channelId,
    title: content.channel,
    blocks: content.blocks,
    connections: content.connections,
  }));

  links = [];
  const nodesByTitle = new Map(
    nodes.map((node) => [node.title.trim().toLowerCase(), node])
  );

  nodes.forEach((sourceNode) => {
    if (sourceNode.connections) {
      sourceNode.connections.forEach((targetTitle) => {
        const targetNode = nodesByTitle.get(targetTitle.trim().toLowerCase());
        if (targetNode) {
          links.push({ source: sourceNode.id, target: targetNode.id });
        } else {
          console.log(
            `No match found for connection "${targetTitle}" from channel "${sourceNode.title}"`
          );
        }
      });
    }
  });

  const svgContainer = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(
      d3
        .zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => svg.attr("transform", event.transform))
    );

  const svg = svgContainer.append("g");

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(linkDistance)
    )
    .force("charge", d3.forceManyBody().strength(charge))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", "white")
    .attr("stroke-width", 2);

  const label = svg
    .append("g")
    .attr("class", "labels")
    .selectAll("g")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "label-group");

  label
    .append("rect")
    .attr("class", "label-bg")
    .attr("fill", "rgb(13, 13, 13)");

  label
    .append("text")
    .attr("class", "label-text")
    .text((d) => d.title)
    .attr("fill", "white")
    .attr("x", 10)
    .attr("y", -10);

  label.each(function () {
    const g = d3.select(this);
    const text = g.select("text");
    const rect = g.select("rect");
    const bbox = text.node().getBBox();

    rect
      .attr("x", bbox.x - 5)
      .attr("y", bbox.y - 5)
      .attr("width", bbox.width + 10)
      .attr("height", bbox.height + 10)
      .attr("stroke", "none");
  });

  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 7)
    .attr("fill", "white")
    .attr("stroke", "white")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    )
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    label.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });

  function getSelectedNodes() {
    // Example logic for getting selected nodes
    // Adjust this logic based on your application's requirements
    return nodes.filter((node) => {
      // Add your criteria for selection here
      // For example, select nodes with a specific tag or title
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
  }

  function handleMouseOver(event, d) {
    d3.selectAll(".node").style("opacity", 0.2).style("stroke-opacity", 0.2);
    d3.selectAll(".link").style("opacity", 0.2);
    d3.selectAll(".label-text").style("opacity", 0.2);
    d3.selectAll(".label-bg").style("opacity", 0.2);

    d3.select(this)
      .style("fill", "rgb(0, 255, 0)")
      .style("stroke", "rgb(0, 255, 0)")
      .style("opacity", 1)
      .style("stroke-opacity", 1);

    d3.selectAll(".link")
      .filter((l) => l.source.id === d.id || l.target.id === d.id)
      .style("stroke", "rgb(0, 255, 0)")
      .style("opacity", 1);

    d3.selectAll(".node")
      .filter((n) => n.id === d.id)
      .style("fill", "rgb(0, 255, 0)")
      .style("stroke", "rgb(0, 255, 0)")
      .style("opacity", 1)
      .style("stroke-opacity", 1);

    d3.selectAll(".label-text")
      .filter((n) => n.id === d.id)
      .style("fill", "rgb(0, 255, 0)")
      .style("opacity", 1);

    d3.selectAll(".label-bg")
      .filter((n) => n.id === d.id)
      .style("stroke", "rgb(0, 255, 0)")
      .style("opacity", 1);

    // Ensure selected items from the menu decrease in opacity but remain visible
    const selectedNodes = getSelectedNodes();
    selectedNodes.forEach((node) => {
      d3.selectAll(".node")
        .filter((n) => n.id === node.id)
        .style("opacity", 0.5)
        .style("stroke-opacity", 0.5);
      d3.selectAll(".label-text")
        .filter((n) => n.id === node.id)
        .style("opacity", 0.5);
      d3.selectAll(".label-bg")
        .filter((n) => n.id === node.id)
        .style("opacity", 0.5);
    });
  }

  function handleMouseOut() {
    highlightNodes();
  }

  async function handleClick(event, d) {
    const channelResponse = await fetch(
      `https://api.are.na/v2/channels/${d.id}/contents`,
      {
        headers: {
          Authorization: `Bearer ${auth}`,
          "Cache-Control": "no-store, max-age=0, no-cache",
          referrerPolicy: "no-referrer",
        },
      }
    );
    const channelData = await channelResponse.json();
    const heroBlock = channelData.contents.find(
      (block) => block.title.toLowerCase() === "hero"
    );
    const descriptionBlock = channelData.contents.find(
      (block) => block.title.toLowerCase() === "description"
    );
    const tagsBlock = channelData.contents.find(
      (block) => block.title.toLowerCase() === "tag"
    );

    const tagsElements = tagsBlock
      ? tagsBlock.content.split(",").map((tag) => tag.trim())
      : [];

    const truncateText = (text, wordLimit) => {
      const words = text.split(" ");
      if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(" ") + "...";
      }
      return text;
    };

    const truncatedDescription = descriptionBlock
      ? truncateText(descriptionBlock.content, 85)
      : "";

    const divContent = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3>${d.title}</h3>
        <button class="close-btn">x</button>
      </div>
      ${tagsElements.map((tag) => `<h4>${tag}</h4>`).join("")}
      ${
        heroBlock
          ? `<img src="${heroBlock.image.display.url}" alt="${d.title}" style="max-width: 100%;">`
          : ""
      }
      ${truncatedDescription ? `<p>${truncatedDescription}</p>` : ""}
      <button class="more-btn" style="margin-top: 10px;">More</button>
    `;

    if (d.infoDiv) {
      d.infoDiv.remove();
    }

    d.infoDiv = d3
      .select("body")
      .append("div")
      .attr("class", "info draggable-info")
      .html(divContent)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("padding", "10px")
      .style("z-index", highestZIndex)
      .style("pointer-events", "all")
      .style("display", "block")
      .style("width", "0px")
      .style("max-height", "0px")
      .style("overflow", "hidden");

    makeDraggable();

    const infoDivNode = d.infoDiv.node();
    const divWidth = 400;

    d.infoDiv
      .style("left", `${(window.innerWidth - divWidth) / 2}px`)
      .style("top", `${window.innerHeight / 10}px`)
      .style("max-height", "100vh")
      .style("overflow", "scroll");

    setTimeout(() => {
      d.infoDiv.style("width", `${divWidth}px`).style("max-height", "auto");
    }, 0);

    d.infoDiv.select(".close-btn").on("click", function () {
      d.infoDiv
        .style("width", "0px")
        .style("max-height", "0px")
        .style("padding", "0px");
      setTimeout(() => {
        d.infoDiv.remove();
        d.infoDiv = null;
      }, 500);
    });

    d.infoDiv.select(".more-btn").on("click", function () {
      alert(`More details for ${d.title}`);
    });

    setHighestZIndex(d.infoDiv.node());
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
};

const fetchAccountContents = async (accountSlug) => {
  document.body.classList.add("loading");

  const loadingIndicator = document.createElement("div");
  loadingIndicator.className = "loading-indicator";
  loadingIndicator.textContent = "Loading...";
  document.body.appendChild(loadingIndicator);

  const container = document.querySelector(".container"); // Ensure container is defined here

  try {
    let allChannels = [];
    let page = 1;
    let morePages = true;

    while (morePages) {
      const channelsResponse = await fetch(
        `https://api.are.na/v2/users/${accountSlug}/channels?page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${auth}`,
            "Cache-Control": "no-store, max-age=0, no-cache",
            referrerPolicy: "no-referrer",
          },
        }
      );

      if (!channelsResponse.ok) {
        throw new Error(`HTTP error! status: ${channelsResponse.status}`);
      }

      const channelsData = await channelsResponse.json();
      allChannels = allChannels.concat(channelsData.channels);

      if (channelsData.channels.length < perPage) {
        morePages = false;
      } else {
        page++;
      }
    }

    const allContents = [];
    const allTags = new Set();
    const allTitles = new Set();
    const allChannelNames = [];

    for (const channel of allChannels) {
      if (channel.title.startsWith("!")) {
        continue; // Skip channels that start with "!"
      }

      const contentsResponse = await fetch(
        `https://api.are.na/v2/channels/${channel.id}/contents`,
        {
          headers: {
            Authorization: `Bearer ${auth}`,
            "Cache-Control": "no-store, max-age=0, no-cache",
            referrerPolicy: "no-referrer",
          },
        }
      );

      if (contentsResponse.ok) {
        const contentsData = await contentsResponse.json();
        const connectionsBlock = contentsData.contents.find(
          (block) => block.title.toLowerCase() === "connections"
        );
        const connections = connectionsBlock
          ? connectionsBlock.content.split(",").map((name) => name.trim())
          : [];

        const tagsBlock = contentsData.contents.find(
          (block) => block.title.toLowerCase() === "tag"
        );
        const titleBlock = contentsData.contents.find(
          (block) => block.title.toLowerCase() === "title"
        );

        if (tagsBlock) {
          tagsBlock.content
            .split(",")
            .forEach((tag) => allTags.add(tag.trim()));
        }

        if (titleBlock) {
          titleBlock.content
            .split(",")
            .forEach((title) => allTitles.add(title.trim()));
        }

        allContents.push({
          channel: channel.title,
          channelId: channel.id,
          blocks: contentsData.contents,
          connections,
        });

        allChannelNames.push(channel.title);
      }
    }

    document.body.removeChild(loadingIndicator);
    document.body.classList.remove("loading");

    createD3Visualization(allContents, container);
    createMenu(Array.from(allTags), Array.from(allTitles), allChannelNames);

    // Show the welcome message after loading is done
    showWelcomeMessage();
  } catch (error) {
    console.error("Error fetching account contents:", error);
    loadingIndicator.textContent = "Failed to load content";
  }
};

fetchAccountContents(accountSlug);
