# nenbajonathan.com

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fnenbajonathan.com&style=for-the-badge)](https://nenbajonathan.com)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

My personal website and blog, built with [Astro](https://astro.build/) and based on the [AstroPaper](https://github.com/satnaing/astro-paper) theme.

I'm a full-stack developer focused on building fast, reliable applications. I'm passionate about open-source, blockchain, and decentralized finance, working primarily with JavaScript, Python, Rust, and Go.

## Links

- **Website**: [nenbajonathan.com](https://nenbajonathan.com)
- **GitHub**: [github.com/nejos97](https://github.com/nejos97)
- **LinkedIn**: [linkedin.com/in/jnenba](https://linkedin.com/in/jnenba)
- **Twitter**: [twitter.com/nejos97](https://twitter.com/nejos97)

## Features

- Type-safe markdown blog posts
- Light & dark mode
- Fuzzy search
- SEO-friendly with sitemap & RSS feed
- Dynamic OG image generation
- Fully responsive design
- Accessible (Keyboard/VoiceOver)

## Tech Stack

**Framework** - [Astro](https://astro.build/)
**Type Checking** - [TypeScript](https://www.typescriptlang.org/)
**Component Framework** - [React](https://reactjs.org/)
**Styling** - [TailwindCSS](https://tailwindcss.com/)
**Fuzzy Search** - [FuseJS](https://fusejs.io/)
**Linting** - [ESLint](https://eslint.org)
**Code Formatting** - [Prettier](https://prettier.io/)

## Project Structure

```
/
├── public/
│   ├── assets/
│   └── toggle-theme.js
├── src/
│   ├── assets/
│   ├── components/
│   ├── content/
│   │   └── blog/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   ├── utils/
│   ├── config.ts
│   └── types.ts
└── package.json
```

Blog posts are stored in `src/content/blog/`.

## Running Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

With Docker:

```bash
docker build -t nenbajonathan.com .
docker run -p 4321:80 nenbajonathan.com
```

## Commands

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Install dependencies                             |
| `npm run dev`          | Start local dev server at `localhost:4321`        |
| `npm run build`        | Build production site to `./dist/`               |
| `npm run preview`      | Preview build locally before deploying           |
| `npm run format:check` | Check code format with Prettier                  |
| `npm run format`       | Format code with Prettier                        |
| `npm run sync`         | Generate TypeScript types for Astro modules      |
| `npm run lint`         | Lint with ESLint                                 |

## License

Licensed under the MIT License.

---

Built by [Nenba Jonathan](https://nenbajonathan.com). Theme based on [AstroPaper](https://github.com/satnaing/astro-paper) by [Sat Naing](https://satnaing.dev).
