import fs from "fs/promises";
import path from "path";
import hasYarn from "has-yarn";
import { generate } from "github-actions-badge";

export const migrate = async (cwd: string) => {
    const travisFilePath = path.join(cwd, ".travis.yml");
    try {
        await fs.unlink(travisFilePath);
        console.log(`Delete ${travisFilePath}`);
    } catch {
        console.log(`Not found ${travisFilePath}`);
    }
    // copy
    const workflowDir = path.join(cwd, ".github/workflows");
    try {
        await fs.mkdir(workflowDir, {
            recursive: true,
        });
        console.log(`Create ${workflowDir}`);
    } catch {}
    const outputFilePath = path.join(workflowDir, "test.yml");
    const hasYaml = await fs
        .access(outputFilePath)
        .then(() => true)
        .catch(() => false);
    if (hasYaml) {
        console.log(`Already exists ${outputFilePath}`);
        return;
    }
    if (hasYarn(cwd)) {
        await fs.copyFile(path.join(__dirname, "../templates/yarn.test.yml"), outputFilePath);
        console.log(`Copy to ${outputFilePath}`);
    } else {
        await fs.copyFile(path.join(__dirname, "../templates/npm.test.yml"), outputFilePath);
        console.log(`Copy to ${outputFilePath}`);
    }
    // Update README badge
    const readmeFilePath = path.join(cwd, "README.md");
    try {
        const readmeContent = await fs.readFile(readmeFilePath, "utf-8");
        // [![Build Status](https://travis-ci.org/azu/safe-marked.svg?branch=master)](https://travis-ci.org/azu/safe-marked)
        const travisBadgePattern = /\[!\[Build Status]\(https:\/\/travis-ci.org\/(?<owner>.*?)\/(?<repo>.*)\?.*\)]\(.*\)/;
        const match = readmeContent.match(travisBadgePattern);
        const owner = match?.groups?.owner;
        const repo = match?.groups?.repo;
        if (!match || !owner || !repo) {
            return;
        }
        const githubActionBadge = generate({
            format: "markdown",
            cwd: cwd,
            owner: owner,
            repo: repo,
        });
        const newReadmeContent = readmeContent.replace(travisBadgePattern, githubActionBadge);
        await fs.writeFile(readmeFilePath, newReadmeContent, "utf-8");
        console.log("Rewrite README.md badge");
    } catch (error) {
        console.log("Error on README: " + error);
    }
};
