#!/usr/bin/env bun
import { execSync, spawn } from "node:child_process"

import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, "../../..")

const PORTS_TO_CHECK = [3000, 3210, 3211]

console.log("🚀 Starting development server...")

// Function to find process using a port
function findProcessOnPort(port: number): string | null {
  try {
    const result = execSync(`lsof -i :${port} -sTCP:LISTEN -t`, { encoding: "utf-8" }).trim()
    return result || null
  } catch {
    return null
  }
}

// Function to get process info
function getProcessInfo(pid: string): string {
  try {
    const info = execSync(`ps -p ${pid} -o comm=`, { encoding: "utf-8" }).trim()
    return info || "unknown"
  } catch {
    return "unknown"
  }
}

// Function to kill process
function killProcess(pid: string, port: number, processName: string) {
  try {
    execSync(`kill -9 ${pid}`, { stdio: "ignore" })
    console.log(`✅ Killed process ${processName} (PID ${pid}) on port ${port}`)
  } catch (error) {
    console.error(`❌ Failed to kill process ${pid} on port ${port}`)
  }
}

// Check and kill processes on required ports
console.log("🔍 Checking for processes on required ports...")
for (const port of PORTS_TO_CHECK) {
  const pid = findProcessOnPort(port)
  if (pid) {
    const processName = getProcessInfo(pid)
    console.log(`⚠️  Found process ${processName} (PID ${pid}) on port ${port}`)
    killProcess(pid, port, processName)
  }
}

// Wait a moment for ports to be freed
await new Promise(resolve => setTimeout(resolve, 500))

console.log("🚀 Starting development servers with turbo...")

// Start turbo dev - it will run both web and backend in parallel
const turboProcess = spawn("turbo", ["dev"], {
  cwd: ROOT_DIR,
  stdio: "inherit",
  shell: true
})

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Stopping development servers...")
  turboProcess.kill("SIGINT")
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("\n🛑 Stopping development servers...")
  turboProcess.kill("SIGTERM")
  process.exit(0)
})

// Wait for turbo process to exit
turboProcess.on("exit", (code) => {
  process.exit(code || 0)
})
