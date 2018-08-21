/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { tags, terminal } from '@angular-devkit/core';
import { execSync } from 'child_process';
import { SchematicCommand } from '../models/schematic-command';

// tslint:disable:no-global-tslint-disable no-any
export class DockerCommand extends SchematicCommand {
  private schematicName = 'docker';

  private collectionName = '@schematics/angular';

  private commands: Object[] = [
    {
      name: 'init',
      type: 'schematic',
    },
  ];

  public async initialize(options: any) {
    await super.initialize(options);

    this.dockerCliExistChecker();

    const schematicOptions = await this.getOptions({
      schematicName: this.schematicName,
      collectionName: this.collectionName,
    });

    this.addOptions(schematicOptions);
  }

  public validate(options: any): boolean {
    if (!options) {
      this.logger.error(tags.oneLine`
        The "ng docker" command requires an
        action name to be specified.
        For more details, use "ng help".`);

      return false;
    }

    return true;
  }

  public run(options: any) {
    if (options.dryRun) {
      options.skipGit = true;
    }

    return this.runSchematic({
      collectionName: this.collectionName,
      schematicName: this.schematicName,
      schematicOptions: options,
      debug: options.debug,
      dryRun: options.dryRun,
      force: options.force,
    });
  }

  public printHelp(_name: string, _description: string, options: any) {
    console.log('Options', options);
    if (!options._.length) {
      this.logger.info(`usage: ng docker <command>`);
      this.commands.forEach((command: any) => {
        this.logger.info(`    ${command.name}`);
      });

      this.logger.info(terminal.cyan(`\nng docker <command> --help`));

      return;
    }

    const command = options._[0];

    if (command === 'init') {
      this.printHelpUsage(`usage: ng docker ${command}`, this.options);
      this.printHelpOptions(this.options);
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
