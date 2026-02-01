const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const packagesRoot = path.resolve(monorepoRoot, 'packages');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Resolve workspace packages
config.resolver.extraNodeModules = new Proxy(
  {
    '@rangexp/theme': path.resolve(packagesRoot, 'theme/src'),
    '@rangexp/types': path.resolve(packagesRoot, 'types/src'),
    '@rangexp/api-client': path.resolve(packagesRoot, 'api-client/src'),
  },
  {
    get: (target, name) => {
      if (target.hasOwnProperty(name)) {
        return target[name];
      }
      // Fall back to node_modules
      return path.join(projectRoot, 'node_modules', name);
    },
  }
);

// Ensure symlinks are followed
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
