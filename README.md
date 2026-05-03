# AI Social Media Studio

Transform your ideas into stunning, viral social media content with AI. Generate polished Instagram carousels, posts, and stories in seconds.

![AI Social Media Studio](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)

## ✨ Features

- 🤖 **AI-Powered Content Generation** - Turn any idea into viral social media content
- 🎨 **Visual Generation** - AI-generated images for each slide
- 📱 **Instagram Formats** - Support for Post (1:1), Story (9:16), and Carousel formats
- ✏️ **Inline Editing** - Click to edit slide titles and content
- 🔄 **Smart Regeneration** - Regenerate individual slides without losing your work
- 💾 **Download as PNG** - Export your creations as high-quality images
- 🌙 **Dark/Light Mode** - Fully functional theme toggle with persistence
- 📜 **Generation History** - Keep track of your recent creations
- 📋 **Copy to Clipboard** - Easy copying of slide content
- 🎬 **Smooth Animations** - Beautiful transitions powered by Framer Motion


## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with dark mode support
- **Components:** ShadCN-style component architecture
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **AI Integration:** OpenAI API (GPT-4.1-mini + DALL-E 3)
- **Deployment:** Vercel-ready

## 📁 Project Structure

```
ai-social-media-studio/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes for AI generation
│   │   ├── layout.tsx    # Root layout with theme provider
│   │   └── page.tsx      # Main studio page
│   ├── components/       # React components
│   │   ├── studio.tsx    # Main studio interface
│   │   ├── theme-toggle.tsx
│   │   ├── slide-card.tsx
│   │   └── ui/           # Reusable UI components
│   ├── context/          # React context providers
│   │   └── theme-context.tsx
│   ├── lib/              # Utility functions
│   │   └── ai.ts         # OpenAI integration
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── tailwind.config.js    # Tailwind configuration with dark mode
├── next.config.ts        # Next.js configuration
└── package.json
```

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-social-media-studio.git
cd ai-social-media-studio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_TEXT_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-1
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌍 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `OPENAI_TEXT_MODEL` | No | Text generation model (default: gpt-4.1-mini) |
| `OPENAI_IMAGE_MODEL` | No | Image generation model (default: gpt-image-1) |

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/new) and import your repository
3. Add your environment variables in Project Settings
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

```bash
npm run build
```

## 🔒 Security

- ✅ API keys are **server-side only** - never exposed to the client
- ✅ All AI calls go through Next.js API routes
- ✅ Environment variables are properly secured

## 🎨 Customization

### Themes
The app supports both dark and light modes. The theme toggle uses Tailwind's `dark:` modifier classes and persists to localStorage.

### Styling
Built with Tailwind CSS 4. Customize colors, spacing, and components in:
- `tailwind.config.js` - Theme configuration
- `src/app/globals.css` - Global styles

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the amazing AI models
- [Next.js](https://nextjs.org/) team for the fantastic framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [ShadCN](https://ui.shadcn.com/) for the beautiful component patterns

---

**Made with ❤️ using Next.js + OpenAI**
