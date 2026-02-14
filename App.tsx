
import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Coins, MapPin, Settings, Calendar, 
  TrendingUp, AlertTriangle, ChevronRight, Download, Upload, Trash2,
  GitBranch, Minus, User, Heart, Zap, Info, X, ShieldAlert, Edit2, Save,
  Briefcase, Key, Database, Target, Award, BookOpen, ScrollText
} from 'lucide-react';
import { GuildState, ClassType, GuildFocus, Member, MemberRank, GuildAsset } from './types';
import { createNewGuild, processMonth, generateMember, generateAsset } from './services/guildEngine';
import { MORALE_TABLE, MARKET_CLASS_LIMITS, MAX_REVENUE_BY_MC, POTENTIAL_RECRUITS_PER_MC } from './constants';

const App: React.FC = () => {
  const [guild, setGuild] = useState<GuildState>(createNewGuild());
  const [view, setView] = useState<'dashboard' | 'members' | 'settings' | 'hierarchy' | 'assets' | 'journal'>('dashboard');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<GuildAsset | null>(null);
  const [memberToBanish, setMemberToBanish] = useState<Member | null>(null);
  const [goldAdjustAmount, setGoldAdjustAmount] = useState<number>(100);
  const [recruitmentLog, setRecruitmentLog] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAsset, setIsEditingAsset] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('thieves_guild_data_v7');
    if (saved) {
      try {
        setGuild(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load guild data");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('thieves_guild_data_v7', JSON.stringify(guild));
  }, [guild]);

  const handleNextMonth = () => {
    const nextState = processMonth(guild);
    setGuild(nextState);
    setRecruitmentLog(null);
  };

  const exportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(guild, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${guild.name.replace(/\s+/g, '_')}_data.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setGuild(imported);
        } catch (err) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const getMoraleLevel = (score: number): string => {
    return MORALE_TABLE.find(t => score >= t.min && score <= t.max)?.level || 'Content';
  };

  const adjustMorale = (delta: number) => {
    setGuild(prev => ({
      ...prev,
      moraleScore: Math.min(20, Math.max(0, prev.moraleScore + delta))
    }));
  };

  const tryRecruit = () => {
    const cost = 100 + (guild.marketClass * 25);
    const currentLimit = guild.maxMemberOverride || MARKET_CLASS_LIMITS[guild.marketClass];
    if (guild.members.length >= currentLimit) { setRecruitmentLog("Guild at capacity!"); return; }
    if (guild.treasury < cost) { setRecruitmentLog("Insufficient gold!"); return; }
    
    setGuild(prev => ({ ...prev, treasury: prev.treasury - cost }));
    if ((Math.floor(Math.random() * 100) + 1) <= (40 + (guild.marketClass * 4))) {
      const newMember = generateMember();
      setGuild(prev => ({ ...prev, members: [...prev.members, newMember] }));
      setRecruitmentLog(`SUCCESS: ${newMember.name} joined!`);
    } else {
      setRecruitmentLog("FAILURE: No recruits found.");
    }
  };

  const addAsset = (type: 'Contact' | 'Stash' | 'Hideout') => {
    const asset = generateAsset(type);
    setGuild(prev => ({ ...prev, assets: [...prev.assets, asset] }));
    setSelectedAsset(asset);
    setIsEditingAsset(true);
  };

  const removeAsset = (id: string) => {
    setGuild(prev => ({ ...prev, assets: prev.assets.filter(a => a.id !== id) }));
    if (selectedAsset?.id === id) setSelectedAsset(null);
  };

  const updateAsset = (id: string, updates: Partial<GuildAsset>) => {
    setGuild(prev => {
      const updatedAssets = prev.assets.map(a => a.id === id ? { ...a, ...updates } : a);
      if (selectedAsset?.id === id) {
        const found = updatedAssets.find(a => a.id === id);
        if (found) setSelectedAsset(found);
      }
      return { ...prev, assets: updatedAssets };
    });
  };

  const adjustGold = (amount: number) => {
    setGuild(prev => ({ ...prev, treasury: Math.max(0, prev.treasury + amount) }));
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setGuild(prev => {
      const updatedMembers = prev.members.map(m => m.id === id ? { ...m, ...updates } : m);
      if (selectedMember?.id === id) {
        const found = updatedMembers.find(m => m.id === id);
        if (found) setSelectedMember(found);
      }
      return { ...prev, members: updatedMembers };
    });
  };

  const removeMember = (id: string) => {
    setGuild(prev => {
      const filteredMembers = prev.members.filter(m => m.id !== id);
      const cleanedMembers = filteredMembers.map(m => {
        if (m.relationships[id] !== undefined) {
          const newRels = { ...m.relationships };
          delete newRels[id];
          return { ...m, relationships: newRels };
        }
        return m;
      });
      return {
        ...prev,
        members: cleanedMembers
      };
    });
    setSelectedMember(null);
    setMemberToBanish(null);
  };

  // Filter journal entries to only show non-empty ones
  const filteredJournalEntries = (Object.entries(guild.journal) as [string, string][])
    .filter(([_, entry]) => entry && entry.trim().length > 0)
    .sort((a, b) => Number(b[0]) - Number(a[0]));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-slate-800 p-6 flex flex-col gap-8 border-r border-slate-700 shadow-2xl z-20">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-lg shadow-lg shadow-amber-500/20">
            <MapPin className="text-slate-900" size={24} />
          </div>
          <h1 className="medieval-font text-2xl font-bold text-amber-500 uppercase tracking-wider leading-none">Shadow<br/>Master</h1>
        </div>

        <ul className="flex flex-col gap-2">
          {[
            { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
            { id: 'members', icon: Users, label: `Roster (${guild.members.length})` },
            { id: 'hierarchy', icon: GitBranch, label: 'Hierarchy' },
            { id: 'assets', icon: Database, label: 'Assets & Intel' },
            { id: 'journal', icon: BookOpen, label: 'Journal' },
            { id: 'settings', icon: Settings, label: 'Configuration' }
          ].map(item => (
            <li 
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${view === item.id ? 'bg-amber-500 text-slate-900 font-semibold' : 'hover:bg-slate-700 text-slate-300'}`}
            >
              <item.icon size={20} /> {item.label}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-3">
          <button onClick={exportJson} className="flex items-center justify-center gap-2 p-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors text-xs font-bold"><Download size={16} /> EXPORT DATA</button>
          <label className="flex items-center justify-center gap-2 p-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors cursor-pointer text-xs font-bold"><Upload size={16} /> IMPORT JSON
            <input type="file" className="hidden" accept=".json" onChange={importJson} />
          </label>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto z-10">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="medieval-font text-4xl font-bold mb-1 text-amber-500 tracking-tight">{guild.name}</h2>
            <p className="text-slate-400 flex items-center gap-2 text-sm font-medium uppercase tracking-widest">
              <Calendar size={14} className="text-amber-500/60" /> Month {guild.currentMonth} &bull; {guild.focus} Focus
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 min-w-[140px] shadow-xl">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Treasury</p>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xl"><Coins size={18} /> {guild.treasury.toLocaleString()} gp</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 min-w-[180px] shadow-xl relative group">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Morale</p>
              <div className="flex items-center justify-between">
                <div className="text-emerald-400 font-bold text-xl">{getMoraleLevel(guild.moraleScore)} ({guild.moraleScore})</div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => adjustMorale(-1)} title="Decrease Morale" className="bg-slate-700 hover:bg-rose-500 p-1 rounded text-xs"><Minus size={12}/></button>
                  <button onClick={() => adjustMorale(1)} title="Increase Morale" className="bg-slate-700 hover:bg-emerald-500 p-1 rounded text-xs"><Plus size={12}/></button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {view === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-sm shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="text-amber-500" /> Operational Log
                  </h3>
                  <button onClick={handleNextMonth} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-8 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95">Next Month <ChevronRight size={20} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/30">
                      <p className="text-slate-400 text-sm mb-1 uppercase font-bold text-[10px]">Gross Revenue</p>
                      <p className="text-2xl font-bold text-amber-500">{guild.lastMonthLog.grossRevenue.toLocaleString()} gp</p>
                      <p className="text-xs text-slate-500 italic mt-1">{guild.lastMonthLog.modifierText}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/30">
                      <p className="text-slate-400 text-sm mb-1 uppercase font-bold text-[10px]">Net Profit</p>
                      <p className={`text-2xl font-bold ${guild.lastMonthLog.netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{guild.lastMonthLog.netProfit.toLocaleString()} gp</p>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/30 space-y-3 shadow-inner">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest text-[10px]">Expenses</p>
                    {[{ label: 'Salaries', val: guild.lastMonthLog.expenses.salaries }, { label: 'Maintenance', val: guild.lastMonthLog.expenses.maintenance }, { label: 'Bribes', val: guild.lastMonthLog.expenses.bribes }].map(ex => (
                      <div key={ex.label} className="flex justify-between text-sm"><span className="text-slate-400">{ex.label}</span><span className="font-mono">{ex.val} gp</span></div>
                    ))}
                    <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-rose-400"><span>Total Outlay</span><span className="font-mono">{guild.lastMonthLog.expenses.total} gp</span></div>
                  </div>
                </div>

                {guild.lastMonthLog.events.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-[10px] font-black text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-[0.2em]"><AlertTriangle size={14} className="text-amber-500" /> Logged Events</h4>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {guild.lastMonthLog.events.map((ev, i) => (
                        <li key={i} className={`bg-slate-700/20 p-3 rounded-xl text-xs border-l-2 text-slate-300 ${ev.includes('BOON') ? 'border-emerald-500' : ev.includes('BANE') ? 'border-rose-500' : ev.includes('Conflict') || ev.includes('Discord') ? 'border-orange-500' : 'border-amber-500'}`}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              <section className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ScrollText className="text-amber-500" /> Guildmaster's Monthly Decree</h3>
                <textarea 
                  value={guild.currentJournalEntry}
                  onChange={e => setGuild(prev => ({ ...prev, currentJournalEntry: e.target.value }))}
                  placeholder="Record orders, observations, or secrets for this month..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 min-h-[120px] outline-none text-slate-300 focus:border-amber-500 transition-all font-medium text-sm leading-relaxed"
                />
                <p className="text-[10px] text-slate-500 mt-2 uppercase font-bold tracking-widest italic">Archived only if not empty when Month progresses.</p>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 shadow-lg text-center">
                <h3 className="text-xl font-bold mb-6 flex items-center justify-center gap-2"><Target className="text-amber-500" /> Recruit Drive</h3>
                <button onClick={tryRecruit} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 mb-4"><Plus size={20} /> Hire Agent ({100 + (guild.marketClass * 25)} gp)</button>
                {recruitmentLog && <div className={`p-4 rounded-xl text-xs font-bold ${recruitmentLog.includes('SUCCESS') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'}`}>{recruitmentLog}</div>}
              </section>

              <section className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 shadow-lg space-y-4">
                 <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Coins className="text-amber-500" /> Treasury Adj.</h3>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">GP</span>
                    <input type="number" value={goldAdjustAmount} onChange={e => setGoldAdjustAmount(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 pl-12 outline-none font-bold text-amber-500 text-lg" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => adjustGold(goldAdjustAmount)} className="flex-1 bg-emerald-600/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 font-bold py-2 rounded-xl transition-all text-xs">Deposit</button>
                    <button onClick={() => adjustGold(-goldAdjustAmount)} className="flex-1 bg-rose-600/20 hover:bg-rose-500/40 text-rose-400 border border-rose-500/30 font-bold py-2 rounded-xl transition-all text-xs">Withdraw</button>
                  </div>
              </section>

              <section className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 space-y-3">
                <h3 className="text-xl font-bold mb-4">Cell Stats</h3>
                <div className="flex justify-between text-sm items-center p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
                  <span className="text-slate-400">Agents</span>
                  <span className="font-bold text-amber-500">{guild.members.length} / {guild.maxMemberOverride || MARKET_CLASS_LIMITS[guild.marketClass]}</span>
                </div>
                <div className="flex justify-between text-sm items-center p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
                  <span className="text-slate-400">Network Assets</span>
                  <span className="font-bold text-emerald-500">{guild.assets.length} items</span>
                </div>
              </section>
            </div>
          </div>
        )}

        {view === 'journal' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-amber-500 medieval-font uppercase tracking-widest">Guildmaster's Archive</h3>
              <div className="text-xs bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-slate-400 font-bold uppercase tracking-widest">
                {filteredJournalEntries.length} Records
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-4xl">
              {filteredJournalEntries.map(([month, entry]) => (
                <div key={month} className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 bg-amber-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-amber-500/10 transition-colors"></div>
                   <div className="relative z-10">
                     <div className="flex items-center gap-4 mb-4">
                       <div className="bg-amber-500 text-slate-900 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg medieval-font shadow-lg">{month}</div>
                       <h4 className="text-slate-400 uppercase font-black tracking-widest text-[10px]">Month Entry</h4>
                     </div>
                     <p className="text-slate-200 text-lg leading-relaxed font-medium italic whitespace-pre-wrap">
                       {entry}
                     </p>
                   </div>
                </div>
              ))}
              {filteredJournalEntries.length === 0 && (
                <div className="py-32 text-center bg-slate-800/20 border border-dashed border-slate-700 rounded-3xl">
                   <ScrollText size={48} className="mx-auto text-slate-700 mb-4" />
                   <p className="text-slate-500 italic">No historical records found. Notes are saved when you advance the month.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'assets' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-amber-500 medieval-font uppercase tracking-widest">Network Assets</h3>
              <div className="flex gap-2">
                <button onClick={() => addAsset('Contact')} className="bg-slate-800 hover:bg-slate-700 text-amber-500 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 text-sm font-bold"><Plus size={16}/> New Contact</button>
                <button onClick={() => addAsset('Stash')} className="bg-slate-800 hover:bg-slate-700 text-emerald-500 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 text-sm font-bold"><Plus size={16}/> New Stash</button>
                <button onClick={() => addAsset('Hideout')} className="bg-slate-800 hover:bg-slate-700 text-blue-500 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 text-sm font-bold"><Plus size={16}/> New Hideout</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guild.assets.map(asset => (
                <div key={asset.id} className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-xl hover:border-amber-500/50 transition-all group relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => { setSelectedAsset(asset); setIsEditingAsset(true); }} className="text-slate-500 hover:text-amber-500 transition-all opacity-0 group-hover:opacity-100 p-1"><Edit2 size={16}/></button>
                    <button onClick={() => removeAsset(asset.id)} className="text-slate-500 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 p-1"><Trash2 size={16}/></button>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-2xl ${asset.type === 'Contact' ? 'bg-amber-500/10 text-amber-500' : asset.type === 'Stash' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {asset.type === 'Contact' ? <Briefcase size={24}/> : asset.type === 'Stash' ? <Key size={24}/> : <Database size={24}/>}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{asset.type}</p>
                      <h4 className="font-bold text-slate-200">{asset.name}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{asset.description}</p>
                  {asset.location && <p className="text-xs text-slate-500 mb-2 font-medium">📍 {asset.location}</p>}
                  {asset.benefit && <p className="text-xs text-amber-500/80 font-bold bg-amber-500/5 p-2 rounded-lg italic">✨ {asset.benefit}</p>}
                  {asset.value !== undefined && <p className="text-xs text-emerald-500/80 font-bold">💰 Est. Value: {asset.value} gp</p>}
                </div>
              ))}
              {guild.assets.length === 0 && (
                <div className="col-span-full py-20 text-center bg-slate-800/20 border border-dashed border-slate-700 rounded-3xl">
                  <p className="text-slate-500 italic">No external assets recorded in the network yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'members' && (
          <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl animate-in fade-in duration-500">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
              <h3 className="text-2xl font-bold text-amber-500 medieval-font uppercase tracking-wider">Active Roster</h3>
              <button onClick={tryRecruit} className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"><Plus size={18} /> Recruit</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/80 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                  <tr><th className="p-6">Name</th><th className="p-6">Vocation</th><th className="p-6">Status</th><th className="p-6 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {guild.members.map(m => (
                    <tr key={m.id} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="p-6"><div className="font-bold text-slate-200">{m.name}</div><div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{m.rank}</div></td>
                      <td className="p-6"><div className="flex items-center gap-3"><span className="text-xs text-slate-300 font-bold">{m.classType} Lvl {m.level}</span><div className={`w-2 h-2 rounded-full ${m.workEthic === 'Ambitious' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : m.workEthic === 'Lazy' ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-slate-500'}`}></div></div></td>
                      <td className="p-6"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${m.status === 'Active' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>{m.status}</span></td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setSelectedMember(m); setIsEditing(false); }} title="View Info" className="text-amber-500 hover:text-amber-400 p-2 rounded-lg transition-all"><Info size={20} /></button>
                          <button onClick={() => setMemberToBanish(m)} title="Banish" className="text-slate-500 hover:text-rose-500 p-2 rounded-lg transition-all"><Trash2 size={20} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'hierarchy' && (
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 shadow-xl animate-in fade-in duration-500">
            <h3 className="text-2xl font-bold mb-6 text-amber-500 medieval-font uppercase tracking-wider">Command & Rank</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(MemberRank).reverse().map(rank => {
                const rankMembers = guild.members.filter(m => m.rank === rank);
                return (
                  <div key={rank} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 flex flex-col gap-4 shadow-inner">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-3"><h4 className="text-amber-500 font-black uppercase tracking-widest text-[10px]">{rank}</h4><span className="text-[10px] bg-slate-700 px-2 py-1 rounded-full text-slate-300 font-bold">{rankMembers.length}</span></div>
                    <div className="space-y-2 flex-1 min-h-[100px]">
                      {rankMembers.map(m => (
                        <div key={m.id} className="flex items-center justify-between group"><span onClick={() => { setSelectedMember(m); setIsEditing(false); }} className="text-sm text-slate-300 font-medium hover:text-amber-500 cursor-pointer">{m.name}</span>
                          <select value={m.rank} onChange={(e) => updateMember(m.id, { rank: e.target.value as MemberRank })} className="bg-slate-800 text-[9px] px-1 py-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            {Object.values(MemberRank).map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <section className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 shadow-xl space-y-8">
              <h3 className="text-2xl font-bold text-amber-500 medieval-font uppercase tracking-widest">Base Config</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Guild Name</label>
                  <input type="text" value={guild.name} onChange={e => setGuild(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none font-bold text-slate-200 focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Guild Focus</label>
                  <select value={guild.focus} onChange={e => setGuild(prev => ({ ...prev, focus: e.target.value as GuildFocus }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none font-bold text-slate-200 focus:border-amber-500">
                    {Object.values(GuildFocus).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-2 italic font-medium">Changing focus updates revenue tables and operational risks.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">GM Level</label>
                    <input type="number" value={guild.guildmasterLevel} onChange={e => setGuild(prev => ({ ...prev, guildmasterLevel: Number(e.target.value) }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none font-bold text-slate-200 focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">GM Vocation</label>
                    <select value={guild.guildmasterClass} onChange={e => setGuild(prev => ({ ...prev, guildmasterClass: e.target.value as ClassType }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none font-bold text-slate-200 focus:border-amber-500">
                      {Object.values(ClassType).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </section>
            <section className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 shadow-xl space-y-8">
              <h3 className="text-2xl font-bold text-amber-500 medieval-font uppercase tracking-widest">City Dynamics</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Market Size ({guild.marketClass})</label>
                  <input type="range" min="1" max="10" value={guild.marketClass} onChange={e => setGuild(prev => ({ ...prev, marketClass: Number(e.target.value) }))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                  <div className="flex justify-between text-xs mt-2 font-bold text-slate-500"><span>1 (Backwater)</span><span>10 (Metropolis)</span></div>
                </div>
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                  <input type="checkbox" id="gm-active" checked={guild.isGuildmasterPresent} onChange={e => setGuild(prev => ({ ...prev, isGuildmasterPresent: e.target.checked }))} className="w-6 h-6 accent-amber-500 rounded cursor-pointer" />
                  <label htmlFor="gm-active" className="text-sm font-bold text-slate-300 cursor-pointer">Active GM Oversight (+1 Revenue)</label>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Member Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
            <div className="p-8 relative flex-1 overflow-y-auto">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl border-4 border-slate-800 shrink-0"><User size={40} /></div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input value={selectedMember.name} onChange={e => updateMember(selectedMember.id, { name: e.target.value })} className="text-2xl font-bold bg-slate-900 border border-slate-700 rounded px-2 w-full text-amber-500 medieval-font mb-2 focus:border-amber-500" />
                    ) : (
                      <h3 className="text-2xl font-bold text-amber-500 medieval-font truncate">{selectedMember.name}</h3>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[10px] bg-slate-700 px-3 py-1 rounded-full text-slate-300 font-bold uppercase tracking-widest">{selectedMember.rank}</span>
                      <span className="text-[10px] bg-slate-700 px-3 py-1 rounded-full text-slate-300 font-bold uppercase tracking-widest">{selectedMember.classType} Lvl {selectedMember.level}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <button onClick={() => setIsEditing(!isEditing)} className={`p-3 rounded-xl transition-all shadow-md ${isEditing ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 hover:bg-amber-500 hover:text-slate-900 text-amber-500'}`}>
                    {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
                  </button>
                  <button onClick={() => setSelectedMember(null)} className="bg-slate-900/50 hover:bg-slate-700 p-3 rounded-xl text-slate-400 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Zap size={14} className="text-amber-500" /> Profiling & Career</h4>
                    <div className="space-y-3">
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 shadow-inner">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Backstory</p>
                        {isEditing ? (
                          <textarea value={selectedMember.backstory} onChange={e => updateMember(selectedMember.id, { backstory: e.target.value })} className="w-full bg-slate-800 p-2 rounded text-xs h-20 outline-none text-slate-300 border border-slate-700 focus:border-amber-500" />
                        ) : (
                          <p className="text-sm text-slate-300 italic leading-relaxed whitespace-pre-wrap">{selectedMember.backstory}</p>
                        )}
                      </div>
                      
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Vocation</p>
                          {isEditing ? (
                            <select value={selectedMember.classType} onChange={e => updateMember(selectedMember.id, { classType: e.target.value as ClassType })} className="bg-slate-800 p-1 rounded text-xs text-slate-200 border border-slate-700 outline-none focus:border-amber-500">
                              {Object.values(ClassType).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          ) : (
                            <p className="text-xs font-bold text-amber-500">{selectedMember.classType}</p>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Rank</p>
                          {isEditing ? (
                            <select value={selectedMember.rank} onChange={e => updateMember(selectedMember.id, { rank: e.target.value as MemberRank })} className="bg-slate-800 p-1 rounded text-xs text-slate-200 border border-slate-700 outline-none focus:border-amber-500">
                              {Object.values(MemberRank).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          ) : (
                            <p className="text-xs font-bold text-slate-300">{selectedMember.rank}</p>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Level</p>
                          {isEditing ? (
                            <input type="number" min="0" value={selectedMember.level} onChange={e => updateMember(selectedMember.id, { level: Number(e.target.value) })} className="bg-slate-800 p-1 rounded text-xs text-slate-200 border border-slate-700 outline-none focus:border-amber-500 w-16 text-right" />
                          ) : (
                            <p className="text-xs font-bold text-emerald-500">{selectedMember.level}</p>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Work Ethic</p>
                          {isEditing ? (
                            <select value={selectedMember.workEthic} onChange={e => updateMember(selectedMember.id, { workEthic: e.target.value as any })} className="bg-slate-800 p-1 rounded text-xs text-slate-200 border border-slate-700 outline-none focus:border-amber-500">
                              {['Lazy', 'Reliable', 'Ambitious', 'Sloppy'].map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <p className={`text-xs font-black uppercase ${selectedMember.workEthic === 'Ambitious' ? 'text-emerald-500' : selectedMember.workEthic === 'Lazy' ? 'text-rose-500' : 'text-slate-400'}`}>{selectedMember.workEthic}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 shadow-inner">
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Unique Quirk</p>
                          {isEditing ? (
                            <textarea value={selectedMember.quirk} onChange={e => updateMember(selectedMember.id, { quirk: e.target.value })} className="w-full bg-slate-800 p-2 rounded text-xs h-16 outline-none text-slate-200 border border-slate-700 focus:border-amber-500" />
                          ) : (
                            <p className="text-sm text-amber-500/80 font-medium leading-relaxed whitespace-pre-wrap">{selectedMember.quirk}</p>
                          )}
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 shadow-inner">
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Personal Interest</p>
                          {isEditing ? (
                            <textarea value={selectedMember.interest} onChange={e => updateMember(selectedMember.id, { interest: e.target.value })} className="w-full bg-slate-800 p-2 rounded text-xs h-16 outline-none text-slate-200 border border-slate-700 focus:border-amber-500" />
                          ) : (
                            <p className="text-sm text-emerald-500/80 font-medium leading-relaxed whitespace-pre-wrap">{selectedMember.interest}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/30">
                    <button onClick={() => setMemberToBanish(selectedMember)} className="w-full text-rose-500 font-bold flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-all text-sm uppercase tracking-widest py-3 rounded-xl border border-rose-500/20"><Trash2 size={16} /> Banish Member</button>
                  </div>
                </div>

                <div className="flex flex-col h-full">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Heart size={14} className="text-rose-500" /> Social Network</h4>
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden flex-1 min-h-[300px] max-h-[600px] overflow-y-auto shadow-inner">
                    {guild.members.filter(m => m.id !== selectedMember.id).map(m => {
                      const score = selectedMember.relationships[m.id] || 0;
                      return (
                        <div key={m.id} className="p-4 border-b border-slate-700/50 flex justify-between items-center hover:bg-slate-800/50 transition-colors">
                          <div className="min-w-0 flex-1 pr-4"><p className="text-sm font-bold text-slate-300 truncate">{m.name}</p></div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden relative">
                              <div className={`absolute top-0 bottom-0 transition-all ${score > 0 ? 'bg-emerald-500' : score < 0 ? 'bg-rose-500' : 'bg-slate-600'}`} style={{ left: '50%', width: `${Math.abs(score) * 5}%`, marginLeft: score < 0 ? `-${Math.abs(score) * 5}%` : '0' }}></div>
                            </div>
                            <span className={`text-[10px] font-black min-w-[2rem] text-right ${score > 0 ? 'text-emerald-500' : score < 0 ? 'text-rose-500' : 'text-slate-500'}`}>{score > 0 ? '+' : ''}{score}</span>
                          </div>
                        </div>
                      );
                    })}
                    {guild.members.length <= 1 && (
                      <div className="p-8 text-center text-slate-600 text-xs italic">No other members in the guild yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {memberToBanish && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-800 border-2 border-rose-500/50 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.2)] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="bg-rose-500/20 w-16 h-16 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-lg">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-100 medieval-font mb-2">Banish Agent?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Are you certain you wish to remove <span className="text-amber-500 font-bold">{memberToBanish.name}</span> from the guild? All relationship ties will be severed.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => removeMember(memberToBanish.id)}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
                >
                  Confirm Banishment
                </button>
                <button 
                  onClick={() => setMemberToBanish(null)}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Editor Modal */}
      {selectedAsset && isEditingAsset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-amber-500 medieval-font uppercase tracking-widest">Edit Asset</h3>
                <button onClick={() => { setSelectedAsset(null); setIsEditingAsset(false); }} className="text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Name</label>
                  <input type="text" value={selectedAsset.name} onChange={e => updateAsset(selectedAsset.id, { name: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none font-bold text-slate-200 focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Description</label>
                  <textarea value={selectedAsset.description} onChange={e => updateAsset(selectedAsset.id, { description: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none font-medium text-slate-300 h-24 focus:border-amber-500" />
                </div>
                {selectedAsset.type === 'Contact' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Network Benefit</label>
                    <input type="text" value={selectedAsset.benefit || ''} onChange={e => updateAsset(selectedAsset.id, { benefit: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none font-bold text-amber-500/80 focus:border-amber-500" />
                  </div>
                )}
                {(selectedAsset.type === 'Stash' || selectedAsset.type === 'Hideout') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Location</label>
                      <input type="text" value={selectedAsset.location || ''} onChange={e => updateAsset(selectedAsset.id, { location: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none font-bold text-slate-200 focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Valuation (gp)</label>
                      <input type="number" value={selectedAsset.value || 0} onChange={e => updateAsset(selectedAsset.id, { value: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none font-bold text-emerald-500 focus:border-amber-500" />
                    </div>
                  </div>
                )}
                <button onClick={() => { setSelectedAsset(null); setIsEditingAsset(false); }} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest">Seal Intelligence</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
