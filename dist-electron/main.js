import { createRequire as e } from "node:module";
import { BrowserWindow as t, Menu as n, Tray as r, app as i, globalShortcut as a, ipcMain as o, nativeImage as s, screen as c, shell as l } from "electron";
import u from "node:path";
import d from "node:fs";
import { fileURLToPath as f } from "node:url";
//#region \0rolldown/runtime.js
var p = /* @__PURE__ */ e(import.meta.url);
//#endregion
//#region node_modules/openai/internal/tslib.mjs
function m(e, t, n, r, i) {
	if (r === "m") throw TypeError("Private method is not writable");
	if (r === "a" && !i) throw TypeError("Private accessor was defined without a setter");
	if (typeof t == "function" ? e !== t || !i : !t.has(e)) throw TypeError("Cannot write private member to an object whose class did not declare it");
	return r === "a" ? i.call(e, n) : i ? i.value = n : t.set(e, n), n;
}
function h(e, t, n, r) {
	if (n === "a" && !r) throw TypeError("Private accessor was defined without a getter");
	if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw TypeError("Cannot read private member from an object whose class did not declare it");
	return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
//#endregion
//#region node_modules/openai/internal/utils/uuid.mjs
var ee = function() {
	let { crypto: e } = globalThis;
	if (e?.randomUUID) return ee = e.randomUUID.bind(e), e.randomUUID();
	let t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (e) => (e ^ n() & 15 >> e / 4).toString(16));
};
//#endregion
//#region node_modules/openai/internal/errors.mjs
function te(e) {
	return typeof e == "object" && !!e && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var g = (e) => {
	if (e instanceof Error) return e;
	if (typeof e == "object" && e) {
		try {
			if (Object.prototype.toString.call(e) === "[object Error]") {
				let t = Error(e.message, e.cause ? { cause: e.cause } : {});
				return e.stack && (t.stack = e.stack), e.cause && !t.cause && (t.cause = e.cause), e.name && (t.name = e.name), t;
			}
		} catch {}
		try {
			return Error(JSON.stringify(e));
		} catch {}
	}
	return Error(e);
}, _ = class extends Error {}, v = class e extends _ {
	constructor(t, n, r, i) {
		super(`${e.makeMessage(t, n, r)}`), this.status = t, this.headers = i, this.requestID = i?.get("x-request-id"), this.error = n;
		let a = n;
		this.code = a?.code, this.param = a?.param, this.type = a?.type;
	}
	static makeMessage(e, t, n) {
		let r = t?.message ? typeof t.message == "string" ? t.message : JSON.stringify(t.message) : t ? JSON.stringify(t) : n;
		return e && r ? `${e} ${r}` : e ? `${e} status code (no body)` : r || "(no status code or body)";
	}
	static generate(t, n, r, i) {
		if (!t || !i) return new ne({
			message: r,
			cause: g(n)
		});
		let a = n?.error;
		return t === 400 ? new re(t, a, r, i) : t === 401 ? new ie(t, a, r, i) : t === 403 ? new ae(t, a, r, i) : t === 404 ? new oe(t, a, r, i) : t === 409 ? new se(t, a, r, i) : t === 422 ? new ce(t, a, r, i) : t === 429 ? new le(t, a, r, i) : t >= 500 ? new ue(t, a, r, i) : new e(t, a, r, i);
	}
}, y = class extends v {
	constructor({ message: e } = {}) {
		super(void 0, void 0, e || "Request was aborted.", void 0);
	}
}, ne = class extends v {
	constructor({ message: e, cause: t }) {
		super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
	}
}, b = class extends ne {
	constructor({ message: e } = {}) {
		super({ message: e ?? "Request timed out." });
	}
}, re = class extends v {}, ie = class extends v {}, ae = class extends v {}, oe = class extends v {}, se = class extends v {}, ce = class extends v {}, le = class extends v {}, ue = class extends v {}, de = class extends _ {
	constructor() {
		super("Could not parse response content as the length limit was reached");
	}
}, fe = class extends _ {
	constructor() {
		super("Could not parse response content as the request was rejected by the content filter");
	}
}, pe = class extends Error {
	constructor(e) {
		super(e);
	}
}, me = class extends v {
	constructor(e, t, n) {
		let r = "OAuth2 authentication error", i;
		if (t && typeof t == "object") {
			let e = t;
			i = e.error;
			let n = e.error_description;
			n && typeof n == "string" ? r = n : i && (r = i);
		}
		super(e, t, r, n), this.error_code = i;
	}
}, he = class extends _ {
	constructor(e, t, n) {
		super(e), this.provider = t, this.cause = n;
	}
}, ge = /^[a-z][a-z0-9+.-]*:/i, _e = (e) => ge.test(e), x = (e) => (x = Array.isArray, x(e)), ve = x;
function ye(e) {
	return typeof e == "object" ? e ?? {} : {};
}
function be(e) {
	if (!e) return !0;
	for (let t in e) return !1;
	return !0;
}
function xe(e, t) {
	return Object.prototype.hasOwnProperty.call(e, t);
}
function Se(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var Ce = (e, t) => {
	if (typeof t != "number" || !Number.isInteger(t)) throw new _(`${e} must be an integer`);
	if (t < 0) throw new _(`${e} must be a positive integer`);
	return t;
}, we = (e) => {
	try {
		return JSON.parse(e);
	} catch {
		return;
	}
}, Te = (e) => new Promise((t) => setTimeout(t, e)), Ee = "6.42.0", De = () => typeof window < "u" && window.document !== void 0 && typeof navigator < "u";
function Oe() {
	return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(globalThis.process === void 0 ? 0 : globalThis.process) === "[object process]" ? "node" : "unknown";
}
var ke = () => {
	let e = Oe();
	if (e === "deno") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": Ee,
		"X-Stainless-OS": Me(Deno.build.os),
		"X-Stainless-Arch": je(Deno.build.arch),
		"X-Stainless-Runtime": "deno",
		"X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
	};
	if (typeof EdgeRuntime < "u") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": Ee,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": `other:${EdgeRuntime}`,
		"X-Stainless-Runtime": "edge",
		"X-Stainless-Runtime-Version": globalThis.process.version
	};
	if (e === "node") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": Ee,
		"X-Stainless-OS": Me(globalThis.process.platform ?? "unknown"),
		"X-Stainless-Arch": je(globalThis.process.arch ?? "unknown"),
		"X-Stainless-Runtime": "node",
		"X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
	};
	let t = Ae();
	return t ? {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": Ee,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": "unknown",
		"X-Stainless-Runtime": `browser:${t.browser}`,
		"X-Stainless-Runtime-Version": t.version
	} : {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": Ee,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": "unknown",
		"X-Stainless-Runtime": "unknown",
		"X-Stainless-Runtime-Version": "unknown"
	};
};
function Ae() {
	if (typeof navigator > "u" || !navigator) return null;
	for (let { key: e, pattern: t } of [
		{
			key: "edge",
			pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "ie",
			pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "ie",
			pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "chrome",
			pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "firefox",
			pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "safari",
			pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/
		}
	]) {
		let n = t.exec(navigator.userAgent);
		if (n) return {
			browser: e,
			version: `${n[1] || 0}.${n[2] || 0}.${n[3] || 0}`
		};
	}
	return null;
}
var je = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Me = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Ne, Pe = () => Ne ??= ke();
//#endregion
//#region node_modules/openai/internal/shims.mjs
function Fe() {
	if (typeof fetch < "u") return fetch;
	throw Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Ie(...e) {
	let t = globalThis.ReadableStream;
	if (t === void 0) throw Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
	return new t(...e);
}
function Le(e) {
	let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
	return Ie({
		start() {},
		async pull(e) {
			let { done: n, value: r } = await t.next();
			n ? e.close() : e.enqueue(r);
		},
		async cancel() {
			await t.return?.();
		}
	});
}
function Re(e) {
	if (e[Symbol.asyncIterator]) return e;
	let t = e.getReader();
	return {
		async next() {
			try {
				let e = await t.read();
				return e?.done && t.releaseLock(), e;
			} catch (e) {
				throw t.releaseLock(), e;
			}
		},
		async return() {
			let e = t.cancel();
			return t.releaseLock(), await e, {
				done: !0,
				value: void 0
			};
		},
		[Symbol.asyncIterator]() {
			return this;
		}
	};
}
async function ze(e) {
	if (typeof e != "object" || !e) return;
	if (e[Symbol.asyncIterator]) {
		await e[Symbol.asyncIterator]().return?.();
		return;
	}
	let t = e.getReader(), n = t.cancel();
	t.releaseLock(), await n;
}
//#endregion
//#region node_modules/openai/internal/request-options.mjs
var Be = ({ headers: e, body: t }) => ({
	bodyHeaders: { "content-type": "application/json" },
	body: JSON.stringify(t)
}), Ve = "RFC3986", He = (e) => String(e), Ue = {
	RFC1738: (e) => String(e).replace(/%20/g, "+"),
	RFC3986: He
}, We = (e, t) => (We = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), We(e, t)), S = /* @__PURE__ */ (() => {
	let e = [];
	for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
	return e;
})(), Ge = 1024, Ke = (e, t, n, r, i) => {
	if (e.length === 0) return e;
	let a = e;
	if (typeof e == "symbol" ? a = Symbol.prototype.toString.call(e) : typeof e != "string" && (a = String(e)), n === "iso-8859-1") return escape(a).replace(/%u[0-9a-f]{4}/gi, function(e) {
		return "%26%23" + parseInt(e.slice(2), 16) + "%3B";
	});
	let o = "";
	for (let e = 0; e < a.length; e += Ge) {
		let t = a.length >= Ge ? a.slice(e, e + Ge) : a, n = [];
		for (let e = 0; e < t.length; ++e) {
			let r = t.charCodeAt(e);
			if (r === 45 || r === 46 || r === 95 || r === 126 || r >= 48 && r <= 57 || r >= 65 && r <= 90 || r >= 97 && r <= 122 || i === "RFC1738" && (r === 40 || r === 41)) {
				n[n.length] = t.charAt(e);
				continue;
			}
			if (r < 128) {
				n[n.length] = S[r];
				continue;
			}
			if (r < 2048) {
				n[n.length] = S[192 | r >> 6] + S[128 | r & 63];
				continue;
			}
			if (r < 55296 || r >= 57344) {
				n[n.length] = S[224 | r >> 12] + S[128 | r >> 6 & 63] + S[128 | r & 63];
				continue;
			}
			e += 1, r = 65536 + ((r & 1023) << 10 | t.charCodeAt(e) & 1023), n[n.length] = S[240 | r >> 18] + S[128 | r >> 12 & 63] + S[128 | r >> 6 & 63] + S[128 | r & 63];
		}
		o += n.join("");
	}
	return o;
};
function qe(e) {
	return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function Je(e, t) {
	if (x(e)) {
		let n = [];
		for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
		return n;
	}
	return t(e);
}
//#endregion
//#region node_modules/openai/internal/qs/stringify.mjs
var Ye = {
	brackets(e) {
		return String(e) + "[]";
	},
	comma: "comma",
	indices(e, t) {
		return String(e) + "[" + t + "]";
	},
	repeat(e) {
		return String(e);
	}
}, Xe = function(e, t) {
	Array.prototype.push.apply(e, x(t) ? t : [t]);
}, Ze, C = {
	addQueryPrefix: !1,
	allowDots: !1,
	allowEmptyArrays: !1,
	arrayFormat: "indices",
	charset: "utf-8",
	charsetSentinel: !1,
	delimiter: "&",
	encode: !0,
	encodeDotInKeys: !1,
	encoder: Ke,
	encodeValuesOnly: !1,
	format: Ve,
	formatter: He,
	indices: !1,
	serializeDate(e) {
		return (Ze ??= Function.prototype.call.bind(Date.prototype.toISOString))(e);
	},
	skipNulls: !1,
	strictNullHandling: !1
};
function Qe(e) {
	return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var $e = {};
function et(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h, ee, te) {
	let g = e, _ = te, v = 0, y = !1;
	for (; (_ = _.get($e)) !== void 0 && !y;) {
		let t = _.get(e);
		if (v += 1, t !== void 0) {
			if (t === v) throw RangeError("Cyclic object value");
			y = !0;
		}
		_.get($e) === void 0 && (v = 0);
	}
	if (typeof l == "function" ? g = l(t, g) : g instanceof Date ? g = f?.(g) : n === "comma" && x(g) && (g = Je(g, function(e) {
		return e instanceof Date ? f?.(e) : e;
	})), g === null) {
		if (a) return c && !h ? c(t, C.encoder, ee, "key", p) : t;
		g = "";
	}
	if (Qe(g) || qe(g)) {
		if (c) {
			let e = h ? t : c(t, C.encoder, ee, "key", p);
			return [m?.(e) + "=" + m?.(c(g, C.encoder, ee, "value", p))];
		}
		return [m?.(t) + "=" + m?.(String(g))];
	}
	let ne = [];
	if (g === void 0) return ne;
	let b;
	if (n === "comma" && x(g)) h && c && (g = Je(g, c)), b = [{ value: g.length > 0 ? g.join(",") || null : void 0 }];
	else if (x(l)) b = l;
	else {
		let e = Object.keys(g);
		b = u ? e.sort(u) : e;
	}
	let re = s ? String(t).replace(/\./g, "%2E") : String(t), ie = r && x(g) && g.length === 1 ? re + "[]" : re;
	if (i && x(g) && g.length === 0) return ie + "[]";
	for (let t = 0; t < b.length; ++t) {
		let _ = b[t], y = typeof _ == "object" && _.value !== void 0 ? _.value : g[_];
		if (o && y === null) continue;
		let re = d && s ? _.replace(/\./g, "%2E") : _, ae = x(g) ? typeof n == "function" ? n(ie, re) : ie : ie + (d ? "." + re : "[" + re + "]");
		te.set(e, v);
		let oe = /* @__PURE__ */ new WeakMap();
		oe.set($e, te), Xe(ne, et(y, ae, n, r, i, a, o, s, n === "comma" && h && x(g) ? null : c, l, u, d, f, p, m, h, ee, oe));
	}
	return ne;
}
function tt(e = C) {
	if (e.allowEmptyArrays !== void 0 && typeof e.allowEmptyArrays != "boolean") throw TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
	if (e.encodeDotInKeys !== void 0 && typeof e.encodeDotInKeys != "boolean") throw TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
	if (e.encoder !== null && e.encoder !== void 0 && typeof e.encoder != "function") throw TypeError("Encoder has to be a function.");
	let t = e.charset || C.charset;
	if (e.charset !== void 0 && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
	let n = Ve;
	if (e.format !== void 0) {
		if (!We(Ue, e.format)) throw TypeError("Unknown format option provided.");
		n = e.format;
	}
	let r = Ue[n], i = C.filter;
	(typeof e.filter == "function" || x(e.filter)) && (i = e.filter);
	let a;
	if (a = e.arrayFormat && e.arrayFormat in Ye ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : C.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw TypeError("`commaRoundTrip` must be a boolean, or absent");
	let o = e.allowDots === void 0 ? e.encodeDotInKeys ? !0 : C.allowDots : !!e.allowDots;
	return {
		addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : C.addQueryPrefix,
		allowDots: o,
		allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : C.allowEmptyArrays,
		arrayFormat: a,
		charset: t,
		charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : C.charsetSentinel,
		commaRoundTrip: !!e.commaRoundTrip,
		delimiter: e.delimiter === void 0 ? C.delimiter : e.delimiter,
		encode: typeof e.encode == "boolean" ? e.encode : C.encode,
		encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : C.encodeDotInKeys,
		encoder: typeof e.encoder == "function" ? e.encoder : C.encoder,
		encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : C.encodeValuesOnly,
		filter: i,
		format: n,
		formatter: r,
		serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : C.serializeDate,
		skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : C.skipNulls,
		sort: typeof e.sort == "function" ? e.sort : null,
		strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : C.strictNullHandling
	};
}
function nt(e, t = {}) {
	let n = e, r = tt(t), i, a;
	typeof r.filter == "function" ? (a = r.filter, n = a("", n)) : x(r.filter) && (a = r.filter, i = a);
	let o = [];
	if (typeof n != "object" || !n) return "";
	let s = Ye[r.arrayFormat], c = s === "comma" && r.commaRoundTrip;
	i ||= Object.keys(n), r.sort && i.sort(r.sort);
	let l = /* @__PURE__ */ new WeakMap();
	for (let e = 0; e < i.length; ++e) {
		let t = i[e];
		r.skipNulls && n[t] === null || Xe(o, et(n[t], t, s, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, l));
	}
	let u = o.join(r.delimiter), d = r.addQueryPrefix === !0 ? "?" : "";
	return r.charsetSentinel && (r.charset === "iso-8859-1" ? d += "utf8=%26%2310003%3B&" : d += "utf8=%E2%9C%93&"), u.length > 0 ? d + u : "";
}
//#endregion
//#region node_modules/openai/internal/utils/query.mjs
function rt(e) {
	return nt(e, { arrayFormat: "brackets" });
}
//#endregion
//#region node_modules/openai/internal/utils/bytes.mjs
function it(e) {
	let t = 0;
	for (let n of e) t += n.length;
	let n = new Uint8Array(t), r = 0;
	for (let t of e) n.set(t, r), r += t.length;
	return n;
}
var at;
function ot(e) {
	let t;
	return (at ??= (t = new globalThis.TextEncoder(), t.encode.bind(t)))(e);
}
var st;
function ct(e) {
	let t;
	return (st ??= (t = new globalThis.TextDecoder(), t.decode.bind(t)))(e);
}
//#endregion
//#region node_modules/openai/internal/decoders/line.mjs
var w, T, lt = class {
	constructor() {
		w.set(this, void 0), T.set(this, void 0), m(this, w, new Uint8Array(), "f"), m(this, T, null, "f");
	}
	decode(e) {
		if (e == null) return [];
		let t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ot(e) : e;
		m(this, w, it([h(this, w, "f"), t]), "f");
		let n = [], r;
		for (; (r = ut(h(this, w, "f"), h(this, T, "f"))) != null;) {
			if (r.carriage && h(this, T, "f") == null) {
				m(this, T, r.index, "f");
				continue;
			}
			if (h(this, T, "f") != null && (r.index !== h(this, T, "f") + 1 || r.carriage)) {
				n.push(ct(h(this, w, "f").subarray(0, h(this, T, "f") - 1))), m(this, w, h(this, w, "f").subarray(h(this, T, "f")), "f"), m(this, T, null, "f");
				continue;
			}
			let e = h(this, T, "f") === null ? r.preceding : r.preceding - 1, t = ct(h(this, w, "f").subarray(0, e));
			n.push(t), m(this, w, h(this, w, "f").subarray(r.index), "f"), m(this, T, null, "f");
		}
		return n;
	}
	flush() {
		return h(this, w, "f").length ? this.decode("\n") : [];
	}
};
w = /* @__PURE__ */ new WeakMap(), T = /* @__PURE__ */ new WeakMap(), lt.NEWLINE_CHARS = new Set(["\n", "\r"]), lt.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function ut(e, t) {
	for (let n = t ?? 0; n < e.length; n++) {
		if (e[n] === 10) return {
			preceding: n,
			index: n + 1,
			carriage: !1
		};
		if (e[n] === 13) return {
			preceding: n,
			index: n + 1,
			carriage: !0
		};
	}
	return null;
}
function dt(e) {
	for (let t = 0; t < e.length - 1; t++) {
		if (e[t] === 10 && e[t + 1] === 10 || e[t] === 13 && e[t + 1] === 13) return t + 2;
		if (e[t] === 13 && e[t + 1] === 10 && t + 3 < e.length && e[t + 2] === 13 && e[t + 3] === 10) return t + 4;
	}
	return -1;
}
//#endregion
//#region node_modules/openai/internal/utils/log.mjs
var ft = {
	off: 0,
	error: 200,
	warn: 300,
	info: 400,
	debug: 500
}, pt = (e, t, n) => {
	if (e) {
		if (xe(ft, e)) return e;
		E(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(ft))}`);
	}
};
function mt() {}
function ht(e, t, n) {
	return !t || ft[e] > ft[n] ? mt : t[e].bind(t);
}
var gt = {
	error: mt,
	warn: mt,
	info: mt,
	debug: mt
}, _t = /* @__PURE__ */ new WeakMap();
function E(e) {
	let t = e.logger, n = e.logLevel ?? "off";
	if (!t) return gt;
	let r = _t.get(t);
	if (r && r[0] === n) return r[1];
	let i = {
		error: ht("error", t, n),
		warn: ht("warn", t, n),
		info: ht("info", t, n),
		debug: ht("debug", t, n)
	};
	return _t.set(t, [n, i]), i;
}
var vt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers &&= Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([e, t]) => [e, e.toLowerCase() === "authorization" || e.toLowerCase() === "api-key" || e.toLowerCase() === "x-api-key" || e.toLowerCase() === "cookie" || e.toLowerCase() === "set-cookie" ? "***" : t])), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), yt, bt = class e {
	constructor(e, t, n) {
		this.iterator = e, yt.set(this, void 0), this.controller = t, m(this, yt, n, "f");
	}
	static fromSSEResponse(t, n, r, i) {
		let a = !1, o = r ? E(r) : console;
		async function* s() {
			if (a) throw new _("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
			a = !0;
			let e = !1;
			try {
				for await (let r of xt(t, n)) if (!e) {
					if (r.data.startsWith("[DONE]")) {
						e = !0;
						continue;
					}
					if (r.event === null || !r.event.startsWith("thread.")) {
						let e;
						try {
							e = JSON.parse(r.data);
						} catch (e) {
							throw o.error("Could not parse message into JSON:", r.data), o.error("From chunk:", r.raw), e;
						}
						if (e && e.error) throw new v(void 0, e.error, void 0, t.headers);
						yield i ? {
							event: r.event,
							data: e
						} : e;
					} else {
						let e;
						try {
							e = JSON.parse(r.data);
						} catch (e) {
							throw console.error("Could not parse message into JSON:", r.data), console.error("From chunk:", r.raw), e;
						}
						if (r.event == "error") throw new v(void 0, e.error, e.message, void 0);
						yield {
							event: r.event,
							data: e
						};
					}
				}
				e = !0;
			} catch (e) {
				if (te(e)) return;
				throw e;
			} finally {
				e || n.abort();
			}
		}
		return new e(s, n, r);
	}
	static fromReadableStream(t, n, r) {
		let i = !1;
		async function* a() {
			let e = new lt(), n = Re(t);
			for await (let t of n) for (let n of e.decode(t)) yield n;
			for (let t of e.flush()) yield t;
		}
		async function* o() {
			if (i) throw new _("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
			i = !0;
			let e = !1;
			try {
				for await (let t of a()) e || t && (yield JSON.parse(t));
				e = !0;
			} catch (e) {
				if (te(e)) return;
				throw e;
			} finally {
				e || n.abort();
			}
		}
		return new e(o, n, r);
	}
	[(yt = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
		return this.iterator();
	}
	tee() {
		let t = [], n = [], r = this.iterator(), i = (e) => ({ next: () => {
			if (e.length === 0) {
				let e = r.next();
				t.push(e), n.push(e);
			}
			return e.shift();
		} });
		return [new e(() => i(t), this.controller, h(this, yt, "f")), new e(() => i(n), this.controller, h(this, yt, "f"))];
	}
	toReadableStream() {
		let e = this, t;
		return Ie({
			async start() {
				t = e[Symbol.asyncIterator]();
			},
			async pull(e) {
				try {
					let { value: n, done: r } = await t.next();
					if (r) return e.close();
					let i = ot(JSON.stringify(n) + "\n");
					e.enqueue(i);
				} catch (t) {
					e.error(t);
				}
			},
			async cancel() {
				await t.return?.();
			}
		});
	}
};
async function* xt(e, t) {
	if (!e.body) throw t.abort(), globalThis.navigator !== void 0 && globalThis.navigator.product === "ReactNative" ? new _("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new _("Attempted to iterate over a response with no body");
	let n = new Ct(), r = new lt(), i = Re(e.body);
	for await (let e of St(i)) for (let t of r.decode(e)) {
		let e = n.decode(t);
		e && (yield e);
	}
	for (let e of r.flush()) {
		let t = n.decode(e);
		t && (yield t);
	}
}
async function* St(e) {
	let t = new Uint8Array();
	for await (let n of e) {
		if (n == null) continue;
		let e = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ot(n) : n, r = new Uint8Array(t.length + e.length);
		r.set(t), r.set(e, t.length), t = r;
		let i;
		for (; (i = dt(t)) !== -1;) yield t.slice(0, i), t = t.slice(i);
	}
	t.length > 0 && (yield t);
}
var Ct = class {
	constructor() {
		this.event = null, this.data = [], this.chunks = [];
	}
	decode(e) {
		if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
			if (!this.event && !this.data.length) return null;
			let e = {
				event: this.event,
				data: this.data.join("\n"),
				raw: this.chunks
			};
			return this.event = null, this.data = [], this.chunks = [], e;
		}
		if (this.chunks.push(e), e.startsWith(":")) return null;
		let [t, n, r] = wt(e, ":");
		return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
	}
};
function wt(e, t) {
	let n = e.indexOf(t);
	return n === -1 ? [
		e,
		"",
		""
	] : [
		e.substring(0, n),
		t,
		e.substring(n + t.length)
	];
}
//#endregion
//#region node_modules/openai/internal/parse.mjs
async function Tt(e, t) {
	let { response: n, requestLogID: r, retryOfRequestLogID: i, startTime: a } = t, o = await (async () => {
		if (t.options.stream) return E(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : bt.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
		if (n.status === 204) return null;
		if (t.options.__binaryResponse) return n;
		let r = n.headers.get("content-type")?.split(";")[0]?.trim();
		return r?.includes("application/json") || r?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Et(await n.json(), n) : await n.text();
	})();
	return E(e).debug(`[${r}] response parsed`, vt({
		retryOfRequestLogID: i,
		url: n.url,
		status: n.status,
		body: o,
		durationMs: Date.now() - a
	})), o;
}
function Et(e, t) {
	return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
		value: t.headers.get("x-request-id"),
		enumerable: !1
	});
}
//#endregion
//#region node_modules/openai/core/api-promise.mjs
var Dt, Ot = class e extends Promise {
	constructor(e, t, n = Tt) {
		super((e) => {
			e(null);
		}), this.responsePromise = t, this.parseResponse = n, Dt.set(this, void 0), m(this, Dt, e, "f");
	}
	_thenUnwrap(t) {
		return new e(h(this, Dt, "f"), this.responsePromise, async (e, n) => Et(t(await this.parseResponse(e, n), n), n.response));
	}
	asResponse() {
		return this.responsePromise.then((e) => e.response);
	}
	async withResponse() {
		let [e, t] = await Promise.all([this.parse(), this.asResponse()]);
		return {
			data: e,
			response: t,
			request_id: t.headers.get("x-request-id")
		};
	}
	parse() {
		return this.parsedPromise ||= this.responsePromise.then((e) => this.parseResponse(h(this, Dt, "f"), e)), this.parsedPromise;
	}
	then(e, t) {
		return this.parse().then(e, t);
	}
	catch(e) {
		return this.parse().catch(e);
	}
	finally(e) {
		return this.parse().finally(e);
	}
};
Dt = /* @__PURE__ */ new WeakMap();
//#endregion
//#region node_modules/openai/core/pagination.mjs
var kt, At = class {
	constructor(e, t, n, r) {
		kt.set(this, void 0), m(this, kt, e, "f"), this.options = r, this.response = t, this.body = n;
	}
	hasNextPage() {
		return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
	}
	async getNextPage() {
		let e = this.nextPageRequestOptions();
		if (!e) throw new _("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
		return await h(this, kt, "f").requestAPIList(this.constructor, e);
	}
	async *iterPages() {
		let e = this;
		for (yield e; e.hasNextPage();) e = await e.getNextPage(), yield e;
	}
	async *[(kt = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
		for await (let e of this.iterPages()) for (let t of e.getPaginatedItems()) yield t;
	}
}, jt = class extends Ot {
	constructor(e, t, n) {
		super(e, t, async (e, t) => new n(e, t.response, await Tt(e, t), t.options));
	}
	async *[Symbol.asyncIterator]() {
		let e = await this;
		for await (let t of e) yield t;
	}
}, Mt = class extends At {
	constructor(e, t, n, r) {
		super(e, t, n, r), this.data = n.data || [], this.object = n.object;
	}
	getPaginatedItems() {
		return this.data ?? [];
	}
	nextPageRequestOptions() {
		return null;
	}
}, D = class extends At {
	constructor(e, t, n, r) {
		super(e, t, n, r), this.data = n.data || [], this.has_more = n.has_more || !1;
	}
	getPaginatedItems() {
		return this.data ?? [];
	}
	hasNextPage() {
		return this.has_more === !1 ? !1 : super.hasNextPage();
	}
	nextPageRequestOptions() {
		let e = this.getPaginatedItems(), t = e[e.length - 1]?.id;
		return t ? {
			...this.options,
			query: {
				...ye(this.options.query),
				after: t
			}
		} : null;
	}
}, O = class extends At {
	constructor(e, t, n, r) {
		super(e, t, n, r), this.data = n.data || [], this.has_more = n.has_more || !1, this.last_id = n.last_id || "";
	}
	getPaginatedItems() {
		return this.data ?? [];
	}
	hasNextPage() {
		return this.has_more === !1 ? !1 : super.hasNextPage();
	}
	nextPageRequestOptions() {
		let e = this.last_id;
		return e ? {
			...this.options,
			query: {
				...ye(this.options.query),
				after: e
			}
		} : null;
	}
}, k = class extends At {
	constructor(e, t, n, r) {
		super(e, t, n, r), this.data = n.data || [], this.has_more = n.has_more || !1, this.next = n.next || null;
	}
	getPaginatedItems() {
		return this.data ?? [];
	}
	hasNextPage() {
		return this.has_more === !1 ? !1 : super.hasNextPage();
	}
	nextPageRequestOptions() {
		let e = this.next;
		return e ? {
			...this.options,
			query: {
				...ye(this.options.query),
				after: e
			}
		} : null;
	}
}, Nt = {
	jwt: "urn:ietf:params:oauth:token-type:jwt",
	id: "urn:ietf:params:oauth:token-type:id_token"
}, Pt = "urn:ietf:params:oauth:grant-type:token-exchange", Ft = class {
	constructor(e, t) {
		this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Fe();
	}
	async getToken() {
		if (!this.cachedToken || this.isTokenExpired(this.cachedToken)) {
			if (this.refreshPromise) return await this.refreshPromise;
			this.refreshPromise = this.refreshToken();
			try {
				return await this.refreshPromise;
			} finally {
				this.refreshPromise = null;
			}
		}
		return this.needsRefresh(this.cachedToken) && !this.refreshPromise && (this.refreshPromise = this.refreshToken().finally(() => {
			this.refreshPromise = null;
		})), this.cachedToken.token;
	}
	async refreshToken() {
		let e = {
			grant_type: Pt,
			subject_token: await this.config.provider.getToken(),
			subject_token_type: Nt[this.config.provider.tokenType],
			identity_provider_id: this.config.identityProviderId,
			service_account_id: this.config.serviceAccountId
		};
		this.config.clientId && (e.client_id = this.config.clientId);
		let t = await this.fetch(this.tokenExchangeUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(e)
		});
		if (!t.ok) {
			let e = await t.text(), n;
			try {
				n = JSON.parse(e);
			} catch {}
			throw t.status === 400 || t.status === 401 || t.status === 403 ? new me(t.status, n, t.headers) : v.generate(t.status, n, `Token exchange failed with status ${t.status}`, t.headers);
		}
		let n = await t.json(), r = n.expires_in || 3600, i = Date.now() + r * 1e3;
		return this.cachedToken = {
			token: n.access_token,
			expiresAt: i
		}, n.access_token;
	}
	isTokenExpired(e) {
		return Date.now() >= e.expiresAt;
	}
	needsRefresh(e) {
		let t = (this.config.refreshBufferSeconds ?? 1200) * 1e3;
		return Date.now() >= e.expiresAt - t;
	}
	invalidateToken() {
		this.cachedToken = null, this.refreshPromise = null;
	}
}, It = () => {
	if (typeof File > "u") {
		let { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
		throw Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
	}
};
function Lt(e, t, n) {
	return It(), new File(e, t ?? "unknown_file", n);
}
function Rt(e) {
	return (typeof e == "object" && !!e && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var zt = (e) => typeof e == "object" && !!e && typeof e[Symbol.asyncIterator] == "function", Bt = async (e, t) => Kt(e.body) ? {
	...e,
	body: await Ut(e.body, t)
} : e, A = async (e, t) => ({
	...e,
	body: await Ut(e.body, t)
}), Vt = /* @__PURE__ */ new WeakMap();
function Ht(e) {
	let t = typeof e == "function" ? e : e.fetch, n = Vt.get(t);
	if (n) return n;
	let r = (async () => {
		try {
			let e = "Response" in t ? t.Response : (await t("data:,")).constructor, n = new FormData();
			return n.toString() !== await new e(n).text();
		} catch {
			return !0;
		}
	})();
	return Vt.set(t, r), r;
}
var Ut = async (e, t) => {
	if (!await Ht(t)) throw TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
	let n = new FormData();
	return await Promise.all(Object.entries(e || {}).map(([e, t]) => qt(n, e, t))), n;
}, Wt = (e) => e instanceof Blob && "name" in e, Gt = (e) => typeof e == "object" && !!e && (e instanceof Response || zt(e) || Wt(e)), Kt = (e) => {
	if (Gt(e)) return !0;
	if (Array.isArray(e)) return e.some(Kt);
	if (e && typeof e == "object") {
		for (let t in e) if (Kt(e[t])) return !0;
	}
	return !1;
}, qt = async (e, t, n) => {
	if (n !== void 0) {
		if (n == null) throw TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
		if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
		else if (n instanceof Response) e.append(t, Lt([await n.blob()], Rt(n)));
		else if (zt(n)) e.append(t, Lt([await new Response(Le(n)).blob()], Rt(n)));
		else if (Wt(n)) e.append(t, n, Rt(n));
		else if (Array.isArray(n)) await Promise.all(n.map((n) => qt(e, t + "[]", n)));
		else if (typeof n == "object") await Promise.all(Object.entries(n).map(([n, r]) => qt(e, `${t}[${n}]`, r)));
		else throw TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
	}
}, Jt = (e) => typeof e == "object" && !!e && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Yt = (e) => typeof e == "object" && !!e && typeof e.name == "string" && typeof e.lastModified == "number" && Jt(e), Xt = (e) => typeof e == "object" && !!e && typeof e.url == "string" && typeof e.blob == "function";
async function Zt(e, t, n) {
	if (It(), e = await e, Yt(e)) return e instanceof File ? e : Lt([await e.arrayBuffer()], e.name);
	if (Xt(e)) {
		let r = await e.blob();
		return t ||= new URL(e.url).pathname.split(/[\\/]/).pop(), Lt(await Qt(r), t, n);
	}
	let r = await Qt(e);
	if (t ||= Rt(e), !n?.type) {
		let e = r.find((e) => typeof e == "object" && "type" in e && e.type);
		typeof e == "string" && (n = {
			...n,
			type: e
		});
	}
	return Lt(r, t, n);
}
async function Qt(e) {
	let t = [];
	if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
	else if (Jt(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
	else if (zt(e)) for await (let n of e) t.push(...await Qt(n));
	else {
		let t = e?.constructor?.name;
		throw Error(`Unexpected data type: ${typeof e}${t ? `; constructor: ${t}` : ""}${$t(e)}`);
	}
	return t;
}
function $t(e) {
	return typeof e != "object" || !e ? "" : `; props: [${Object.getOwnPropertyNames(e).map((e) => `"${e}"`).join(", ")}]`;
}
//#endregion
//#region node_modules/openai/core/resource.mjs
var j = class {
	constructor(e) {
		this._client = e;
	}
};
//#endregion
//#region node_modules/openai/internal/utils/path.mjs
function en(e) {
	return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var tn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), M = /* @__PURE__ */ ((e = en) => function(t, ...n) {
	if (t.length === 1) return t[0];
	let r = !1, i = [], a = t.reduce((t, a, o) => {
		/[?#]/.test(a) && (r = !0);
		let s = n[o], c = (r ? encodeURIComponent : e)("" + s);
		return o !== n.length && (s == null || typeof s == "object" && s.toString === Object.getPrototypeOf(Object.getPrototypeOf(s.hasOwnProperty ?? tn) ?? tn)?.toString) && (c = s + "", i.push({
			start: t.length + a.length,
			length: c.length,
			error: `Value of type ${Object.prototype.toString.call(s).slice(8, -1)} is not a valid path parameter`
		})), t + a + (o === n.length ? "" : c);
	}, ""), o = a.split(/[?#]/, 1)[0], s = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi, c;
	for (; (c = s.exec(o)) !== null;) i.push({
		start: c.index,
		length: c[0].length,
		error: `Value "${c[0]}" can\'t be safely passed as a path parameter`
	});
	if (i.sort((e, t) => e.start - t.start), i.length > 0) {
		let e = 0, t = i.reduce((t, n) => {
			let r = " ".repeat(n.start - e), i = "^".repeat(n.length);
			return e = n.start + n.length, t + r + i;
		}, "");
		throw new _(`Path parameters result in path with invalid segments:\n${i.map((e) => e.error).join("\n")}\n${a}\n${t}`);
	}
	return a;
})(en), nn = class extends j {
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/chat/completions/${e}/messages`, D, {
			query: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
};
//#endregion
//#region node_modules/openai/lib/parser.mjs
function rn(e) {
	return e !== void 0 && "function" in e && e.function !== void 0;
}
function an(e) {
	return e?.$brand === "auto-parseable-response-format";
}
function on(e) {
	return e?.$brand === "auto-parseable-tool";
}
function sn(e, t) {
	return !t || !fn(t) ? {
		...e,
		choices: e.choices.map((e) => (pn(e.message.tool_calls), {
			...e,
			message: {
				...e.message,
				parsed: null,
				...e.message.tool_calls ? { tool_calls: e.message.tool_calls } : void 0
			}
		}))
	} : cn(e, t);
}
function cn(e, t) {
	let n = e.choices.map((e) => {
		if (e.finish_reason === "length") throw new de();
		if (e.finish_reason === "content_filter") throw new fe();
		return pn(e.message.tool_calls), {
			...e,
			message: {
				...e.message,
				...e.message.tool_calls ? { tool_calls: e.message.tool_calls?.map((e) => un(t, e)) ?? void 0 } : void 0,
				parsed: e.message.content && !e.message.refusal ? ln(t, e.message.content) : null
			}
		};
	});
	return {
		...e,
		choices: n
	};
}
function ln(e, t) {
	return e.response_format?.type === "json_schema" && e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function un(e, t) {
	let n = e.tools?.find((e) => rn(e) && e.function?.name === t.function.name);
	return {
		...t,
		function: {
			...t.function,
			parsed_arguments: on(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
		}
	};
}
function dn(e, t) {
	if (!e || !("tools" in e) || !e.tools) return !1;
	let n = e.tools?.find((e) => rn(e) && e.function?.name === t.function.name);
	return rn(n) && (on(n) || n?.function.strict || !1);
}
function fn(e) {
	return an(e.response_format) ? !0 : e.tools?.some((e) => on(e) || e.type === "function" && e.function.strict === !0) ?? !1;
}
function pn(e) {
	for (let t of e || []) if (t.type !== "function") throw new _(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function mn(e) {
	for (let t of e ?? []) {
		if (t.type !== "function") throw new _(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
		if (t.function.strict !== !0) throw new _(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
	}
}
//#endregion
//#region node_modules/openai/lib/chatCompletionUtils.mjs
var hn = (e) => e?.role === "assistant", gn = (e) => e?.role === "tool", _n, vn, yn, bn, xn, Sn, Cn, N, wn, Tn, En, Dn, On, kn = class {
	constructor() {
		_n.add(this), this.controller = new AbortController(), vn.set(this, void 0), yn.set(this, () => {}), bn.set(this, () => {}), xn.set(this, void 0), Sn.set(this, () => {}), Cn.set(this, () => {}), N.set(this, {}), wn.set(this, !1), Tn.set(this, !1), En.set(this, !1), Dn.set(this, !1), m(this, vn, new Promise((e, t) => {
			m(this, yn, e, "f"), m(this, bn, t, "f");
		}), "f"), m(this, xn, new Promise((e, t) => {
			m(this, Sn, e, "f"), m(this, Cn, t, "f");
		}), "f"), h(this, vn, "f").catch(() => {}), h(this, xn, "f").catch(() => {});
	}
	_run(e) {
		setTimeout(() => {
			e().then(() => {
				this._emitFinal(), this._emit("end");
			}, h(this, _n, "m", On).bind(this));
		}, 0);
	}
	_connected() {
		this.ended || (h(this, yn, "f").call(this), this._emit("connect"));
	}
	get ended() {
		return h(this, wn, "f");
	}
	get errored() {
		return h(this, Tn, "f");
	}
	get aborted() {
		return h(this, En, "f");
	}
	abort() {
		this.controller.abort();
	}
	on(e, t) {
		return (h(this, N, "f")[e] || (h(this, N, "f")[e] = [])).push({ listener: t }), this;
	}
	off(e, t) {
		let n = h(this, N, "f")[e];
		if (!n) return this;
		let r = n.findIndex((e) => e.listener === t);
		return r >= 0 && n.splice(r, 1), this;
	}
	once(e, t) {
		return (h(this, N, "f")[e] || (h(this, N, "f")[e] = [])).push({
			listener: t,
			once: !0
		}), this;
	}
	emitted(e) {
		return new Promise((t, n) => {
			m(this, Dn, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
		});
	}
	async done() {
		m(this, Dn, !0, "f"), await h(this, xn, "f");
	}
	_emit(e, ...t) {
		if (h(this, wn, "f")) return;
		e === "end" && (m(this, wn, !0, "f"), h(this, Sn, "f").call(this));
		let n = h(this, N, "f")[e];
		if (n && (h(this, N, "f")[e] = n.filter((e) => !e.once), n.forEach(({ listener: e }) => e(...t))), e === "abort") {
			let e = t[0];
			!h(this, Dn, "f") && !n?.length && Promise.reject(e), h(this, bn, "f").call(this, e), h(this, Cn, "f").call(this, e), this._emit("end");
			return;
		}
		if (e === "error") {
			let e = t[0];
			!h(this, Dn, "f") && !n?.length && Promise.reject(e), h(this, bn, "f").call(this, e), h(this, Cn, "f").call(this, e), this._emit("end");
		}
	}
	_emitFinal() {}
};
vn = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), N = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakSet(), On = function(e) {
	if (m(this, Tn, !0, "f"), e instanceof Error && e.name === "AbortError" && (e = new y()), e instanceof y) return m(this, En, !0, "f"), this._emit("abort", e);
	if (e instanceof _) return this._emit("error", e);
	if (e instanceof Error) {
		let t = new _(e.message);
		return t.cause = e, this._emit("error", t);
	}
	return this._emit("error", new _(String(e)));
};
//#endregion
//#region node_modules/openai/lib/RunnableFunction.mjs
function An(e) {
	return typeof e.parse == "function";
}
//#endregion
//#region node_modules/openai/lib/AbstractChatCompletionRunner.mjs
var P, jn, Mn, Nn, Pn, Fn, In, Ln, Rn = 10, zn = class extends kn {
	constructor() {
		super(...arguments), P.add(this), this._chatCompletions = [], this.messages = [];
	}
	_addChatCompletion(e) {
		this._chatCompletions.push(e), this._emit("chatCompletion", e);
		let t = e.choices[0]?.message;
		return t && this._addMessage(t), e;
	}
	_addMessage(e, t = !0) {
		if ("content" in e || (e.content = null), this.messages.push(e), t) {
			if (this._emit("message", e), gn(e) && e.content) this._emit("functionToolCallResult", e.content);
			else if (hn(e) && e.tool_calls) for (let t of e.tool_calls) t.type === "function" && this._emit("functionToolCall", t.function);
		}
	}
	async finalChatCompletion() {
		await this.done();
		let e = this._chatCompletions[this._chatCompletions.length - 1];
		if (!e) throw new _("stream ended without producing a ChatCompletion");
		return e;
	}
	async finalContent() {
		return await this.done(), h(this, P, "m", jn).call(this);
	}
	async finalMessage() {
		return await this.done(), h(this, P, "m", Mn).call(this);
	}
	async finalFunctionToolCall() {
		return await this.done(), h(this, P, "m", Nn).call(this);
	}
	async finalFunctionToolCallResult() {
		return await this.done(), h(this, P, "m", Pn).call(this);
	}
	async totalUsage() {
		return await this.done(), h(this, P, "m", Fn).call(this);
	}
	allChatCompletions() {
		return [...this._chatCompletions];
	}
	_emitFinal() {
		let e = this._chatCompletions[this._chatCompletions.length - 1];
		e && this._emit("finalChatCompletion", e);
		let t = h(this, P, "m", Mn).call(this);
		t && this._emit("finalMessage", t);
		let n = h(this, P, "m", jn).call(this);
		n && this._emit("finalContent", n);
		let r = h(this, P, "m", Nn).call(this);
		r && this._emit("finalFunctionToolCall", r);
		let i = h(this, P, "m", Pn).call(this);
		i != null && this._emit("finalFunctionToolCallResult", i), this._chatCompletions.some((e) => e.usage) && this._emit("totalUsage", h(this, P, "m", Fn).call(this));
	}
	async _createChatCompletion(e, t, n) {
		let r = n?.signal;
		r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), h(this, P, "m", In).call(this, t);
		let i = await e.chat.completions.create({
			...t,
			stream: !1
		}, {
			...n,
			signal: this.controller.signal
		});
		return this._connected(), this._addChatCompletion(cn(i, t));
	}
	async _runChatCompletion(e, t, n) {
		for (let e of t.messages) this._addMessage(e, !1);
		return await this._createChatCompletion(e, t, n);
	}
	async _runTools(e, t, n) {
		let r = "tool", { tool_choice: i = "auto", stream: a, ...o } = t, s = typeof i != "string" && i.type === "function" && i?.function?.name, { maxChatCompletions: c = Rn } = n || {}, l = t.tools.map((e) => {
			if (on(e)) {
				if (!e.$callback) throw new _("Tool given to `.runTools()` that does not have an associated function");
				return {
					type: "function",
					function: {
						function: e.$callback,
						name: e.function.name,
						description: e.function.description || "",
						parameters: e.function.parameters,
						parse: e.$parseRaw,
						strict: !0
					}
				};
			}
			return e;
		}), u = {};
		for (let e of l) e.type === "function" && (u[e.function.name || e.function.function.name] = e.function);
		let d = "tools" in t ? l.map((e) => e.type === "function" ? {
			type: "function",
			function: {
				name: e.function.name || e.function.function.name,
				parameters: e.function.parameters,
				description: e.function.description,
				strict: e.function.strict
			}
		} : e) : void 0;
		for (let e of t.messages) this._addMessage(e, !1);
		for (let t = 0; t < c; ++t) {
			let t = (await this._createChatCompletion(e, {
				...o,
				tool_choice: i,
				tools: d,
				messages: [...this.messages]
			}, n)).choices[0]?.message;
			if (!t) throw new _("missing message in ChatCompletion response");
			if (!t.tool_calls?.length) return;
			for (let e of t.tool_calls) {
				if (e.type !== "function") continue;
				let t = e.id, { name: n, arguments: i } = e.function, a = u[n];
				if (!a) {
					let e = `Invalid tool_call: ${JSON.stringify(n)}. Available options are: ${Object.keys(u).map((e) => JSON.stringify(e)).join(", ")}. Please try again`;
					this._addMessage({
						role: r,
						tool_call_id: t,
						content: e
					});
					continue;
				} else if (s && s !== n) {
					let e = `Invalid tool_call: ${JSON.stringify(n)}. ${JSON.stringify(s)} requested. Please try again`;
					this._addMessage({
						role: r,
						tool_call_id: t,
						content: e
					});
					continue;
				}
				let o;
				try {
					o = An(a) ? await a.parse(i) : i;
				} catch (e) {
					let n = e instanceof Error ? e.message : String(e);
					this._addMessage({
						role: r,
						tool_call_id: t,
						content: n
					});
					continue;
				}
				let c = await a.function(o, this), l = h(this, P, "m", Ln).call(this, c);
				if (this._addMessage({
					role: r,
					tool_call_id: t,
					content: l
				}), s) return;
			}
		}
	}
};
P = /* @__PURE__ */ new WeakSet(), jn = function() {
	return h(this, P, "m", Mn).call(this).content ?? null;
}, Mn = function() {
	let e = this.messages.length;
	for (; e-- > 0;) {
		let t = this.messages[e];
		if (hn(t)) return {
			...t,
			content: t.content ?? null,
			refusal: t.refusal ?? null
		};
	}
	throw new _("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Nn = function() {
	for (let e = this.messages.length - 1; e >= 0; e--) {
		let t = this.messages[e];
		if (hn(t) && t?.tool_calls?.length) return t.tool_calls.filter((e) => e.type === "function").at(-1)?.function;
	}
}, Pn = function() {
	for (let e = this.messages.length - 1; e >= 0; e--) {
		let t = this.messages[e];
		if (gn(t) && t.content != null && typeof t.content == "string" && this.messages.some((e) => e.role === "assistant" && e.tool_calls?.some((e) => e.type === "function" && e.id === t.tool_call_id))) return t.content;
	}
}, Fn = function() {
	let e = {
		completion_tokens: 0,
		prompt_tokens: 0,
		total_tokens: 0
	};
	for (let { usage: t } of this._chatCompletions) t && (e.completion_tokens += t.completion_tokens, e.prompt_tokens += t.prompt_tokens, e.total_tokens += t.total_tokens);
	return e;
}, In = function(e) {
	if (e.n != null && e.n > 1) throw new _("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, Ln = function(e) {
	return typeof e == "string" ? e : e === void 0 ? "undefined" : JSON.stringify(e);
};
//#endregion
//#region node_modules/openai/lib/ChatCompletionRunner.mjs
var Bn = class e extends zn {
	static runTools(t, n, r) {
		let i = new e(), a = {
			...r,
			headers: {
				...r?.headers,
				"X-Stainless-Helper-Method": "runTools"
			}
		};
		return i._run(() => i._runTools(t, n, a)), i;
	}
	_addMessage(e, t = !0) {
		super._addMessage(e, t), hn(e) && e.content && this._emit("content", e.content);
	}
}, F = {
	STR: 1,
	NUM: 2,
	ARR: 4,
	OBJ: 8,
	NULL: 16,
	BOOL: 32,
	NAN: 64,
	INFINITY: 128,
	MINUS_INFINITY: 256,
	INF: 384,
	SPECIAL: 496,
	ATOM: 499,
	COLLECTION: 12,
	ALL: 511
}, Vn = class extends Error {}, Hn = class extends Error {};
function Un(e, t = F.ALL) {
	if (typeof e != "string") throw TypeError(`expecting str, got ${typeof e}`);
	if (!e.trim()) throw Error(`${e} is empty`);
	return Wn(e.trim(), t);
}
var Wn = (e, t) => {
	let n = e.length, r = 0, i = (e) => {
		throw new Vn(`${e} at position ${r}`);
	}, a = (e) => {
		throw new Hn(`${e} at position ${r}`);
	}, o = () => (d(), r >= n && i("Unexpected end of input"), e[r] === "\"" ? s() : e[r] === "{" ? c() : e[r] === "[" ? l() : e.substring(r, r + 4) === "null" || F.NULL & t && n - r < 4 && "null".startsWith(e.substring(r)) ? (r += 4, null) : e.substring(r, r + 4) === "true" || F.BOOL & t && n - r < 4 && "true".startsWith(e.substring(r)) ? (r += 4, !0) : e.substring(r, r + 5) === "false" || F.BOOL & t && n - r < 5 && "false".startsWith(e.substring(r)) ? (r += 5, !1) : e.substring(r, r + 8) === "Infinity" || F.INFINITY & t && n - r < 8 && "Infinity".startsWith(e.substring(r)) ? (r += 8, Infinity) : e.substring(r, r + 9) === "-Infinity" || F.MINUS_INFINITY & t && 1 < n - r && n - r < 9 && "-Infinity".startsWith(e.substring(r)) ? (r += 9, -Infinity) : e.substring(r, r + 3) === "NaN" || F.NAN & t && n - r < 3 && "NaN".startsWith(e.substring(r)) ? (r += 3, NaN) : u()), s = () => {
		let o = r, s = !1;
		for (r++; r < n && (e[r] !== "\"" || s && e[r - 1] === "\\");) s = e[r] === "\\" ? !s : !1, r++;
		if (e.charAt(r) == "\"") try {
			return JSON.parse(e.substring(o, ++r - Number(s)));
		} catch (e) {
			a(String(e));
		}
		else if (F.STR & t) try {
			return JSON.parse(e.substring(o, r - Number(s)) + "\"");
		} catch {
			return JSON.parse(e.substring(o, e.lastIndexOf("\\")) + "\"");
		}
		i("Unterminated string literal");
	}, c = () => {
		r++, d();
		let a = {};
		try {
			for (; e[r] !== "}";) {
				if (d(), r >= n && F.OBJ & t) return a;
				let i = s();
				d(), r++;
				try {
					let e = o();
					Object.defineProperty(a, i, {
						value: e,
						writable: !0,
						enumerable: !0,
						configurable: !0
					});
				} catch (e) {
					if (F.OBJ & t) return a;
					throw e;
				}
				d(), e[r] === "," && r++;
			}
		} catch {
			if (F.OBJ & t) return a;
			i("Expected '}' at end of object");
		}
		return r++, a;
	}, l = () => {
		r++;
		let n = [];
		try {
			for (; e[r] !== "]";) n.push(o()), d(), e[r] === "," && r++;
		} catch {
			if (F.ARR & t) return n;
			i("Expected ']' at end of array");
		}
		return r++, n;
	}, u = () => {
		if (r === 0) {
			e === "-" && F.NUM & t && i("Not sure what '-' is");
			try {
				return JSON.parse(e);
			} catch (n) {
				if (F.NUM & t) try {
					return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
				} catch {}
				a(String(n));
			}
		}
		let o = r;
		for (e[r] === "-" && r++; e[r] && !",]}".includes(e[r]);) r++;
		r == n && !(F.NUM & t) && i("Unterminated number literal");
		try {
			return JSON.parse(e.substring(o, r));
		} catch {
			e.substring(o, r) === "-" && F.NUM & t && i("Not sure what '-' is");
			try {
				return JSON.parse(e.substring(o, e.lastIndexOf("e")));
			} catch (e) {
				a(String(e));
			}
		}
	}, d = () => {
		for (; r < n && " \n\r	".includes(e[r]);) r++;
	};
	return o();
}, Gn = (e) => Un(e, F.ALL ^ F.NUM), I, L, Kn, R, qn, Jn, Yn, Xn, Zn, Qn, $n, er, tr = class e extends zn {
	constructor(e) {
		super(), I.add(this), L.set(this, void 0), Kn.set(this, void 0), R.set(this, void 0), m(this, L, e, "f"), m(this, Kn, [], "f");
	}
	get currentChatCompletionSnapshot() {
		return h(this, R, "f");
	}
	static fromReadableStream(t) {
		let n = new e(null);
		return n._run(() => n._fromReadableStream(t)), n;
	}
	static createChatCompletion(t, n, r) {
		let i = new e(n);
		return i._run(() => i._runChatCompletion(t, {
			...n,
			stream: !0
		}, {
			...r,
			headers: {
				...r?.headers,
				"X-Stainless-Helper-Method": "stream"
			}
		})), i;
	}
	async _createChatCompletion(e, t, n) {
		super._createChatCompletion;
		let r = n?.signal;
		r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), h(this, I, "m", qn).call(this);
		let i = await e.chat.completions.create({
			...t,
			stream: !0
		}, {
			...n,
			signal: this.controller.signal
		});
		this._connected();
		for await (let e of i) h(this, I, "m", Yn).call(this, e);
		if (i.controller.signal?.aborted) throw new y();
		return this._addChatCompletion(h(this, I, "m", Qn).call(this));
	}
	async _fromReadableStream(e, t) {
		let n = t?.signal;
		n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), h(this, I, "m", qn).call(this), this._connected();
		let r = bt.fromReadableStream(e, this.controller), i;
		for await (let e of r) i && i !== e.id && this._addChatCompletion(h(this, I, "m", Qn).call(this)), h(this, I, "m", Yn).call(this, e), i = e.id;
		if (r.controller.signal?.aborted) throw new y();
		return this._addChatCompletion(h(this, I, "m", Qn).call(this));
	}
	[(L = /* @__PURE__ */ new WeakMap(), Kn = /* @__PURE__ */ new WeakMap(), R = /* @__PURE__ */ new WeakMap(), I = /* @__PURE__ */ new WeakSet(), qn = function() {
		this.ended || m(this, R, void 0, "f");
	}, Jn = function(e) {
		let t = h(this, Kn, "f")[e.index];
		return t || (t = {
			content_done: !1,
			refusal_done: !1,
			logprobs_content_done: !1,
			logprobs_refusal_done: !1,
			done_tool_calls: /* @__PURE__ */ new Set(),
			current_tool_call_index: null
		}, h(this, Kn, "f")[e.index] = t, t);
	}, Yn = function(e) {
		if (this.ended) return;
		let t = h(this, I, "m", er).call(this, e);
		this._emit("chunk", e, t);
		for (let n of e.choices) {
			let e = t.choices[n.index];
			n.delta.content != null && e.message?.role === "assistant" && e.message?.content && (this._emit("content", n.delta.content, e.message.content), this._emit("content.delta", {
				delta: n.delta.content,
				snapshot: e.message.content,
				parsed: e.message.parsed
			})), n.delta.refusal != null && e.message?.role === "assistant" && e.message?.refusal && this._emit("refusal.delta", {
				delta: n.delta.refusal,
				snapshot: e.message.refusal
			}), n.logprobs?.content != null && e.message?.role === "assistant" && this._emit("logprobs.content.delta", {
				content: n.logprobs?.content,
				snapshot: e.logprobs?.content ?? []
			}), n.logprobs?.refusal != null && e.message?.role === "assistant" && this._emit("logprobs.refusal.delta", {
				refusal: n.logprobs?.refusal,
				snapshot: e.logprobs?.refusal ?? []
			});
			let r = h(this, I, "m", Jn).call(this, e);
			e.finish_reason && (h(this, I, "m", Zn).call(this, e), r.current_tool_call_index != null && h(this, I, "m", Xn).call(this, e, r.current_tool_call_index));
			for (let t of n.delta.tool_calls ?? []) r.current_tool_call_index !== t.index && (h(this, I, "m", Zn).call(this, e), r.current_tool_call_index != null && h(this, I, "m", Xn).call(this, e, r.current_tool_call_index)), r.current_tool_call_index = t.index;
			for (let t of n.delta.tool_calls ?? []) {
				let n = e.message.tool_calls?.[t.index];
				n?.type && (n?.type === "function" ? this._emit("tool_calls.function.arguments.delta", {
					name: n.function?.name,
					index: t.index,
					arguments: n.function.arguments,
					parsed_arguments: n.function.parsed_arguments,
					arguments_delta: t.function?.arguments ?? ""
				}) : n?.type);
			}
		}
	}, Xn = function(e, t) {
		if (h(this, I, "m", Jn).call(this, e).done_tool_calls.has(t)) return;
		let n = e.message.tool_calls?.[t];
		if (!n) throw Error("no tool call snapshot");
		if (!n.type) throw Error("tool call snapshot missing `type`");
		if (n.type === "function") {
			let e = h(this, L, "f")?.tools?.find((e) => rn(e) && e.function.name === n.function.name);
			this._emit("tool_calls.function.arguments.done", {
				name: n.function.name,
				index: t,
				arguments: n.function.arguments,
				parsed_arguments: on(e) ? e.$parseRaw(n.function.arguments) : e?.function.strict ? JSON.parse(n.function.arguments) : null
			});
		} else n.type;
	}, Zn = function(e) {
		let t = h(this, I, "m", Jn).call(this, e);
		if (e.message.content && !t.content_done) {
			t.content_done = !0;
			let n = h(this, I, "m", $n).call(this);
			this._emit("content.done", {
				content: e.message.content,
				parsed: n ? n.$parseRaw(e.message.content) : null
			});
		}
		e.message.refusal && !t.refusal_done && (t.refusal_done = !0, this._emit("refusal.done", { refusal: e.message.refusal })), e.logprobs?.content && !t.logprobs_content_done && (t.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: e.logprobs.content })), e.logprobs?.refusal && !t.logprobs_refusal_done && (t.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: e.logprobs.refusal }));
	}, Qn = function() {
		if (this.ended) throw new _("stream has ended, this shouldn't happen");
		let e = h(this, R, "f");
		if (!e) throw new _("request ended without sending any chunks");
		return m(this, R, void 0, "f"), m(this, Kn, [], "f"), nr(e, h(this, L, "f"));
	}, $n = function() {
		let e = h(this, L, "f")?.response_format;
		return an(e) ? e : null;
	}, er = function(e) {
		var t, n, r, i;
		let a = h(this, R, "f"), { choices: o, ...s } = e;
		a ? Object.assign(a, s) : a = m(this, R, {
			...s,
			choices: []
		}, "f");
		for (let { delta: o, finish_reason: s, index: c, logprobs: l = null, ...u } of e.choices) {
			let e = a.choices[c];
			if (e ||= a.choices[c] = {
				finish_reason: s,
				index: c,
				message: {},
				logprobs: l,
				...u
			}, l) if (!e.logprobs) e.logprobs = Object.assign({}, l);
			else {
				let { content: r, refusal: i, ...a } = l;
				Object.assign(e.logprobs, a), r && ((t = e.logprobs).content ?? (t.content = []), e.logprobs.content.push(...r)), i && ((n = e.logprobs).refusal ?? (n.refusal = []), e.logprobs.refusal.push(...i));
			}
			if (s && (e.finish_reason = s, h(this, L, "f") && fn(h(this, L, "f")))) {
				if (s === "length") throw new de();
				if (s === "content_filter") throw new fe();
			}
			if (Object.assign(e, u), !o) continue;
			let { content: d, refusal: f, function_call: p, role: m, tool_calls: ee, ...te } = o;
			if (Object.assign(e.message, te), f && (e.message.refusal = (e.message.refusal || "") + f), m && (e.message.role = m), p && (e.message.function_call ? (p.name && (e.message.function_call.name = p.name), p.arguments && ((r = e.message.function_call).arguments ?? (r.arguments = ""), e.message.function_call.arguments += p.arguments)) : e.message.function_call = p), d && (e.message.content = (e.message.content || "") + d, !e.message.refusal && h(this, I, "m", $n).call(this) && (e.message.parsed = Gn(e.message.content))), ee) {
				e.message.tool_calls || (e.message.tool_calls = []);
				for (let { index: t, id: n, type: r, function: a, ...o } of ee) {
					let s = (i = e.message.tool_calls)[t] ?? (i[t] = {});
					Object.assign(s, o), n && (s.id = n), r && (s.type = r), a && (s.function ??= {
						name: a.name ?? "",
						arguments: ""
					}), a?.name && (s.function.name = a.name), a?.arguments && (s.function.arguments += a.arguments, dn(h(this, L, "f"), s) && (s.function.parsed_arguments = Gn(s.function.arguments)));
				}
			}
		}
		return a;
	}, Symbol.asyncIterator)]() {
		let e = [], t = [], n = !1;
		return this.on("chunk", (n) => {
			let r = t.shift();
			r ? r.resolve(n) : e.push(n);
		}), this.on("end", () => {
			n = !0;
			for (let e of t) e.resolve(void 0);
			t.length = 0;
		}), this.on("abort", (e) => {
			n = !0;
			for (let n of t) n.reject(e);
			t.length = 0;
		}), this.on("error", (e) => {
			n = !0;
			for (let n of t) n.reject(e);
			t.length = 0;
		}), {
			next: async () => e.length ? {
				value: e.shift(),
				done: !1
			} : n ? {
				value: void 0,
				done: !0
			} : new Promise((e, n) => t.push({
				resolve: e,
				reject: n
			})).then((e) => e ? {
				value: e,
				done: !1
			} : {
				value: void 0,
				done: !0
			}),
			return: async () => (this.abort(), {
				value: void 0,
				done: !0
			})
		};
	}
	toReadableStream() {
		return new bt(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
	}
};
function nr(e, t) {
	let { id: n, choices: r, created: i, model: a, system_fingerprint: o, ...s } = e;
	return sn({
		...s,
		id: n,
		choices: r.map(({ message: t, finish_reason: n, index: r, logprobs: i, ...a }) => {
			if (!n) throw new _(`missing finish_reason for choice ${r}`);
			let { content: o = null, function_call: s, tool_calls: c, ...l } = t, u = t.role;
			if (!u) throw new _(`missing role for choice ${r}`);
			if (s) {
				let { arguments: e, name: c } = s;
				if (e == null) throw new _(`missing function_call.arguments for choice ${r}`);
				if (!c) throw new _(`missing function_call.name for choice ${r}`);
				return {
					...a,
					message: {
						content: o,
						function_call: {
							arguments: e,
							name: c
						},
						role: u,
						refusal: t.refusal ?? null
					},
					finish_reason: n,
					index: r,
					logprobs: i
				};
			}
			return c ? {
				...a,
				index: r,
				finish_reason: n,
				logprobs: i,
				message: {
					...l,
					role: u,
					content: o,
					refusal: t.refusal ?? null,
					tool_calls: c.map((t, n) => {
						let { function: i, type: a, id: o, ...s } = t, { arguments: c, name: l, ...u } = i || {};
						if (o == null) throw new _(`missing choices[${r}].tool_calls[${n}].id\n${rr(e)}`);
						if (a == null) throw new _(`missing choices[${r}].tool_calls[${n}].type\n${rr(e)}`);
						if (l == null) throw new _(`missing choices[${r}].tool_calls[${n}].function.name\n${rr(e)}`);
						if (c == null) throw new _(`missing choices[${r}].tool_calls[${n}].function.arguments\n${rr(e)}`);
						return {
							...s,
							id: o,
							type: a,
							function: {
								...u,
								name: l,
								arguments: c
							}
						};
					})
				}
			} : {
				...a,
				message: {
					...l,
					content: o,
					role: u,
					refusal: t.refusal ?? null
				},
				finish_reason: n,
				index: r,
				logprobs: i
			};
		}),
		created: i,
		model: a,
		object: "chat.completion",
		...o ? { system_fingerprint: o } : {}
	}, t);
}
function rr(e) {
	return JSON.stringify(e);
}
//#endregion
//#region node_modules/openai/lib/ChatCompletionStreamingRunner.mjs
var ir = class e extends tr {
	static fromReadableStream(t) {
		let n = new e(null);
		return n._run(() => n._fromReadableStream(t)), n;
	}
	static runTools(t, n, r) {
		let i = new e(n), a = {
			...r,
			headers: {
				...r?.headers,
				"X-Stainless-Helper-Method": "runTools"
			}
		};
		return i._run(() => i._runTools(t, n, a)), i;
	}
}, ar = class extends j {
	constructor() {
		super(...arguments), this.messages = new nn(this._client);
	}
	create(e, t) {
		return this._client.post("/chat/completions", {
			body: e,
			...t,
			stream: e.stream ?? !1,
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/chat/completions/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/chat/completions/${e}`, {
			body: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/chat/completions", D, {
			query: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/chat/completions/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	parse(e, t) {
		return mn(e.tools), this._client.chat.completions.create(e, {
			...t,
			headers: {
				...t?.headers,
				"X-Stainless-Helper-Method": "chat.completions.parse"
			}
		})._thenUnwrap((t) => cn(t, e));
	}
	runTools(e, t) {
		return e.stream ? ir.runTools(this._client, e, t) : Bn.runTools(this._client, e, t);
	}
	stream(e, t) {
		return tr.createChatCompletion(this._client, e, t);
	}
};
ar.Messages = nn;
//#endregion
//#region node_modules/openai/resources/chat/chat.mjs
var or = class extends j {
	constructor() {
		super(...arguments), this.completions = new ar(this._client);
	}
};
or.Completions = ar;
//#endregion
//#region node_modules/openai/resources/admin/organization/admin-api-keys.mjs
var sr = class extends j {
	create(e, t) {
		return this._client.post("/organization/admin_api_keys", {
			body: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/organization/admin_api_keys/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/organization/admin_api_keys", D, {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/organization/admin_api_keys/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, cr = class extends j {
	list(e = {}, t) {
		return this._client.getAPIList("/organization/audit_logs", O, {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, lr = class extends j {
	create(e, t) {
		return this._client.post("/organization/certificates", {
			body: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t = {}, n) {
		return this._client.get(M`/organization/certificates/${e}`, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/organization/certificates/${e}`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/organization/certificates", O, {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/organization/certificates/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	activate(e, t) {
		return this._client.getAPIList("/organization/certificates/activate", Mt, {
			body: e,
			method: "post",
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	deactivate(e, t) {
		return this._client.getAPIList("/organization/certificates/deactivate", Mt, {
			body: e,
			method: "post",
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, ur = class extends j {
	retrieve(e) {
		return this._client.get("/organization/data_retention", {
			...e,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t) {
		return this._client.post("/organization/data_retention", {
			body: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, dr = class extends j {
	create(e, t) {
		return this._client.post("/organization/invites", {
			body: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/organization/invites/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/organization/invites", O, {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/organization/invites/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, fr = class extends j {
	create(e, t) {
		return this._client.post("/organization/roles", {
			body: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/organization/roles/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/organization/roles/${e}`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/organization/roles", k, {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/organization/roles/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, pr = class extends j {
	create(e, t) {
		return this._client.post("/organization/spend_alerts", {
			body: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/organization/spend_alerts/${e}`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/organization/spend_alerts", O, {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/organization/spend_alerts/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, mr = class extends j {
	audioSpeeches(e, t) {
		return this._client.get("/organization/usage/audio_speeches", {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	audioTranscriptions(e, t) {
		return this._client.get("/organization/usage/audio_transcriptions", {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	codeInterpreterSessions(e, t) {
		return this._client.get("/organization/usage/code_interpreter_sessions", {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	completions(e, t) {
		return this._client.get("/organization/usage/completions", {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	costs(e, t) {
		return this._client.get("/organization/costs", {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	embeddings(e, t) {
		return this._client.get("/organization/usage/embeddings", {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	fileSearchCalls(e, t) {
		return this._client.get("/organization/usage/file_search_calls", {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	images(e, t) {
		return this._client.get("/organization/usage/images", {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	moderations(e, t) {
		return this._client.get("/organization/usage/moderations", {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	vectorStores(e, t) {
		return this._client.get("/organization/usage/vector_stores", {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	webSearchCalls(e, t) {
		return this._client.get("/organization/usage/web_search_calls", {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, hr = class extends j {
	create(e, t, n) {
		return this._client.post(M`/organization/groups/${e}/roles`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { group_id: r } = t;
		return this._client.get(M`/organization/groups/${r}/roles/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/organization/groups/${e}/roles`, k, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { group_id: r } = t;
		return this._client.delete(M`/organization/groups/${r}/roles/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, gr = class extends j {
	create(e, t, n) {
		return this._client.post(M`/organization/groups/${e}/users`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { group_id: r } = t;
		return this._client.get(M`/organization/groups/${r}/users/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/organization/groups/${e}/users`, k, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { group_id: r } = t;
		return this._client.delete(M`/organization/groups/${r}/users/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, _r = class extends j {
	constructor() {
		super(...arguments), this.users = new gr(this._client), this.roles = new hr(this._client);
	}
	create(e, t) {
		return this._client.post("/organization/groups", {
			body: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/organization/groups/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/organization/groups/${e}`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/organization/groups", k, {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/organization/groups/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
};
_r.Users = gr, _r.Roles = hr;
//#endregion
//#region node_modules/openai/resources/admin/organization/projects/api-keys.mjs
var vr = class extends j {
	retrieve(e, t, n) {
		let { project_id: r } = t;
		return this._client.get(M`/organization/projects/${r}/api_keys/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/organization/projects/${e}/api_keys`, O, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { project_id: r } = t;
		return this._client.delete(M`/organization/projects/${r}/api_keys/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, yr = class extends j {
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/organization/projects/${e}/certificates`, O, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	activate(e, t, n) {
		return this._client.getAPIList(M`/organization/projects/${e}/certificates/activate`, Mt, {
			body: t,
			method: "post",
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	deactivate(e, t, n) {
		return this._client.getAPIList(M`/organization/projects/${e}/certificates/deactivate`, Mt, {
			body: t,
			method: "post",
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, br = class extends j {
	retrieve(e, t) {
		return this._client.get(M`/organization/projects/${e}/data_retention`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/organization/projects/${e}/data_retention`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, xr = class extends j {
	retrieve(e, t) {
		return this._client.get(M`/organization/projects/${e}/hosted_tool_permissions`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/organization/projects/${e}/hosted_tool_permissions`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, Sr = class extends j {
	retrieve(e, t) {
		return this._client.get(M`/organization/projects/${e}/model_permissions`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/organization/projects/${e}/model_permissions`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/organization/projects/${e}/model_permissions`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, Cr = class extends j {
	listRateLimits(e, t = {}, n) {
		return this._client.getAPIList(M`/organization/projects/${e}/rate_limits`, O, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	updateRateLimit(e, t, n) {
		let { project_id: r, ...i } = t;
		return this._client.post(M`/organization/projects/${r}/rate_limits/${e}`, {
			body: i,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, wr = class extends j {
	create(e, t, n) {
		return this._client.post(M`/projects/${e}/roles`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { project_id: r } = t;
		return this._client.get(M`/projects/${r}/roles/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		let { project_id: r, ...i } = t;
		return this._client.post(M`/projects/${r}/roles/${e}`, {
			body: i,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/projects/${e}/roles`, k, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { project_id: r } = t;
		return this._client.delete(M`/projects/${r}/roles/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, Tr = class extends j {
	create(e, t, n) {
		return this._client.post(M`/organization/projects/${e}/service_accounts`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { project_id: r } = t;
		return this._client.get(M`/organization/projects/${r}/service_accounts/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		let { project_id: r, ...i } = t;
		return this._client.post(M`/organization/projects/${r}/service_accounts/${e}`, {
			body: i,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/organization/projects/${e}/service_accounts`, O, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { project_id: r } = t;
		return this._client.delete(M`/organization/projects/${r}/service_accounts/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, Er = class extends j {
	create(e, t, n) {
		return this._client.post(M`/organization/projects/${e}/spend_alerts`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		let { project_id: r, ...i } = t;
		return this._client.post(M`/organization/projects/${r}/spend_alerts/${e}`, {
			body: i,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/organization/projects/${e}/spend_alerts`, O, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { project_id: r } = t;
		return this._client.delete(M`/organization/projects/${r}/spend_alerts/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, Dr = class extends j {
	create(e, t, n) {
		let { project_id: r, ...i } = t;
		return this._client.post(M`/projects/${r}/groups/${e}/roles`, {
			body: i,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { project_id: r, group_id: i } = t;
		return this._client.get(M`/projects/${r}/groups/${i}/roles/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e, t, n) {
		let { project_id: r, ...i } = t;
		return this._client.getAPIList(M`/projects/${r}/groups/${e}/roles`, k, {
			query: i,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { project_id: r, group_id: i } = t;
		return this._client.delete(M`/projects/${r}/groups/${i}/roles/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, Or = class extends j {
	constructor() {
		super(...arguments), this.roles = new Dr(this._client);
	}
	create(e, t, n) {
		return this._client.post(M`/organization/projects/${e}/groups`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { project_id: r, ...i } = t;
		return this._client.get(M`/organization/projects/${r}/groups/${e}`, {
			query: i,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/organization/projects/${e}/groups`, k, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { project_id: r } = t;
		return this._client.delete(M`/organization/projects/${r}/groups/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
};
Or.Roles = Dr;
//#endregion
//#region node_modules/openai/resources/admin/organization/projects/users/roles.mjs
var kr = class extends j {
	create(e, t, n) {
		let { project_id: r, ...i } = t;
		return this._client.post(M`/projects/${r}/users/${e}/roles`, {
			body: i,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { project_id: r, user_id: i } = t;
		return this._client.get(M`/projects/${r}/users/${i}/roles/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e, t, n) {
		let { project_id: r, ...i } = t;
		return this._client.getAPIList(M`/projects/${r}/users/${e}/roles`, k, {
			query: i,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { project_id: r, user_id: i } = t;
		return this._client.delete(M`/projects/${r}/users/${i}/roles/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, Ar = class extends j {
	constructor() {
		super(...arguments), this.roles = new kr(this._client);
	}
	create(e, t, n) {
		return this._client.post(M`/organization/projects/${e}/users`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { project_id: r } = t;
		return this._client.get(M`/organization/projects/${r}/users/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		let { project_id: r, ...i } = t;
		return this._client.post(M`/organization/projects/${r}/users/${e}`, {
			body: i,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/organization/projects/${e}/users`, O, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { project_id: r } = t;
		return this._client.delete(M`/organization/projects/${r}/users/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
};
Ar.Roles = kr;
//#endregion
//#region node_modules/openai/resources/admin/organization/projects/projects.mjs
var z = class extends j {
	constructor() {
		super(...arguments), this.users = new Ar(this._client), this.serviceAccounts = new Tr(this._client), this.apiKeys = new vr(this._client), this.rateLimits = new Cr(this._client), this.modelPermissions = new Sr(this._client), this.hostedToolPermissions = new xr(this._client), this.groups = new Or(this._client), this.roles = new wr(this._client), this.dataRetention = new br(this._client), this.spendAlerts = new Er(this._client), this.certificates = new yr(this._client);
	}
	create(e, t) {
		return this._client.post("/organization/projects", {
			body: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/organization/projects/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/organization/projects/${e}`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/organization/projects", O, {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	archive(e, t) {
		return this._client.post(M`/organization/projects/${e}/archive`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
};
z.Users = Ar, z.ServiceAccounts = Tr, z.APIKeys = vr, z.RateLimits = Cr, z.ModelPermissions = Sr, z.HostedToolPermissions = xr, z.Groups = Or, z.Roles = wr, z.DataRetention = br, z.SpendAlerts = Er, z.Certificates = yr;
//#endregion
//#region node_modules/openai/resources/admin/organization/users/roles.mjs
var jr = class extends j {
	create(e, t, n) {
		return this._client.post(M`/organization/users/${e}/roles`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { user_id: r } = t;
		return this._client.get(M`/organization/users/${r}/roles/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/organization/users/${e}/roles`, k, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { user_id: r } = t;
		return this._client.delete(M`/organization/users/${r}/roles/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, Mr = class extends j {
	constructor() {
		super(...arguments), this.roles = new jr(this._client);
	}
	retrieve(e, t) {
		return this._client.get(M`/organization/users/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/organization/users/${e}`, {
			body: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/organization/users", O, {
			query: e,
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/organization/users/${e}`, {
			...t,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
};
Mr.Roles = jr;
//#endregion
//#region node_modules/openai/resources/admin/organization/organization.mjs
var B = class extends j {
	constructor() {
		super(...arguments), this.auditLogs = new cr(this._client), this.adminAPIKeys = new sr(this._client), this.usage = new mr(this._client), this.invites = new dr(this._client), this.users = new Mr(this._client), this.groups = new _r(this._client), this.roles = new fr(this._client), this.dataRetention = new ur(this._client), this.spendAlerts = new pr(this._client), this.certificates = new lr(this._client), this.projects = new z(this._client);
	}
};
B.AuditLogs = cr, B.AdminAPIKeys = sr, B.Usage = mr, B.Invites = dr, B.Users = Mr, B.Groups = _r, B.Roles = fr, B.DataRetention = ur, B.SpendAlerts = pr, B.Certificates = lr, B.Projects = z;
//#endregion
//#region node_modules/openai/resources/admin/admin.mjs
var Nr = class extends j {
	constructor() {
		super(...arguments), this.organization = new B(this._client);
	}
};
Nr.Organization = B;
//#endregion
//#region node_modules/openai/internal/headers.mjs
var Pr = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* Fr(e) {
	if (!e) return;
	if (Pr in e) {
		let { values: t, nulls: n } = e;
		yield* t.entries();
		for (let e of n) yield [e, null];
		return;
	}
	let t = !1, n;
	e instanceof Headers ? n = e.entries() : ve(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
	for (let e of n) {
		let n = e[0];
		if (typeof n != "string") throw TypeError("expected header name to be a string");
		let r = ve(e[1]) ? e[1] : [e[1]], i = !1;
		for (let e of r) e !== void 0 && (t && !i && (i = !0, yield [n, null]), yield [n, e]);
	}
}
var V = (e) => {
	let t = new Headers(), n = /* @__PURE__ */ new Set();
	for (let r of e) {
		let e = /* @__PURE__ */ new Set();
		for (let [i, a] of Fr(r)) {
			let r = i.toLowerCase();
			e.has(r) || (t.delete(i), e.add(r)), a === null ? (t.delete(i), n.add(r)) : (t.append(i, a), n.delete(r));
		}
	}
	return {
		[Pr]: !0,
		values: t,
		nulls: n
	};
}, Ir = class extends j {
	create(e, t) {
		return this._client.post("/audio/speech", {
			body: e,
			...t,
			headers: V([{ Accept: "application/octet-stream" }, t?.headers]),
			__security: { bearerAuth: !0 },
			__binaryResponse: !0
		});
	}
}, Lr = class extends j {
	create(e, t) {
		return this._client.post("/audio/transcriptions", A({
			body: e,
			...t,
			stream: e.stream ?? !1,
			__metadata: { model: e.model },
			__security: { bearerAuth: !0 }
		}, this._client));
	}
}, Rr = class extends j {
	create(e, t) {
		return this._client.post("/audio/translations", A({
			body: e,
			...t,
			__metadata: { model: e.model },
			__security: { bearerAuth: !0 }
		}, this._client));
	}
}, zr = class extends j {
	constructor() {
		super(...arguments), this.transcriptions = new Lr(this._client), this.translations = new Rr(this._client), this.speech = new Ir(this._client);
	}
};
zr.Transcriptions = Lr, zr.Translations = Rr, zr.Speech = Ir;
//#endregion
//#region node_modules/openai/resources/batches.mjs
var Br = class extends j {
	create(e, t) {
		return this._client.post("/batches", {
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/batches/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/batches", D, {
			query: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	cancel(e, t) {
		return this._client.post(M`/batches/${e}/cancel`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
}, Vr = class extends j {
	create(e, t) {
		return this._client.post("/assistants", {
			body: e,
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/assistants/${e}`, {
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/assistants/${e}`, {
			body: t,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/assistants", D, {
			query: e,
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/assistants/${e}`, {
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
}, Hr = class extends j {
	create(e, t) {
		return this._client.post("/realtime/sessions", {
			body: e,
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
}, Ur = class extends j {
	create(e, t) {
		return this._client.post("/realtime/transcription_sessions", {
			body: e,
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
}, Wr = class extends j {
	constructor() {
		super(...arguments), this.sessions = new Hr(this._client), this.transcriptionSessions = new Ur(this._client);
	}
};
Wr.Sessions = Hr, Wr.TranscriptionSessions = Ur;
//#endregion
//#region node_modules/openai/resources/beta/chatkit/sessions.mjs
var Gr = class extends j {
	create(e, t) {
		return this._client.post("/chatkit/sessions", {
			body: e,
			...t,
			headers: V([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	cancel(e, t) {
		return this._client.post(M`/chatkit/sessions/${e}/cancel`, {
			...t,
			headers: V([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
}, Kr = class extends j {
	retrieve(e, t) {
		return this._client.get(M`/chatkit/threads/${e}`, {
			...t,
			headers: V([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/chatkit/threads", O, {
			query: e,
			...t,
			headers: V([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/chatkit/threads/${e}`, {
			...t,
			headers: V([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	listItems(e, t = {}, n) {
		return this._client.getAPIList(M`/chatkit/threads/${e}/items`, O, {
			query: t,
			...n,
			headers: V([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
}, qr = class extends j {
	constructor() {
		super(...arguments), this.sessions = new Gr(this._client), this.threads = new Kr(this._client);
	}
};
qr.Sessions = Gr, qr.Threads = Kr;
//#endregion
//#region node_modules/openai/resources/beta/threads/messages.mjs
var Jr = class extends j {
	create(e, t, n) {
		return this._client.post(M`/threads/${e}/messages`, {
			body: t,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { thread_id: r } = t;
		return this._client.get(M`/threads/${r}/messages/${e}`, {
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	update(e, t, n) {
		let { thread_id: r, ...i } = t;
		return this._client.post(M`/threads/${r}/messages/${e}`, {
			body: i,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/threads/${e}/messages`, D, {
			query: t,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { thread_id: r } = t;
		return this._client.delete(M`/threads/${r}/messages/${e}`, {
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
}, Yr = class extends j {
	retrieve(e, t, n) {
		let { thread_id: r, run_id: i, ...a } = t;
		return this._client.get(M`/threads/${r}/runs/${i}/steps/${e}`, {
			query: a,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	list(e, t, n) {
		let { thread_id: r, ...i } = t;
		return this._client.getAPIList(M`/threads/${r}/runs/${e}/steps`, D, {
			query: i,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
}, Xr = (e) => {
	if (typeof Buffer < "u") {
		let t = Buffer.from(e, "base64");
		return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
	} else {
		let t = atob(e), n = t.length, r = new Uint8Array(n);
		for (let e = 0; e < n; e++) r[e] = t.charCodeAt(e);
		return Array.from(new Float32Array(r.buffer));
	}
}, Zr = (e) => {
	if (globalThis.process !== void 0) return globalThis.process.env?.[e]?.trim() || void 0;
	if (globalThis.Deno !== void 0) return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, H, Qr, $r, U, ei, W, ti, ni, ri, ii, G, ai, oi, si, ci, li, ui, di, fi, pi, mi, hi, gi, _i = class extends kn {
	constructor() {
		super(...arguments), H.add(this), $r.set(this, []), U.set(this, {}), ei.set(this, {}), W.set(this, void 0), ti.set(this, void 0), ni.set(this, void 0), ri.set(this, void 0), ii.set(this, void 0), G.set(this, void 0), ai.set(this, void 0), oi.set(this, void 0), si.set(this, void 0);
	}
	[($r = /* @__PURE__ */ new WeakMap(), U = /* @__PURE__ */ new WeakMap(), ei = /* @__PURE__ */ new WeakMap(), W = /* @__PURE__ */ new WeakMap(), ti = /* @__PURE__ */ new WeakMap(), ni = /* @__PURE__ */ new WeakMap(), ri = /* @__PURE__ */ new WeakMap(), ii = /* @__PURE__ */ new WeakMap(), G = /* @__PURE__ */ new WeakMap(), ai = /* @__PURE__ */ new WeakMap(), oi = /* @__PURE__ */ new WeakMap(), si = /* @__PURE__ */ new WeakMap(), H = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
		let e = [], t = [], n = !1;
		return this.on("event", (n) => {
			let r = t.shift();
			r ? r.resolve(n) : e.push(n);
		}), this.on("end", () => {
			n = !0;
			for (let e of t) e.resolve(void 0);
			t.length = 0;
		}), this.on("abort", (e) => {
			n = !0;
			for (let n of t) n.reject(e);
			t.length = 0;
		}), this.on("error", (e) => {
			n = !0;
			for (let n of t) n.reject(e);
			t.length = 0;
		}), {
			next: async () => e.length ? {
				value: e.shift(),
				done: !1
			} : n ? {
				value: void 0,
				done: !0
			} : new Promise((e, n) => t.push({
				resolve: e,
				reject: n
			})).then((e) => e ? {
				value: e,
				done: !1
			} : {
				value: void 0,
				done: !0
			}),
			return: async () => (this.abort(), {
				value: void 0,
				done: !0
			})
		};
	}
	static fromReadableStream(e) {
		let t = new Qr();
		return t._run(() => t._fromReadableStream(e)), t;
	}
	async _fromReadableStream(e, t) {
		let n = t?.signal;
		n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
		let r = bt.fromReadableStream(e, this.controller);
		for await (let e of r) h(this, H, "m", ci).call(this, e);
		if (r.controller.signal?.aborted) throw new y();
		return this._addRun(h(this, H, "m", li).call(this));
	}
	toReadableStream() {
		return new bt(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
	}
	static createToolAssistantStream(e, t, n, r) {
		let i = new Qr();
		return i._run(() => i._runToolAssistantStream(e, t, n, {
			...r,
			headers: {
				...r?.headers,
				"X-Stainless-Helper-Method": "stream"
			}
		})), i;
	}
	async _createToolAssistantStream(e, t, n, r) {
		let i = r?.signal;
		i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort()));
		let a = {
			...n,
			stream: !0
		}, o = await e.submitToolOutputs(t, a, {
			...r,
			signal: this.controller.signal
		});
		this._connected();
		for await (let e of o) h(this, H, "m", ci).call(this, e);
		if (o.controller.signal?.aborted) throw new y();
		return this._addRun(h(this, H, "m", li).call(this));
	}
	static createThreadAssistantStream(e, t, n) {
		let r = new Qr();
		return r._run(() => r._threadAssistantStream(e, t, {
			...n,
			headers: {
				...n?.headers,
				"X-Stainless-Helper-Method": "stream"
			}
		})), r;
	}
	static createAssistantStream(e, t, n, r) {
		let i = new Qr();
		return i._run(() => i._runAssistantStream(e, t, n, {
			...r,
			headers: {
				...r?.headers,
				"X-Stainless-Helper-Method": "stream"
			}
		})), i;
	}
	currentEvent() {
		return h(this, ai, "f");
	}
	currentRun() {
		return h(this, oi, "f");
	}
	currentMessageSnapshot() {
		return h(this, W, "f");
	}
	currentRunStepSnapshot() {
		return h(this, si, "f");
	}
	async finalRunSteps() {
		return await this.done(), Object.values(h(this, U, "f"));
	}
	async finalMessages() {
		return await this.done(), Object.values(h(this, ei, "f"));
	}
	async finalRun() {
		if (await this.done(), !h(this, ti, "f")) throw Error("Final run was not received.");
		return h(this, ti, "f");
	}
	async _createThreadAssistantStream(e, t, n) {
		let r = n?.signal;
		r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort()));
		let i = {
			...t,
			stream: !0
		}, a = await e.createAndRun(i, {
			...n,
			signal: this.controller.signal
		});
		this._connected();
		for await (let e of a) h(this, H, "m", ci).call(this, e);
		if (a.controller.signal?.aborted) throw new y();
		return this._addRun(h(this, H, "m", li).call(this));
	}
	async _createAssistantStream(e, t, n, r) {
		let i = r?.signal;
		i && (i.aborted && this.controller.abort(), i.addEventListener("abort", () => this.controller.abort()));
		let a = {
			...n,
			stream: !0
		}, o = await e.create(t, a, {
			...r,
			signal: this.controller.signal
		});
		this._connected();
		for await (let e of o) h(this, H, "m", ci).call(this, e);
		if (o.controller.signal?.aborted) throw new y();
		return this._addRun(h(this, H, "m", li).call(this));
	}
	static accumulateDelta(e, t) {
		for (let [n, r] of Object.entries(t)) {
			if (!e.hasOwnProperty(n)) {
				e[n] = r;
				continue;
			}
			let t = e[n];
			if (t == null) {
				e[n] = r;
				continue;
			}
			if (n === "index" || n === "type") {
				e[n] = r;
				continue;
			}
			if (typeof t == "string" && typeof r == "string") t += r;
			else if (typeof t == "number" && typeof r == "number") t += r;
			else if (Se(t) && Se(r)) t = this.accumulateDelta(t, r);
			else if (Array.isArray(t) && Array.isArray(r)) {
				if (t.every((e) => typeof e == "string" || typeof e == "number")) {
					t.push(...r);
					continue;
				}
				for (let e of r) {
					if (!Se(e)) throw Error(`Expected array delta entry to be an object but got: ${e}`);
					let n = e.index;
					if (n == null) throw console.error(e), Error("Expected array delta entry to have an `index` property");
					if (typeof n != "number") throw Error(`Expected array delta entry \`index\` property to be a number but got ${n}`);
					let r = t[n];
					r == null ? t.push(e) : t[n] = this.accumulateDelta(r, e);
				}
				continue;
			} else throw Error(`Unhandled record type: ${n}, deltaValue: ${r}, accValue: ${t}`);
			e[n] = t;
		}
		return e;
	}
	_addRun(e) {
		return e;
	}
	async _threadAssistantStream(e, t, n) {
		return await this._createThreadAssistantStream(t, e, n);
	}
	async _runAssistantStream(e, t, n, r) {
		return await this._createAssistantStream(t, e, n, r);
	}
	async _runToolAssistantStream(e, t, n, r) {
		return await this._createToolAssistantStream(t, e, n, r);
	}
};
Qr = _i, ci = function(e) {
	if (!this.ended) switch (m(this, ai, e, "f"), h(this, H, "m", fi).call(this, e), e.event) {
		case "thread.created": break;
		case "thread.run.created":
		case "thread.run.queued":
		case "thread.run.in_progress":
		case "thread.run.requires_action":
		case "thread.run.completed":
		case "thread.run.incomplete":
		case "thread.run.failed":
		case "thread.run.cancelling":
		case "thread.run.cancelled":
		case "thread.run.expired":
			h(this, H, "m", gi).call(this, e);
			break;
		case "thread.run.step.created":
		case "thread.run.step.in_progress":
		case "thread.run.step.delta":
		case "thread.run.step.completed":
		case "thread.run.step.failed":
		case "thread.run.step.cancelled":
		case "thread.run.step.expired":
			h(this, H, "m", di).call(this, e);
			break;
		case "thread.message.created":
		case "thread.message.in_progress":
		case "thread.message.delta":
		case "thread.message.completed":
		case "thread.message.incomplete":
			h(this, H, "m", ui).call(this, e);
			break;
		case "error": throw Error("Encountered an error event in event processing - errors should be processed earlier");
		default:
	}
}, li = function() {
	if (this.ended) throw new _("stream has ended, this shouldn't happen");
	if (!h(this, ti, "f")) throw Error("Final run has not been received");
	return h(this, ti, "f");
}, ui = function(e) {
	let [t, n] = h(this, H, "m", mi).call(this, e, h(this, W, "f"));
	m(this, W, t, "f"), h(this, ei, "f")[t.id] = t;
	for (let e of n) {
		let n = t.content[e.index];
		n?.type == "text" && this._emit("textCreated", n.text);
	}
	switch (e.event) {
		case "thread.message.created":
			this._emit("messageCreated", e.data);
			break;
		case "thread.message.in_progress": break;
		case "thread.message.delta":
			if (this._emit("messageDelta", e.data.delta, t), e.data.delta.content) for (let n of e.data.delta.content) {
				if (n.type == "text" && n.text) {
					let e = n.text, r = t.content[n.index];
					if (r && r.type == "text") this._emit("textDelta", e, r.text);
					else throw Error("The snapshot associated with this text delta is not text or missing");
				}
				if (n.index != h(this, ni, "f")) {
					if (h(this, ri, "f")) switch (h(this, ri, "f").type) {
						case "text":
							this._emit("textDone", h(this, ri, "f").text, h(this, W, "f"));
							break;
						case "image_file":
							this._emit("imageFileDone", h(this, ri, "f").image_file, h(this, W, "f"));
							break;
					}
					m(this, ni, n.index, "f");
				}
				m(this, ri, t.content[n.index], "f");
			}
			break;
		case "thread.message.completed":
		case "thread.message.incomplete":
			if (h(this, ni, "f") !== void 0) {
				let t = e.data.content[h(this, ni, "f")];
				if (t) switch (t.type) {
					case "image_file":
						this._emit("imageFileDone", t.image_file, h(this, W, "f"));
						break;
					case "text":
						this._emit("textDone", t.text, h(this, W, "f"));
						break;
				}
			}
			h(this, W, "f") && this._emit("messageDone", e.data), m(this, W, void 0, "f");
	}
}, di = function(e) {
	let t = h(this, H, "m", pi).call(this, e);
	switch (m(this, si, t, "f"), e.event) {
		case "thread.run.step.created":
			this._emit("runStepCreated", e.data);
			break;
		case "thread.run.step.delta":
			let n = e.data.delta;
			if (n.step_details && n.step_details.type == "tool_calls" && n.step_details.tool_calls && t.step_details.type == "tool_calls") for (let e of n.step_details.tool_calls) e.index == h(this, ii, "f") ? this._emit("toolCallDelta", e, t.step_details.tool_calls[e.index]) : (h(this, G, "f") && this._emit("toolCallDone", h(this, G, "f")), m(this, ii, e.index, "f"), m(this, G, t.step_details.tool_calls[e.index], "f"), h(this, G, "f") && this._emit("toolCallCreated", h(this, G, "f")));
			this._emit("runStepDelta", e.data.delta, t);
			break;
		case "thread.run.step.completed":
		case "thread.run.step.failed":
		case "thread.run.step.cancelled":
		case "thread.run.step.expired":
			m(this, si, void 0, "f"), e.data.step_details.type == "tool_calls" && h(this, G, "f") && (this._emit("toolCallDone", h(this, G, "f")), m(this, G, void 0, "f")), this._emit("runStepDone", e.data, t);
			break;
		case "thread.run.step.in_progress": break;
	}
}, fi = function(e) {
	h(this, $r, "f").push(e), this._emit("event", e);
}, pi = function(e) {
	switch (e.event) {
		case "thread.run.step.created": return h(this, U, "f")[e.data.id] = e.data, e.data;
		case "thread.run.step.delta":
			let t = h(this, U, "f")[e.data.id];
			if (!t) throw Error("Received a RunStepDelta before creation of a snapshot");
			let n = e.data;
			if (n.delta) {
				let r = Qr.accumulateDelta(t, n.delta);
				h(this, U, "f")[e.data.id] = r;
			}
			return h(this, U, "f")[e.data.id];
		case "thread.run.step.completed":
		case "thread.run.step.failed":
		case "thread.run.step.cancelled":
		case "thread.run.step.expired":
		case "thread.run.step.in_progress":
			h(this, U, "f")[e.data.id] = e.data;
			break;
	}
	if (h(this, U, "f")[e.data.id]) return h(this, U, "f")[e.data.id];
	throw Error("No snapshot available");
}, mi = function(e, t) {
	let n = [];
	switch (e.event) {
		case "thread.message.created": return [e.data, n];
		case "thread.message.delta":
			if (!t) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
			let r = e.data;
			if (r.delta.content) for (let e of r.delta.content) if (e.index in t.content) {
				let n = t.content[e.index];
				t.content[e.index] = h(this, H, "m", hi).call(this, e, n);
			} else t.content[e.index] = e, n.push(e);
			return [t, n];
		case "thread.message.in_progress":
		case "thread.message.completed":
		case "thread.message.incomplete":
			if (t) return [t, n];
			throw Error("Received thread message event with no existing snapshot");
	}
	throw Error("Tried to accumulate a non-message event");
}, hi = function(e, t) {
	return Qr.accumulateDelta(t, e);
}, gi = function(e) {
	switch (m(this, oi, e.data, "f"), e.event) {
		case "thread.run.created": break;
		case "thread.run.queued": break;
		case "thread.run.in_progress": break;
		case "thread.run.requires_action":
		case "thread.run.cancelled":
		case "thread.run.failed":
		case "thread.run.completed":
		case "thread.run.expired":
		case "thread.run.incomplete":
			m(this, ti, e.data, "f"), h(this, G, "f") && (this._emit("toolCallDone", h(this, G, "f")), m(this, G, void 0, "f"));
			break;
		case "thread.run.cancelling": break;
	}
};
//#endregion
//#region node_modules/openai/resources/beta/threads/runs/runs.mjs
var vi = class extends j {
	constructor() {
		super(...arguments), this.steps = new Yr(this._client);
	}
	create(e, t, n) {
		let { include: r, ...i } = t;
		return this._client.post(M`/threads/${e}/runs`, {
			query: { include: r },
			body: i,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			stream: t.stream ?? !1,
			__synthesizeEventData: !0,
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { thread_id: r } = t;
		return this._client.get(M`/threads/${r}/runs/${e}`, {
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	update(e, t, n) {
		let { thread_id: r, ...i } = t;
		return this._client.post(M`/threads/${r}/runs/${e}`, {
			body: i,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/threads/${e}/runs`, D, {
			query: t,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	cancel(e, t, n) {
		let { thread_id: r } = t;
		return this._client.post(M`/threads/${r}/runs/${e}/cancel`, {
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	async createAndPoll(e, t, n) {
		let r = await this.create(e, t, n);
		return await this.poll(r.id, { thread_id: e }, n);
	}
	createAndStream(e, t, n) {
		return _i.createAssistantStream(e, this._client.beta.threads.runs, t, n);
	}
	async poll(e, t, n) {
		let r = V([n?.headers, {
			"X-Stainless-Poll-Helper": "true",
			"X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
		}]);
		for (;;) {
			let { data: i, response: a } = await this.retrieve(e, t, {
				...n,
				headers: {
					...n?.headers,
					...r
				}
			}).withResponse();
			switch (i.status) {
				case "queued":
				case "in_progress":
				case "cancelling":
					let e = 5e3;
					if (n?.pollIntervalMs) e = n.pollIntervalMs;
					else {
						let t = a.headers.get("openai-poll-after-ms");
						if (t) {
							let n = parseInt(t);
							isNaN(n) || (e = n);
						}
					}
					await Te(e);
					break;
				case "requires_action":
				case "incomplete":
				case "cancelled":
				case "completed":
				case "failed":
				case "expired": return i;
			}
		}
	}
	stream(e, t, n) {
		return _i.createAssistantStream(e, this._client.beta.threads.runs, t, n);
	}
	submitToolOutputs(e, t, n) {
		let { thread_id: r, ...i } = t;
		return this._client.post(M`/threads/${r}/runs/${e}/submit_tool_outputs`, {
			body: i,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			stream: t.stream ?? !1,
			__synthesizeEventData: !0,
			__security: { bearerAuth: !0 }
		});
	}
	async submitToolOutputsAndPoll(e, t, n) {
		let r = await this.submitToolOutputs(e, t, n);
		return await this.poll(r.id, t, n);
	}
	submitToolOutputsStream(e, t, n) {
		return _i.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
	}
};
vi.Steps = Yr;
//#endregion
//#region node_modules/openai/resources/beta/threads/threads.mjs
var yi = class extends j {
	constructor() {
		super(...arguments), this.runs = new vi(this._client), this.messages = new Jr(this._client);
	}
	create(e = {}, t) {
		return this._client.post("/threads", {
			body: e,
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/threads/${e}`, {
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/threads/${e}`, {
			body: t,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/threads/${e}`, {
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	createAndRun(e, t) {
		return this._client.post("/threads/runs", {
			body: e,
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			stream: e.stream ?? !1,
			__synthesizeEventData: !0,
			__security: { bearerAuth: !0 }
		});
	}
	async createAndRunPoll(e, t) {
		let n = await this.createAndRun(e, t);
		return await this.runs.poll(n.id, { thread_id: n.thread_id }, t);
	}
	createAndRunStream(e, t) {
		return _i.createThreadAssistantStream(e, this._client.beta.threads, t);
	}
};
yi.Runs = vi, yi.Messages = Jr;
//#endregion
//#region node_modules/openai/resources/beta/beta.mjs
var bi = class extends j {
	constructor() {
		super(...arguments), this.realtime = new Wr(this._client), this.chatkit = new qr(this._client), this.assistants = new Vr(this._client), this.threads = new yi(this._client);
	}
};
bi.Realtime = Wr, bi.ChatKit = qr, bi.Assistants = Vr, bi.Threads = yi;
//#endregion
//#region node_modules/openai/resources/completions.mjs
var xi = class extends j {
	create(e, t) {
		return this._client.post("/completions", {
			body: e,
			...t,
			stream: e.stream ?? !1,
			__security: { bearerAuth: !0 }
		});
	}
}, Si = class extends j {
	retrieve(e, t, n) {
		let { container_id: r } = t;
		return this._client.get(M`/containers/${r}/files/${e}/content`, {
			...n,
			headers: V([{ Accept: "application/binary" }, n?.headers]),
			__security: { bearerAuth: !0 },
			__binaryResponse: !0
		});
	}
}, Ci = class extends j {
	constructor() {
		super(...arguments), this.content = new Si(this._client);
	}
	create(e, t, n) {
		return this._client.post(M`/containers/${e}/files`, Bt({
			body: t,
			...n,
			__security: { bearerAuth: !0 }
		}, this._client));
	}
	retrieve(e, t, n) {
		let { container_id: r } = t;
		return this._client.get(M`/containers/${r}/files/${e}`, {
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/containers/${e}/files`, D, {
			query: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { container_id: r } = t;
		return this._client.delete(M`/containers/${r}/files/${e}`, {
			...n,
			headers: V([{ Accept: "*/*" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
};
Ci.Content = Si;
//#endregion
//#region node_modules/openai/resources/containers/containers.mjs
var wi = class extends j {
	constructor() {
		super(...arguments), this.files = new Ci(this._client);
	}
	create(e, t) {
		return this._client.post("/containers", {
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/containers/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/containers", D, {
			query: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/containers/${e}`, {
			...t,
			headers: V([{ Accept: "*/*" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
};
wi.Files = Ci;
//#endregion
//#region node_modules/openai/resources/conversations/items.mjs
var Ti = class extends j {
	create(e, t, n) {
		let { include: r, ...i } = t;
		return this._client.post(M`/conversations/${e}/items`, {
			query: { include: r },
			body: i,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { conversation_id: r, ...i } = t;
		return this._client.get(M`/conversations/${r}/items/${e}`, {
			query: i,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/conversations/${e}/items`, O, {
			query: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { conversation_id: r } = t;
		return this._client.delete(M`/conversations/${r}/items/${e}`, {
			...n,
			__security: { bearerAuth: !0 }
		});
	}
}, Ei = class extends j {
	constructor() {
		super(...arguments), this.items = new Ti(this._client);
	}
	create(e = {}, t) {
		return this._client.post("/conversations", {
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/conversations/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/conversations/${e}`, {
			body: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/conversations/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
};
Ei.Items = Ti;
//#endregion
//#region node_modules/openai/resources/embeddings.mjs
var Di = class extends j {
	create(e, t) {
		let n = !!e.encoding_format, r = n ? e.encoding_format : "base64";
		n && E(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
		let i = this._client.post("/embeddings", {
			body: {
				...e,
				encoding_format: r
			},
			...t,
			__security: { bearerAuth: !0 }
		});
		return n ? i : (E(this._client).debug("embeddings/decoding base64 embeddings from base64"), i._thenUnwrap((e) => (e && e.data && e.data.forEach((e) => {
			let t = e.embedding;
			e.embedding = Xr(t);
		}), e)));
	}
}, Oi = class extends j {
	retrieve(e, t, n) {
		let { eval_id: r, run_id: i } = t;
		return this._client.get(M`/evals/${r}/runs/${i}/output_items/${e}`, {
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	list(e, t, n) {
		let { eval_id: r, ...i } = t;
		return this._client.getAPIList(M`/evals/${r}/runs/${e}/output_items`, D, {
			query: i,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
}, ki = class extends j {
	constructor() {
		super(...arguments), this.outputItems = new Oi(this._client);
	}
	create(e, t, n) {
		return this._client.post(M`/evals/${e}/runs`, {
			body: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { eval_id: r } = t;
		return this._client.get(M`/evals/${r}/runs/${e}`, {
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/evals/${e}/runs`, D, {
			query: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { eval_id: r } = t;
		return this._client.delete(M`/evals/${r}/runs/${e}`, {
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	cancel(e, t, n) {
		let { eval_id: r } = t;
		return this._client.post(M`/evals/${r}/runs/${e}`, {
			...n,
			__security: { bearerAuth: !0 }
		});
	}
};
ki.OutputItems = Oi;
//#endregion
//#region node_modules/openai/resources/evals/evals.mjs
var Ai = class extends j {
	constructor() {
		super(...arguments), this.runs = new ki(this._client);
	}
	create(e, t) {
		return this._client.post("/evals", {
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/evals/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/evals/${e}`, {
			body: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/evals", D, {
			query: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/evals/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
};
Ai.Runs = ki;
//#endregion
//#region node_modules/openai/resources/files.mjs
var ji = class extends j {
	create(e, t) {
		return this._client.post("/files", A({
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		}, this._client));
	}
	retrieve(e, t) {
		return this._client.get(M`/files/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/files", D, {
			query: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/files/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	content(e, t) {
		return this._client.get(M`/files/${e}/content`, {
			...t,
			headers: V([{ Accept: "application/binary" }, t?.headers]),
			__security: { bearerAuth: !0 },
			__binaryResponse: !0
		});
	}
	async waitForProcessing(e, { pollInterval: t = 5e3, maxWait: n = 1800 * 1e3 } = {}) {
		let r = new Set([
			"processed",
			"error",
			"deleted"
		]), i = Date.now(), a = await this.retrieve(e);
		for (; !a.status || !r.has(a.status);) if (await Te(t), a = await this.retrieve(e), Date.now() - i > n) throw new b({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
		return a;
	}
}, Mi = class extends j {}, Ni = class extends j {
	run(e, t) {
		return this._client.post("/fine_tuning/alpha/graders/run", {
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	validate(e, t) {
		return this._client.post("/fine_tuning/alpha/graders/validate", {
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
}, Pi = class extends j {
	constructor() {
		super(...arguments), this.graders = new Ni(this._client);
	}
};
Pi.Graders = Ni;
//#endregion
//#region node_modules/openai/resources/fine-tuning/checkpoints/permissions.mjs
var Fi = class extends j {
	create(e, t, n) {
		return this._client.getAPIList(M`/fine_tuning/checkpoints/${e}/permissions`, Mt, {
			body: t,
			method: "post",
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	retrieve(e, t = {}, n) {
		return this._client.get(M`/fine_tuning/checkpoints/${e}/permissions`, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/fine_tuning/checkpoints/${e}/permissions`, O, {
			query: t,
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { fine_tuned_model_checkpoint: r } = t;
		return this._client.delete(M`/fine_tuning/checkpoints/${r}/permissions/${e}`, {
			...n,
			__security: { adminAPIKeyAuth: !0 }
		});
	}
}, Ii = class extends j {
	constructor() {
		super(...arguments), this.permissions = new Fi(this._client);
	}
};
Ii.Permissions = Fi;
//#endregion
//#region node_modules/openai/resources/fine-tuning/jobs/checkpoints.mjs
var Li = class extends j {
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/fine_tuning/jobs/${e}/checkpoints`, D, {
			query: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
}, Ri = class extends j {
	constructor() {
		super(...arguments), this.checkpoints = new Li(this._client);
	}
	create(e, t) {
		return this._client.post("/fine_tuning/jobs", {
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/fine_tuning/jobs/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/fine_tuning/jobs", D, {
			query: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	cancel(e, t) {
		return this._client.post(M`/fine_tuning/jobs/${e}/cancel`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	listEvents(e, t = {}, n) {
		return this._client.getAPIList(M`/fine_tuning/jobs/${e}/events`, D, {
			query: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	pause(e, t) {
		return this._client.post(M`/fine_tuning/jobs/${e}/pause`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	resume(e, t) {
		return this._client.post(M`/fine_tuning/jobs/${e}/resume`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
};
Ri.Checkpoints = Li;
//#endregion
//#region node_modules/openai/resources/fine-tuning/fine-tuning.mjs
var zi = class extends j {
	constructor() {
		super(...arguments), this.methods = new Mi(this._client), this.jobs = new Ri(this._client), this.checkpoints = new Ii(this._client), this.alpha = new Pi(this._client);
	}
};
zi.Methods = Mi, zi.Jobs = Ri, zi.Checkpoints = Ii, zi.Alpha = Pi;
//#endregion
//#region node_modules/openai/resources/graders/grader-models.mjs
var Bi = class extends j {}, Vi = class extends j {
	constructor() {
		super(...arguments), this.graderModels = new Bi(this._client);
	}
};
Vi.GraderModels = Bi;
//#endregion
//#region node_modules/openai/resources/images.mjs
var Hi = class extends j {
	createVariation(e, t) {
		return this._client.post("/images/variations", A({
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		}, this._client));
	}
	edit(e, t) {
		return this._client.post("/images/edits", A({
			body: e,
			...t,
			stream: e.stream ?? !1,
			__security: { bearerAuth: !0 }
		}, this._client));
	}
	generate(e, t) {
		return this._client.post("/images/generations", {
			body: e,
			...t,
			stream: e.stream ?? !1,
			__security: { bearerAuth: !0 }
		});
	}
}, Ui = class extends j {
	retrieve(e, t) {
		return this._client.get(M`/models/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	list(e) {
		return this._client.getAPIList("/models", Mt, {
			...e,
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/models/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
}, Wi = class extends j {
	create(e, t) {
		return this._client.post("/moderations", {
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
}, Gi = class extends j {
	accept(e, t, n) {
		return this._client.post(M`/realtime/calls/${e}/accept`, {
			body: t,
			...n,
			headers: V([{ Accept: "*/*" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	hangup(e, t) {
		return this._client.post(M`/realtime/calls/${e}/hangup`, {
			...t,
			headers: V([{ Accept: "*/*" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	refer(e, t, n) {
		return this._client.post(M`/realtime/calls/${e}/refer`, {
			body: t,
			...n,
			headers: V([{ Accept: "*/*" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	reject(e, t = {}, n) {
		return this._client.post(M`/realtime/calls/${e}/reject`, {
			body: t,
			...n,
			headers: V([{ Accept: "*/*" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
}, Ki = class extends j {
	create(e, t) {
		return this._client.post("/realtime/client_secrets", {
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
}, qi = class extends j {
	constructor() {
		super(...arguments), this.clientSecrets = new Ki(this._client), this.calls = new Gi(this._client);
	}
};
qi.ClientSecrets = Ki, qi.Calls = Gi;
//#endregion
//#region node_modules/openai/lib/ResponsesParser.mjs
function Ji(e, t) {
	return !t || !Zi(t) ? {
		...e,
		output_parsed: null,
		output: e.output.map((e) => e.type === "function_call" ? {
			...e,
			parsed_arguments: null
		} : e.type === "message" ? {
			...e,
			content: e.content.map((e) => ({
				...e,
				parsed: null
			}))
		} : e)
	} : Yi(e, t);
}
function Yi(e, t) {
	let n = e.output.map((e) => {
		if (e.type === "function_call") return {
			...e,
			parsed_arguments: ea(t, e)
		};
		if (e.type === "message") {
			let n = e.content.map((e) => e.type === "output_text" ? {
				...e,
				parsed: Xi(t, e.text)
			} : e);
			return {
				...e,
				content: n
			};
		}
		return e;
	}), r = Object.assign({}, e, { output: n });
	return Object.getOwnPropertyDescriptor(e, "output_text") || ta(r), Object.defineProperty(r, "output_parsed", {
		enumerable: !0,
		get() {
			for (let e of r.output) if (e.type === "message") {
				for (let t of e.content) if (t.type === "output_text" && t.parsed !== null) return t.parsed;
			}
			return null;
		}
	}), r;
}
function Xi(e, t) {
	return e.text?.format?.type === "json_schema" ? "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t) : null;
}
function Zi(e) {
	return !!an(e.text?.format);
}
function Qi(e) {
	return e?.$brand === "auto-parseable-tool";
}
function $i(e, t) {
	return e.find((e) => e.type === "function" && e.name === t);
}
function ea(e, t) {
	let n = $i(e.tools ?? [], t.name);
	return {
		...t,
		...t,
		parsed_arguments: Qi(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
	};
}
function ta(e) {
	let t = [];
	for (let n of e.output) if (n.type === "message") for (let e of n.content) e.type === "output_text" && t.push(e.text);
	e.output_text = t.join("");
}
//#endregion
//#region node_modules/openai/lib/responses/ResponseStream.mjs
var na, ra, ia, aa, oa, sa, ca, la, ua = class e extends kn {
	constructor(e) {
		super(), na.add(this), ra.set(this, void 0), ia.set(this, void 0), aa.set(this, void 0), m(this, ra, e, "f");
	}
	static createResponse(t, n, r) {
		let i = new e(n);
		return i._run(() => i._createOrRetrieveResponse(t, n, {
			...r,
			headers: {
				...r?.headers,
				"X-Stainless-Helper-Method": "stream"
			}
		})), i;
	}
	async _createOrRetrieveResponse(e, t, n) {
		let r = n?.signal;
		r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), h(this, na, "m", oa).call(this);
		let i, a = null;
		"response_id" in t ? (i = await e.responses.retrieve(t.response_id, { stream: !0 }, {
			...n,
			signal: this.controller.signal,
			stream: !0
		}), a = t.starting_after ?? null) : i = await e.responses.create({
			...t,
			stream: !0
		}, {
			...n,
			signal: this.controller.signal
		}), this._connected();
		for await (let e of i) h(this, na, "m", sa).call(this, e, a);
		if (i.controller.signal?.aborted) throw new y();
		return h(this, na, "m", ca).call(this);
	}
	[(ra = /* @__PURE__ */ new WeakMap(), ia = /* @__PURE__ */ new WeakMap(), aa = /* @__PURE__ */ new WeakMap(), na = /* @__PURE__ */ new WeakSet(), oa = function() {
		this.ended || m(this, ia, void 0, "f");
	}, sa = function(e, t) {
		if (this.ended) return;
		let n = (e, n) => {
			(t == null || n.sequence_number > t) && this._emit(e, n);
		}, r = h(this, na, "m", la).call(this, e);
		switch (n("event", e), e.type) {
			case "response.output_text.delta": {
				let t = r.output[e.output_index];
				if (!t) throw new _(`missing output at index ${e.output_index}`);
				if (t.type === "message") {
					let r = t.content[e.content_index];
					if (!r) throw new _(`missing content at index ${e.content_index}`);
					if (r.type !== "output_text") throw new _(`expected content to be 'output_text', got ${r.type}`);
					n("response.output_text.delta", {
						...e,
						snapshot: r.text
					});
				}
				break;
			}
			case "response.function_call_arguments.delta": {
				let t = r.output[e.output_index];
				if (!t) throw new _(`missing output at index ${e.output_index}`);
				t.type === "function_call" && n("response.function_call_arguments.delta", {
					...e,
					snapshot: t.arguments
				});
				break;
			}
			default:
				n(e.type, e);
				break;
		}
	}, ca = function() {
		if (this.ended) throw new _("stream has ended, this shouldn't happen");
		let e = h(this, ia, "f");
		if (!e) throw new _("request ended without sending any events");
		m(this, ia, void 0, "f");
		let t = da(e, h(this, ra, "f"));
		return m(this, aa, t, "f"), t;
	}, la = function(e) {
		let t = h(this, ia, "f");
		if (!t) {
			if (e.type !== "response.created") throw new _(`When snapshot hasn't been set yet, expected 'response.created' event, got ${e.type}`);
			return t = m(this, ia, e.response, "f"), t;
		}
		switch (e.type) {
			case "response.output_item.added":
				t.output.push(e.item);
				break;
			case "response.content_part.added": {
				let n = t.output[e.output_index];
				if (!n) throw new _(`missing output at index ${e.output_index}`);
				let r = n.type, i = e.part;
				r === "message" && i.type !== "reasoning_text" ? n.content.push(i) : r === "reasoning" && i.type === "reasoning_text" && (n.content ||= [], n.content.push(i));
				break;
			}
			case "response.output_text.delta": {
				let n = t.output[e.output_index];
				if (!n) throw new _(`missing output at index ${e.output_index}`);
				if (n.type === "message") {
					let t = n.content[e.content_index];
					if (!t) throw new _(`missing content at index ${e.content_index}`);
					if (t.type !== "output_text") throw new _(`expected content to be 'output_text', got ${t.type}`);
					t.text += e.delta;
				}
				break;
			}
			case "response.function_call_arguments.delta": {
				let n = t.output[e.output_index];
				if (!n) throw new _(`missing output at index ${e.output_index}`);
				n.type === "function_call" && (n.arguments += e.delta);
				break;
			}
			case "response.reasoning_text.delta": {
				let n = t.output[e.output_index];
				if (!n) throw new _(`missing output at index ${e.output_index}`);
				if (n.type === "reasoning") {
					let t = n.content?.[e.content_index];
					if (!t) throw new _(`missing content at index ${e.content_index}`);
					if (t.type !== "reasoning_text") throw new _(`expected content to be 'reasoning_text', got ${t.type}`);
					t.text += e.delta;
				}
				break;
			}
			case "response.completed":
				m(this, ia, e.response, "f");
				break;
		}
		return t;
	}, Symbol.asyncIterator)]() {
		let e = [], t = [], n = !1;
		return this.on("event", (n) => {
			let r = t.shift();
			r ? r.resolve(n) : e.push(n);
		}), this.on("end", () => {
			n = !0;
			for (let e of t) e.resolve(void 0);
			t.length = 0;
		}), this.on("abort", (e) => {
			n = !0;
			for (let n of t) n.reject(e);
			t.length = 0;
		}), this.on("error", (e) => {
			n = !0;
			for (let n of t) n.reject(e);
			t.length = 0;
		}), {
			next: async () => e.length ? {
				value: e.shift(),
				done: !1
			} : n ? {
				value: void 0,
				done: !0
			} : new Promise((e, n) => t.push({
				resolve: e,
				reject: n
			})).then((e) => e ? {
				value: e,
				done: !1
			} : {
				value: void 0,
				done: !0
			}),
			return: async () => (this.abort(), {
				value: void 0,
				done: !0
			})
		};
	}
	async finalResponse() {
		await this.done();
		let e = h(this, aa, "f");
		if (!e) throw new _("stream ended without producing a ChatCompletion");
		return e;
	}
};
function da(e, t) {
	return Ji(e, t);
}
//#endregion
//#region node_modules/openai/resources/responses/input-items.mjs
var fa = class extends j {
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/responses/${e}/input_items`, D, {
			query: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
}, pa = class extends j {
	count(e = {}, t) {
		return this._client.post("/responses/input_tokens", {
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
}, ma = class extends j {
	constructor() {
		super(...arguments), this.inputItems = new fa(this._client), this.inputTokens = new pa(this._client);
	}
	create(e, t) {
		return this._client.post("/responses", {
			body: e,
			...t,
			stream: e.stream ?? !1,
			__security: { bearerAuth: !0 }
		})._thenUnwrap((e) => ("object" in e && e.object === "response" && ta(e), e));
	}
	retrieve(e, t = {}, n) {
		return this._client.get(M`/responses/${e}`, {
			query: t,
			...n,
			stream: t?.stream ?? !1,
			__security: { bearerAuth: !0 }
		})._thenUnwrap((e) => ("object" in e && e.object === "response" && ta(e), e));
	}
	delete(e, t) {
		return this._client.delete(M`/responses/${e}`, {
			...t,
			headers: V([{ Accept: "*/*" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	parse(e, t) {
		return this._client.responses.create(e, t)._thenUnwrap((t) => Yi(t, e));
	}
	stream(e, t) {
		return ua.createResponse(this._client, e, t);
	}
	cancel(e, t) {
		return this._client.post(M`/responses/${e}/cancel`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	compact(e, t) {
		return this._client.post("/responses/compact", {
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
};
ma.InputItems = fa, ma.InputTokens = pa;
//#endregion
//#region node_modules/openai/resources/skills/content.mjs
var ha = class extends j {
	retrieve(e, t) {
		return this._client.get(M`/skills/${e}/content`, {
			...t,
			headers: V([{ Accept: "application/binary" }, t?.headers]),
			__security: { bearerAuth: !0 },
			__binaryResponse: !0
		});
	}
}, ga = class extends j {
	retrieve(e, t, n) {
		let { skill_id: r } = t;
		return this._client.get(M`/skills/${r}/versions/${e}/content`, {
			...n,
			headers: V([{ Accept: "application/binary" }, n?.headers]),
			__security: { bearerAuth: !0 },
			__binaryResponse: !0
		});
	}
}, _a = class extends j {
	constructor() {
		super(...arguments), this.content = new ga(this._client);
	}
	create(e, t = {}, n) {
		return this._client.post(M`/skills/${e}/versions`, Bt({
			body: t,
			...n,
			__security: { bearerAuth: !0 }
		}, this._client));
	}
	retrieve(e, t, n) {
		let { skill_id: r } = t;
		return this._client.get(M`/skills/${r}/versions/${e}`, {
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/skills/${e}/versions`, D, {
			query: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { skill_id: r } = t;
		return this._client.delete(M`/skills/${r}/versions/${e}`, {
			...n,
			__security: { bearerAuth: !0 }
		});
	}
};
_a.Content = ga;
//#endregion
//#region node_modules/openai/resources/skills/skills.mjs
var va = class extends j {
	constructor() {
		super(...arguments), this.content = new ha(this._client), this.versions = new _a(this._client);
	}
	create(e = {}, t) {
		return this._client.post("/skills", Bt({
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		}, this._client));
	}
	retrieve(e, t) {
		return this._client.get(M`/skills/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/skills/${e}`, {
			body: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/skills", D, {
			query: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/skills/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
};
va.Content = ha, va.Versions = _a;
//#endregion
//#region node_modules/openai/resources/uploads/parts.mjs
var ya = class extends j {
	create(e, t, n) {
		return this._client.post(M`/uploads/${e}/parts`, A({
			body: t,
			...n,
			__security: { bearerAuth: !0 }
		}, this._client));
	}
}, ba = class extends j {
	constructor() {
		super(...arguments), this.parts = new ya(this._client);
	}
	create(e, t) {
		return this._client.post("/uploads", {
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	cancel(e, t) {
		return this._client.post(M`/uploads/${e}/cancel`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	complete(e, t, n) {
		return this._client.post(M`/uploads/${e}/complete`, {
			body: t,
			...n,
			__security: { bearerAuth: !0 }
		});
	}
};
ba.Parts = ya;
//#endregion
//#region node_modules/openai/lib/Util.mjs
var xa = async (e) => {
	let t = await Promise.allSettled(e), n = t.filter((e) => e.status === "rejected");
	if (n.length) {
		for (let e of n) console.error(e.reason);
		throw Error(`${n.length} promise(s) failed - see the above errors`);
	}
	let r = [];
	for (let e of t) e.status === "fulfilled" && r.push(e.value);
	return r;
}, Sa = class extends j {
	create(e, t, n) {
		return this._client.post(M`/vector_stores/${e}/file_batches`, {
			body: t,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { vector_store_id: r } = t;
		return this._client.get(M`/vector_stores/${r}/file_batches/${e}`, {
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	cancel(e, t, n) {
		let { vector_store_id: r } = t;
		return this._client.post(M`/vector_stores/${r}/file_batches/${e}/cancel`, {
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	async createAndPoll(e, t, n) {
		let r = await this.create(e, t);
		return await this.poll(e, r.id, n);
	}
	listFiles(e, t, n) {
		let { vector_store_id: r, ...i } = t;
		return this._client.getAPIList(M`/vector_stores/${r}/file_batches/${e}/files`, D, {
			query: i,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	async poll(e, t, n) {
		let r = V([n?.headers, {
			"X-Stainless-Poll-Helper": "true",
			"X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
		}]);
		for (;;) {
			let { data: i, response: a } = await this.retrieve(t, { vector_store_id: e }, {
				...n,
				headers: r
			}).withResponse();
			switch (i.status) {
				case "in_progress":
					let e = 5e3;
					if (n?.pollIntervalMs) e = n.pollIntervalMs;
					else {
						let t = a.headers.get("openai-poll-after-ms");
						if (t) {
							let n = parseInt(t);
							isNaN(n) || (e = n);
						}
					}
					await Te(e);
					break;
				case "failed":
				case "cancelled":
				case "completed": return i;
			}
		}
	}
	async uploadAndPoll(e, { files: t, fileIds: n = [] }, r) {
		if (t == null || t.length == 0) throw Error("No `files` provided to process. If you've already uploaded files you should use `.createAndPoll()` instead");
		let i = r?.maxConcurrency ?? 5, a = Math.min(i, t.length), o = this._client, s = t.values(), c = [...n];
		async function l(e) {
			for (let t of e) {
				let e = await o.files.create({
					file: t,
					purpose: "assistants"
				}, r);
				c.push(e.id);
			}
		}
		return await xa(Array(a).fill(s).map(l)), await this.createAndPoll(e, { file_ids: c });
	}
}, Ca = class extends j {
	create(e, t, n) {
		return this._client.post(M`/vector_stores/${e}/files`, {
			body: t,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t, n) {
		let { vector_store_id: r } = t;
		return this._client.get(M`/vector_stores/${r}/files/${e}`, {
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	update(e, t, n) {
		let { vector_store_id: r, ...i } = t;
		return this._client.post(M`/vector_stores/${r}/files/${e}`, {
			body: i,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	list(e, t = {}, n) {
		return this._client.getAPIList(M`/vector_stores/${e}/files`, D, {
			query: t,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t, n) {
		let { vector_store_id: r } = t;
		return this._client.delete(M`/vector_stores/${r}/files/${e}`, {
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	async createAndPoll(e, t, n) {
		let r = await this.create(e, t, n);
		return await this.poll(e, r.id, n);
	}
	async poll(e, t, n) {
		let r = V([n?.headers, {
			"X-Stainless-Poll-Helper": "true",
			"X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
		}]);
		for (;;) {
			let i = await this.retrieve(t, { vector_store_id: e }, {
				...n,
				headers: r
			}).withResponse(), a = i.data;
			switch (a.status) {
				case "in_progress":
					let e = 5e3;
					if (n?.pollIntervalMs) e = n.pollIntervalMs;
					else {
						let t = i.response.headers.get("openai-poll-after-ms");
						if (t) {
							let n = parseInt(t);
							isNaN(n) || (e = n);
						}
					}
					await Te(e);
					break;
				case "failed":
				case "completed": return a;
			}
		}
	}
	async upload(e, t, n) {
		let r = await this._client.files.create({
			file: t,
			purpose: "assistants"
		}, n);
		return this.create(e, { file_id: r.id }, n);
	}
	async uploadAndPoll(e, t, n) {
		let r = await this.upload(e, t, n);
		return await this.poll(e, r.id, n);
	}
	content(e, t, n) {
		let { vector_store_id: r } = t;
		return this._client.getAPIList(M`/vector_stores/${r}/files/${e}/content`, Mt, {
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
}, wa = class extends j {
	constructor() {
		super(...arguments), this.files = new Ca(this._client), this.fileBatches = new Sa(this._client);
	}
	create(e, t) {
		return this._client.post("/vector_stores", {
			body: e,
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	retrieve(e, t) {
		return this._client.get(M`/vector_stores/${e}`, {
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	update(e, t, n) {
		return this._client.post(M`/vector_stores/${e}`, {
			body: t,
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/vector_stores", D, {
			query: e,
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/vector_stores/${e}`, {
			...t,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
	search(e, t, n) {
		return this._client.getAPIList(M`/vector_stores/${e}/search`, Mt, {
			body: t,
			method: "post",
			...n,
			headers: V([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
			__security: { bearerAuth: !0 }
		});
	}
};
wa.Files = Ca, wa.FileBatches = Sa;
//#endregion
//#region node_modules/openai/resources/videos.mjs
var Ta = class extends j {
	create(e, t) {
		return this._client.post("/videos", A({
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		}, this._client));
	}
	retrieve(e, t) {
		return this._client.get(M`/videos/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	list(e = {}, t) {
		return this._client.getAPIList("/videos", O, {
			query: e,
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	delete(e, t) {
		return this._client.delete(M`/videos/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	createCharacter(e, t) {
		return this._client.post("/videos/characters", A({
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		}, this._client));
	}
	downloadContent(e, t = {}, n) {
		return this._client.get(M`/videos/${e}/content`, {
			query: t,
			...n,
			headers: V([{ Accept: "application/binary" }, n?.headers]),
			__security: { bearerAuth: !0 },
			__binaryResponse: !0
		});
	}
	edit(e, t) {
		return this._client.post("/videos/edits", A({
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		}, this._client));
	}
	extend(e, t) {
		return this._client.post("/videos/extensions", A({
			body: e,
			...t,
			__security: { bearerAuth: !0 }
		}, this._client));
	}
	getCharacter(e, t) {
		return this._client.get(M`/videos/characters/${e}`, {
			...t,
			__security: { bearerAuth: !0 }
		});
	}
	remix(e, t, n) {
		return this._client.post(M`/videos/${e}/remix`, Bt({
			body: t,
			...n,
			__security: { bearerAuth: !0 }
		}, this._client));
	}
}, Ea, Da, Oa, ka = class extends j {
	constructor() {
		super(...arguments), Ea.add(this);
	}
	async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
		return await this.verifySignature(e, t, n, r), JSON.parse(e);
	}
	async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
		if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw Error("Webhook signature verification is only supported when the `crypto` global is defined");
		h(this, Ea, "m", Da).call(this, n);
		let i = V([t]).values, a = h(this, Ea, "m", Oa).call(this, i, "webhook-signature"), o = h(this, Ea, "m", Oa).call(this, i, "webhook-timestamp"), s = h(this, Ea, "m", Oa).call(this, i, "webhook-id"), c = parseInt(o, 10);
		if (isNaN(c)) throw new pe("Invalid webhook timestamp format");
		let l = Math.floor(Date.now() / 1e3);
		if (l - c > r) throw new pe("Webhook timestamp is too old");
		if (c > l + r) throw new pe("Webhook timestamp is too new");
		let u = a.split(" ").map((e) => e.startsWith("v1,") ? e.substring(3) : e), d = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), f = s ? `${s}.${o}.${e}` : `${o}.${e}`, p = await crypto.subtle.importKey("raw", d, {
			name: "HMAC",
			hash: "SHA-256"
		}, !1, ["verify"]);
		for (let e of u) try {
			let t = Buffer.from(e, "base64");
			if (await crypto.subtle.verify("HMAC", p, t, new TextEncoder().encode(f))) return;
		} catch {
			continue;
		}
		throw new pe("The given webhook signature does not match the expected signature");
	}
};
Ea = /* @__PURE__ */ new WeakSet(), Da = function(e) {
	if (typeof e != "string" || e.length === 0) throw Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, Oa = function(e, t) {
	if (!e) throw Error("Headers are required");
	let n = e.get(t);
	if (n == null) throw Error(`Missing required header: ${t}`);
	return n;
};
//#endregion
//#region node_modules/openai/client.mjs
var Aa, ja, Ma, Na, Pa = "workload-identity-auth", K = class {
	constructor({ baseURL: e = Zr("OPENAI_BASE_URL"), apiKey: t = Zr("OPENAI_API_KEY") ?? null, adminAPIKey: n = Zr("OPENAI_ADMIN_KEY") ?? null, organization: r = Zr("OPENAI_ORG_ID") ?? null, project: i = Zr("OPENAI_PROJECT_ID") ?? null, webhookSecret: a = Zr("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: o, ...s } = {}) {
		Aa.add(this), Ma.set(this, void 0), this.completions = new xi(this), this.chat = new or(this), this.embeddings = new Di(this), this.files = new ji(this), this.images = new Hi(this), this.audio = new zr(this), this.moderations = new Wi(this), this.models = new Ui(this), this.fineTuning = new zi(this), this.graders = new Vi(this), this.vectorStores = new wa(this), this.webhooks = new ka(this), this.beta = new bi(this), this.batches = new Br(this), this.uploads = new ba(this), this.admin = new Nr(this), this.responses = new ma(this), this.realtime = new qi(this), this.conversations = new Ei(this), this.evals = new Ai(this), this.containers = new wi(this), this.skills = new va(this), this.videos = new Ta(this);
		let c = {
			apiKey: t,
			adminAPIKey: n,
			organization: r,
			project: i,
			webhookSecret: a,
			workloadIdentity: o,
			...s,
			baseURL: e || "https://api.openai.com/v1"
		};
		if (t && o) throw new _("The `apiKey` and `workloadIdentity` options are mutually exclusive");
		if (!t && !n && !o) throw new _("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
		if (!c.dangerouslyAllowBrowser && De()) throw new _("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew OpenAI({ apiKey, dangerouslyAllowBrowser: true });\n\nhttps://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety\n");
		this.baseURL = c.baseURL, this.timeout = c.timeout ?? ja.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
		let l = "warn";
		this.logLevel = l, this.logLevel = pt(c.logLevel, "ClientOptions.logLevel", this) ?? pt(Zr("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? l, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? Fe(), m(this, Ma, Be, "f");
		let u = Zr("OPENAI_CUSTOM_HEADERS");
		if (u) {
			let e = {};
			for (let t of u.split("\n")) {
				let n = t.indexOf(":");
				n >= 0 && (e[t.substring(0, n).trim()] = t.substring(n + 1).trim());
			}
			c.defaultHeaders = V([e, c.defaultHeaders]);
		}
		this._options = c, o && (this._workloadIdentityAuth = new Ft(o, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = r, this.project = i, this.webhookSecret = a;
	}
	withOptions(e) {
		return new this.constructor({
			...this._options,
			baseURL: this.baseURL,
			maxRetries: this.maxRetries,
			timeout: this.timeout,
			logger: this.logger,
			logLevel: this.logLevel,
			fetch: this.fetch,
			fetchOptions: this.fetchOptions,
			apiKey: this._options.apiKey,
			adminAPIKey: this.adminAPIKey,
			workloadIdentity: this._options.workloadIdentity,
			organization: this.organization,
			project: this.project,
			webhookSecret: this.webhookSecret,
			...e
		});
	}
	defaultQuery() {
		return this._options.defaultQuery;
	}
	validateHeaders({ values: e, nulls: t }, n = {
		bearerAuth: !0,
		adminAPIKeyAuth: !0
	}) {
		if (!(e.get("authorization") || e.get("api-key")) && !(t.has("authorization") || t.has("api-key")) && !(this._workloadIdentityAuth && n.bearerAuth)) throw Error("Could not resolve authentication method. Expected either apiKey or adminAPIKey to be set. Or for one of the \"Authorization\" or \"api-key\" headers to be explicitly omitted");
	}
	async authHeaders(e, t = {
		bearerAuth: !0,
		adminAPIKeyAuth: !0
	}) {
		return V([t.bearerAuth ? await this.bearerAuth(e) : null, t.adminAPIKeyAuth ? await this.adminAPIKeyAuth(e) : null]);
	}
	async bearerAuth(e) {
		if (this._workloadIdentityAuth) return V([{ Authorization: `Bearer ${await this._workloadIdentityAuth.getToken()}` }]);
		if (this.apiKey != null) return V([{ Authorization: `Bearer ${this.apiKey}` }]);
	}
	async adminAPIKeyAuth(e) {
		if (this.adminAPIKey != null) return V([{ Authorization: `Bearer ${this.adminAPIKey}` }]);
	}
	stringifyQuery(e) {
		return rt(e);
	}
	getUserAgent() {
		return `${this.constructor.name}/JS ${Ee}`;
	}
	defaultIdempotencyKey() {
		return `stainless-node-retry-${ee()}`;
	}
	makeStatusError(e, t, n, r) {
		return v.generate(e, t, n, r);
	}
	async _callApiKey() {
		let e = this._options.apiKey;
		if (typeof e != "function") return !1;
		let t;
		try {
			t = await e();
		} catch (e) {
			throw e instanceof _ ? e : new _(`Failed to get token from 'apiKey' function: ${e.message}`, { cause: e });
		}
		if (typeof t != "string" || !t) throw new _(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
		return this.apiKey = t, !0;
	}
	buildURL(e, t, n) {
		let r = !h(this, Aa, "m", Na).call(this) && n || this.baseURL, i = _e(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), a = this.defaultQuery(), o = Object.fromEntries(i.searchParams);
		return (!be(a) || !be(o)) && (t = {
			...o,
			...a,
			...t
		}), typeof t == "object" && t && !Array.isArray(t) && (i.search = this.stringifyQuery(t)), i.toString();
	}
	async prepareOptions(e) {
		(e.__security ?? { bearerAuth: !0 }).bearerAuth && await this._callApiKey();
	}
	async prepareRequest(e, { url: t, options: n }) {}
	get(e, t) {
		return this.methodRequest("get", e, t);
	}
	post(e, t) {
		return this.methodRequest("post", e, t);
	}
	patch(e, t) {
		return this.methodRequest("patch", e, t);
	}
	put(e, t) {
		return this.methodRequest("put", e, t);
	}
	delete(e, t) {
		return this.methodRequest("delete", e, t);
	}
	methodRequest(e, t, n) {
		return this.request(Promise.resolve(n).then((n) => ({
			method: e,
			path: t,
			...n
		})));
	}
	request(e, t = null) {
		return new Ot(this, this.makeRequest(e, t, void 0));
	}
	async makeRequest(e, t, n) {
		let r = await e, i = r.maxRetries ?? this.maxRetries;
		t ??= i, await this.prepareOptions(r);
		let { req: a, url: o, timeout: s } = await this.buildRequest(r, { retryCount: i - t });
		await this.prepareRequest(a, {
			url: o,
			options: r
		});
		let c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), l = n === void 0 ? "" : `, retryOf: ${n}`, u = Date.now();
		if (E(this).debug(`[${c}] sending request`, vt({
			retryOfRequestLogID: n,
			method: r.method,
			url: o,
			options: r,
			headers: a.headers
		})), r.signal?.aborted) throw new y();
		let d = r.__security ?? { bearerAuth: !0 }, f = new AbortController(), p = await this.fetchWithAuth(o, a, s, f, d).catch(g), m = Date.now();
		if (p instanceof globalThis.Error) {
			let e = `retrying, ${t} attempts remaining`;
			if (r.signal?.aborted) throw new y();
			let i = te(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
			if (t) return E(this).info(`[${c}] connection ${i ? "timed out" : "failed"} - ${e}`), E(this).debug(`[${c}] connection ${i ? "timed out" : "failed"} (${e})`, vt({
				retryOfRequestLogID: n,
				url: o,
				durationMs: m - u,
				message: p.message
			})), this.retryRequest(r, t, n ?? c);
			throw E(this).info(`[${c}] connection ${i ? "timed out" : "failed"} - error; no more retries left`), E(this).debug(`[${c}] connection ${i ? "timed out" : "failed"} (error; no more retries left)`, vt({
				retryOfRequestLogID: n,
				url: o,
				durationMs: m - u,
				message: p.message
			})), p instanceof me || p instanceof he ? p : i ? new b() : new ne({
				message: Fa(p),
				cause: p
			});
		}
		let h = `[${c}${l}${[...p.headers.entries()].filter(([e]) => e === "x-request-id").map(([e, t]) => ", " + e + ": " + JSON.stringify(t)).join("")}] ${a.method} ${o} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - u}ms`;
		if (!p.ok) {
			if (p.status === 401 && this._workloadIdentityAuth && d.bearerAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed) return await ze(p.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
				...r,
				__metadata: {
					...r.__metadata,
					workloadIdentityTokenRefreshed: !0
				}
			}, t, n ?? c);
			let e = await this.shouldRetry(p);
			if (t && e) {
				let e = `retrying, ${t} attempts remaining`;
				return await ze(p.body), E(this).info(`${h} - ${e}`), E(this).debug(`[${c}] response error (${e})`, vt({
					retryOfRequestLogID: n,
					url: p.url,
					status: p.status,
					headers: p.headers,
					durationMs: m - u
				})), this.retryRequest(r, t, n ?? c, p.headers);
			}
			let i = e ? "error; no more retries left" : "error; not retryable";
			E(this).info(`${h} - ${i}`);
			let a = await p.text().catch((e) => g(e).message), o = we(a), s = o ? void 0 : a;
			throw E(this).debug(`[${c}] response error (${i})`, vt({
				retryOfRequestLogID: n,
				url: p.url,
				status: p.status,
				headers: p.headers,
				message: s,
				durationMs: Date.now() - u
			})), this.makeStatusError(p.status, o, s, p.headers);
		}
		return E(this).info(h), E(this).debug(`[${c}] response start`, vt({
			retryOfRequestLogID: n,
			url: p.url,
			status: p.status,
			headers: p.headers,
			durationMs: m - u
		})), {
			response: p,
			options: r,
			controller: f,
			requestLogID: c,
			retryOfRequestLogID: n,
			startTime: u
		};
	}
	getAPIList(e, t, n) {
		return this.requestAPIList(t, n && "then" in n ? n.then((t) => ({
			method: "get",
			path: e,
			...t
		})) : {
			method: "get",
			path: e,
			...n
		});
	}
	requestAPIList(e, t) {
		let n = this.makeRequest(t, null, void 0);
		return new jt(this, n, e);
	}
	async fetchWithAuth(e, t, n, r, i = {
		bearerAuth: !0,
		adminAPIKeyAuth: !0
	}) {
		if (this._workloadIdentityAuth && i.bearerAuth) {
			let e = t.headers, n = e.get("Authorization");
			if (!n || n === `Bearer ${Pa}`) {
				let t = await this._workloadIdentityAuth.getToken();
				e.set("Authorization", `Bearer ${t}`);
			}
		}
		return await this.fetchWithTimeout(e, t, n, r);
	}
	async fetchWithTimeout(e, t, n, r) {
		let { signal: i, method: a, ...o } = t || {}, s = this._makeAbort(r);
		i && i.addEventListener("abort", s, { once: !0 });
		let c = setTimeout(s, n), l = globalThis.ReadableStream && o.body instanceof globalThis.ReadableStream || typeof o.body == "object" && o.body !== null && Symbol.asyncIterator in o.body, u = {
			signal: r.signal,
			...l ? { duplex: "half" } : {},
			method: "GET",
			...o
		};
		a && (u.method = a.toUpperCase());
		try {
			return await this.fetch.call(void 0, e, u);
		} finally {
			clearTimeout(c);
		}
	}
	async shouldRetry(e) {
		let t = e.headers.get("x-should-retry");
		return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
	}
	async retryRequest(e, t, n, r) {
		let i, a = r?.get("retry-after-ms");
		if (a) {
			let e = parseFloat(a);
			Number.isNaN(e) || (i = e);
		}
		let o = r?.get("retry-after");
		if (o && !i) {
			let e = parseFloat(o);
			i = Number.isNaN(e) ? Date.parse(o) - Date.now() : e * 1e3;
		}
		if (i === void 0) {
			let n = e.maxRetries ?? this.maxRetries;
			i = this.calculateDefaultRetryTimeoutMillis(t, n);
		}
		return await Te(i), this.makeRequest(e, t - 1, n);
	}
	calculateDefaultRetryTimeoutMillis(e, t) {
		let n = t - e;
		return Math.min(.5 * 2 ** n, 8) * (1 - Math.random() * .25) * 1e3;
	}
	async buildRequest(e, { retryCount: t = 0 } = {}) {
		let n = { ...e }, { method: r, path: i, query: a, defaultBaseURL: o } = n, s = this.buildURL(i, a, o);
		"timeout" in n && Ce("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
		let { bodyHeaders: c, body: l, isStreamingBody: u } = this.buildBody({ options: n });
		return u && (e.__metadata = {
			...e.__metadata,
			hasStreamingBody: !0
		}), {
			req: {
				method: r,
				headers: await this.buildHeaders({
					options: e,
					method: r,
					bodyHeaders: c,
					retryCount: t
				}),
				...n.signal && { signal: n.signal },
				...globalThis.ReadableStream && l instanceof globalThis.ReadableStream && { duplex: "half" },
				...l && { body: l },
				...this.fetchOptions ?? {},
				...n.fetchOptions ?? {}
			},
			url: s,
			timeout: n.timeout
		};
	}
	async buildHeaders({ options: e, method: t, bodyHeaders: n, retryCount: r }) {
		let i = {};
		this.idempotencyHeader && t !== "get" && (e.idempotencyKey ||= this.defaultIdempotencyKey(), i[this.idempotencyHeader] = e.idempotencyKey);
		let a = V([
			i,
			{
				Accept: "application/json",
				"User-Agent": this.getUserAgent(),
				"X-Stainless-Retry-Count": String(r),
				...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
				...Pe(),
				"OpenAI-Organization": this.organization,
				"OpenAI-Project": this.project
			},
			await this.authHeaders(e, e.__security ?? { bearerAuth: !0 }),
			this._options.defaultHeaders,
			n,
			e.headers
		]);
		return this.validateHeaders(a, e.__security ?? { bearerAuth: !0 }), a.values;
	}
	_makeAbort(e) {
		return () => e.abort();
	}
	buildBody({ options: { body: e, headers: t } }) {
		if (!e) return {
			bodyHeaders: void 0,
			body: void 0,
			isStreamingBody: !1
		};
		let n = V([t]), r = globalThis.ReadableStream !== void 0 && e instanceof globalThis.ReadableStream, i = !r && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || globalThis.Blob !== void 0 && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
		return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || r ? {
			bodyHeaders: void 0,
			body: e,
			isStreamingBody: !i
		} : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
			bodyHeaders: void 0,
			body: Le(e),
			isStreamingBody: !0
		} : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
			bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
			body: this.stringifyQuery(e),
			isStreamingBody: !1
		} : {
			...h(this, Ma, "f").call(this, {
				body: e,
				headers: n
			}),
			isStreamingBody: !1
		};
	}
};
ja = K, Ma = /* @__PURE__ */ new WeakMap(), Aa = /* @__PURE__ */ new WeakSet(), Na = function() {
	return this.baseURL !== "https://api.openai.com/v1";
}, K.OpenAI = ja, K.DEFAULT_TIMEOUT = 6e5, K.OpenAIError = _, K.APIError = v, K.APIConnectionError = ne, K.APIConnectionTimeoutError = b, K.APIUserAbortError = y, K.NotFoundError = oe, K.ConflictError = se, K.RateLimitError = le, K.BadRequestError = re, K.AuthenticationError = ie, K.InternalServerError = ue, K.PermissionDeniedError = ae, K.UnprocessableEntityError = ce, K.InvalidWebhookSignatureError = pe, K.toFile = Zt, K.Completions = xi, K.Chat = or, K.Embeddings = Di, K.Files = ji, K.Images = Hi, K.Audio = zr, K.Moderations = Wi, K.Models = Ui, K.FineTuning = zi, K.Graders = Vi, K.VectorStores = wa, K.Webhooks = ka, K.Beta = bi, K.Batches = Br, K.Uploads = ba, K.Admin = Nr, K.Responses = ma, K.Realtime = qi, K.Conversations = Ei, K.Evals = Ai, K.Containers = wi, K.Skills = va, K.Videos = Ta;
function Fa(e) {
	if (Ia(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function Ia(e) {
	let t = e;
	for (let e = 0; e < 8 && t && typeof t == "object"; e++) {
		let e = t;
		if (e.code === "UND_ERR_INVALID_ARG" && typeof e.message == "string" && e.message.includes("invalid onRequestStart method")) return !0;
		t = e.cause;
	}
	return !1;
}
//#endregion
//#region electron/ai.ts
var La = "\n你是一个个人思维记录助手的意图识别引擎。你的任务是分析用户的自然语言输入，并将其分类并提取结构化信息。\n你必须只返回 JSON 格式的数据，不要包含任何额外的解释或 Markdown 标记（如 ```json）。\n\n分类类型 (type)：\n1. \"idea\": 普通想法\n2. \"task\": 待办（未来某天做，但没有精确时间）\n3. \"reminder\": 精确提醒（明确要求在某个具体时间提醒）\n4. \"learning\": 学习记录\n5. \"blog\": 博客素材\n6. \"summary\": 长期总结素材\n7. \"random\": 稀奇古怪想法\n8. \"normal\": 普通记录（只记录，不涉及上述分类）\n\n输出 JSON 格式要求：\n{\n  \"type\": \"idea | task | reminder | learning | blog | summary | random | normal\",\n  \"topic\": \"提取的主题标签（如 'AI提示词', '博客想法'），如果是普通记录可为空\",\n  \"taskTime\": \"如果 type 是 task，提取用户意图的时间（如 'tomorrow', 'next_week', 'after_3_days'），如果没有明确则为空\",\n  \"reminderTime\": \"如果 type 是 reminder，提取出 ISO 格式的时间字符串（请根据当前时间推算）。如果时间不明确，请置为空，并设置 needsClarification 为 true\",\n  \"needsClarification\": boolean,\n  \"reply\": \"给用户的简短反馈语，例如：'已记录，明早会提醒你：整理提示词模板库'\"\n}\n\n当前时间：${CURRENT_TIME}\n";
async function Ra(e, t, n, r = "gpt-3.5-turbo") {
	let i = new K({
		apiKey: t,
		baseURL: n || void 0
	}), a = (/* @__PURE__ */ new Date()).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }), o = La.replace("${CURRENT_TIME}", a);
	try {
		let t = (await i.chat.completions.create({
			model: r,
			messages: [{
				role: "system",
				content: o
			}, {
				role: "user",
				content: e
			}],
			response_format: { type: "json_object" }
		})).choices[0].message.content;
		if (t) return JSON.parse(t);
	} catch (e) {
		throw console.error("AI Analysis failed:", e), e;
	}
}
//#endregion
//#region electron/store.ts
var za = class {
	constructor(e, t) {
		this.defaults = t;
		let n = i.getPath("userData");
		this.filePath = u.join(n, e), this.data = this.parseDataFile(this.filePath, t);
	}
	get(e) {
		return this.data[e];
	}
	set(e, t) {
		this.data[e] = t, this.saveData();
	}
	getAll() {
		return this.data;
	}
	setAll(e) {
		this.data = e, this.saveData();
	}
	parseDataFile(e, t) {
		try {
			return JSON.parse(d.readFileSync(e, "utf-8"));
		} catch {
			return t;
		}
	}
	saveData() {
		d.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
	}
}, Ba = "你是一个帮助用户复盘一天思维过程的 AI 助手。\n这是用户今天的所有原始输入记录和任务状态：\n{TODAY_DATA}\n\n请根据今天的记录内容，选择适合的复盘模式并生成【今日思维日记】和【长期总结更新】。\n\n### 复盘模式与结构：\n1. **轻量记录模式**：如果当天记录大多是精确提醒、测试、生活琐事。\n   - 不要强行升华深层心理动机，不要过度推断用户状态。\n   - 日记结构应为：## 今天的记录概况、## 今天发生的事、## 今天触发的提醒（如果有）、## 今天沉淀到长期总结的内容（如果有）、## 值得注意。\n2. **完整思维日记模式**：如果当天有丰富的想法、学习记录、判断或项目思路。\n   - 深入分析并梳理思维过程。\n   - 日记结构应为：## 今天的主要思考、## 重要想法、## 今天生成的待办（仅限长期待办 TASK）、## 今天完成的事、## 今天沉淀到长期总结的内容、## 值得继续看的内容。\n\n### 核心分拣规则（非常重要）：\n1. **长期总结的判断标准**：只要一条内容满足“以后可能复用、能指导之后怎么做、属于学习心得、方法经验、判断标准”，就**必须**进入长期总结（提取到 longTermUpdates，并在日记的“今天沉淀到长期总结的内容”中提及）。\n2. **主题归类规则**：这是目前已经存在的长期总结主题列表：\n【{EXISTING_TOPICS}】\n请你**尽可能**将新提取的经验归入上述已有的主题中（即使字面不完全一样，只要领域一致就合并）。只有当新经验实在无法归入现有分类时，才创造一个**最宽泛、最通用**的新主题名（如“生活感悟”、“读书笔记”、“技术积累”），绝不能给每条记录都创建一个小分类！\n3. **提醒与总结的界限**：“提醒”本身（如：一分钟后收衣服）不进长期总结。但是，从提醒中总结出的**使用方法或经验**（如：我发现一分钟提醒适合处理很小的拖延任务）属于方法经验，必须进入长期总结！\n4. **不要一刀切**：即使今天大部分内容是轻量的提醒测试，只要其中混有一条有价值的学习点（如“提示词用英文效果更好”），就必须把这个学习点单独挑出来放进长期总结，绝不能因为当天是“轻量模式”就忽略它！\n\n### 词汇规范：\n- **提醒 (Reminder)**：带有明确时间的单次提醒（如“一分钟后提醒我收衣服”）。写入日记的“今天触发的提醒”中。\n- **待办 (Task)**：没有具体时间、以后要做的长期待办（如“明天整理提示词模板库”）。写入日记的“今天生成的待办”中。\n绝对不要把单次提醒写进“今天生成的待办”里！\n\n请以 JSON 格式返回，不要包含任何额外的解释或 Markdown 标记（如 ```json），结构如下：\n{\n  \"diaryContent\": \"这里是生成的日记 Markdown 文本\",\n  \"longTermUpdates\": [\n    {\n      \"topic\": \"主题名\",\n      \"content\": \"追加的 Markdown 文本内容，带上今天的日期标题\"\n    }\n  ]\n}";
async function Va(e, t, n) {
	if (!n.apiKey) throw Error("API Key not configured");
	let r = "目前还没有任何长期总结。";
	if (n.obsidianPath) {
		let e = n.parentFolderName || "提示助手", t = n.summaryFolderName || "长期总结", i = u.join(n.obsidianPath, e, t);
		if (d.existsSync(i)) {
			let e = d.readdirSync(i).filter((e) => e.endsWith(".md"));
			e.length > 0 && (r = e.map((e) => e.replace(".md", "")).join("、"));
		}
	}
	let i = JSON.stringify({
		entries: e,
		tasks: t
	}), a = Ba;
	n.customReviewPrompt && n.customReviewPrompt.trim() && (a = n.customReviewPrompt + "\n\n请严格以 JSON 格式返回，结构同默认要求：\n{ \"diaryContent\": \"...\", \"longTermUpdates\": [{\"topic\": \"...\", \"content\": \"...\"}] }");
	let o = a.replace("{TODAY_DATA}", i).replace("{EXISTING_TOPICS}", r), s = (await new K({
		apiKey: n.apiKey,
		baseURL: n.apiBaseUrl || void 0
	}).chat.completions.create({
		model: n.modelName || "gpt-3.5-turbo",
		messages: [{
			role: "system",
			content: o
		}],
		response_format: { type: "json_object" }
	})).choices[0].message.content;
	if (!s) throw Error("AI returned empty");
	let c = JSON.parse(s);
	if (e && e.length > 0) {
		let t = "\n\n## 今日原始记录\n\n";
		for (let n of e) {
			let e = new Date(n.timestamp).toLocaleTimeString("zh-CN", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: !1
			}), r = n.aiResult?.type || "normal";
			if (t += `- **[${e}]** \`${r}\` ${n.text}\n`, n.aiResult?.feedback) {
				let e = n.aiResult.feedback.replace(/\n/g, "\n  > ");
				t += `  > ${e}\n`;
			}
		}
		c.diaryContent += t;
	}
	return c;
}
async function Ha(e, t) {
	if (!t.obsidianPath) throw Error("Obsidian Path not configured");
	let n = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], r = t.parentFolderName || "提示助手", i = t.diaryFolderName || "每日日记", a = t.summaryFolderName || "长期总结", o = u.join(t.obsidianPath, r, i), s = u.join(t.obsidianPath, r, a);
	d.existsSync(o) || d.mkdirSync(o, { recursive: !0 }), d.existsSync(s) || d.mkdirSync(s, { recursive: !0 });
	let c = u.join(o, `${n}.md`);
	if (d.existsSync(c) || d.writeFileSync(c, `# ${n} 思维日记\n\n`), d.appendFileSync(c, e.diaryContent + "\n"), e.longTermUpdates && e.longTermUpdates.length > 0) for (let t of e.longTermUpdates) {
		let e = t.topic.replace(/[<>:"/\\|?*]/g, "_"), r = u.join(s, `${e}.md`);
		d.existsSync(r) || d.writeFileSync(r, `# ${t.topic}\n\n`), d.appendFileSync(r, "\n\n### " + n + "\n" + t.content + "\n");
	}
	return !0;
}
function Ua(e, t) {
	if (!e.obsidianPath) return !1;
	let n = t || (/* @__PURE__ */ new Date()).toISOString().split("T")[0], r = e.parentFolderName || "提示助手", i = e.diaryFolderName || "每日日记", a = u.join(e.obsidianPath, r, i, `${n}.md`);
	return d.existsSync(a);
}
//#endregion
//#region electron/main.ts
var Wa = u.dirname(f(import.meta.url));
process.env.APP_ROOT = u.join(Wa, "..");
var q = process.env.VITE_DEV_SERVER_URL, Ga = u.join(process.env.APP_ROOT, "dist-electron"), Ka = u.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = q ? u.join(process.env.APP_ROOT, "public") : Ka;
var J, qa = !0, Ja = null;
function Ya() {
	J = new t({
		width: 600,
		height: 220,
		show: !1,
		frame: !1,
		transparent: !0,
		backgroundColor: "#00000000",
		hasShadow: !1,
		resizable: !1,
		alwaysOnTop: !0,
		skipTaskbar: !0,
		webPreferences: {
			preload: u.join(Wa, "preload.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1
		}
	}), q ? J.loadURL(q) : J.loadFile(u.join(Ka, "index.html")), J.on("blur", () => {
		qa && J?.hide();
	});
}
var Y = null;
function Xa() {
	if (Y) {
		Y.show(), Y.focus();
		return;
	}
	Y = new t({
		width: 500,
		height: 700,
		minWidth: 480,
		minHeight: 650,
		show: !1,
		title: "系统设置",
		autoHideMenuBar: !0,
		webPreferences: {
			preload: u.join(Wa, "preload.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1
		}
	}), q ? Y.loadURL(q + "#/settings") : Y.loadFile(u.join(Ka, "index.html"), { hash: "settings" }), Y.once("ready-to-show", () => {
		Y?.show();
	}), Y.on("closed", () => {
		Y = null;
	});
}
var X = null;
function Za() {
	if (X) {
		X.show(), X.focus();
		return;
	}
	X = new t({
		width: 600,
		height: 800,
		minWidth: 500,
		minHeight: 600,
		show: !1,
		title: "今日记录",
		autoHideMenuBar: !0,
		webPreferences: {
			preload: u.join(Wa, "preload.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1
		}
	}), q ? X.loadURL(q + "#/today") : X.loadFile(u.join(Ka, "index.html"), { hash: "today" }), X.once("ready-to-show", () => {
		X?.show();
	}), X.on("closed", () => {
		X = null;
	});
}
function Qa() {
	let e = u.join(process.env.VITE_PUBLIC || "", "vite.svg"), t;
	t = d.existsSync(e) ? s.createFromPath(e) : s.createEmpty();
	let a = Z.getAll(), o = (a.shortcut || "CommandOrControl+`").replace("CommandOrControl", "Ctrl"), c = a.theme || "pastel", f = (e) => {
		let t = Z.getAll();
		t.theme = e, Z.setAll(t), J && J.webContents.send("theme-changed", e);
	}, p = n.buildFromTemplate([
		{
			label: `记下想法 (${o})`,
			click: () => $a()
		},
		{
			label: "今日时间线",
			click: () => Za()
		},
		{ type: "separator" },
		{
			label: "切换皮肤",
			submenu: [
				{
					label: "方案一：粉彩光晕 (Pastel)",
					type: "radio",
					checked: c === "pastel",
					click: () => f("pastel")
				},
				{
					label: "方案二：macOS 暗黑高级 (Obsidian)",
					type: "radio",
					checked: c === "macos-dark",
					click: () => f("macos-dark")
				},
				{
					label: "方案三：iOS 拟物厚亚克力 (Acrylic)",
					type: "radio",
					checked: c === "ios-acrylic",
					click: () => f("ios-acrylic")
				}
			]
		},
		{ type: "separator" },
		{
			label: "立即晚间复盘",
			click: () => no()
		},
		{
			label: "打开笔记文件夹",
			click: () => {
				let e = Z.getAll();
				e.obsidianPath && l.openPath(e.obsidianPath);
			}
		},
		{ type: "separator" },
		{
			label: "设置",
			click: () => Xa()
		},
		{ type: "separator" },
		{
			label: "退出",
			click: () => i.quit()
		}
	]);
	Ja = new r(t), Ja.setToolTip("思维记录"), Ja.setContextMenu(p);
}
function $a() {
	J && (J.show(), J.focus(), J.webContents.send("window-show"));
}
var Z = new za("config.json", {
	obsidianPath: "",
	apiKey: "",
	apiBaseUrl: "",
	modelName: "gpt-3.5-turbo",
	morningTime: "09:00",
	afternoonTime: "15:00",
	eveningTime: "22:00",
	shortcut: "CommandOrControl+`",
	parentFolderName: "提示助手",
	diaryFolderName: "每日日记",
	summaryFolderName: "长期总结",
	theme: "pastel"
}), Q = new za("entries.json", []), eo = new za("tasks.json", []), to = new za("reminders.json", []);
i.whenReady().then(() => {
	Ya(), Qa();
	let e = Z.getAll();
	i.setLoginItemSettings({
		openAtLogin: e.autoStart || !1,
		openAsHidden: !0
	});
	let n = e.shortcut || "CommandOrControl+`";
	try {
		a.register(n, () => {
			J?.isVisible() ? J.hide() : $a();
		});
	} catch (e) {
		console.error("Failed to register shortcut:", e);
	}
	if (!e.obsidianPath) Xa();
	else {
		let t = (/* @__PURE__ */ new Date(Date.now() - 864e5)).toISOString().split("T")[0], n = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		if (Q.getAll().some((e) => !e.hasReviewed && e.timestamp < n) && !Ua(e, t)) {
			let { Notification: e } = p("electron"), t = new e({
				title: "补昨天复盘",
				body: "昨天还没有生成思维日记，要现在补上吗？ 点击开始"
			});
			t.on("click", () => {
				no();
			}), t.show();
		}
	}
	o.on("set-can-hide", (e, t) => {
		qa = t;
	}), o.on("hide-window", (e) => {
		let n = t.fromWebContents(e.sender);
		n && n.hide();
	}), o.on("close-settings", () => {
		Y?.close();
	}), o.handle("get-today-entries", () => {
		let e = Q.getAll(), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		return e.filter((e) => e.timestamp.startsWith(t));
	}), o.handle("get-config", () => Z.getAll()), o.handle("save-config", (e, t) => {
		let n = Z.getAll();
		if (n.shortcut !== t.shortcut && (n.shortcut && a.unregister(n.shortcut), t.shortcut)) try {
			a.register(t.shortcut, () => {
				J?.isVisible() ? J.hide() : $a();
			});
		} catch (e) {
			console.error("Failed to update shortcut:", e);
		}
		return n.autoStart !== t.autoStart && i.setLoginItemSettings({
			openAtLogin: t.autoStart || !1,
			openAsHidden: !0
		}), Z.setAll(t), Ja && Ja.destroy(), Qa(), { success: !0 };
	}), o.handle("quick-save", async (e, t) => {
		let n = Date.now().toString(), r = Q.getAll();
		return r.push({
			id: n,
			text: t,
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			status: "analyzed",
			aiResult: {
				type: "normal",
				reply: "已记录（跳过分析）"
			}
		}), Q.setAll(r), { success: !0 };
	}), o.handle("analyze-input", async (e, t) => {
		let n = Date.now().toString(), r = Z.getAll(), i = {
			id: n,
			text: t,
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			status: "pending"
		}, a = Q.getAll();
		a.push(i), Q.setAll(a);
		try {
			if (!r.apiKey) return {
				reply: "已记录，但未配置 API Key，无法分析意图。",
				type: "normal"
			};
			let e = await Ra(t, r.apiKey, r.apiBaseUrl, r.modelName), i = a.findIndex((e) => e.id === n);
			if (i !== -1 && (a[i].status = "analyzed", a[i].aiResult = e, Q.setAll(a)), e.type === "task") {
				let r = eo.getAll();
				r.push({
					id: "task_" + n,
					entryId: n,
					originalText: t,
					title: t,
					type: e.type,
					status: "pending",
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				}), eo.setAll(r);
			} else if (e.type === "reminder") {
				let r = to.getAll(), i = new Date(Date.now() + 3600 * 1e3).toISOString();
				e.reminderTime && !isNaN(new Date(e.reminderTime).getTime()) && (i = new Date(e.reminderTime).toISOString()), r.push({
					id: "rem_" + n,
					entryId: n,
					originalText: t,
					title: t,
					type: e.type,
					status: "pending",
					remindAt: i,
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				}), to.setAll(r);
			}
			return e;
		} catch (e) {
			return console.error(e), {
				reply: "已记录，但 AI 分析失败。",
				type: "error"
			};
		}
	}), o.handle("handle-reminder-action", async (e, t, n) => {
		let r = to.getAll(), i = r.findIndex((e) => e.id === t);
		if (i !== -1) {
			if (n === "done") r[i].status = "completed";
			else if (n === "later") r[i].status = "delayed", r[i].remindAt = new Date(Date.now() + 1800 * 1e3).toISOString();
			else if (n === "tomorrow") {
				r[i].status = "delayed";
				let e = /* @__PURE__ */ new Date();
				e.setDate(e.getDate() + 1), r[i].remindAt = e.toISOString();
			}
			to.setAll(r);
		}
		$?.hide();
	}), o.handle("handle-morning-actions", async (e, t) => {
		let n = eo.getAll(), r = /* @__PURE__ */ new Date(), i = Z.getAll(), a = i.afternoonTime || "15:00", o = /* @__PURE__ */ new Date(), [s, c] = a.split(":");
		o.setHours(parseInt(s), parseInt(c), 0, 0);
		let l = /* @__PURE__ */ new Date();
		l.setHours(18, 0, 0, 0), t.forEach((e) => {
			let t = n.findIndex((t) => t.id === e.taskId);
			if (t !== -1) {
				if (e.action === "done") n[t].status = "completed";
				else if (e.action === "cancel") n[t].status = "cancelled";
				else if (e.action === "later") if (n[t].status = "delayed", r < o) n[t].remindAt = o.toISOString();
				else if (r < l) n[t].remindAt = l.toISOString();
				else {
					let e = /* @__PURE__ */ new Date();
					e.setDate(e.getDate() + 1);
					let [r, a] = (i.morningTime || "09:00").split(":");
					e.setHours(parseInt(r), parseInt(a), 0, 0), n[t].remindAt = e.toISOString();
				}
				else if (e.action === "tomorrow") {
					n[t].status = "delayed";
					let e = /* @__PURE__ */ new Date();
					e.setDate(e.getDate() + 1);
					let [r, a] = (i.morningTime || "09:00").split(":");
					e.setHours(parseInt(r), parseInt(a), 0, 0), n[t].remindAt = e.toISOString();
				}
			}
		}), eo.setAll(n), $?.hide();
	}), o.handle("get-today-entry-count", async () => {
		let e = Q.getAll(), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		return e.filter((e) => e.timestamp.startsWith(t)).length;
	}), i.setLoginItemSettings({
		openAtLogin: !0,
		path: i.getPath("exe")
	}), i.on("activate", () => {
		t.getAllWindows().length === 0 && Ya();
	});
	let r = new za("review_state.json", {
		lastReviewDate: "",
		lastMorningDate: ""
	});
	setInterval(() => {
		let e = eo.getAll(), t = to.getAll(), n = /* @__PURE__ */ new Date(), i = Z.getAll(), a = n.toISOString().split("T")[0], o = r.getAll(), [s, c] = (i.morningTime || "09:00").split(":"), l = /* @__PURE__ */ new Date();
		if (l.setHours(parseInt(s), parseInt(c), 0, 0), n >= l && o.lastMorningDate !== a) {
			let t = e.filter((e) => e.status === "pending" || e.status === "delayed" && new Date(e.remindAt) <= n);
			t.length > 0 && (ro(t), o.lastMorningDate = a, r.setAll(o));
		} else if (o.lastMorningDate === a) {
			let t = e.filter((e) => e.status === "delayed" && new Date(e.remindAt) <= n);
			t.length > 0 && (!$ || !$.isVisible()) && (ro(t), t.forEach((e) => {
				e.remindAt = new Date(Date.now() + 300 * 1e3).toISOString();
			}), eo.setAll(e));
		}
		let u = t.filter((e) => e.status === "pending" && new Date(e.remindAt) <= n);
		u.length > 0 && (!$ || !$.isVisible()) && (io(u[0]), u[0].status = "shown", to.setAll(t));
		let [d, f] = (i.eveningTime || "22:00").split(":"), p = /* @__PURE__ */ new Date();
		p.setHours(parseInt(d), parseInt(f), 0, 0), n >= p && o.lastReviewDate !== a && (no(), o.lastReviewDate = a, r.setAll(o));
	}, 6e4);
}), o.handle("generate-review-draft", async () => {
	let e = Q.getAll(), t = eo.getAll(), n = Z.getAll(), r = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], i = e.filter((e) => e.timestamp.startsWith(r));
	try {
		return {
			success: !0,
			draft: await Va(i, t, n)
		};
	} catch (e) {
		return {
			success: !1,
			error: e.message
		};
	}
}), o.handle("save-review", async (e, t) => {
	try {
		await Ha(t, Z.getAll());
		let e = Q.getAll(), n = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], r = !1;
		for (let t of e) !t.hasReviewed && t.timestamp <= n + "T23:59:59" && (t.hasReviewed = !0, r = !0);
		return r && Q.set(e), { success: !0 };
	} catch (e) {
		return {
			success: !1,
			error: e.message
		};
	}
}), o.handle("delete-today-review", () => {
	let e = Z.getAll(), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], n = e.parentFolderName || "提示助手", r = e.diaryFolderName || "每日日记", i = u.join(e.obsidianPath, n, r, `${t}.md`);
	d.existsSync(i) && d.unlinkSync(i);
	let a = Q.getAll(), o = !1;
	for (let e of a) e.timestamp.startsWith(t) && e.hasReviewed && (e.hasReviewed = !1, o = !0);
	return o && Q.set(a), !0;
}), o.handle("check-review-status", () => Ua(Z.getAll())), o.handle("open-today-review", () => {
	let e = Z.getAll(), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], n = e.parentFolderName || "提示助手", r = e.diaryFolderName || "每日日记", i = u.join(e.obsidianPath, n, r, `${t}.md`);
	l.openPath(i);
});
var $ = null;
function no() {
	$ ? ($?.show(), $?.webContents.send("review-show"), l.beep()) : (ao(), $?.webContents.once("did-finish-load", () => {
		$?.show(), $?.webContents.send("review-show"), l.beep();
	}));
}
function ro(e) {
	$ ? ($?.show(), $?.webContents.send("morning-show", e), l.beep()) : (ao(), $?.webContents.once("did-finish-load", () => {
		$?.show(), $?.webContents.send("morning-show", e), l.beep();
	}));
}
function io(e) {
	$ ? ($?.show(), $?.webContents.send("reminder-show", e), l.beep()) : (ao(), $?.webContents.once("did-finish-load", () => {
		$?.show(), $?.webContents.send("reminder-show", e), l.beep();
	}));
}
function ao() {
	let { width: e, height: n } = c.getPrimaryDisplay().workAreaSize;
	$ = new t({
		width: 400,
		height: 650,
		x: 30,
		y: n - 690,
		show: !1,
		frame: !1,
		transparent: !0,
		backgroundColor: "#00000000",
		hasShadow: !1,
		resizable: !1,
		alwaysOnTop: !0,
		skipTaskbar: !0,
		webPreferences: {
			preload: u.join(Wa, "preload.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1
		}
	}), q ? $.loadURL(q + "#/reminder") : $.loadFile(u.join(Ka, "index.html"), { hash: "reminder" }), $.on("blur", () => {});
}
i.on("window-all-closed", () => {
	process.platform !== "darwin" && (i.quit(), J = null);
}), i.on("will-quit", () => {
	a.unregisterAll();
});
//#endregion
export { Ga as MAIN_DIST, Ka as RENDERER_DIST, q as VITE_DEV_SERVER_URL };
