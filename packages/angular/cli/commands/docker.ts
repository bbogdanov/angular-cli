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
import { CommandScope, Option } from './../models/command';

// tslint:disable:no-global-tslint-disable no-any
export default class DockerCommand extends SchematicCommand {
  public readonly name = 'docker';
  public readonly description = 'Generates and/or modifies docker files.';
  public readonly scope = CommandScope.inProject;
  public arguments: string[] = [];
  public options: Option[] = [
    ...this.coreOptions,
    {
      name: 'verbose',
      type: Boolean,
      default: false,
      aliases: ['v'],
      description: 'Adds more details to output logging.',
    },
  ];

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

    this.options = this.options.concat(schematicOptions.options);
    this.arguments = this.arguments.concat(schematicOptions.arguments.map(a => a.name));
  }

  public validate(options: any): boolean {
    if (!options._[0]) {
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

    options = this.removeLocalOptions(options);

    return this.runSchematic({
      collectionName: this.collectionName,
      schematicName: this.schematicName,
      schematicOptions: options,
      debug: options.debug,
      dryRun: options.dryRun,
      force: options.force,
    });
  }

  public printHelp(options: any) {
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
      const argDisplay = this.arguments && this.arguments.length > 0
        ? ' ' + this.arguments.filter(a => a !== 'schematic').map(a => `<${a}>`).join(' ')
        : '';
      const optionsDisplay = this.options && this.options.length > 0
        ? ' [options]'
        : '';
      this.logger.info(`usage: ng docker ${command}${argDisplay}${optionsDisplay}`);
      this.printHelpOptions(options);
    }
  }

  private removeLocalOptions(options: any): any {
    const opts = Object.assign({}, options);
    delete opts.verbose;
    delete opts.collection;
    delete opts.skipGit;

    return opts;
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
