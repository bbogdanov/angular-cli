/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable:no-global-tslint-disable no-any
import { execSync } from 'child_process';
import { Arguments, Option } from '../models/interface';
import { SchematicCommand } from '../models/schematic-command';
import { parseJsonSchemaToOptions } from '../utilities/json-schema';
import { Schema as DockerCommandSchema } from './docker';

export const DockerActions = {
  init: 'init',
  push: 'push',
  deploy: 'deploy',
};

export class DockerCommand extends SchematicCommand<DockerCommandSchema> {

  public async initialize(options: DockerCommandSchema & Arguments) {
    await super.initialize(options);

    this.schematicName = 'docker';

    this.dockerCliExistChecker();

    if (options.action && options.action === DockerActions.init) {

      const collection = this.getCollection(this.collectionName);
      this.description.suboptions = {};

      this.description.suboptions = {};

      const schematic = this.getSchematic(collection, 'docker');
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

  public async run(options: DockerCommandSchema & Arguments) {

    switch (options.action) {
      case DockerActions.init:
        return await this.runSchematic({
          collectionName: this.collectionName,
          schematicName: 'docker',
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
      /**
       * Checking for the default docker-cli existance in the machine.
       * Stdio removes all the output
       */
      execSync('docker', { stdio: [] });
    } catch (err) {
      this.logger.warn('\nDocker-CLI is available on https://docs.docker.com/install/');
      throw Error('Docker-CLI is missing!');
    }
  }
}
