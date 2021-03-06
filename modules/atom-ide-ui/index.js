/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

/* eslint-disable nuclide-internal/no-commonjs */

import fs from 'fs';
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
import path from 'path';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import FeatureLoader from 'nuclide-commons-atom/FeatureLoader';

if (atom.packages.getAvailablePackageNames().includes('nuclide')) {
  atom.notifications.addWarning('Duplicate package: `atom-ide-ui`', {
    description:
      '`atom-ide-ui` is already included as part of `nuclide`.<br>' +
      'Please uninstall `atom-ide-ui` to avoid conflicts.',
    dismissable: true,
  });
} else {
  const featureDir = path.join(__dirname, 'pkg');
  const features = fs
    .readdirSync(featureDir)
    .map(item => {
      const dirname = path.join(featureDir, item);
      try {
        const pkgJson = fs.readFileSync(
          path.join(dirname, 'package.json'),
          'utf8',
        );
        return {
          dirname,
          pkg: JSON.parse(pkgJson),
        };
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    })
    .filter(Boolean);
  const disposables = new UniversalDisposable();
  const featureLoader = new FeatureLoader({
    pkgName: 'atom-ide-ui',
    config: {},
    features,
  });
  featureLoader.load();
  module.exports = {
    config: featureLoader.getConfig(),
    activate() {
      disposables.add(require('nuclide-commons-ui'));
      featureLoader.activate();
    },
    deactivate() {
      featureLoader.deactivate();
      disposables.dispose();
    },
    serialize() {
      featureLoader.serialize();
    },
  };
}
