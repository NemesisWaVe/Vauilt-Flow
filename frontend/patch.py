import os, re
app_path = r'f:\AEGIS\frontend\src\App.jsx'
landing_path = r'f:\AEGIS\frontend\src\LandingPage.jsx'
index_path = r'f:\AEGIS\frontend\index.html'

def process_file(path, replacements):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = re.sub(old, new, content)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# GLOBAL REPLACEMENTS
global_repls = [
    (r'(?i)AEGIS', 'VaultFlow'),
    (r'indigo-400', 'cyan-400'),
    (r'indigo-500', 'blue-500'),
    (r'indigo-600', 'blue-600'),
    (r'#6366f1', '#3b82f6'),
    (r'rgba\(99, 102, 241', 'rgba(59, 130, 246')
]

# LANDING PAGE REPLACEMENTS
land_repls = global_repls + [
    (r'Your data pipeline,<br />\s*<span[^>]*>\s*definitively automated\.\s*</span>', 'Autonomous M&A.<br />\n                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: \'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #06b6d4 100%)\', WebkitBackgroundClip: \'text\' }}>\n                                The Micro-PE Analyst.\n                            </span>'),
    (r'Connect your warehouse or drop a spreadsheet\. VaultFlow writes the queries, plots the visualizations, and briefs you on the strategy in seconds\.', 'Ingest messy P&L data, mathematically isolate distressed digital assets, and instantly provision SPV domains for acquisition.')
]

process_file(landing_path, land_repls)
process_file(index_path, global_repls)

# APP.JSX REPLACEMENTS
with open(app_path, 'r', encoding='utf-8') as f: app_content = f.read()

for old, new in global_repls:
    app_content = re.sub(old, new, app_content)

app_content = app_content.replace("{['data', 'logs', 'viz', 'strategy'].map((tab) => {", "{['data', 'viz', 'strategy'].map((tab) => {")

app_content = app_content.replace("setActiveTab('logs');", "setActiveTab('viz');")
app_content = app_content.replace("rightContent === 'processing' && activeTab === 'logs'", "rightContent === 'processing' && activeTab === 'viz'")
app_content = app_content.replace("rightContent === 'chart' && activeTab === 'logs'", "rightContent === 'chart' && activeTab === 'viz'")

app_content = app_content.replace("tab === 'data' ? '[ Data View ]' : tab === 'logs' ? '[ Execution Pipeline ]' : tab === 'viz' ? '[ Visualizations ]' : '[ Strategy Brief ]'", "tab === 'data' ? '[ Ledger Ingestion ]' : tab === 'viz' ? '[ Valuation Matrix ]' : '[ Acquisition Brief ]'")

logs_block_pattern = r"\{rightContent === 'chart' && activeTab === 'viz' && \(\s*<div key=\"logs-complete\".*?\s*</div>\s*\)\}"
app_content = re.sub(logs_block_pattern, "", app_content, flags=re.DOTALL)

injection_target = "</div>\n\n            <div className=\"mt-8 flex flex-col md:flex-row justify-center gap-4 w-full\">"
injection_code = """</div>

            {aiAnalysis?.strategy_brief?.actionable_domains?.length > 0 && (
                <div className="w-full flex flex-col gap-4 mt-6 z-20 relative px-4">
                    <div className="text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] mb-2 font-bold">
                        [ SPV Domain Deployment ]
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {aiAnalysis.strategy_brief.actionable_domains.map(domain => (
                            <a key={domain} href={`https://gen.xyz/account/register?domain=${domain}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/30 hover:border-cyan-400/50 transition-all group">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="font-mono text-zinc-300 group-hover:text-cyan-400 transition-colors tracking-widest">{domain}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8 flex flex-col md:flex-row justify-center gap-4 w-full">"""
app_content = app_content.replace(injection_target, injection_code)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_content)

print('VaultFlow Script Execution Finished.')
