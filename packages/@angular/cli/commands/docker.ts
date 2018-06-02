import { CommandScope, Option } from '../models/command';
import { tags } from '@angular-devkit/core';
import { SchematicCommand } from '../models/schematic-command';

export default class DockerCommand extends SchematicCommand {
  public readonly name = 'docker';
  public readonly description = 'Generates and/or modifies docker files.';
  public static aliases = ['g'];
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
    }
  ];

  public async initialize(options: any) {
    super.initialize(options);

    return options;
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
    console.log('It works on run!', options);
  }

  public printHelp(options: any) {
    console.log('It works on help!', options);
  }
}
