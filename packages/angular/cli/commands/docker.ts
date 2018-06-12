import { RunSchematicOptions } from './../models/schematic-command';
import { CommandScope, Option } from './../models/command';
import { tags } from '@angular-devkit/core';
import { SchematicCommand } from '../models/schematic-command';
import { getDefaultSchematicCollection } from '../utilities/config';

export default class DockerCommand extends SchematicCommand {
  public readonly name = 'docker';
  public readonly description = 'Generates and/or modifies docker files.';
  public readonly scope = CommandScope.inProject;
  public arguments: string[];
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
      default: 'lol',
      aliases: ['iN'],
      description: 'Adds more details to output logging.',
    },
    {
      name: 'servicePort',
      type: Boolean,
      default: 8000,
      aliases: ['sP'],
      description: 'Adds more details to output logging.',
    }
  ];

  private schematicName = 'docker';

  public async initialize(options: any) {
    await super.initialize(options);

    const collectionName = this.parseCollectionName(options);

    const schematicOptions = await this.getOptions({
      schematicName: this.schematicName,
      collectionName,
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

    let collectionName: string;
    if (options.collection) {
      collectionName = options.collection;
    } else {
      collectionName = this.parseCollectionName(options);
    }

    options = this.removeLocalOptions(options);

    return this.runSchematic({
      collectionName: collectionName,
      schematicName: this.schematicName,
      schematicOptions: options,
      debug: options.debug,
      dryRun: options.dryRun,
      force: options.force,
    });
  }

  public printHelp(options: any) {
    console.log('It works on help!', options);
  }

  private parseCollectionName(options: any): string {
    const collectionName = options.collection || options.c || getDefaultSchematicCollection();

    return collectionName;
  }

  private removeLocalOptions(options: any): any {
    const opts = Object.assign({}, options);
    delete opts.verbose;
    delete opts.collection;
    delete opts.dryRun;
    delete opts.skipGit;

    return opts;
  }
}
