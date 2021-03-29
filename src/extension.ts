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

	});

	context.subscriptions.push(disposable);

	let runActionDisposable = vscode.commands.registerCommand('github-action-debugger.runAction', ( jobName ) => {
		vscode.window.showInformationMessage('About to run an action');

		const writeEmitter = new vscode.EventEmitter<string>();
		let line = '';
		const pty = {
			onDidWrite: writeEmitter.event,
			open: () => writeEmitter.fire('Type and press enter to echo the text\r\n\r\n'),
			close: () => { /* noop*/ },
			handleInput: (data: string) => {
				if (data === '\r') { // Enter
					writeEmitter.fire(`\r\necho: "this!"\r\n\n`);
					line = '';
					return;
				}
				if (data === '\x7f') { // Backspace
					if (line.length === 0) {
						return;
					}
					line = line.substr(0, line.length - 1);
					// Move cursor backward
					writeEmitter.fire('\x1b[D');
					// Delete character
					writeEmitter.fire('\x1b[P');
					return;
				}
				line += data;
				writeEmitter.fire(data);
			}
		};
		const terminal = (<any>vscode.window).createTerminal('GitHub action test');
		terminal.sendText(`echo "Running the GitHub action job ${ jobName }"`);
		terminal.sendText(`act -j ${ jobName }`);
		terminal.show();
		writeEmitter.event(event => {
			const i = event;
		});
	});

	context.subscriptions.push(runActionDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
