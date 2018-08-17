/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { JsonObject, JsonValue, parseJson } from '@angular-devkit/core';
import * as jsonSchemaTraverse from 'json-schema-traverse';
import { Option, OptionSmartDefault } from './command';

export async function convertSchemaToOptions(schema: string): Promise<Option[]> {
  const options = await getOptions(schema);

  return options;
}

function getOptions(schemaText: string, onlyRootProperties = true): Promise<Option[]> {
  // TODO: refactor promise to an observable then use `.toPromise()`
  return new Promise((resolve, reject) => {
    const fullSchema = parseJson(schemaText);
    const traverseOptions = {};
    const options: Option[] = [];
    function postCallback(schema: JsonObject,
                          jsonPointer: string,
                          rootSchema: string,
                          parentJsonPointer: string,
                          parentKeyword: string,
                          parentSchema: string,
                          property: string) {
      if (parentKeyword === 'properties') {
        let includeOption = true;
        if (onlyRootProperties && isPropertyNested(jsonPointer)) {
          includeOption = false;
        }
        const description = typeof schema.description == 'string' ? schema.description : '';
        const type = typeof schema.type == 'string' ? schema.type : '';
        let defaultValue: string | number | boolean | undefined = undefined;
        if (schema.default !== null) {
          if (typeof schema.default !== 'object') {
            defaultValue = schema.default;
          }
        }
        let $default: OptionSmartDefault | undefined = undefined;
        if (schema.$default !== null && JsonValue.isJsonObject(schema.$default)) {
          $default = <OptionSmartDefault> schema.$default;
        }
        let required = false;
        if (typeof schema.required === 'boolean') {
          required = schema.required;
        }
        let aliases: string[] | undefined = undefined;
        if (typeof schema.aliases === 'object' && Array.isArray(schema.aliases)) {
          aliases = <string[]> schema.aliases;
        }
        let format: string | undefined = undefined;
        if (typeof schema.format === 'string') {
          format = schema.format;
        }
        let hidden = false;
        if (typeof schema.hidden === 'boolean') {
          hidden = schema.hidden;
        }

        const option: Option = {
          name: property,
          // ...schema,

          description,
          type,
          default: defaultValue,
          $default,
          required,
          aliases,
          format,
          hidden,
        };

        if (includeOption) {
          options.push(option);
        }
      } else if (schema === fullSchema) {
        resolve(options);
      }
    }

    const callbacks = { post: postCallback };

    jsonSchemaTraverse(<object> fullSchema, traverseOptions, callbacks);
  });
}

function isPropertyNested(jsonPath: string): boolean {
  return jsonPath.split('/')
    .filter(part => part == 'properties' || part == 'items')
    .length > 1;
}

export function parseSchema(schema: string): JsonObject | null {
  const parsedSchema = parseJson(schema);
  if (parsedSchema === null || !JsonValue.isJsonObject(parsedSchema)) {
    return null;
  }

  return parsedSchema;
}
