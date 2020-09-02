const { ProjectConfigs } = require('../config');
const { spawn } = require('child_process');

/** @typedef {import('../config/declarations').Environments} Environments */

// usage
// node setEnv production expo publish -c
// node setEnv production expo build:ios --no-publish

const app_env = /** @type {Environments} */ (process.argv[2]);
const rest = process.argv.slice(3);

const buildConfig = ProjectConfigs.BuildConfigs[app_env];
if (!buildConfig) {
    throw new Error('incorrect APP_ENV (arg #2)');
}

const releaseChannel = buildConfig.mobile.releaseChannel;
if (!releaseChannel) {
    throw new Error('Release channel should be set!');
}

rest.unshift('yarn');
rest.unshift('cross-env', `APP_ENV=${app_env}`);

if (!rest.includes('start')) {
    rest.push('--release-channel', releaseChannel);
}

// const envs = /** @type {any} */ ({ APP_ENV: app_env });
const fullCommand = rest.join(' ');

console.log('Executing command: \r\n\t', fullCommand,
    // '\r\nwith envs:', envs,
);

const child = spawn(fullCommand, { shell: true, stdio: 'inherit' });

child.on('error', /** @arg {Error} err */ err => {
    console.error(err);
});
child.on('exit', function() {
  process.exit();
});
