const showWelcomeMessage = () => {
  const welcomeOverlay = document.createElement("div");
  welcomeOverlay.className = "welcome-overlay";
  welcomeOverlay.innerHTML = `
      <div class="welcome-message">
        <h3>Welcome!</h3>
        <p>We have created this space to connect the dots of artists, activists, scholars, organizations and archives that are engaged in archive-focus research-creation activities. More than providing links to people and places, we are working to map our connections, collaborations and relationships — and create a digital space to support activities, share resources and encourage connections.</p>
        <button class="close-btn"> Continue </button>
      </div>
    `;

  document.body.appendChild(welcomeOverlay);

  const closeButton = welcomeOverlay.querySelector(".close-btn");
  closeButton.addEventListener("click", () => {
    welcomeOverlay.style.display = "none";
    document.body.style.overflow = "auto";
  });

  document.body.style.overflow = "hidden";
};
