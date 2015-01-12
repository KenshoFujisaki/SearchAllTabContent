js <<EOM
let searchAllTabsSub = {
	templateTitle: function (item, text) {
		var simpleURL = item.url.replace(/^https?:\/\//, '');
		if (simpleURL.indexOf('/') == simpleURL.length-1)
			simpleURL = simpleURL.replace('/', '');
		return xml`<span class="td-strut"/>${
				item.index + ":" + (item.matchCount+1) + ": " + 
				(item.title=="" ? "未データ取得" : item.title)
			}<span></span>
			<a highlight="simpleURL">
				<span class="extra-info">${simpleURL}</span>
			</a>`;
	},	
	templateDescription: function (item, text) {
		if (!item.summary) {
			return;
		}
		return !(item.summary && item.summary.length) ? 
			"" :
			xml`<span highlight="InfoMsg">${item.summary.slice(0, item.offset)}</span>
				<span highlight="Filter">${item.filter}</span>
				<span highlight="InfoMsg">${item.summary.slice(
					item.offset + item.filter.length, 
					item.summary.length)
				}</span>`;
	},
	unescapeHTML: function(str) {
		let entity = {
			"&amp;":	"&",
			"&nbsp;":	" ",
			"&lt;":		"<",
			"&gt;":		">",
			"&quot;":	'"',
			"&#39;":	"'",
			"&#13;":	"\r",
			"&#10;":	"\n"
		};
		return str.replace(/\&.{1,4}\;/g,
			function(e) {
				return entity[e] ? entity[e] : e;
			}
		);
	}
}

/* ブラウザの全タブについて内容検索 */
commands.addUserCommand(
	["SearchAllTabContent"],
	"Search about content of all tabs",
	function(args){
		let searchWord, tabIndex, matchCount, url;
		try {
			let text = (args+"").match(/^([^\:]*)\:([^\:]*)\:(\d+)\:(\d+)\:(.*$)/);
			searchWords = text[1].split(" ");
			searchWord = text[2];
			tabIndex = ~~text[3];
			matchCount = text[4];
			url = text[5];
		} finally {
			gBrowser.selectedTab = gBrowser.tabContainer.childNodes[tabIndex];
			let highlightAndFind = function() {
				finder.clear();
				finder._lastSearchString = searchWord;
				finder.find(searchWord);
				finder.highlight(searchWord);
			}
			if(gBrowser.browsers[tabIndex].contentDocument.body.innerHTML == "") {
			let preBody = "";
			let intervalCount = 0;
			let interval = window.setInterval(function() {
				let body = "";
				try {
					body = gBrowser.browsers[tabIndex].contentDocument.body.innerHTML;
				} finally {
					if(body!="" && body==preBody || intervalCount++ > 30/*second*/) {
						clearInterval(interval);
						highlightAndFind();
					}
					preBody = body;
				}
			}, 1000);
			} else {
				highlightAndFind();
			}
		}
	}, {
		completer: function(context, args) {
			context.title = ["Title", "Matching"];
			context.keys = {
				text: "commandline", 
				description: "summary", 
				title: "title", 
				index: "index", 
				url: "url", 
				summary: "summary",
				filter: "filter",
				offset: "offset",
				matchCount: "matchCount",
				commandline: "commandline"
			};
			context.process = [
				searchAllTabsSub.templateTitle,
				searchAllTabsSub.templateDescription
			];
			context.compare = CompletionContext.Sort.number;
			context.regenerate = true;
			context.anchored = true;
			context.ignoreCase = true;
			context.filterFunc = null;
			context.generate = function () {
				const summaryLenMax = 200;
				const prefixLen = 50;
				const matchCountMax = 100;

				let completions = [];
				let filters = context.filters = args.map(function(e){
					return e.replace(
						/\*|\.|\(|\)|\\|\+|\?|\{|\}|\[|\]|\^|\$|\-|\||\//g,
						function(e){ return '\\' + e });
				});
				let title, url, innerHtmlMsg;
				title = url = innerHtmlMsg = "";

				//補完リストの生成
				let makeCompletions = function(searchTarget, index) {
					let startIndex = 0;
					let matchCount = 0;
					let regex = RegExp(filters.join("|"), "ig");
					let matchedList = []; 
					searchTarget.replace(regex, function(e) {
						matchedList.push(e);
					});	

					while(matchCount < matchCountMax && matchCount < matchedList.length) {
						let filter = matchedList[matchCount];
						let offset = searchTarget.indexOf(filter, startIndex);
						startIndex = offset + filter.length;
						if (offset == -1) break;
						let summary = searchTarget.slice(
								offset > prefixLen ?  offset - prefixLen : 0,
								offset + summaryLenMax);
						let commandline = 
							filters[filters.length-1] + ":" 
							+ filter + ":" 
							+ index + ":" 
							+ (matchCount+1) + ":" 
							+ url;
						completions.unshift(
							{ index: index,
								matchCount: matchCount,
								title: title,
								url: url,
								summary: summary,
								filter: filter,
								offset:	offset > prefixLen ? prefixLen : offset,
								commandline: commandline
							}
						);
						if (filter == "") break;
						if (url.match("google.co.jp")) break;
						matchCount += 1;
					}
				};

				//各タブにおけるデータ取得
				for(let i=0; i<gBrowser.tabs.length; i++) {
					try {
						title = tabs.getTab(i).label;
						let targetWindow = gBrowser.browsers[i].contentDocument;
						url = targetWindow.location.href;
						innerHtmlMsg = targetWindow.body.innerHTML
							.replace(/\<[^\>]*?\>/g, "").replace(/(\ |\n|\r)/g, "");
						innerHtmlMsg = searchAllTabsSub.unescapeHTML(innerHtmlMsg);
					} finally {
						let searchTarget = title + innerHtmlMsg + url;
						if (searchTarget == "") continue;
						
						//各単語について検索
						let isMatched = filters.map(function(filter) {
							let regex = new RegExp(filter, "i");
							return searchTarget.match(regex) ? true : false;
						}).reduce(function(s,e) {
							return s && e;
						});
						if (isMatched) {
								makeCompletions(searchTarget, i);
						}
					}
				}
				return completions;
			}
		}
	}
);
EOM
