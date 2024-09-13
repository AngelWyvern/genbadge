export function parseColor(input:string):number
{
	if (input == undefined || input.length <= 0)
		return NaN;

	if (input.startsWith('0x'))
		input = input.substring(2);

	const match = input.match(/[0-9a-fA-F]+/);
	if (match == null || match[0].length <= 0)
		return NaN;

	// short hand
	let code:string = match[0];
	if (code.length == 3)
		code = code[0] + code[0] + code[1] + code[1] + code[2] + code[2];
	else if (code.length == 4)
		code = code[0] + code[0] + code[1] + code[1] + code[2] + code[2] + code[3] + code[3];

	// alpha check
	if (code.length < 8)
		code = code + 'f'.repeat(8 - code.length);

	// safety
	if (code.length > 8)
		code = code.slice(0, 8);

	return parseInt('0x' + code);
}

export function hexifyColor(input:number):string
{
	let code:string = input.toString(16);
	if (code.length < 8)
		code = '0'.repeat(8 - code.length) + code;

	// alpha check
	if (code[6].toLowerCase() == 'f' && code[7].toLowerCase() == 'f')
		code = code.slice(0, 6);

	// short hand
	if (code.length == 6 && code[0] == code[1] && code[2] == code[3] && code[4] == code[5])
		code = code[0] + code[2] + code[4];
	else if (code.length == 8 && code[0] == code[1] && code[2] == code[3] && code[4] == code[5] && code[6] == code[7])
		code = code[0] + code[2] + code[4] + code[6];

	return '#' + code;
}

export function splitRGBA(input:number):RGBA
{
	let code:string = input.toString(16);
	if (code.length < 8)
		code = '0'.repeat(8 - code.length) + code;

	const rgba:RGBA =
	{
		r:parseInt('0x' + code[0] + code[1]) || 0,
		g:parseInt('0x' + code[2] + code[3]) || 0,
		b:parseInt('0x' + code[4] + code[5]) || 0,
		a:parseInt('0x' + code[6] + code[7]) || 255
	};
	return rgba;
}

export function getLuminance(input:number):number
{
	const color:RGBA = splitRGBA(input);

	function map(c:number):number
	{
		c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	}

	return 0.2126 * map(color.r) + 0.7152 * map(color.g) + 0.0722 * map(color.b);
}

export function useDarkColorsOver(input:number):boolean
{
	return getLuminance(input) >= 0.23;
}

export function transformNumber(input:number, ops:Array<TransformOp>):number
{
	ops.forEach(op =>
	{
		switch (op.fn)
		{
			case TransformFn.Translate:
				input += op.v;
				break;
			case TransformFn.Scale:
				input *= op.v;
				break;
		}
	});
	return input;
}

export function transformPath(d:string, ops:Array<TransformOp>):string
{
	if (ops.length <= 0)
		return d;

	const m = d.match(/[A-Z]|\d+\.?\d*|\s/g);
	if (m == null)
		return d;

	return m.map(v =>
	{
		if (v.match(/\d+\.?\d*/))
			return transformNumber(parseFloat(v), ops).toString();
		return v;
	}).join('');
}

export interface RGBA
{
	r:number,
	g:number,
	b:number,
	a:number
}

export interface TransformOp
{
	fn:TransformFn,
	v:number
}

export enum TransformFn
{
	Translate = 'translate',
	Scale = 'scale'
}