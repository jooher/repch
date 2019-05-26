var javascriptBarcodeReader = function (a) {
	'use strict';
	var d = Math.ceil,
	e = Math.round;
	function b(a) {
		var b = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
		return "#" === !a[0] || b.test(a)
	}
	function c(a) {
		var b = document.createElement("canvas"),
		c = b.getContext("2d"),
		d = a.naturalWidth,
		e = a.naturalHeight;
		return b.width = d,
		b.height = e,
		c.drawImage(a, 0, 0),
		c.getImageData(0, 0, a.naturalWidth, a.naturalHeight)
	}
	a = a && a.hasOwnProperty("default") ? a["default"] : a;
	var f = "undefined" == typeof window ? "undefined" == typeof global ? "undefined" == typeof self ? {}
	 : self : global : window,
	g = "object" == typeof process && process.release && "node" === process.release.name,
	h = {
		getImageDataFromSource: async function (d) {
			var e = "string" == typeof d,
			f = !!e && b(d),
			h = d.tagName;
			return new Promise(function (b, i) {
				if (!e)
					h ? ("IMG" === h ? b(c(d)) : "CANVAS" === h && b(d.getContext("2d").getImageData(0, 0, d.naturalWidth, d.naturalHeight)), i(new Error("Invalid image source specified!"))) : d.data && d.width && d.height ? b(d) : i(new Error("Invalid image source specified!"));
				else if (g)
					a.read(f ? {
						url: d,
						headers: {}
					}
						 : d, function (a, c) {
						if (a)
							i(a);
						else {
							var d = c.bitmap,
							e = d.data,
							f = d.width,
							g = d.height;
							b({
								data: e.toJSON().data,
								width: f,
								height: g
							})
						}
					});
				else if (f) {
					var j = new Image;
					j.onerror = i,
					j.onload = function () {
						return b(c(j))
					},
					j.src = d
				} else {
					var k = document.getElementById(d);
					k && b(c(k)),
					i(new Error("Invalid image source specified!"))
				}
			})
		}
	},
	j = ["212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", "114131", "311141", "411131", "211412", "211214", "211232", "233111", "211133", "2331112"],
	k = [" ", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_", "NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL", "BS", "HT", "LF", "VT", "FF", "CR", "SO", "SI", "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB", "CAN", "EM", "SUB", "ESC", "FS", "GS", "RS", "US", "FNC 3", "FNC 2", "Shift B", "Code C", "Code B", "FNC 4", "FNC 1"],
	l = [" ", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_", "`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~", "DEL", "FNC 3", "FNC 2", "Shift A", "Code C", "FNC 4", "Code A", "FNC 1"],
	m = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "Code B", "Code A", "FNC 1"],
	n = function (a) {
		var b = a.reduce(function (a, b) {
				return a + b
			}, 0) / 11;
		return a.map(function (a) {
			return e(a / b)
		}).join("")
	},
	o = function (a) {
		var b,
		c,
		d,
		e,
		f,
		g = [];
		a.pop();
		var h = a.slice(0);
		switch (d = n(h.splice(0, 6)), d) {
		case "211214":
			b = l,
			c = 104;
			break;
		case "211232":
			b = m,
			c = 105;
			break;
		default:
			b = k,
			c = 103;
		}
		for (var o = 1; 12 < h.length; o += 1)
			switch (d = n(h.splice(0, 6)), f = j.indexOf(d), c += o * f, e = b[f], e) {
			case "Code A":
				b = k;
				break;
			case "Code B":
				b = l;
				break;
			case "Code C":
				b = m;
				break;
			default:
				g.push(e);
			}
		return d = n(h.splice(0, 6)),
		c % 103 === j.indexOf(d) ? g.join("") : null
	},
	p = ["nnwwn", "wnnnw", "nwnnw", "wwnnn", "nnwnw", "wnwnn", "nwwnn", "nnnww", "wnnwn", "nwnwn"],
	q = function (c, e) {
		void 0 === e && (e = "standard");
		var f = [],
		g = d(c.reduce(function (a, b) {
					return (a + b) / 2
				}, 0));
		if ("interleaved" === e) {
			var h = c.splice(0, 4).map(function (a) {
					return a > g ? "w" : "n"
				}).join(""),
			i = c.splice(c.length - 3, 3).map(function (a) {
					return a > g ? "w" : "n"
				}).join("");
			if ("nnnn" !== h || "wnn" !== i)
				return null;
			for (; 0 < c.length; ) {
				var j = c.splice(0, 10),
				k = j.filter(function (a, b) {
						return 0 == b % 2
					}).map(function (a) {
						return a > g ? "w" : "n"
					}).join("");
				f.push(p.indexOf(k));
				var a = j.filter(function (a, b) {
						return 0 != b % 2
					}).map(function (a) {
						return a > g ? "w" : "n"
					}).join("");
				f.push(p.indexOf(a))
			}
		} else if ("standard" === e) {
			var b = c.splice(0, 6).filter(function (a, b) {
					return 0 == b % 2
				}).map(function (a) {
					return a > g ? "w" : "n"
				}).join(""),
			l = c.splice(c.length - 5, 5).filter(function (a, b) {
					return 0 == b % 2
				}).map(function (a) {
					return a > g ? "w" : "n"
				}).join("");
			if ("wwn" !== b || "wnw" !== l)
				return null;
			for (; 0 < c.length; ) {
				var m = c.splice(0, 10).filter(function (a, b) {
						return 0 == b % 2
					}).map(function (a) {
						return a > g ? "w" : "n"
					}).join("");
				f.push(p.indexOf(m))
			}
		}
		return f.join("")
	},
	r = {
		nnnwwnwnn: "0",
		wnnwnnnnw: "1",
		nnwwnnnnw: "2",
		wnwwnnnnn: "3",
		nnnwwnnnw: "4",
		wnnwwnnnn: "5",
		nnwwwnnnn: "6",
		nnnwnnwnw: "7",
		wnnwnnwnn: "8",
		nnwwnnwnn: "9",
		wnnnnwnnw: "A",
		nnwnnwnnw: "B",
		wnwnnwnnn: "C",
		nnnnwwnnw: "D",
		wnnnwwnnn: "E",
		nnwnwwnnn: "F",
		nnnnnwwnw: "G",
		wnnnnwwnn: "H",
		nnwnnwwnn: "I",
		nnnnwwwnn: "J",
		wnnnnnnww: "K",
		nnwnnnnww: "L",
		wnwnnnnwn: "M",
		nnnnwnnww: "N",
		wnnnwnnwn: "O",
		nnwnwnnwn: "P",
		nnnnnnwww: "Q",
		wnnnnnwwn: "R",
		nnwnnnwwn: "S",
		nnnnwnwwn: "T",
		wwnnnnnnw: "U",
		nwwnnnnnw: "V",
		wwwnnnnnn: "W",
		nwnnwnnnw: "X",
		wwnnwnnnn: "Y",
		nwwnwnnnn: "Z",
		nwnnnnwnw: "-",
		wwnnnnwnn: ".",
		nwwnnnwnn: " ",
		nwnwnwnnn: "$",
		nwnwnnnwn: "/",
		nwnnnwnwn: "+",
		nnnwnwnwn: "%",
		nwnnwnwnn: "*"
	},
	s = function (a) {
		for (var b = [], c = d(a.reduce(function (a, b) {
						return a + b
					}, 0) / a.length); 0 < a.length; ) {
			var e = a.splice(0, 10).map(function (a) {
					return a > c ? "w" : "n"
				});
			b.push(r[e.slice(0, 9).join("")])
		}
		return "*" !== b.pop() || "*" !== b.shift() ? null : b.join("")
	},
	t = [{
			100010100: "0"
		}, {
			101001000: "1"
		}, {
			101000100: "2"
		}, {
			101000010: "3"
		}, {
			100101000: "4"
		}, {
			100100100: "5"
		}, {
			100100010: "6"
		}, {
			101010000: "7"
		}, {
			100010010: "8"
		}, {
			100001010: "9"
		}, {
			110101000: "A"
		}, {
			110100100: "B"
		}, {
			110100010: "C"
		}, {
			110010100: "D"
		}, {
			110010010: "E"
		}, {
			110001010: "F"
		}, {
			101101000: "G"
		}, {
			101100100: "H"
		}, {
			101100010: "I"
		}, {
			100110100: "J"
		}, {
			100011010: "K"
		}, {
			101011000: "L"
		}, {
			101001100: "M"
		}, {
			101000110: "N"
		}, {
			100101100: "O"
		}, {
			100010110: "P"
		}, {
			110110100: "Q"
		}, {
			110110010: "R"
		}, {
			110101100: "S"
		}, {
			110100110: "T"
		}, {
			110010110: "U"
		}, {
			110011010: "V"
		}, {
			101101100: "W"
		}, {
			101100110: "X"
		}, {
			100110110: "Y"
		}, {
			100111010: "Z"
		}, {
			100101110: "-"
		}, {
			111010100: "."
		}, {
			111010010: " "
		}, {
			111001010: "$"
		}, {
			101101110: "/"
		}, {
			101110110: "+"
		}, {
			110101110: "%"
		}, {
			100100110: "($)"
		}, {
			111011010: "(%)"
		}, {
			111010110: "(/)"
		}, {
			100110010: "(+)"
		}, {
			101011110: "*"
		}
	],
	u = function (a) {
		var b = [],
		c = [];
		a.pop();
		for (var e, f = d(a.reduce(function (a, b) {
						return a + b
					}, 0) / a.length), g = d(a.reduce(function (a, b) {
						return b < f ? (a + b) / 2 : a
					}, 0)), h = 0; h < a.length; h += 1)
			for (e = a[h]; 0 < e; )
				0 == h % 2 ? c.push(1) : c.push(0), e -= g;
		for (var j = function (a) {
			var d = c.slice(a, a + 9).join(""),
			e = t.filter(function (a) {
					return Object.keys(a)[0] === d
				});
			b.push(e[0][d])
		}, k = 0; k < c.length; k += 9)
			j(k);
		if ("*" !== b.shift() || "*" !== b.pop())
			return null;
		for (var l, m, n = b.pop(), o = 0, p = function (a) {
			return Object.values(a)[0] === l
		}, q = b.length - 1; 0 <= q; q -= 1)
			l = b[q], m = t.indexOf(t.filter(p)[0]), o += m * (1 + (b.length - (q + 1)) % 20);
		if (Object.values(t[o % 47])[0] !== n)
			return null;
		var r = b.pop();
		o = 0;
		for (var s = b.length - 1; 0 <= s; s -= 1)
			l = b[s], m = t.indexOf(t.filter(p)[0]), o += m * (1 + (b.length - (s + 1)) % 20);
		return Object.values(t[o % 47])[0] === r ? b.join("") : null
	},
	v = {
		3211: "0",
		2221: "1",
		2122: "2",
		1411: "3",
		1132: "4",
		1231: "5",
		1114: "6",
		1312: "7",
		1213: "8",
		3112: "9"
	},
	w = function (a) {
		var b = "";
		a.unshift(0);
		for (var c, d = ~~((a[1] + a[2] + a[3]) / 3), f = 1; f < a.length; f += 1) {
			c = void 0,
			c = 6 > b.length ? a.slice(4 * f, 4 * f + 4) : a.slice(4 * f + 5, 4 * f + 9);
			var g = [e(c[0] / d), e(c[1] / d), e(c[2] / d), e(c[3] / d)],
			h = v[g.join("")] || v[g.reverse().join("")];
			if (h && (b += h), 12 === b.length)
				break
		}
		return b
	},
	x = {
		3211: "0",
		2221: "1",
		2122: "2",
		1411: "3",
		1132: "4",
		1231: "5",
		1114: "6",
		1312: "7",
		1213: "8",
		3112: "9"
	},
	y = function (a) {
		var b = "";
		a.unshift(0);
		for (var c, d = ~~((a[1] + a[2] + a[3]) / 3), f = 1; f < a.length; f += 1) {
			c = void 0,
			c = 4 > b.length ? a.slice(4 * f, 4 * f + 4) : a.slice(4 * f + 5, 4 * f + 9);
			var g = [e(c[0] / d), e(c[1] / d), e(c[2] / d), e(c[3] / d)],
			h = x[g.join("")] || x[g.reverse().join("")];
			if (h && (b += h), 8 === b.length)
				break
		}
		return b
	},
	z = {
		nnnnnww: "0",
		nnnnwwn: "1",
		nnnwnnw: "2",
		wwnnnnn: "3",
		nnwnnwn: "4",
		wnnnnwn: "5",
		nwnnnnw: "6",
		nwnnwnn: "7",
		nwwnnnn: "8",
		wnnwnnn: "9",
		nnnwwnn: "-",
		nnwwnnn: "$",
		wnnnwnw: ":",
		wnwnnnw: "/",
		wnwnwnn: ".",
		nnwwwww: "+",
		nnwwnwn: "A",
		nnnwnww: "B",
		nwnwnnw: "C",
		nnnwwwn: "D"
	},
	A = function (b) {
		for (var c = [], e = d(b.reduce(function (a, b) {
						return (a + b) / 2
					}, 0)); 0 < b.length; ) {
			var f = b.splice(0, 8).splice(0, 7),
			g = f.map(function (a) {
					return a < e ? "n" : "w"
				}).join("");
			c.push(z[g])
		}
		return c.join("")
	},
	B = function (a, b) {
		return b = {
			exports: {}
		},
		a(b, b.exports),
		b.exports
	}
	(function (a) {
		async function b(a, b) {
			var d = Math.floor;
			b.barcode = b.barcode.toLowerCase();
			var e = Object.keys(c);
			if (-1 === e.indexOf(b.barcode))
				throw new Error("Invalid barcode specified. Available decoders: " + e + ". https://github.com/mubaidr/Javascript-Barcode-Reader#available-decoders");
			for (var f = await h.getImageDataFromSource(a), j = f.data, k = f.width, l = f.height, m = j.length / (k * l), n = [1, 9, 2, 8, 3, 7, 4, 6, 5], o = n.length, p = l / (o + 1); o -= 1; ) {
				for (var q = m * k * d(p * n[o]), r = m * k * d(p * n[o]) + 2 * m * k, t = j.slice(q, r), u = [], v = 0, w = 0, x = {
						left: !0,
						right: !0
					}, y = 0; 2 > y; y += 1)
					for (var z = 0; z < k; z += 1) {
						var A = (y * k + z) * m,
						i = (3 * t[A] + 4 * t[A + 1] + 2 * t[A + 2]) / 9,
						g = u[z];
						t[A] = i,
						t[A + 1] = i,
						t[A + 2] = i,
						u[z] = i + (g || 0)
					}
				for (var s = 0; s < k; s += 1) {
					u[s] /= 2;
					var B = u[s];
					B < v ? v = B : w = B
				}
				for (var C = v + (w - v) / 2, D = [], E = 0; E < k; E += 1) {
					for (var F = 0, G = void 0, H = 0; 2 > H; H += 1)
						G = t[(H * k + E) * m], G > C && (F += 1);
					0 == E && G <= C && (x.left = !1),
					E == k - 1 && G <= C && (x.right = !1),
					D.push(1 < F)
				}
				for (var I = D[0], J = 1, K = [], L = 0; L < k; L += 1)
					D[L] === I ? (J += 1, L == k - 1 && K.push(J)) : (K.push(J), J = 1, I = D[L]);
				x.left && K.shift(),
				x.right && K.pop();
				var M = c[b.barcode](K, b.type);
				if (M)
					return M
			}
			throw new Error("Failed to extract barcode!")
		}
		var c = {
			"code-128": o,
			"code-2of5": q,
			"code-39": s,
			"code-93": u,
			"ean-13": w,
			"ean-8": y,
			codabar: A
		};
		a && a.exports ? a.exports = b : f.javascriptBarcodeReader = b
	});
	return B
}
(document);
//# sourceMappingURL=javascript-barcode-reader.min.js.map
