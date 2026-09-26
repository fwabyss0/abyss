/**
 * Abyss AI Chatbot - Mock Implementation
 * Designed for Alish Shrestha's Portfolio
 */

const CHATBOT_CONFIG = {
    botName: "Abyss AI",
    welcomeMessage: "Hello! I'm the Abyss AI Assistant. How can I help you learn more about Alish?",
    fallbackMessage: "That's an interesting question. I'm currently in mock mode, but I can tell you about Alish's skills, projects, or education!",
    responses: [
        {
            keywords: ['hello', 'hi', 'hey', 'greetings'],
            reply: "Hello! I'm the Abyss AI Assistant. How can I help you learn more about Alish?"
        },
        {
            keywords: ['about', 'who', 'who is', 'biography', 'bio'],
            reply: "Alish Shrestha is a passionate AI Student and Web Developer from Bhaktapur, Nepal. He is currently pursuing a degree in AI at Softwarica College (Coventry University) and manages operations at Print Village."
        },
        {
            keywords: ['skills', 'programming', 'tech', 'stack', 'what can you do'],
            reply: "Alish is proficient in Python, JavaScript, HTML, and CSS. He has a strong interest in AI & ML (TensorFlow, Neural Networks) and Creative Development (UI/UX, Video Editing)."
        },
        {
            keywords: ['projects', 'work', 'portfolio', 'created', 'built'],
            reply: "Alish has built several interesting projects, including the Yatra Travel Agency platform, a Printing Resolution hardware/web system, and the Abyss AI Chatbot experiment. You can see them in the Projects section!"
        },
        {
            keywords: ['contact', 'email', 'whatsapp', 'reach', 'connect'],
            reply: "You can reach Alish via WhatsApp or email at shrestaalish444@gmail.com. He's also active on GitHub, LinkedIn, and Discord (fwabyss)."
        },
        {
            keywords: ['education', 'college', 'study', 'degree'],
            reply: "Alish is currently studying Artificial Intelligence at Softwarica College (Coventry University), having previously specialized in Computer Science at Khwopa Secondary School."
        }
    ]
};

class AbyssChatbot {
    constructor() {
        this.initUI();
        this.bindEvents();
    }

    initUI() {
        // Create Chatbot Trigger
        this.trigger = document.createElement('div');
        this.trigger.id = 'chatbot-trigger';
        this.trigger.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        `;
        document.body.appendChild(this.trigger);

        // Create Chat Window
        this.window = document.createElement('div');
        this.window.id = 'chatbot-window';
        this.window.innerHTML = `
            <div class="chat-header">
                <div class="chat-header-info">
                    <span class="chat-bot-name">${CHATBOT_CONFIG.botName}</span>
                    <span class="chat-bot-status">Online</span>
                </div>
                <button id="chat-close">&times;</button>
            </div>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Ask me about Alish..." autocomplete="off">
                <button id="chat-send">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(this.window);

        this.messagesContainer = document.getElementById('chat-messages');
        this.inputField = document.getElementById('chat-input');
        this.sendButton = document.getElementById('chat-send');
        this.closeButton = document.getElementById('chat-close');

        this.addMessage(CHATBOT_CONFIG.welcomeMessage, 'bot');
    }

    bindEvents() {
        this.trigger.onclick = () => {
            this.window.classList.toggle('active');
            this.trigger.classList.toggle('active');
        };

        this.closeButton.onclick = () => {
            this.window.classList.remove('active');
            this.trigger.classList.remove('active');
        };

        this.sendButton.onclick = () => this.handleSend();
        
        this.inputField.onkeypress = (e) => {
            if (e.key === 'Enter') this.handleSend();
        };
    }

    handleSend() {
        const text = this.inputField.value.trim();
        if (!text) return;

        this.addMessage(text, 'user');
        this.inputField.value = '';

        // Simulate "typing" delay
        setTimeout(() => {
            const response = this.getResponse(text);
            this.addMessage(response, 'bot');
        }, 600 + Math.random() * 1000);
    }

    getResponse(input) {
        const text = input.toLowerCase();
        for (const entry of CHATBOT_CONFIG.responses) {
            if (entry.keywords.some(kw => text.includes(kw))) {
                return entry.reply;
            }
        }
        return CHATBOT_CONFIG.fallbackMessage;
    }

    addMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = `chat-msg ${sender}`;
        msg.innerHTML = `<div class="msg-content">${text}</div>`;
        this.messagesContainer.appendChild(msg);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    window.abyssBot = new AbyssChatbot();
});
