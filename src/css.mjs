// Primer-flavored CSS for github-mock. Kept inline so the service has
// zero dependencies — copy/paste into the response stream and we're done.

export const CSS = String.raw`
* { box-sizing: border-box; margin: 0; padding: 0 }
body {
  font-family: -apple-system, "Segoe UI", system-ui, "Helvetica Neue", sans-serif;
  background: #0d1117; color: #c9d1d9; line-height: 1.5; font-size: 14px;
}
a { color: #2f81f7; text-decoration: none }
a:hover { text-decoration: underline }
code { font-family: ui-monospace, "SF Mono", Menlo, monospace; color: #79c0ff; background: rgba(110,118,129,0.4); padding: 1px 6px; border-radius: 3px; font-size: 12px }
.muted { color: #8b949e; font-size: 12px }
.grow { flex: 1 }

/* Header */
.header {
  background: #010409; border-bottom: 1px solid #30363d;
  padding: 0 32px; height: 62px; display: flex; align-items: center;
  gap: 16px; position: sticky; top: 0; z-index: 50;
}
.header .logo {
  font-weight: 800; font-size: 18px; color: white; display: flex;
  align-items: center; gap: 8px;
}
.header .logo svg { fill: white; width: 28px; height: 28px }
.header .search {
  flex: 1; max-width: 360px; background: #0d1117; border: 1px solid #30363d;
  border-radius: 6px; padding: 5px 12px; color: #c9d1d9; font-size: 13px;
}
.header .nav { display: flex; gap: 4px; margin-left: 4px }
.header .nav a {
  color: #c9d1d9; padding: 6px 12px; border-radius: 6px;
  font-size: 14px; font-weight: 500;
}
.header .nav a:hover { background: #21262d; text-decoration: none }
.header .right { margin-left: auto; display: flex; gap: 14px; align-items: center }
.header .hdr-icon { color: #c9d1d9; font-size: 16px; cursor: pointer }
.header .avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, #f78166, #ea4aaa);
  display: inline-block; cursor: pointer;
}

/* Repo banner */
.repo-banner { background: #0d1117; border-bottom: 1px solid #30363d; padding: 16px 32px 0 }
.repo-title { display: flex; align-items: center; gap: 8px; font-size: 20px; margin-bottom: 16px }
.repo-title .icon { color: #8b949e; font-size: 16px }
.repo-title .owner { color: #2f81f7; font-weight: 400 }
.repo-title .sep { color: #8b949e; margin: 0 4px }
.repo-title .name { color: #2f81f7; font-weight: 600 }
.repo-title .visibility {
  margin-left: 8px; font-size: 12px; font-weight: 500; padding: 2px 8px;
  border: 1px solid #30363d; border-radius: 12px; color: #8b949e;
}
.repo-actions { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; flex-wrap: wrap }

/* Buttons */
.btn {
  background: #21262d; color: #c9d1d9; border: 1px solid #30363d;
  padding: 5px 14px; border-radius: 6px; font-size: 12px; font-weight: 500;
  cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
}
.btn:hover { background: #30363d }
.btn-primary { background: #238636; border-color: #2ea043; color: white }
.btn-primary:hover { background: #2ea043 }
.btn-danger { background: #da3633; color: white; border-color: #f85149 }
.count-pill { background: #30363d; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 4px }

/* Sub nav */
.subnav {
  display: flex; gap: 0; padding: 0 32px; background: #0d1117;
  border-bottom: 1px solid #30363d; overflow-x: auto;
}
.subnav .tab {
  padding: 12px 16px; color: #c9d1d9; display: inline-flex; gap: 8px;
  align-items: center; border-bottom: 2px solid transparent;
  font-size: 14px; cursor: pointer; white-space: nowrap;
}
.subnav .tab:hover { color: white; text-decoration: none }
.subnav .tab.active { border-bottom-color: #f78166; color: white; font-weight: 600 }
.subnav .tab .count {
  background: #30363d; color: #c9d1d9; font-size: 12px; padding: 2px 8px;
  border-radius: 20px;
}

/* Layout */
main { max-width: 1280px; margin: 0 auto; padding: 24px 32px }
.row { display: flex; gap: 24px }
.col-main { flex: 1; min-width: 0 }
.col-side { width: 296px; flex-shrink: 0 }

/* Branch bar */
.branch-bar {
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  flex-wrap: wrap;
}
.branch-meta { display: inline-flex; gap: 8px; align-items: center }
.sep-dot { color: #6e7681 }

/* Cards */
.card {
  background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
  margin-bottom: 16px;
}
.card-header {
  padding: 12px 16px; background: #161b22; border-bottom: 1px solid #30363d;
  display: flex; align-items: center; gap: 12px; font-size: 13px;
  border-radius: 6px 6px 0 0;
}
.card-header .author { color: #c9d1d9; font-weight: 600 }
.card-header .commit-summary { color: #8b949e }
.card-header .sha {
  font-family: ui-monospace, monospace; color: #2f81f7; font-size: 12px;
  margin-left: auto;
}
.card-header .commit-count { margin-left: 8px }

.avatar-sm {
  width: 22px; height: 22px; border-radius: 50%;
  display: inline-block; flex-shrink: 0;
}
.grad-blue { background: linear-gradient(135deg, #79c0ff, #a371f7) }
.grad-pink { background: linear-gradient(135deg, #f78166, #ea4aaa) }
.grad-orange { background: linear-gradient(135deg, #ffb86c, #ff7f50) }
.grad-green { background: linear-gradient(135deg, #7ee787, #3fb950) }
.grad-violet { background: linear-gradient(135deg, #d2a8ff, #8957e5) }

/* File tree */
.file-tree { padding: 0 }
.file-row {
  display: flex; align-items: center; gap: 12px; padding: 6px 16px;
  border-bottom: 1px solid #21262d; font-size: 14px;
}
.file-row:last-child { border-bottom: none }
.file-row:hover { background: #161b22 }
.file-row .icon { color: #8b949e; width: 16px; text-align: center }
.file-row .name { flex: 1; min-width: 0 }
.file-row .name a { color: #2f81f7 }
.file-row .commit-msg {
  color: #8b949e; flex: 2; min-width: 0; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}
.file-row .time { color: #8b949e; font-size: 12px; min-width: 80px; text-align: right }

/* README */
.readme { padding: 24px 28px }
.readme h2 { color: #f0f6fc; margin-bottom: 12px; font-size: 24px; border-bottom: 1px solid #30363d; padding-bottom: 8px }
.readme h3 { color: #f0f6fc; margin-top: 16px; margin-bottom: 8px; font-size: 18px; border-bottom: 1px solid #30363d; padding-bottom: 6px }
.readme p { color: #c9d1d9; margin-bottom: 10px }
.readme pre {
  background: #161b22; padding: 14px; border-radius: 6px; color: #c9d1d9;
  font-family: ui-monospace, monospace; font-size: 13px; border: 1px solid #30363d;
  white-space: pre; overflow-x: auto;
}
.readme ul { color: #c9d1d9; margin-left: 22px; line-height: 1.7 }

/* Side cards */
.side-card { background: #0d1117; border-bottom: 1px solid #30363d; padding-bottom: 16px; margin-bottom: 16px }
.side-card .title {
  padding: 0 0 12px; font-size: 14px; font-weight: 600; color: #c9d1d9;
  display: flex; justify-content: space-between;
}
.side-card .title .gear { color: #8b949e; font-size: 12px }
.side-card .body { color: #c9d1d9; font-size: 14px }
.side-card .body .lead { color: #c9d1d9; margin-bottom: 12px }
.side-meta { list-style: none; padding: 0; margin: 6px 0 0; font-size: 13px; color: #8b949e }
.side-meta li { padding: 3px 0 }
.side-meta a { color: #8b949e }
.side-meta a:hover { color: #2f81f7 }
.side-card .topics { margin-top: 10px }
.topic-pill {
  display: inline-block; padding: 2px 10px; margin: 4px 4px 0 0;
  background: rgba(56, 139, 253, 0.15); color: #79c0ff;
  border-radius: 12px; font-size: 12px;
}
.topic-pill:hover { background: rgba(56, 139, 253, 0.30); text-decoration: none }
.release-row { display: flex; align-items: center; gap: 6px; margin-top: 10px }
.dot-green { width: 8px; height: 8px; background: #3fb950; border-radius: 50%; display: inline-block }
.bold { font-weight: 600 }
.contributors { display: flex; gap: 4px; align-items: center; margin-top: 6px }
.lang-bar {
  height: 10px; border-radius: 5px; overflow: hidden;
  display: flex; margin: 8px 0;
}
.lang-bar div { height: 100% }
.lang-list { list-style: none; padding: 0; font-size: 12px; color: #c9d1d9 }
.lang-list li {
  display: inline-flex; align-items: center; gap: 4px; margin-right: 12px;
  padding: 2px 0;
}
.lang-list .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block }

/* PR list */
.pr-toolbar {
  background: #161b22; padding: 12px 16px; border-bottom: 1px solid #30363d;
  display: flex; gap: 8px; align-items: center; border-radius: 6px 6px 0 0;
  flex-wrap: wrap;
}
.pr-toolbar .checkbox { width: 14px; height: 14px; border: 1px solid #8b949e; border-radius: 3px }
.pr-toolbar .filter-chip {
  color: #c9d1d9; font-size: 13px; padding: 4px 8px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 4px;
}
.pr-toolbar .filter-chip:hover { color: white; text-decoration: none }
.pr-toolbar .filter-chip.active b { color: #c9d1d9 }
.pr-item {
  padding: 16px; border-bottom: 1px solid #30363d; display: flex; gap: 12px;
}
.pr-item:last-child { border-bottom: none }
.pr-item .status-icon { color: #3fb950; font-size: 18px; margin-top: 2px; flex-shrink: 0 }
.pr-item .status-icon.closed { color: #f85149 }
.pr-item .status-icon.merged { color: #a371f7 }
.pr-info { flex: 1; min-width: 0 }
.pr-info .pr-title { font-size: 16px; font-weight: 600 }
.pr-info .pr-title a { color: #f0f6fc }
.pr-info .pr-title a:hover { color: #2f81f7 }
.pr-info .pr-meta { color: #8b949e; font-size: 12px; margin-top: 4px }
.pr-info .pr-meta .check-icon { color: #3fb950; margin-left: 6px }
.label {
  display: inline-block; margin-left: 6px; padding: 0 8px; border-radius: 12px;
  font-size: 12px; font-weight: 500; line-height: 18px; cursor: pointer;
}
.label.bug { background: rgba(248, 81, 73, 0.3); color: #ff7b72; border: 1px solid rgba(248, 81, 73, 0.2) }
.label.feature { background: rgba(56, 139, 253, 0.3); color: #79c0ff; border: 1px solid rgba(56, 139, 253, 0.2) }
.label.docs { background: rgba(210, 168, 255, 0.3); color: #d2a8ff; border: 1px solid rgba(210, 168, 255, 0.2) }
.label.good-first-issue { background: rgba(126, 231, 135, 0.3); color: #7ee787; border: 1px solid rgba(126, 231, 135, 0.2) }
.pr-actions { text-align: right; color: #8b949e; font-size: 12px; min-width: 100px; display: flex; align-items: center; gap: 6px; justify-content: flex-end }
.reviewer {
  display: inline-block; width: 20px; height: 20px; border-radius: 50%;
  background: linear-gradient(135deg, #6e7681, #484f58); margin-right: -6px;
  border: 2px solid #0d1117;
}

/* PR detail */
.pr-header { padding-bottom: 16px; border-bottom: 1px solid #30363d; margin-bottom: 24px }
.pr-header h1 { font-size: 28px; font-weight: 400; color: #f0f6fc; line-height: 1.25 }
.pr-header h1 .num { color: #8b949e; font-weight: 400; margin-left: 6px }
.pr-header-meta { display: flex; gap: 14px; align-items: center; margin-top: 12px; flex-wrap: wrap }
.pr-state {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
  border-radius: 20px; font-size: 14px; font-weight: 600;
}
.pr-state.open { background: #1f6feb; color: white }
.pr-state.merged { background: #8957e5; color: white }
.pr-state.closed { background: #da3633; color: white }
.pr-summary { color: #8b949e; font-size: 14px }
.pr-summary b { color: #c9d1d9; font-weight: 600 }

.pr-tabs { display: flex; gap: 0; border-bottom: 1px solid #30363d; margin-bottom: 24px; overflow-x: auto }
.pr-tabs .tab {
  padding: 10px 16px; color: #c9d1d9; display: inline-flex; gap: 8px;
  border-bottom: 2px solid transparent; cursor: pointer; white-space: nowrap;
  font-size: 14px;
}
.pr-tabs .tab:hover { color: white; text-decoration: none }
.pr-tabs .tab.active { border-bottom-color: #f78166; color: white; font-weight: 600 }
.pr-tabs .tab .count {
  background: #30363d; color: #c9d1d9; font-size: 12px; padding: 2px 8px;
  border-radius: 20px;
}

.file-diff {
  background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
  margin-bottom: 12px; overflow: hidden;
}
.file-diff .file-head {
  background: #161b22; padding: 8px 16px; border-bottom: 1px solid #30363d;
  display: flex; align-items: center; gap: 10px; font-size: 13px;
}
.file-diff .file-head .icon { color: #8b949e }
.file-diff .file-head .path { color: #c9d1d9; font-family: ui-monospace, monospace }
.file-diff .file-head .stats {
  margin-left: auto; display: flex; gap: 10px; color: #8b949e; font-size: 12px;
}
.file-diff .file-head .add-count { color: #3fb950 }
.file-diff .file-head .rem-count { color: #f85149 }
.diff-body {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 12px; line-height: 20px;
}
.diff-line {
  display: grid; grid-template-columns: 50px 50px 1fr;
  padding: 0 16px; column-gap: 16px;
}
.diff-line .lineno {
  color: #6e7681; text-align: right; font-size: 11px; user-select: none;
}
.diff-line.add { background: rgba(46, 160, 67, 0.15) }
.diff-line.add .code { color: #aff5b4 }
.diff-line.rem { background: rgba(248, 81, 73, 0.15) }
.diff-line.rem .code { color: #ffdcd7 }
.diff-line .marker { color: #6e7681 }
.diff-line.add .marker { color: #3fb950 }
.diff-line.rem .marker { color: #f85149 }

.review-bar {
  margin-top: 24px; padding: 16px;
  background: #161b22; border: 1px solid #30363d; border-radius: 6px;
}
.review-head { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; color: #f0f6fc }
.review-bar textarea {
  width: 100%; min-height: 80px; background: #0d1117; color: #c9d1d9;
  border: 1px solid #30363d; border-radius: 6px; padding: 10px;
  font-family: inherit; font-size: 14px; resize: vertical;
}
.review-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px }
`;
