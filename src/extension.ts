import * as vscode from 'vscode';
import { GitHubActionsProvider } from './GitHubActionsProvider';

export function activate(context: vscode.ExtensionContext) {
	const actionsProvider = new GitHubActionsProvider(vscode.workspace);
	vscode.window.registerTreeDataProvider('ghActions', actionsProvider);
	vscode.commands.registerCommand('ghActions.refresh', () => actionsProvider.refresh());
	vscode.window.createTreeView('ghActions', {
		treeDataProvider: actionsProvider,
	});

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "github-action-debugger" is now active!');

	let disposable = vscode.commands.registerCommand('github-action-debugger.welcome', () => {
		console.log('inside welcome!');
	});

	context.subscriptions.push(disposable);

	let runActionDisposable = vscode.commands.registerCommand('github-action-debugger.runAction', ( jobName ) => {
		vscode.window.showInformationMessage('About to run an action');

		const command = 'all' === jobName
			? 'act'
			: `act -j ${ jobName }`;

		const terminal = (<any>vscode.window).createTerminal('GitHub action test');
		terminal.sendText(`echo "Running the GitHub action job ${ jobName }"`);
		terminal.sendText(command);
		terminal.show();
	});

	context.subscriptions.push(runActionDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
