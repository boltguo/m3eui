#!/usr/bin/env node
import { runM3ECli } from "./index.js";

process.exitCode = runM3ECli(process.argv.slice(2));
