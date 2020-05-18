import { Group as GroupBase, Span as SpanBase, VerticalTextAlignment } from './canvaslabel.common';
import { Font, FontWeight } from '@nativescript/core/ui/styling/font';
import { Color } from '@nativescript/core/color';

export { CanvasLabel } from './canvaslabel.common';

function isBold(fontWeight: FontWeight): boolean {
    return fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800' || fontWeight === '900';
}

// class VerticalCenterSpan extends android.text.style.ReplacementSpan {
//     constructor(private verticaltextalignment: VerticalTextAlignment) {
//         super();
//         return global.__native(this);
//     }
//     public getSize(p: android.graphics.Paint, text: string, start: number, end: number, fm: android.graphics.Paint.FontMetricsInt) {
//         // if (fm != null) {
//         //     const space = p.getFontMetricsInt(fm);

//         //     fm.ascent -= space;
//         //     fm.top -= space;
//         // }

//         return Math.round(p.measureText(text, start, end));
//     }
//     draw(canvas: android.graphics.Canvas, text: any, start: number, end: number, x: number, top: number, y: number, bottom: number, paint: android.graphics.Paint) {
//         const h = bottom - top;
//         const fm = paint.getFontMetricsInt();
//         const space = fm.ascent - fm.descent + fm.leading;
//         switch (this.verticaltextalignment) {
//             case 'top':
//                 canvas.drawText(text.subSequence(start, end).toString(), x, y - h - space, paint);
//                 break;
//             case 'center':
//             case 'middle':
//                 canvas.drawText(text.subSequence(start, end).toString(), x, y - h / 2 - space / 2, paint);
//                 break;
//             default:
//                 canvas.drawText(text.subSequence(start, end).toString(), x, y, paint);
//         }
//     }
// }

let lineSeparator;
export function createSpannable(span: Span, parent?: Group) {
    let text = span.text;
    // console.log('createSpannable', text);
    if (!text) {
        return null;
    }

    if (text.indexOf('\n') !== -1) {
        if (!lineSeparator) {
            lineSeparator = java.lang.System.getProperty('line.separator');
        }
        text = text.replace(/\\n/g, lineSeparator);
    }
    const length = text.length;
    let ssb = span._ssb;
    if (!ssb) {
        span._ssb = ssb = new android.text.SpannableStringBuilder(text);
    } else {
        ssb.clear();
        ssb.append(text);
    }

    const fontFamily = span.fontfamily || (parent && parent.fontfamily);
    const fontSize = span.fontsize || (parent && parent.fontsize);
    const fontweight = span.fontweight || (parent && parent.fontweight) || 'normal';
    const fontstyle = span.fontstyle || (parent && parent.fontstyle) || 'normal';

    const textcolor = span.color || (parent && parent.color);
    const textDecorations = span.textdecoration || (parent && parent.textdecoration);
    const backgroundcolor = span.backgroundcolor || (parent && parent.backgroundcolor);
    const verticaltextalignment = span.verticaltextalignment || (parent && parent.verticaltextalignment);

    const bold = isBold(fontweight);
    const italic = fontstyle === 'italic';
    if (bold && italic) {
        ssb.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.BOLD_ITALIC), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    } else if (bold) {
        ssb.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.BOLD), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    } else if (italic) {
        ssb.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.ITALIC), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    if (fontFamily) {
        const font = new Font(fontFamily, 0, italic ? 'italic' : 'normal', bold ? 'bold' : 'normal');
        const typeface = font.getAndroidTypeface() || android.graphics.Typeface.create(fontFamily, 0);
        const typefaceSpan: android.text.style.TypefaceSpan = new org.nativescript.widgets.CustomTypefaceSpan(fontFamily, typeface);
        ssb.setSpan(typefaceSpan, 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }
    if (verticaltextalignment) {
        ssb.setSpan(new (com as any).nativescript.canvaslabel.VerticalCenterSpan(verticaltextalignment), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }
    if (fontSize) {
        ssb.setSpan(new android.text.style.AbsoluteSizeSpan(fontSize), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    if (textcolor) {
        const color = textcolor instanceof Color ? textcolor : new Color(textcolor as any);
        ssb.setSpan(new android.text.style.ForegroundColorSpan(color.android), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }
    if (backgroundcolor) {
        const color = backgroundcolor instanceof Color ? backgroundcolor : new Color(backgroundcolor as any);
        ssb.setSpan(new android.text.style.BackgroundColorSpan(color.android), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    if (textDecorations) {
        const underline = textDecorations.indexOf('underline') !== -1;
        if (underline) {
            ssb.setSpan(new android.text.style.UnderlineSpan(), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }

        const strikethrough = textDecorations.indexOf('line-through') !== -1;
        if (strikethrough) {
            ssb.setSpan(new android.text.style.StrikethroughSpan(), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
    }
    return ssb;
}

export class Span extends SpanBase {
    _ssb: android.text.SpannableStringBuilder;
    createNative(parent?: Group) {
        // const startTime = Date.now();
        this._native = this._ssb = createSpannable(this, parent);
        // console.log('createNative', Date.now() - startTime, 'ms');
    }
}

export class Group extends GroupBase {
    _ssb: android.text.SpannableStringBuilder;
    createNative() {
        // const startTime = Date.now();
        let ssb = this._ssb;
        if (!ssb) {
            this._ssb = ssb = new android.text.SpannableStringBuilder();
        } else {
            ssb.clear();
        }
        this.spans.forEach((s) => {
            // s._startIndexInGroup = ssb.length();
            // s._endIndexInGroup = s._startIndexInGroup + (s.text ? s.text.length: 0);
            const native = s.getOrCreateNative(this);
            if (native) {
                ssb.append(native);
            }
        });
        // console.log('Group createNative', Date.now() - startTime, 'ms');
        this._native = ssb;
    }
    onChildChange(span: Span) {
        this._native = null;
        this._staticlayout = null;
        super.onChildChange(span);
        // if (this._native) {
        //     (this._native as android.text.SpannableStringBuilder).replace(span._startIndexInGroup, span._endIndexInGroup, span.getOrCreateNative(this));
        // }
        // span._endIndexInGroup = span._startIndexInGroup + (span.text ? span.text.length: 0);
    }
}