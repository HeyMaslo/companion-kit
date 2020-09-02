import * as ModuleAlias from 'module-alias';

const aliases = {
    'common': __dirname + '/../../../../common',
    'server': __dirname + '/..',
};

// console.log('[ModuleAlias] adding aliases:', aliases);

ModuleAlias.addAliases(aliases);
