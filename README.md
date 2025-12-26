# Locotek.ca

[![CI Analysis](https://github.com/LUSKTECH/locotek.ca/actions/workflows/ci.yml/badge.svg)](https://github.com/LUSKTECH/locotek.ca/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=LUSKTECH_locotek.ca&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=LUSKTECH_locotek.ca)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=LUSKTECH_locotek.ca&metric=coverage)](https://sonarcloud.io/summary/new_code?id=LUSKTECH_locotek.ca)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=LUSKTECH_locotek.ca&metric=bugs)](https://sonarcloud.io/summary/new_code?id=LUSKTECH_locotek.ca)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=LUSKTECH_locotek.ca&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=LUSKTECH_locotek.ca)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=LUSKTECH_locotek.ca&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=LUSKTECH_locotek.ca)
![Next.js](https://img.shields.io/badge/next.js-v16-black?style=flat&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-v24-green?style=flat&logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat)

Official website for **LOCOTEK**, a Toronto-based Techno DJ and Producer.
This project creates a modern, high-performance static site using Next.js, replacing the previous WordPress installation.

## 🚀 Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: Native CSS Modules (Variables, Dark Mode centric)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Fonts**: `next/font` (Orbitron & Inter)
*   **Deployment**: [Netlify](https://www.netlify.com/)
*   **Testing**: Jest + React Testing Library

## 🛠️ Getting Started

### Prerequisites

*   Node.js (v24 Active LTS recommended)
*   npm

### Installation

```bash
git clone https://github.com/LUSKTECH/locotek.ca.git
cd locotek.ca
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
```

The output will be generated in the `.next` directory.

## ✅ Code Quality & Testing

### Linting

This project uses **ESLint** with `next/core-web-vitals` to ensure code quality and accessibility (a11y) standards.

```bash
npm run lint
```

### Unit Tests

Unit tests are written using **Jest** and **React Testing Library**.

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Deployment

This project is configured for deployment on **Netlify**.
Configuration is handled via `netlify.toml`, including:
*   Security Headers (HSTS, X-Frame-Options, CSP basic protections)
*   Build settings (`npm run build`)

## 📂 Project Structure

*   `src/app`: App Router pages and layouts.
*   `public`: Static assets (backgrounds, favicons).
*   `.github/workflows`: CI/CD pipelines for Linting and Code Coverage.
*   `jest.config.ts`: Test environment configuration.

## 🤖 AI Usage Disclaimer

Portions of this codebase were generated with the assistance of Large Language Models (LLMs). All AI-generated code has been reviewed and tested to ensure quality and correctness.
