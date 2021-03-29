import * as vscode from 'vscode';
import * as fs from 'fs';
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
    const jobs = ymlFiles.reduce(
      ( accumulator, ymlFile ) => [
        ...accumulator,
        ...Object.keys(yaml.load(fs.readFileSync(ymlFile.fsPath, 'utf8'))?.jobs ?? {})
      ],
      []
    );

    jobs.push(
      new Dependency(
        'all',
        vscode.TreeItemCollapsibleState.None
      )
    );

    return Promise.resolve(
      jobs.reduce(
        ( accumulator, jobName ) => [
          ...accumulator,
          new Dependency(
            jobName,
            vscode.TreeItemCollapsibleState.None
          )
        ],
        []
      )
    );
  }
}
