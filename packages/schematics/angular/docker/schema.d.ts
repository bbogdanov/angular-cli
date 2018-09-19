/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface Schema {
  /**
   * The name of the project.
   */
  project: string;
  /**
   * TODO find way to remove this dependency.
  * The name of the project.
  */
  name?: string;
  /**
   * Initialize for a particular environment.
   */
  environment: string;
  /**
   * The image name to use for image pushes.
   */
  imageName: string;
  /**
   * The name of the machine.
   */
  machineName: string;
  /**
   * Initializes the environment for deploying with an image, rather than performing a build.
   */
  useImage: boolean;
  /**
   * The org name to use for image pushes.
   */
  imageOrg: string;
  /**
   * The registry address to use for image pushes.
   */
  imageRegistry: string;
  /**
   * The port of the computer service.
   */
  servicePort: number;
  /**
   * The name of the service.
   */
  serviceName: string;

}
