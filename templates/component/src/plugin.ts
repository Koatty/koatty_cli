/*
 * @Description:
 * @Usage:
 * @Author: xxx
 * @Date: 2020-12-24 10:32:14
 * @LastEditTime: 2023-12-16 14:38:17
 */
import { Koatty, Logger, Helper } from "koatty";

/**
 *
 *
 * @interface OptionsInterface
 */
export interface OptionsInterface {
  // todo

}

/**
 * default options
 */
const defaultOptions: OptionsInterface = {
  // todo

};

export function _CLASS_NAME(options: OptionsInterface, app: Koatty): Promise<any> {
  // todo
  const opt = { ...defaultOptions, ...options };

  return Promise.resolve();
}