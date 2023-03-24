#!/usr/bin/env node

import { Command } from "commander";
import { Configuration, OpenAIApi } from "openai";
import axios from "axios";
import { load as cheerioLoad } from "cheerio";
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
const packageJson = require("./package.json");

program
  .version(packageJson.version)
  .description(
    "A CLI tool for asking questions to ChatGPT using the OpenAI node.js library"
  )
  .argument("[question]", "The question to ask ChatGPT")
  .option("-u, --url <url>", "The URL of the page to summarize")
  .helpOption("-h, --help", "Display help for command")
  .parse(process.argv);

const options = program.opts();
const question = program.args[0];

if (options.url) {
  summarizeURL(options.url);
} else if (question) {
  askChatGPT(question);
} else {
  console.error(
    "Error: No question or URL provided. Use --help flag for more information."
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

async function summarizeURL(url: string) {
  try {
    const response = await axios.get(url);
    const $ = cheerioLoad(response.data);
    const pageTitle = $("title").text();
    const summaryQuestion = `Please summarize the content of the web page at ${url} with title "${pageTitle}"`;

    askChatGPT(summaryQuestion);
  } catch (error: any) {
    console.error("Error:", error);
  }
}
