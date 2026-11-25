export default function decorate(block) {
  const text = block.textContent.trim();

  // Alert button with icon
  if (block.classList.contains('button-with-icon')) {
    block.innerHTML = `
      <button type="button" class="custom-btn alert-btn">
        <img
          src="/icons/custom-alert.svg"
          alt="Alert"
          class="button-icon"
        />
        <span>${text}</span>
      </button>
    `;
    return;
  }

  // Normal submit button
  if (block.classList.contains('button-without-icon')) {
    block.innerHTML = `
      <button type="button" class="custom-btn submit-btn">
        <span>${text}</span>
      </button>
    `;
  }
}