import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Dependency } from './Dependency';

export class GitHubActionsProvider implements vscode.TreeDataProvider<Dependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();

  constructor(private workspace: typeof vscode.workspace) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: Dependency): Promise<Dependency[]> {
    const ymlFiles = await this.workspace.findFiles('.github/workflows/*.yml');
    const singleFile = yaml.load(fs.readFileSync(ymlFiles[0].fsPath, 'utf8'));
    return Promise.resolve(
      Object.keys(singleFile.jobs).reduce(
        ( accumulator, jobName ) => {
          return [
            ...accumulator,
            new Dependency(
              jobName,
              vscode.TreeItemCollapsibleState.None
            )
          ];
        },
        []
      )
    );

    /*
    return Promise.resolve([
      new Dependency(
        'first',
        '0.1.0',
        vscode.TreeItemCollapsibleState.None
      ),
      new Dependency(
        'second',
        '2.23.32',
        vscode.TreeItemCollapsibleState.None
      ),
    ]);
    if (!this.workspace.workspaceFile || typeof this.workspace.workspaceFile !== 'string') {
      vscode.window.showInformationMessage('No dependency in empty workspace');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(
        this.getDepsInPackageJson(
          path.join(this.workspace.workspaceFile, 'node_modules', element.label, 'package.json')
        )
      );
    } else {
      const packageJsonPath = path.join(this.workspace.workspaceFile, 'package.json');
      if (this.pathExists(packageJsonPath)) {
        return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
      } else {
        vscode.window.showInformationMessage('Workspace has no package.json');
        return Promise.resolve([]);
      }
    }
    const result = fs.readdir( path.join(this.workspace.workspaceFile, '.github', 'workflows' ), response => {
      const i = response;
    } );
    */
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
    if (this.pathExists(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      const toDep = (moduleName: string, version: string): Dependency => {
        if (
          typeof this.workspace.workspaceFile === 'string' &&
          this.pathExists(path.join(this.workspace.workspaceFile, 'node_modules', moduleName))
        ) {
          return new Dependency(
            moduleName,
            version,
            vscode.TreeItemCollapsibleState.None
          );
        } else {
          return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None);
        }
      };

      return packageJson.dependencies
        ? Object.keys(packageJson.dependencies).map(dep =>
            toDep(dep, packageJson.dependencies[dep])
          )
        : [];
    } else {
      return [];
    }
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}
