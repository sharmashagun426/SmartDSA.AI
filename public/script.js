import {
    startThinkingAnimation,
    stopThinkingAnimation
} from "./loader.js";

const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const themeToggle = document.getElementById('themeToggle');
const suggestions = document.querySelectorAll('.chip');

/**
 * BACKGROUND PARTICLES LOGIC
 */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.life = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0) this.reset();
    }
    draw() {
        ctx.fillStyle = `rgba(0, 242, 255, ${this.life})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f2ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 100; i++) particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();

/**
 * AI CORE LOGIC
 */

async function getAIResponse(prompt) {

    try {

        const response = await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                prompt: prompt
            })

        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        return data.response;

    } catch (error) {

        console.error(error);

        return "🚀 I'm currently undergoing maintenance to bring you a faster, smarter, and more capable AI experience. Thank you for your patience! Please drop email to Sharmashagun426@gmail.com if you found any bug or need any support.";

    }

}

/**
 * UI & ANIMATION HELPERS
 */
async function typeWordByWord(element, text) {
    element.innerHTML = "";
    const words = text.split(" ");

    // Preliminary render to handle Markdown/Code highlighting properly
    // but we simulate the visual of typing
    const fullHtml = marked.parse(text);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullHtml;

    // Simple typewriter for text blocks
    for (let word of words) {
        const span = document.createElement('span');
        span.innerText = word + " ";
        span.style.opacity = "0";
        element.appendChild(span);

        gsap.to(span, {
            opacity: 1,
            duration: 0.2,
            ease: "power1.out"
        });

        await new Promise(r => setTimeout(r, 50));
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Final render to apply proper Markdown + Syntax Highlighting
    element.innerHTML = fullHtml;
    element.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
        addCopyButton(block.parentElement);
    });
}

function addCopyButton(preElement) {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="far fa-copy"></i>';
    btn.className = 'copy-btn';
    btn.onclick = () => {
        navigator.clipboard.writeText(preElement.innerText);
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => btn.innerHTML = '<i class="far fa-copy"></i>', 2000);
    };
    preElement.style.position = 'relative';
    preElement.appendChild(btn);
}

function createMessageElement(type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    chatBox.appendChild(msgDiv);
    return msgDiv;
}

/**
 * EVENT LISTENERS
 */

async function handleSubmission() {
    const text = userInput.value.trim();

    if (!text) return;

    // Prevent duplicate requests
    sendBtn.disabled = true;
    userInput.disabled = true;

    sendBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

    // User Message
    const uMsg = createMessageElement("user-msg");
    uMsg.innerText = text;
    gsap.from(uMsg, {
        x: 30,
        opacity: 0,
        duration: 0.4
    });

    userInput.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // AI Message Placeholder
    const aiMsg = createMessageElement("ai-msg");

    // Start loading animation
    startThinkingAnimation(aiMsg, chatBox);

    try {

        const responseText = await getAIResponse(text);

        // Stop animation
        stopThinkingAnimation();

        // Show response
        await typeWordByWord(aiMsg, responseText);

    } catch (err) {

        stopThinkingAnimation();

        aiMsg.innerHTML =
            `🚀 I'm currently undergoing maintenance to bring you a faster, smarter, and more capable AI experience. Thank you for your patience!`
        console.error(err);

    } finally {

        sendBtn.disabled = false;
        userInput.disabled = false;

        sendBtn.innerHTML =
            `<i class="fas fa-paper-plane"></i>`;

        userInput.focus();
    }
}

sendBtn.addEventListener('click', handleSubmission);

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSubmission();
});

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

    gsap.fromTo(document.body, { filter: "invert(1)" }, { filter: "invert(0)", duration: 0.5 });
});

suggestions.forEach(chip => {
    chip.addEventListener('click', () => {
        userInput.value = chip.getAttribute('data-query');
        handleSubmission();
    });
});

// Entrance Animation
gsap.from(".glass-nav", { y: -50, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)" });
gsap.from(".input-container", { y: 50, opacity: 0, duration: 1, delay: 0.5 });