dp.sh.Brushes.Bash = function()
{
	var keywords =	'break case esac if fi do done in while ' +
			'echo ls touch uname rm ' +
			'mvn svn' +
			'';
	this.regexList = [
		{ regex: dp.sh.RegexLib.SingleLinePerlComments,								css: 'comment' },		// one line comments
		{ regex: dp.sh.RegexLib.DoubleQuotedString,								css: 'string' },		// strings
		{ regex: dp.sh.RegexLib.SingleQuotedString,								css: 'string' },		// strings
		{ regex: new RegExp('\\b([\\d]+(\\.[\\d]+)?|0x[a-f0-9]+)\\b', 'gi'),	css: 'number' },		// numbers
		{ regex: new RegExp(this.GetKeywords(keywords), 'gm'),					css: 'keyword' }		// bash keyword
		];
}

dp.sh.Brushes.Bash.prototype	= new dp.sh.Highlighter();
dp.sh.Brushes.Bash.Aliases	= ['bash'];
