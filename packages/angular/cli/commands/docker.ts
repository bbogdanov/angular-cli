/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { CommandScope, Option } from './../models/command';
import { tags, terminal } from '@angular-devkit/core';
import { SchematicCommand } from '../models/schematic-command';
import { getDefaultSchematicCollection } from '../utilities/config';
import { getEngineHost, getCollection } from '../utilities/schematics';

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
    {
      name: 'imageName',
      type: String,
      default: this.project.name,
      aliases: ['in'],
      description: 'The name of the docker image.',
    },
    {
      name: 'servicePort',
      type: Number,
      default: 8000,
      aliases: ['sp'],
      description: 'The port of the appcliation service.',
    }
  ];

  private schematicName = 'docker';

  private collectionName = '@schematics/angular';

  public async initialize(options: any) {
    await super.initialize(options);

    const schematicOptions = await this.getOptions({
      schematicName: this.schematicName,
      collectionName: this.collectionName
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
    const schematicName = options._[0];
    if (schematicName) {
      const argDisplay = this.arguments && this.arguments.length > 0
        ? ' ' + this.arguments.filter(a => a !== 'schematic').map(a => `<${a}>`).join(' ')
        : '';
      const optionsDisplay = this.options && this.options.length > 0
        ? ' [options]'
        : '';
      this.logger.info(`usage: ng docker ${schematicName}${argDisplay}${optionsDisplay}`);
      this.printHelpOptions(options);
    } else {
      this.printHelpUsage(this.name, this.arguments, this.options);
      const engineHost = getEngineHost();
      const [collectionName] = this.parseCollectionName(options);
      const collection = getCollection(collectionName);
      const schematicNames: string[] = engineHost.listSchematics(collection);
      this.logger.info('Available schematics:');
      schematicNames.forEach(schematicName => {
        this.logger.info(`    ${schematicName}`);
      });

      this.logger.warn(`\nTo see help for a schematic run:`);
      this.logger.info(terminal.cyan(`  ng generate <schematic> --help`));
    }
  }

  private parseCollectionName(options: any): string {
    const collectionName = options.collection || options.c || getDefaultSchematicCollection();

    return collectionName;
  }

  private removeLocalOptions(options: any): any {
    const opts = Object.assign({}, options);
    delete opts.verbose;
    delete opts.collection;
    delete opts.skipGit;

    return opts;
  }
}
