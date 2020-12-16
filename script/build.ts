#!/usr/bin/env ts-node

import * as shell from "shelljs";
import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";

const OUTDIR = "dist";

function mapFile(source: string, destination: string, transform: (content: string) => string) {
    const content = fs.readFileSync(source, "utf8");
    fs.writeFileSync(destination, transform(content));
}

function installPrereqs() {
    const result = shell.exec("npm install --ignore-scripts");
    if (result.code !== 0) {
        process.exit(result.code);
    }
}

function buildTypeScript() {
    const result = shell.exec(`npm run tsc --project src/cli`);
    if (result.code !== 0) {
        process.exit(result.code);
    }
}

const scriptPrefix = "#!/usr/bin/env node\n";

function makeDistributedCLIExecutable() {
    const cli = path.join(OUTDIR, "cli", "index.js");
    mapFile(cli, cli, content => {
        if (_.startsWith(content, scriptPrefix)) return content;
        return scriptPrefix + content;
    });
    shell.chmod("+x", cli);
}

function main() {
    const skipPrereqs = !!process.env.SKIP_INSTALL_PREREQUISITES;

    buildTypeScript();
    makeDistributedCLIExecutable();
}

main();
