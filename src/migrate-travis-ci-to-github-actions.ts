import fs from "fs/promises";
import path from "path";
import hasYarn from "has-yarn";

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
    if (hasYarn(cwd)) {
        await fs.copyFile(path.join(__dirname, "../templates/yarn.test.yml"), outputFilePath);
        console.log(`Copy to ${outputFilePath}`);
    } else {
        await fs.copyFile(path.join(__dirname, "../templates/npm.test.yml"), outputFilePath);
        console.log(`Copy to ${outputFilePath}`);
    }
};
