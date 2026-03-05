import React, { useState } from 'react';
import clsx from 'clsx';

// ─── Pure crypto functions ────────────────────────────────────────────────────

function caesarEncrypt(text: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return text
    .toUpperCase()
    .split('')
    .map(c => (c >= 'A' && c <= 'Z' ? String.fromCharCode(((c.charCodeAt(0) - 65 + s) % 26) + 65) : c))
    .join('');
}

function vigenereEncrypt(text: string, key: string): string {
  if (!key) return text;
  const k = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (!k) return text;
  let ki = 0;
  return text
    .toUpperCase()
    .split('')
    .map(c => {
      if (c >= 'A' && c <= 'Z') {
        const enc = String.fromCharCode(((c.charCodeAt(0) - 65 + k.charCodeAt(ki % k.length) - 65) % 26) + 65);
        ki++;
        return enc;
      }
      return c;
    })
    .join('');
}

function vigenereDecrypt(text: string, key: string): string {
  if (!key) return text;
  const k = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (!k) return text;
  let ki = 0;
  return text
    .toUpperCase()
    .split('')
    .map(c => {
      if (c >= 'A' && c <= 'Z') {
        const dec = String.fromCharCode(((c.charCodeAt(0) - 65 - (k.charCodeAt(ki % k.length) - 65) + 26) % 26) + 65);
        ki++;
        return dec;
      }
      return c;
    })
    .join('');
}

function gcd(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function modInverse(a: number, m: number): number | null {
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return null;
}

function affineEncrypt(text: string, a: number, b: number): string {
  if (gcd(a, 26) !== 1) return 'ERROR: gcd(a,26) harus = 1';
  return text
    .toUpperCase()
    .split('')
    .map(c => (c >= 'A' && c <= 'Z' ? String.fromCharCode(((a * (c.charCodeAt(0) - 65) + b) % 26) + 65) : c))
    .join('');
}

function affineDecrypt(text: string, a: number, b: number): string {
  const ai = modInverse(a, 26);
  if (ai === null) return 'ERROR: gcd(a,26) harus = 1';
  return text
    .toUpperCase()
    .split('')
    .map(c => (c >= 'A' && c <= 'Z' ? String.fromCharCode(((ai * ((c.charCodeAt(0) - 65 - b + 26)) % 26 + 26) % 26) + 65) : c))
    .join('');
}

function otpXor(text: string, key: string): string {
  const a = text.toUpperCase().split('').filter(c => c >= 'A' && c <= 'Z');
  const k = key.toUpperCase().split('').filter(c => c >= 'A' && c <= 'Z');
  if (!a.length || !k.length) return '';
  return a
    .map((c, i) => String.fromCharCode(((c.charCodeAt(0) - 65) ^ (k[i % k.length].charCodeAt(0) - 65)) + 65))
    .join('');
}

type BlockMode = 'ECB' | 'CBC';
function blockCipherVisual(text: string, mode: BlockMode): string[][] {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  const blocks: string[][] = [];
  for (let i = 0; i < letters.length; i += 4) {
    blocks.push(letters.slice(i, i + 4).split(''));
  }
  if (!blocks.length) return [];

  if (mode === 'ECB') return blocks;

  // CBC: XOR each block with previous
  const result: string[][] = [];
  let prev = [0, 0, 0, 0]; // IV = 0
  for (const block of blocks) {
    const xored = block.map((c, i) => {
      const val = ((c.charCodeAt(0) - 65) ^ prev[i]) % 26;
      return String.fromCharCode(val + 65);
    });
    result.push(xored);
    prev = xored.map(c => c.charCodeAt(0) - 65);
  }
  return result;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}

function rsaCalc(p: number, q: number, e?: number): { n: number; phi: number; e: number; d: number | null; error?: string } | null {
  if (p < 2 || q < 2) return null;
  if (!isPrime(p) || !isPrime(q)) return { n: p * q, phi: 0, e: 0, d: null, error: 'p dan q harus bilangan prima' };
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  const chosenE = e && gcd(e, phi) === 1 ? e : 65537;
  const finalE = gcd(chosenE, phi) === 1 ? chosenE : (() => {
    for (let x = 3; x < phi; x += 2) { if (gcd(x, phi) === 1) return x; }
    return 3;
  })();
  const d = modInverse(finalE, phi);
  return { n, phi, e: finalE, d };
}

function rsaEncrypt(m: number, e: number, n: number): number {
  return Number(BigInt(m) ** BigInt(e) % BigInt(n));
}

function rsaDecrypt(c: number, d: number, n: number): number {
  return Number(BigInt(c) ** BigInt(d) % BigInt(n));
}

// ─── Block Color Helper ───────────────────────────────────────────────────────

const BLOCK_COLORS = [
  'bg-red-200 text-red-800',
  'bg-blue-200 text-blue-800',
  'bg-green-200 text-green-800',
  'bg-yellow-200 text-yellow-800',
  'bg-purple-200 text-purple-800',
  'bg-pink-200 text-pink-800',
  'bg-orange-200 text-orange-800',
  'bg-teal-200 text-teal-800',
];

// ─── Shared table styles ──────────────────────────────────────────────────────

function CalcTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="bg-indigo-600 text-white">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-slate-700 border-b border-slate-100">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tool: Caesar + Vigenère (Module 102) ────────────────────────────────────

const CaesarVigenere: React.FC = () => {
  const [caesarText, setCaesarText] = useState('HELLO WORLD');
  const [caesarShift, setCaesarShift] = useState(3);
  const [vigenText, setVigenText] = useState('ATTACKATDAWN');
  const [vigenKey, setVigenKey] = useState('LEMON');
  const [vigenMode, setVigenMode] = useState<'enc' | 'dec'>('enc');

  const caesarOut = caesarEncrypt(caesarText, caesarShift);
  const vigenOut = vigenMode === 'enc' ? vigenereEncrypt(vigenText, vigenKey) : vigenereDecrypt(vigenText, vigenKey);

  // Caesar step-by-step table (max 8 A-Z chars)
  const caesarLetters = caesarText.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8).split('');
  const caesarRows = caesarLetters.map(c => {
    const x = c.charCodeAt(0) - 65;
    const sum = x + caesarShift;
    const mod = sum % 26;
    const result = String.fromCharCode(mod + 65);
    return [c, String(x), `${x}+${caesarShift}=${sum}`, String(mod), result];
  });

  // Vigenère step-by-step table (max 8 letters)
  const vigenLetters = vigenText.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8).split('');
  const keyClean = vigenKey.toUpperCase().replace(/[^A-Z]/g, '');
  const vigenRows = vigenLetters.map((p, i) => {
    const pi = p.charCodeAt(0) - 65;
    const ki = keyClean.length ? keyClean.charCodeAt(i % keyClean.length) - 65 : 0;
    const kChar = keyClean.length ? keyClean[i % keyClean.length] : '?';
    const sum = vigenMode === 'enc' ? pi + ki : pi - ki + 26;
    const mod = sum % 26;
    const result = String.fromCharCode(mod + 65);
    return [p, String(pi), kChar, String(ki), `${pi}${vigenMode === 'enc' ? '+' : '-'}${ki}=${vigenMode === 'enc' ? pi + ki : pi - ki}`, String(mod), result];
  });

  return (
    <div className="space-y-8">
      {/* Caesar */}
      <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
        <h3 className="font-bold text-slate-900 mb-1">Sandi Caesar</h3>
        <p className="text-xs text-slate-500 mb-4 font-mono">E(x) = (x + k) mod 26</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Plaintext</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={caesarText}
              onChange={e => setCaesarText(e.target.value)}
              placeholder="Masukkan teks..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Kunci (Shift): {caesarShift}</label>
            <input
              type="range"
              min={1}
              max={25}
              value={caesarShift}
              onChange={e => setCaesarShift(Number(e.target.value))}
              className="w-full accent-indigo-600 mt-2"
            />
          </div>
        </div>
        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 font-mono text-lg tracking-widest text-indigo-800 text-center break-all">
          {caesarOut || '—'}
        </div>
        {/* Alphabet shift table */}
        <div className="mt-4 overflow-x-auto">
          <table className="text-xs font-mono mx-auto">
            <tbody>
              <tr>
                <td className="pr-2 text-slate-500 font-sans">Plaintext:</td>
                {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(c => (
                  <td key={c} className="px-1 text-slate-600">{c}</td>
                ))}
              </tr>
              <tr>
                <td className="pr-2 text-slate-500 font-sans">Ciphertext:</td>
                {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(c => (
                  <td key={c} className="px-1 text-indigo-600 font-bold">{caesarEncrypt(c, caesarShift)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        {/* Step-by-step calculation table */}
        {caesarRows.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Perhitungan Langkah demi Langkah</p>
            <CalcTable
              headers={['Huruf', 'Nilai x (A=0)', `x + ${caesarShift}`, 'mod 26', 'Hasil']}
              rows={caesarRows}
            />
          </div>
        )}
      </div>

      {/* Vigenère */}
      <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
        <h3 className="font-bold text-slate-900 mb-1">Sandi Vigenère</h3>
        <p className="text-xs text-slate-500 mb-4 font-mono">Cᵢ = (Pᵢ + Kᵢ) mod 26</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Teks</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={vigenText}
              onChange={e => setVigenText(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Kunci</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={vigenKey}
              onChange={e => setVigenKey(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {(['enc', 'dec'] as const).map(m => (
            <button
              key={m}
              onClick={() => setVigenMode(m)}
              className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium transition-colors', vigenMode === m ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600')}
            >
              {m === 'enc' ? 'Enkripsi' : 'Dekripsi'}
            </button>
          ))}
        </div>
        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 font-mono text-lg tracking-widest text-indigo-800 text-center break-all">
          {vigenOut || '—'}
        </div>
        {/* Step-by-step Vigenère table */}
        {vigenRows.length > 0 && keyClean.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Perhitungan per Huruf (maks 8) — {vigenMode === 'enc' ? 'Enkripsi' : 'Dekripsi'}
            </p>
            <CalcTable
              headers={['P', 'Pᵢ', 'K', 'Kᵢ', `Pᵢ${vigenMode === 'enc' ? '+' : '−'}Kᵢ`, 'mod 26', 'Hasil']}
              rows={vigenRows}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tool: Affine + OTP (Module 103) ─────────────────────────────────────────

const VALID_A = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

const AffineOTP: React.FC = () => {
  const [affText, setAffText] = useState('HELLO');
  const [affA, setAffA] = useState(5);
  const [affB, setAffB] = useState(8);
  const [affMode, setAffMode] = useState<'enc' | 'dec'>('enc');
  const [otpText, setOtpText] = useState('BINAI');
  const [otpKey, setOtpKey] = useState('KEY');

  const affOut = affMode === 'enc' ? affineEncrypt(affText, affA, affB) : affineDecrypt(affText, affA, affB);
  const otpOut = otpXor(otpText, otpKey);
  const aInv = modInverse(affA, 26);
  const gcdVal = gcd(affA, 26);

  // Affine step-by-step table (max 6 chars)
  const affLetters = affText.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6).split('');
  const affRows = affLetters.map(c => {
    const x = c.charCodeAt(0) - 65;
    if (affMode === 'enc') {
      const axb = affA * x + affB;
      const mod = ((affA * x + affB) % 26);
      const result = String.fromCharCode(mod + 65);
      return [c, String(x), `${affA}×${x}=${affA * x}`, `${affA * x}+${affB}=${axb}`, String(mod), result];
    } else {
      const xMinusB = x - affB;
      const ai = aInv ?? 0;
      const aiXb = ai * ((x - affB + 260) % 26);
      const mod = aiXb % 26;
      const result = String.fromCharCode(mod + 65);
      return [c, String(x), `${x}−${affB}=${xMinusB}`, `${ai}×${((x - affB + 260) % 26)}=${aiXb}`, String(mod), result];
    }
  });

  // OTP binary table (max 5 chars)
  const otpLetters = otpText.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5).split('');
  const otpKeyLetters = otpKey.toUpperCase().replace(/[^A-Z]/g, '');
  const otpRows = otpLetters.map((p, i) => {
    const pVal = p.charCodeAt(0) - 65;
    const kChar = otpKeyLetters.length ? otpKeyLetters[i % otpKeyLetters.length] : '?';
    const kVal = otpKeyLetters.length ? otpKeyLetters.charCodeAt(i % otpKeyLetters.length) - 65 : 0;
    const xorVal = pVal ^ kVal;
    const result = String.fromCharCode(xorVal + 65);
    const toBin = (n: number, bits: number) => n.toString(2).padStart(bits, '0');
    return [p, toBin(pVal, 5), kChar, toBin(kVal, 5), toBin(xorVal, 5), result];
  });

  return (
    <div className="space-y-8">
      {/* Affine */}
      <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
        <h3 className="font-bold text-slate-900 mb-1">Affine Cipher</h3>
        <p className="text-xs text-slate-500 mb-4 font-mono">E(x) = (ax + b) mod 26  |  D(x) = a⁻¹(x − b) mod 26</p>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Teks</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={affText}
              onChange={e => setAffText(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              a (coprime 26)
              <span className={clsx('ml-2 font-bold', gcdVal === 1 ? 'text-emerald-600' : 'text-red-600')}>
                gcd({affA}, 26) = {gcdVal} {gcdVal === 1 ? '✓ Valid' : '✗ Invalid'}
              </span>
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={affA}
              onChange={e => setAffA(Number(e.target.value))}
            >
              {VALID_A.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">b (0–25): {affB}</label>
            <input
              type="range"
              min={0}
              max={25}
              value={affB}
              onChange={e => setAffB(Number(e.target.value))}
              className="w-full accent-indigo-600 mt-2"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {(['enc', 'dec'] as const).map(m => (
            <button
              key={m}
              onClick={() => setAffMode(m)}
              className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium transition-colors', affMode === m ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600')}
            >
              {m === 'enc' ? 'Enkripsi' : 'Dekripsi'}
            </button>
          ))}
        </div>
        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 font-mono text-lg tracking-widest text-indigo-800 text-center break-all">
          {affOut || '—'}
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
          a⁻¹ mod 26 = {aInv ?? 'N/A'}
        </p>
        {/* Step-by-step affine table */}
        {affRows.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Perhitungan ({affMode === 'enc' ? `E(x) = (${affA}x + ${affB}) mod 26` : `D(x) = ${aInv}(x − ${affB}) mod 26`})
            </p>
            <CalcTable
              headers={affMode === 'enc'
                ? ['Huruf', 'x', `${affA}×x`, `${affA}×x+${affB}`, 'mod 26', 'Hasil']
                : ['Huruf', 'x', `x−${affB}`, `${aInv}×(x−${affB})`, 'mod 26', 'Hasil']
              }
              rows={affRows}
            />
          </div>
        )}
      </div>

      {/* OTP XOR */}
      <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
        <h3 className="font-bold text-slate-900 mb-1">One-Time Pad (XOR)</h3>
        <p className="text-xs text-slate-500 mb-4 font-mono">Cᵢ = Pᵢ ⊕ Kᵢ  —  operasi yang sama untuk enkripsi dan dekripsi</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Plaintext / Ciphertext</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={otpText}
              onChange={e => setOtpText(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Kunci (diulang)</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={otpKey}
              onChange={e => setOtpKey(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 font-mono text-lg tracking-widest text-indigo-800 text-center break-all">
          {otpOut || '—'}
        </div>
        {/* OTP binary XOR table */}
        {otpRows.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Tabel XOR Biner (maks 5 huruf, 5-bit)</p>
            <CalcTable
              headers={['P', 'Biner P', 'K', 'Biner K', 'XOR', 'Hasil']}
              rows={otpRows}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tool: Block Cipher Visual (Module 104) ───────────────────────────────────

const BlockCipherTool: React.FC = () => {
  const [text, setText] = useState('SERANGANMENDADAK');
  const [mode, setMode] = useState<BlockMode>('ECB');

  const ecbBlocks = blockCipherVisual(text, 'ECB');
  const cbcBlocks = blockCipherVisual(text, 'CBC');

  const renderBlocks = (blocks: string[][], label: string, colorByValue: boolean, showLabels: boolean) => (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-3">
        {blocks.map((block, bi) => {
          const key = block.join('');
          const colorIdx = colorByValue
            ? (key.charCodeAt(0) + key.charCodeAt(1 % key.length)) % BLOCK_COLORS.length
            : bi % BLOCK_COLORS.length;
          return (
            <div key={bi} className="flex flex-col items-center gap-1">
              {showLabels && (
                <span className="text-xs text-slate-400 font-mono">
                  {colorByValue ? `E(P${bi + 1})` : `C${bi + 1}`}
                </span>
              )}
              <div className={clsx('flex rounded-lg overflow-hidden border border-white/50', BLOCK_COLORS[colorIdx])}>
                {block.map((c, ci) => (
                  <span key={ci} className="w-8 h-8 flex items-center justify-center text-sm font-mono font-bold">{c}</span>
                ))}
              </div>
              {!colorByValue && bi < blocks.length - 1 && (
                <span className="text-xs text-slate-400 font-mono">⊕↓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Mode comparison table
  const modeRows = [
    ['ECB', 'Ya', 'Tidak', 'Tidak', <span className="text-red-600 font-bold">Jangan digunakan</span>],
    ['CBC', 'Hanya Dekripsi', 'IV acak', 'Tidak', 'Gunakan + HMAC'],
    ['CTR', 'Ya', 'Nonce', 'Tidak', 'Gunakan + MAC'],
    ['GCM', 'Ya', 'Nonce 96-bit', 'Ya (GHASH)', <span className="text-emerald-600 font-bold">Direkomendasikan ✓</span>],
  ];

  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 space-y-6">
      <div>
        <h3 className="font-bold text-slate-900 mb-1">Visualisasi Mode Block Cipher (4 huruf/blok)</h3>
        <p className="text-xs text-slate-500">
          ECB: blok identik → warna identik (kelemahan!). CBC: setiap blok berbeda karena chaining.
        </p>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">Plaintext</label>
        <input
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Masukkan teks (gunakan kata berulang untuk melihat perbedaan)"
        />
      </div>

      <div className="space-y-6">
        {renderBlocks(ecbBlocks, 'ECB — Warna sama = blok plaintext identik', true, true)}
        {renderBlocks(cbcBlocks, 'CBC — Setiap blok unik karena XOR dengan blok sebelumnya', false, true)}
      </div>

      {ecbBlocks.length >= 2 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          {ecbBlocks.some((b, i) => i > 0 && ecbBlocks.findIndex(other => other.join('') === b.join('')) < i)
            ? '⚠️ ECB terdeteksi memiliki blok duplikat — pola terlihat! CBC aman karena tidak ada duplikat.'
            : 'Coba masukkan teks dengan kata berulang (mis: ABCDABCD) untuk melihat kelemahan ECB.'}
        </div>
      )}

      {/* Mode Comparison Table */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Perbandingan Mode</p>
        <CalcTable
          headers={['Mode', 'Paralel?', 'IV/Nonce?', 'Integritas?', 'Rekomendasi']}
          rows={modeRows}
        />
      </div>
    </div>
  );
};

// ─── Tool: RSA Calculator (Module 105) ───────────────────────────────────────

const RSATool: React.FC = () => {
  const [p, setP] = useState(61);
  const [q, setQ] = useState(53);
  const [eInput, setEInput] = useState(17);
  const [msg, setMsg] = useState(65);

  const keys = rsaCalc(p, q, eInput);
  const pPrime = isPrime(p);
  const qPrime = isPrime(q);

  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 space-y-6">
      <div>
        <h3 className="font-bold text-slate-900 mb-1">Kalkulator RSA</h3>
        <p className="text-xs text-slate-500">Masukkan dua bilangan prima p dan q untuk melihat proses RSA.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">
            p (prima)
            <span className={clsx('ml-1 font-bold', pPrime ? 'text-emerald-600' : 'text-red-500')}>
              {pPrime ? '✓' : '✗'}
            </span>
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={p}
            onChange={e => setP(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">
            q (prima)
            <span className={clsx('ml-1 font-bold', qPrime ? 'text-emerald-600' : 'text-red-500')}>
              {qPrime ? '✓' : '✗'}
            </span>
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={q}
            onChange={e => setQ(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">e (kunci publik)</label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={eInput}
            onChange={e => setEInput(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Pesan M (integer)</label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={msg}
            onChange={e => setMsg(Number(e.target.value))}
          />
        </div>
      </div>

      {keys && (
        <>
          {keys.error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{keys.error}</div>
          ) : (
            <div className="space-y-5">
              {/* Zone 1: Key generation walkthrough */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Langkah Pembangkitan Kunci
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Pilih p dan q prima', detail: `p = ${p} ${pPrime ? '✓ prima' : '✗ bukan prima'}, q = ${q} ${qPrime ? '✓ prima' : '✗ bukan prima'}` },
                    { label: 'Hitung n = p × q', detail: `n = ${p} × ${q} = ${keys.n}` },
                    { label: 'Hitung φ(n) = (p−1)(q−1)', detail: `φ(${keys.n}) = ${p - 1} × ${q - 1} = ${keys.phi}` },
                    { label: `Pilih e coprime φ(n)`, detail: `gcd(${keys.e}, ${keys.phi}) = ${gcd(keys.e, keys.phi)} ${gcd(keys.e, keys.phi) === 1 ? '✓ valid' : '✗ tidak valid'}` },
                    { label: 'Hitung d = e⁻¹ mod φ(n)', detail: keys.d !== null ? `d = ${keys.d}  →  verifikasi: (${keys.e} × ${keys.d}) mod ${keys.phi} = ${Number((BigInt(keys.e) * BigInt(keys.d)) % BigInt(keys.phi))} ✓` : 'Invers tidak ditemukan' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-slate-700">{step.label}: </span>
                        <span className="text-xs font-mono text-slate-600">{step.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zone 2: Key summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'n = p × q', value: keys.n, sub: 'Modulus (publik)' },
                  { label: 'φ(n)', value: keys.phi, sub: "Euler's totient" },
                  { label: 'e — Kunci Publik', value: keys.e, sub: 'Dibagi bebas' },
                  { label: 'd — Kunci Privat', value: keys.d ?? '—', sub: 'RAHASIA' },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                    <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                    <p className="text-2xl font-bold text-indigo-700 font-mono">{value}</p>
                    <p className="text-xs text-slate-400 mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Zone 3: Encrypt/Decrypt panel */}
              {keys.d && msg < keys.n && msg >= 0 && (() => {
                const C = rsaEncrypt(msg, keys.e, keys.n);
                const M = rsaDecrypt(C, keys.d!, keys.n);
                const verified = M === msg;
                return (
                  <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-5 space-y-4">
                    <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                      <span className="text-slate-600 font-mono">C = M<sup>e</sup> mod n</span>
                      <span className="font-mono font-bold text-indigo-800">
                        {msg}<sup>{keys.e}</sup> mod {keys.n} = <span className="text-xl">{C}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                      <span className="text-slate-600 font-mono">M = C<sup>d</sup> mod n</span>
                      <span className="font-mono font-bold text-indigo-800">
                        {C}<sup>{keys.d}</sup> mod {keys.n} = <span className="text-xl text-emerald-700">{M}</span>
                      </span>
                    </div>
                    <div className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border',
                      verified
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    )}>
                      <span className="text-base">{verified ? '✓' : '✗'}</span>
                      <span>decrypt(encrypt({msg})) = {M} {verified ? '= M ✓ RSA Benar!' : '≠ M — Periksa parameter'}</span>
                    </div>
                  </div>
                );
              })()}
              {msg >= keys.n && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  ⚠️ M harus lebih kecil dari n ({keys.n}). Kurangi nilai M.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Main CryptoTools Router ──────────────────────────────────────────────────

interface CryptoToolsProps {
  moduleId: number;
}

export const CryptoTools: React.FC<CryptoToolsProps> = ({ moduleId }) => {
  if (moduleId === 101) return null; // theory only

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
        <span className="text-2xl">🔐</span>
        Alat Kriptografi Interaktif
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Eksplorasi konsep kriptografi secara langsung. Ubah parameter dan lihat hasilnya secara real-time.
      </p>

      {moduleId === 102 && <CaesarVigenere />}
      {moduleId === 103 && <AffineOTP />}
      {moduleId === 104 && <BlockCipherTool />}
      {moduleId === 105 && <RSATool />}
    </div>
  );
};
