import meow from "meow";
import { migrate } from "./migrate-travis-ci-to-github-actions";

export const cli = meow(
    `
    Usage
      $ migrate-travis-ci-to-github-actions
`,
    {
        flags: {
            cwd: {
                type: "string",
                default: process.cwd(),
            },
        },
        autoHelp: true,
        autoVersion: true,
    }
);

export const run = async (
    _input = cli.input,
    flags = cli.flags
): Promise<{ exitStatus: number; stdout: string | null; stderr: Error | null }> => {
    try {
        await migrate(flags.cwd);
    } catch (error) {
        return {
            exitStatus: 1,
            stderr: error,
            stdout: null,
        };
    }
    return {
        exitStatus: 1,
        stderr: null,
        stdout: "Migration Complete!",
    };
};
