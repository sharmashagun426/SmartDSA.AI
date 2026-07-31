let interval;

const messages = [
    "🤖 Generating answer",
    "📚 Searching algorithms",
    "🧠 Thinking",
    "⚡ Optimizing solution",
    "📖 Preparing explanation"
];

export function startThinkingAnimation(element, chatBox) {

    let index = 0;
    let dots = "";

    element.innerHTML = messages[0];

    interval = setInterval(() => {

        dots = dots.length >= 3 ? "" : dots + ".";

        element.innerHTML =
            `<div class="typing-dots">${messages[index]}${dots}</div>`;

        if (dots === "") {
            index = (index + 1) % messages.length;
        }

        chatBox.scrollTop = chatBox.scrollHeight;

    }, 500);
}

export function stopThinkingAnimation() {
    clearInterval(interval);
}