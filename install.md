# Installation Guide: FloraChronos

Follow these steps to set up the FloraChronos development environment locally.

## Prerequisites

*   **Node.js**: Version 18.0.0 or higher.
*   **npm** or **yarn**: Package manager.
*   **Google Gemini API Key**: Required for the simulation engine to function. Get one at [aistudio.google.com](https://aistudio.google.com/).

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/florachronos.git
cd florachronos
```

## 2. Install Dependencies

Install the required React, Tailwind, and GenAI packages.

```bash
npm install
# OR
yarn install
```

**Key Dependencies:**
*   `react`, `react-dom`: UI Framework
*   `@google/genai`: AI SDK
*   `recharts`: Data visualization
*   `lucide-react`: Icons
*   `tailwindcss`: Styling

## 3. Environment Configuration

1.  Create a file named `.env` in the root directory.
2.  Add your Google API key.

```env
API_KEY=your_actual_api_key_here
```

> **Security Note**: Never commit your `.env` file to version control.

## 4. Run the Application

Start the development server.

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## 5. Build for Production

To create an optimized build for deployment:

```bash
npm run build
```

## Troubleshooting

*   **API Error**: If the simulation fails, check your console logs. Ensure your `API_KEY` is valid and has access to the `gemini-2.5-flash` model.
*   **Missing Styles**: Ensure Tailwind CSS is correctly configured in your build pipeline (postcss/autoprefixer).

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.