import { Path } from './../../../angular_devkit/core/src/virtual-fs/path';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicsException,
  Tree,
  apply,
  mergeWith,
  move,
  template,
  url,
} from '@angular-devkit/schematics';
import { getWorkspace } from '../utility/config';
import { parseName } from '../utility/parse-name';
import { buildDefaultPath } from '../utility/project';
import { Schema as ServiceOptions } from './schema';
import { dirname } from 'path';

export default function (options: ServiceOptions): Rule {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    if (!options.project) {
      throw new SchematicsException('Option (project) is required.');
    }
    const project = workspace.projects[options.project];

    if (options.path === undefined) {
      options.path = project.root + '/docker';
    }

    options.path = dirname((options.path + '/') as Path);

    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        'if-flat': (s: string) => options.flat ? '' : s,
        ...options,
      }),
      move(options.path),
    ]);

    return mergeWith(templateSource);
  };
}
