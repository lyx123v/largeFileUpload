import {
  readWantedLockfile,
  type Lockfile,
  type PackageSnapshot,
  type ProjectSnapshot,
  existsNonEmptyWantedLockfile,
} from '@pnpm/lockfile-file';

import { DepGraph, type DepGraphNode } from '../types';
import { BaseDepGraph } from './base';

/**
 * 解析指定字符串格式，返回解析后的名称、规格符、本地版本和版本信息。
 * @param specifier 要解析的规格符字符串。
 * @returns 返回解析后的对象，包含名称、规格符、本地版本和版本信息。
 */
const parseFromSpecify = (specifier: string) => {
  /**
   * 定义一个正则表达式常量，用于匹配特定格式的字符串。
   * 此正则表达式主要用于解析类似于 `/path/to/resource` 或 `/@alias/path/to/resource` 格式的字符串。
   * 其中，可选的 `@alias` 部分代表一个别名，后续的路径表示资源的具体位置。
   *
   * 此正则表达式的结构如下：
   * - `^\/` 匹配字符串的开始，并且必须以 `/` 开头；
   * - `(@?[\w\-\d\.]+(\/[\w\-\d\.]+)?)` 匹配可选的 `@别名/` 部分，其中别名由字母、数字、下划线、连字符或点组成；
   * - `\/` 匹配路径中的下一个 `/`；
   * - `([\d\w\.\-]+)` 匹配路径中的剩余部分，由数字、字母、下划线、点或连字符组成；
   * - `(.+)?` 匹配路径后可能存在的额外信息，是可选的。
   *
   * @type {RegExp}
   */
  const REGEXP = /^\/(@?[\w\-\d\.]+(\/[\w\-\d\.]+)?)\/(([\d\w\.\-]+)(.+)?)/;
  if (!REGEXP.test(specifier)) {
    throw new Error(`Can not parse this key: ${specifier}`);
  }
  const [, name, , localVersion, version] = REGEXP.exec(specifier)!;

  return {
    name,
    specifier,
    localVersion,
    version,
  };
};

/**
 * 解析外部依赖。
 * @param depDef 包含依赖信息的对象。
 * @returns 返回一个数组，每个元素都表示一个依赖节点，包含名称、版本和依赖类型。
 */
const parseExternalDeps = (
  depDef: PackageSnapshot,
): DepGraphNode['dependencies'] => {
  const { dependencies, peerDependencies } = depDef;
  return [
    [dependencies, 'prod'],
    [peerDependencies, 'peer'],
  ]
    .map(([sources, type]) =>
      sources
        ? Object.keys(sources).map(dep => {
            return { name: dep, version: sources[dep], depType: type };
          })
        : [],
    )
    .flat() as DepGraphNode['dependencies'];
};

/**
 * 解析内部依赖。
 * @param depDef 包含项目内部依赖信息的对象。
 * @returns 返回一个数组，每个元素都表示一个依赖节点，包含名称、版本和依赖类型。
 */
const parseInternalDeps = (depDef: ProjectSnapshot) => {
  const { dependencies, devDependencies } = depDef;
  return [
    [dependencies, 'prod'],
    [devDependencies, 'dev'],
  ]
    .map(([sources, type]) =>
      sources
        ? Object.keys(sources).map(dep => {
            const { version } = sources[dep];
            return {
              name: dep,
              version: version as string,
              depType: type,
            };
          })
        : [],
    )
    .flat() as DepGraphNode['dependencies'];
};

/**
 * PNPM锁文件图选项接口。
 */
interface PnpmLockGraphOptions {
  lockPath: string; // PNPM锁文件所在的目录，仅目录路径！
}

/**
 * PNPM锁文件图类，继承自基础依赖图类。
 */
export class PnpmLockGraph extends BaseDepGraph {
  private lockPath: string;
  private pnpmLock?: Lockfile = undefined;

  /**
   * 构造函数。
   * @param options PNPM锁文件图选项。
   */
  constructor(options: PnpmLockGraphOptions) {
    super();
    const { lockPath } = options;
    this.lockPath = lockPath;
  }

  /**
   * 加载锁文件信息。
   * @param force 是否强制重新加载。
   */
  private async load(force = false) {
    if (!!this.pnpmLock && force === false) {
      return;
    }
    const { lockPath } = this;
    if (!(await existsNonEmptyWantedLockfile(lockPath))) {
      throw new Error(`Lock file not exits or empty.`);
    }
    const pnpmLock = await readWantedLockfile(lockPath, {
      ignoreIncompatible: true,
    });
    if (!pnpmLock) {
      throw new Error(`Can't parse lockfile: ${lockPath}`);
    }
    this.pnpmLock = pnpmLock;
  }

  /**
   * 解析依赖图。
   * @returns 返回解析后的依赖图。
   */
  async parse(): Promise<DepGraph> {
    await this.load();
    const {
      importers,
      // @ts-expect-error
      dependencies,
      // @ts-expect-error
      devDependencies,
      // @ts-expect-error
      peerDependencies,
      packages,
    } = this.pnpmLock!;
    const res: DepGraph = [];
    if (importers) {
      const modules = Object.keys(importers).map(key => ({
        dependencies: parseInternalDeps(importers[key]),
        external: false,
        name: key,
      }));
      res.push(...modules);
    } else {
      // @ts-expect-error
      const deps = parseInternalDeps({
        dependencies,
        devDependencies,
      });
      res.push({ name: '$root', dependencies: deps, external: false });
    }
    if (packages) {
      res.push(
        ...Object.keys(packages).map(key => {
          const { name, version, specifier, localVersion } =
            parseFromSpecify(key);
          return {
            dependencies: parseExternalDeps(packages[key]),
            external: true,
            version,
            name,
            specifier,
            localVersion,
          };
        }),
      );
    }
    return res;
  }
}
