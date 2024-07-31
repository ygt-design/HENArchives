function makeDraggable() {
  $(".draggable-info").draggable({
    start: function (event, ui) {
      setHighestZIndex(ui.helper[0]); // Ensure the div is on top while dragging
    },
  });
}

// Create an observer instance
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      for (const node of mutation.addedNodes) {
        if ($(node).hasClass("draggable-info")) {
          makeDraggable();
        }
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
