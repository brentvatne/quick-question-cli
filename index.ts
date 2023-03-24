#!/usr/bin/env node

import { Command } from "commander";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import os from "os";

const username = os.userInfo().username ?? "anonymous";

// Load API key from a .env file
dotenv.config();
const apiKey: string | undefined = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error(
    "Error: API key not found. Set it in the .env file or as an environment variable."
  );
  process.exit(1);
}

const configuration = new Configuration({
  organization: "org-3YtRrlXTZuE5kRMsWeXAOZ2K",
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const program = new Command();

// Import the package.json file
const packageJson = require('./package.json');

program
  .version(packageJson.version)
  .description(
    "A CLI tool for asking questions to ChatGPT using the OpenAI node.js library"
  )
  .argument("<question>", "The question to ask ChatGPT")
  .helpOption("-h, --help", "Display help for command")
  .parse(process.argv);

const question = program.args[0];

if (question) {
  askChatGPT(question);
} else {
  console.error(
    "Error: No question provided. Use --help flag for more information."
  );
  process.exit(1);
}

async function askChatGPT(question: string) {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", name: username, content: question }],
    });

    console.log(response.data.choices[0]?.message?.content);
  } catch (error: any) {
    console.error("Error:", error);
  }
}
