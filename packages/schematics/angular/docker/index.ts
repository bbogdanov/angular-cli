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
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  chain,
  mergeWith,
  move,
  template,
  url,
} from '@angular-devkit/schematics';
import { dirname } from 'path';
import { getWorkspace, getWorkspacePath } from '../utility/config';
import { getProjectTargets } from '../utility/project-targets';
import { Path } from './../../../angular_devkit/core/src/virtual-fs/path';
import { Schema as DockerOptions } from './schema';

function updateConfigFile(options: DockerOptions): Rule {
  return (host: Tree, context: SchematicContext) => {

    const dockerOptions = {
      imageName: options.imageName,
      registryAddress: options.imageRegistry,
      machineName: options.machineName,
      isImageDeploy: false,
      serviceName: options.serviceName,
    };

    context.logger.debug('updating config file.');
    const workspacePath = getWorkspacePath(host);

    const workspace = getWorkspace(host);

    const project = workspace.projects[options.project as string];

    if (!project) {
      throw new Error(`Project is not defined in this workspace.`);
    }

    const projectTargets = getProjectTargets(project);

    if (!projectTargets) {
      throw new Error(`Target is not defined for this project.`);
    }

    let applyTo = projectTargets.build;

    if (options.environment &&
        projectTargets.build.configurations &&
        projectTargets.build.configurations[options.environment]) {
      applyTo = projectTargets.build.configurations[options.environment];
    }

    applyTo.docker = dockerOptions;

    host.overwrite(workspacePath, JSON.stringify(workspace, null, 2));

    return host;
  };
}

export default function (options: DockerOptions): Rule {
  return (host: Tree) => {
    const workspace = getWorkspace(host);

    if (!options.project) {
      throw new SchematicsException('Option (project) is required.');
    }
    const project = workspace.projects[options.project];

    if (options.path === undefined && project) {
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

    return chain([
      mergeWith(templateSource),
      updateConfigFile(options),
    ]);
  };
}
