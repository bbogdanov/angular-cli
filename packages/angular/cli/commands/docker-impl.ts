/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable:no-global-tslint-disable no-any
import { execSync } from 'child_process';
import { Option } from '../models/interface';
import { SchematicCommand } from '../models/schematic-command';
import { parseJsonSchemaToOptions } from '../utilities/json-schema';
import { BaseSchematicOptions } from './../models/schematic-command';

export enum DockerActions {
  init = 'init',
  deploy = 'deploy',
  push = 'push',
}

export interface DockerCommandOptions extends BaseSchematicOptions {
  action?: DockerActions;
}

export class DockerCommand<
  T extends DockerCommandOptions = DockerCommandOptions,
> extends SchematicCommand<T> {

  private collectionName = '@schematics/angular';

  private schematicName = 'docker';

  public async initialize(options: T) {
    await super.initialize(options);

    this.dockerCliExistChecker();

    if (options.action && options.action === DockerActions.init) {
      const collection = this.getCollection(this.collectionName);

      this.description.suboptions = {};

      const schematic = this.getSchematic(collection, this.schematicName, true);
      let options: Option[] = [];

      if (schematic.description.schemaJson) {
        options = await parseJsonSchemaToOptions(
          this._workflow.registry,
          schematic.description.schemaJson,
        );
      }

      this.description.suboptions[`${this.collectionName}:${this.schematicName}`] = options;
    }
  }

  public async run(options: T) {

    switch (options.action) {
      case DockerActions.init:
        return await this.runSchematic({
          collectionName: this.collectionName,
          schematicName: this.schematicName,
          schematicOptions: options['--'] || [],
          debug: !!options.debug || false,
          dryRun: !!options.dryRun || false,
          force: !!options.force || false,
        });
      default:
        await this.printHelp(options);
    }
  }

  private dockerCliExistChecker() {
    try {
      execSync('docker', { stdio: [] });
    } catch (err) {
      this.logger.warn('\nDocker-CLI is available on https://docs.docker.com/install/');
      throw Error('Docker-CLI is missing!');
    }
  }
}
