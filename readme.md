Asroma – Web3 Multiplayer Crypto Game (Solana)
Overview

ASROMA is a full-stack Web3 multiplayer game built from scratch, where players compete in real-time Rock–Paper–Scissors matches using real SOL wagers on the Solana blockchain.

The project combines Web2 and Web3 authentication, real-time gameplay, wallet management, and on-chain transactions, with a strong focus on security, scalability, and user experience.

This application was developed end-to-end, covering frontend, backend, real-time systems, authentication flows, and blockchain integration.

Core Features:

- GAMEPLAY:

Real-time Rock–Paper–Scissors matches

Public matchmaking system

Private rooms with invitations

On-chain SOL wagers per match

Automatic result validation and payouts

- AUTHENTICATION SYSTEM:

Web2 Authentication

Email + password login

Email verification

OTP verification for weak or expired sessions

Password reset via email verification

Web3 Authentication

Phantom wallet signature login

Secure challenge–response authentication

Wallet-linked user accounts

Users can authenticate using either Web2 or Web3, without interfering with each other.

- Wallet & Blockchain System (Solana):

Internal wallet creation on registration

Wallet import via private key

Secure private key encryption

SOL deposits and withdrawals

Drag-and-drop SOL transfers between wallets

Wallet archiving and management

Real-time balance synchronization

Live SOL price tracking

- Social Features:

Friend system (requests & acceptance)

Real-time private chat

Game invitations

Live notifications

Online status tracking

- Statistics & Ranking:

Player statistics tracking

PNL (Profit & Loss) system

Match history

Global leaderboard

Seasonal system with automatic resets

- User Experience & Settings:

Multi-language support:

English

Spanish

French

Portuguese

German

Theme switching

Profile customization

Change username, password, and avatar

Account deletion flow with confirmation

- Technical Architecture:
Frontend

Next.js (App Router)

TypeScript

Zustand (state management)

Socket.IO (real-time communication)

TailwindCSS + Framer Motion

i18next (internationalization)

Solana Wallet Adapter

Backend

Node.js + Express

TypeScript

MongoDB (Mongoose)

JWT authentication

OTP & email verification flows

Socket.IO server

Solana Web3.js

Secure escrow and wallet services

- Security Highlights:

JWT-based authentication with expiration handling

OTP verification for weak sessions

Rate limiting on auth routes

Email verification and password recovery flows

Encrypted wallet private keys

Server-side Phantom signature verification

Secure handling of on-chain transactions

- Why This Project Matters:

This project demonstrates:

Full-stack development skills

Real-time system design

Secure Web3 authentication flows

Blockchain wallet management

Production-ready architecture

Strong understanding of security best practices

ASROMA was designed as a real-world Web3 application, not a demo or prototype.

- Deployment:

Frontend: Next.js (Vercel-ready)

Backend: Node.js server

Database: MongoDB

Blockchain: Solana (Devnet / Mainnet compatible)

👨‍💻 Author

Developed by rage

Focused on Web3 development, real-time applications, and scalable full-stack systems.

- Notes:

This project represents a major learning milestone for me.

When I started working on ASROMA, my programming knowledge was very basic.
The entire system was built from scratch, learning and researching how real world applications are designed, secured, and scaled.

Throughout the development process, I learned:

How authentication systems work in practice

How to design real time architectures with sockets

How Web3 wallets, signatures, and on-chain transactions operate

How to structure a large, maintainable codebase

How to debug complex issues across frontend, backend, and blockchain layers

ASROMA reflects not only technical implementation, but also problem solving, persistence, and the ability to learn complex systems independently.