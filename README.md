# MCP Web & Filesystem Bridge

![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)
![Python](https://img.shields.io/badge/Python-3.11-yellow?logo=python)
![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![Nginx](https://img.shields.io/badge/Nginx-Reverse%20Proxy-success?logo=nginx)
![Protocol](https://img.shields.io/badge/Protocol-MCP-purple)

This project consists of a containerized microservices architecture that acts as a bridge using the **Model Context Protocol (MCP)**. 

It allows Artificial Intelligences (such as ChatGPT, Claude, or Cursor) to interact directly with the user's local environment and the web, exposing tools to read documents, browse the internet, and explore the file system securely through Server-Sent Events (SSE).

## System Architecture

The project is designed following an **API Gateway** pattern with a Reverse Proxy, encapsulating three independent microservices managed by Docker Compose:

1. **MCP PDF Reader (Python):** Uses `FastMCP` and `Tesseract OCR` to read, extract text, and analyze metadata from local PDF files.
2. **MCP Filesystem (Node.js):** Based on `@modelcontextprotocol/server-filesystem`, it allows the AI to list directories, read, and search files within specific local paths (`/mnt/documents`).
3. **MCP Playwright (Node.js):** Based on `@playwright/mcp`, it provides the AI with an automated Chromium browser to interact with web pages, extract content, and take screenshots.
4. **Nginx (Reverse Proxy):** Unifies all traffic on a single port and routes the AI's requests to the corresponding microservice.

## Prerequisites

* [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed on your machine.
* A tool to expose local ports to the internet ([ngrok](https://ngrok.com/)).

## Installation and Deployment

1. **Clone the repositories:**
   You need to clone the main bridge repository and the specific PDF reader repository inside it.
   ```bash
   git clone https://github.com/Migueel0/mcp-web-fs-bridge.git
   cd mcp-web-fs-bridge
   git clone https://github.com/Migueel0/mcp-pdf-reader.git
   ```

2. **Environment Setup:**
   Make sure to configure the environment variables in your `.env` file or directly in your system to define where your local documents are located (`DOCS_PATH`) and the path to the PDF reader (`MCP_PDF_READER_PATH`).
   ```env
   DOCS_PATH=C:\Path\To\Your\Documents
   MCP_PDF_READER_PATH=./mcp-pdf-reader
   ```

3. **Build and spin up the containers:**
   
```bash
   docker-compose up -d --build
   ```
   *This will download all dependencies (including Chromium and Tesseract OCR) and start the services. Nginx will be listening on port `8080`.*

## Connecting with the AI (e.g., ChatGPT)

For the AI to use these tools, you need to expose the Nginx `8080` port to the internet.

1. **Start the tunnel:**
   ```bash
   ngrok http 8080
   ```

2. **Client Configuration (ChatGPT / Claude Desktop):**
   Copy the secure URL (HTTPS) provided by ngrok and add three new Custom Tools (or MCP Servers) in your UI with the following configuration:

   * **PDF Reader:** 
     * URL: `https://<YOUR-NGROK-URL>/sse`
     * Authentication: `None`
   * **Filesystem Explorer:** 
     * URL: `https://<YOUR-NGROK-URL>/fs/sse`
     * Authentication: `None`
   * **Web Browser (Playwright):** 
     * URL: `https://<YOUR-NGROK-URL>/web/sse`
     * Authentication: `None`

## Nginx Routing Structure

| Path | Destination | Microservice |
|---|---|---|
| `/sse` and `/messages` | `mcp-pdf-reader:8000` | PDF Reader |
| `/fs/sse` and `/fs/messages` | `mcp-filesystem:8001` | Filesystem |
| `/web/sse` and `/web/messages`| `mcp-playwright:8002` | Playwright Web |
