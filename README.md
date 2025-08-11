# Zenergy ⚡️

Zenergy is a smart, adaptable, and engaging AI assistant designed for exploring science, technology, and future innovations. It leverages the power of Large Language Models (LLMs) through the Groq API to deliver fast and accurate responses with a unique, playful personality.

## ✨ Features

* **Multi-Model AI**: Seamlessly switch between various powerful AI models to suit your needs, including DeepSeek, Gemma, Llama, and more.
* **Deepthink & Reasoning**: Get step-by-step explanations and powerful reasoning for complex topics. The AI is designed to break down information in an accessible yet accurate way.
* **Gen Z Personality**: Zenergy communicates with a trendy, Gen Z-inspired persona, adapting its slang and cultural references to the user's language for a more engaging and relatable experience.
* **File Uploads**: Attach files to your messages for the AI to analyze and discuss.
* **Code Highlighting**: Code snippets in the chat are beautifully highlighted for readability, supporting various programming languages.
* **PWA Ready**: Zenergy can be installed as a Progressive Web App (PWA) for a native-like experience on your devices.

## 🛠️ Tech Stack

* **Frontend**: [SvelteKit](https://kit.svelte.dev/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **AI Backend**: [Groq API](https://groq.com/)
* **Component Library**: Custom-built Svelte components
* **Linting/Formatting**: Prettier, SvelteCheck

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (v20 or higher recommended)
* npm (or your preferred package manager)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/zenergy.git](https://github.com/your-username/zenergy.git)
    cd zenergy
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and add your Groq API key:
    ```
    GROQ_API_KEY=your_groq_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running at `http://localhost:5173`.

## ⚙️ Configuration

* **`GROQ_API_KEY`**: **Required**. Your API key from [GroqCloud](https://console.groq.com/keys).
* **`RATE_LIMIT_RPM`**: Optional. Sets the number of requests per minute for rate limiting.

## 📜 Available Scripts

* `npm run dev`: Starts the development server.
* `npm run build`: Builds the application for production.
* `npm run preview`: Previews the production build locally.
* `npm run check`: Runs SvelteCheck to type-check your Svelte components.
* `npm run format`: Formats all files using Prettier.
* `npm run lint`: Checks for formatting issues with Prettier.
* `npm run test`: Runs unit tests with Vitest.