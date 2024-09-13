import express from 'express';
import config from '../srvconfig.json';
import { logger } from './logger';
import { parseColor, hexifyColor, useDarkColorsOver, transformPath, type TransformOp, TransformFn } from './utils';
import { glyphs } from './glyphs';
import { create as buildxml } from 'xmlbuilder2';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

const app = express();

(function main():void
{
	app.get('/', (req:express.Request, res:express.Response) =>
	{
		if (Object.keys(req.query).length <= 0)
		{
			logger.warn(`\x1b[1m\x1b[36m(${req.hostname})\x1b[0m Empty query, ignoring...`);
			res.send('No input');
			return;
		}

		logger.info(`\x1b[1m\x1b[36m(${req.hostname})\x1b[0m Building query: \x1b[32m${JSON.stringify(req.query)}\x1b[0m`);
		res.contentType('image/svg+xml');
		res.send(buildQuery(req.query));
	});

	app.listen(config.port, config.host, () =>
	{
		logger.info(`Web server online at ${config.host}:${config.port}`);
	});
})();

function buildQuery(query:any):string
{
	const params:QParams = parse(query);
	const factor:number = params.h / 32;
	//console.log(params);

	const xml = buildxml();

	const root = xml.ele('http://www.w3.org/2000/svg', 'svg');
	root.att('width', params.w.toString());
	root.att('height', params.h.toString());

	let bg:XMLBuilder = root.ele('polygon');
	let badge:XMLBuilder = root.ele('polygon');

	switch (params.shape)
	{
		case Shape.Diamond:
		case Shape.InsetDiamond:
			bg = root.ele('polygon');
			badge = root.ele('polygon');

			bg.att('points', buildPoly(params.shape, { x:0, y:0, w:params.w, h:params.h }, factor, true));
			badge.att('points', buildPoly(params.shape, { x:0, y:0, w:params.h, h:params.h }, factor));
			break;

		default:
			bg = root.ele('rect');
			badge = root.ele('rect');

			buildRect(bg, params.shape, { x:0, y:0, w:params.w, h:params.h }, factor, true);
			buildRect(badge, params.shape, { x:0, y:0, w:params.h, h:params.h }, factor);
	}

	bg.att('fill', hexifyColor(params.bg));
	badge.att('fill', hexifyColor(params.accent));

	if (params.icon != 'none' && Object.keys(glyphs).includes(params.icon))
	{
		let dfactor:number = factor, grade:number = 1;
		let transforms:Array<TransformOp> = [];

		if (params.shape == Shape.InsetDiamond)
		{
			dfactor *= 0.9; // 0.75 would be the correct factor here, but it comes off a little small
			transforms.push({ fn:TransformFn.Translate, v:1.8625 });
		}

		if (dfactor != 1)
			transforms.push({ fn:TransformFn.Scale, v:dfactor });

		let glyph:string = Reflect.get(glyphs, params.icon), index:number;
		if ((index = glyph.indexOf(';')) != -1)
		{
			let properties:Array<string> = glyph.slice(0, index).split(','), tmp:Array<string>;
			glyph = glyph.slice(index + 1, glyph.length);

			properties.forEach(prop =>
			{
				tmp = prop.split('=');
				switch (tmp[0].toLowerCase())
				{
					case 'g':
						grade = parseFloat(tmp[1]);
						break;
				}
			});
		}

		const icon = root.ele('path');
		icon.att('d', transformPath(glyph, transforms));
		icon.att('fill', '#0000');
		icon.att('stroke', useDarkColorsOver(params.accent) ? '#000' : '#fff');
		icon.att('stroke-width', (dfactor * 2.625 * grade).toString());
	}

	if (params.label.length > 0)
	{
		const text = root.ele('text');

		text.att('dominant-baseline', 'middle');

		switch (params.align)
		{
			case TextAlign.Left:	text.att('text-anchor', 'left'); break;
			case TextAlign.Center:	text.att('text-anchor', 'middle'); break;
			case TextAlign.Right:	text.att('text-anchor', 'end'); break;
		}

		positionText(text, params, factor);

		text.att('font-family', 'Bahnschrift, Arial, sans-serif');
		text.att('font-size', (params.h * 0.6484375).toString()); // magic numbers ftw
		text.att('font-weight', '600');
		text.att('fill', hexifyColor(params.fg));

		text.txt(params.label);
	}

	return root.end({ headless:true });
}

function buildRect(obj:XMLBuilder, shape:Shape, area:Rect, factor:number = 1, wide:boolean = false):void
{
	if (shape.startsWith('inset'))
	{
		if (!wide)
			area = applyInsets(area, factor);
		shape = shape.substring(5) as Shape;
	}

	obj.att('x', area.x.toString());
	obj.att('y', area.y.toString());
	obj.att('width', area.w.toString());
	obj.att('height', area.h.toString());

	switch (shape)
	{
		case Shape.Pill:
			obj.att('rx', (area.h / 2).toString());
			obj.att('ry', (area.h / 2).toString());
			break;
	}
}

function buildPoly(shape:Shape, area:Rect, factor:number = 1, wide:boolean = false):string
{
	let points:Array<Point> = [];

	if (shape.startsWith('inset'))
	{
		if (!wide)
			area = applyInsets(area, factor);
		shape = shape.substring(5) as Shape;
	}

	switch (shape)
	{
		case Shape.Square:
			points.push({ x:area.x, y:area.y }, { x:area.x + area.w, y:area.y },
			            { x:area.x + area.w, y:area.y + area.h }, { x:area.x, y:area.y + area.h });
			break;
		case Shape.Diamond:
			points.push({ x:area.x, y:area.y + (area.h / 2) }, { x:area.x + (area.h / 2), y:area.y });
			if (wide)
				points.push({ x:area.x + area.w - (area.h / 2), y:area.y });
			points.push({ x:area.x + area.w, y:area.y + (area.h / 2) });
			if (wide)
				points.push({ x:area.x + area.w - (area.h / 2), y:area.y + area.h });
			points.push({ x:area.x + (area.h / 2), y:area.y + area.h });
			break;
	}

	return points.map(p => `${p.x},${p.y}`).join(' ');
}

function applyInsets(area:Rect, factor:number):Rect
{
	area.x += 4 * factor;
	area.y += 4 * factor;
	area.w -= 8 * factor;
	area.h -= 8 * factor;
	return area;
}

function positionText(text:XMLBuilder, params:QParams, factor:number):void
{
	let shape = params.shape, inset:boolean = false;
	if (inset = shape.startsWith('inset'))
		shape = shape.substring(5) as Shape;

	switch (params.align)
	{
		case TextAlign.Left:switch (shape)
		{
			default:text.att('x', (params.h + factor * (inset ? 2 : 8)).toString());
		}
		break;

		case TextAlign.Center:switch (shape)
		{
			case Shape.Diamond:text.att('x', (params.w / 2 + factor * 8).toString()); break;
			case Shape.Pill:text.att('x', (params.w / 2 + params.h / 4).toString()); break;
			default:text.att('x', ((params.w + params.h) / 2).toString());
		}
		break;

		case TextAlign.Right:switch (shape)
		{
			case Shape.Diamond:text.att('x', (params.w - params.h / 2 - factor * 8).toString()); break;
			case Shape.Pill:text.att('x', (params.w - params.h / 4).toString()); break;
			default:text.att('x', (params.w - factor * 8).toString());
		}
		break;
	}
	text.att('y', (params.h / 2 + 2).toString());
}

function parse(query:any):QParams
{
	const params:QParams =
	{
		shape:query.shape?.toLowerCase() || Shape.Square,
		w:parseFloat(query.w) || 128,
		h:parseFloat(query.h) || 32,
		bg:parseColor(query.bg) || 0xFFFFFFFF,
		fg:parseColor(query.fg) || 0x000000FF,
		accent:parseColor(query.accent) || 0x00000080,
		icon:query.icon?.toLowerCase() || 'none',
		label:query.label || '',
		align:query.align?.toLowerCase() || TextAlign.Left
	};
	return params;
}

interface QParams
{
	shape:Shape,
	w:number,
	h:number,
	bg:number,
	fg:number,
	accent:number,
	icon:string,
	label:string,
	align:TextAlign
}

enum Shape
{
	Square = 'square',
	Diamond = 'diamond',
	Pill = 'pill',
	InsetSquare = 'insetsquare',
	InsetDiamond = 'insetdiamond',
	InsetPill = 'insetpill'
}

interface Point
{
	x:number,
	y:number
}

interface Rect
{
	x:number,
	y:number,
	w:number,
	h:number
}

enum TextAlign
{
	Left = 'left',
	Center = 'center',
	Right = 'right'
}