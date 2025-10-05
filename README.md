# Zenith Ledger

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aunghtet-star/lottery-test-1)

A high-performance system for game agents to manage sales, track finances, and place bets with maximum speed and efficiency.

Zenith Ledger is a responsive web application designed for agents and sellers in the 2D and 3D gaming industry. It provides a suite of tools for rapid bet entry, real-time financial tracking, and efficient sales management. The system is built on a modern, serverless architecture using Cloudflare Workers for speed and reliability, ensuring a seamless experience across all devices.

## Key Features

- **📈 Real-time Dashboard**: At-a-glance KPIs for total sales, net profit, and top agents using visually appealing charts and stat cards.
- **⚡ High-Speed Bet Entry**: A dedicated interface optimized for rapid, keyboard-first single and bulk bet placement.
- **📒 Comprehensive Sales Ledger**: A searchable, filterable, and real-time log of all transactions and bets.
- **👥 Agent Management**: Tools to manage sub-agents, track their sales, and set individual commission rates.
- **📱 Fully Responsive**: A seamless, mobile-first experience on desktop, tablet, and mobile devices.
- **🎨 Modern UI/UX**: A clean, intuitive, and beautiful interface built with shadcn/ui and Tailwind CSS.

## Technology Stack

- **Frontend**: React, Vite, React Router, Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod for validation
- **Backend**: Hono running on Cloudflare Workers
- **Database**: Cloudflare Durable Objects for stateful, serverless storage
- **Language**: TypeScript (end-to-end type safety)
- **UI Components**: Lucide React (icons), Recharts (charts), Framer Motion (animations)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (Cloudflare's command-line tool)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/zenith-ledger.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd zenith-ledger
    ```

3.  **Install dependencies using Bun:**
    ```bash
    bun install
    ```

## Development

To run the application in a local development environment, which includes both the Vite frontend server and the Cloudflare Worker for the backend, use the following command:

```bash
bun dev
```

This will start the development server, typically on `http://localhost:3000`. The application will automatically reload upon file changes.

## Project Structure

The project is organized into three main directories:

-   `src/`: Contains the frontend React application, including pages, components, hooks, and utility functions.
-   `worker/`: Contains the backend Hono application running on Cloudflare Workers, including API routes and entity logic.
-   `shared/`: Contains TypeScript types and interfaces shared between the frontend and backend to ensure end-to-end type safety.

## Deployment

This project is designed for seamless deployment to the Cloudflare network.

1.  **Build the project:**
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare Workers:**
    ```bash
    bun run deploy
    ```

Wrangler will handle the process of building the application, uploading the assets, and deploying the worker script.

Alternatively, you can deploy directly from your GitHub repository using the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aunghtet-star/lottery-test-1)