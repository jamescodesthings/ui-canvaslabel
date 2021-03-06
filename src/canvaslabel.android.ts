import { Paint } from '@nativescript-community/ui-canvas';
import { Color, getTransformedText, profile } from '@nativescript/core';
import { FontWeight } from '@nativescript/core/ui/styling/font';
import { CanvasLabel as CanvasLabelBase, Group as GroupBase, Span as SpanBase, paintFontCache } from './canvaslabel.common';

function isBold(fontWeight: FontWeight): boolean {
    return fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800' || fontWeight === '900';
}

export const typefaceCache = {};

let SDK_INT = -1;
function getSDK() {
    if (SDK_INT === -1) {
        SDK_INT = android.os.Build.VERSION.SDK_INT;
    }
    return SDK_INT;
}

let lineSeparator;
let Style: typeof android.text.style;
let Spanned: typeof android.text.Spanned;

export const createSpannable = profile('createSpannable', function (span: Span, parentCanvas: CanvasLabel, parent?: Group, maxFontSize?: number) {
    let text = span.text;
    if (!text || span.visibility !== 'visible') {
        return null;
    }
    const fontSize = span.fontSize;
    const fontWeight = span.fontWeight || 'normal';
    const fontStyle = span.fontStyle || (parent && parent.fontStyle) || 'normal';
    const fontFamily = span.fontFamily;

    const color = span.color;
    const textDecorations = span.textDecoration || (parent && parent.textDecoration);
    const backgroundcolor = span.backgroundColor || (parent && parent.backgroundColor);
    const verticalTextAlignment = span.verticalTextAlignment;
    const letterSpacing = span.letterSpacing || (parent && parent.letterSpacing);
    const lineHeight = span.lineHeight || (parent && parent.lineHeight);
    const realMaxFontSize = Math.max(maxFontSize, parentCanvas.fontSize || 0);

    if (typeof text === 'boolean' || typeof text === 'number') {
        text = text.toString();
    }
    const textTransform = span.textTransform || (parent && parent.textTransform);
    if (textTransform) {
        text = getTransformedText(text, textTransform);
    }
    if (typeof text === 'string') {
        if (text.indexOf('\n') !== -1) {
            if (!lineSeparator) {
                lineSeparator = java.lang.System.getProperty('line.separator');
            }
            text = text.replace(/\\n/g, lineSeparator);
        }
    }
    const length = typeof text.length === 'function' ? text.length() : text.length;

    let ssb = span._ssb;
    if (!ssb) {
        span._ssb = ssb = NSPan.createSpannableStringBuilder(text);
    } else {
        ssb.clear();
        ssb.clearSpans();
        ssb.append(text);
    }

    if (!Style) {
        Style = android.text.style;
    }
    if (!Spanned) {
        Spanned = android.text.Spanned;
    }
    const bold = isBold(fontWeight);
    const italic = fontStyle === 'italic';
    // if (getSDK() < 28) {
    if (bold && italic) {
        ssb.setSpan(new Style.StyleSpan(android.graphics.Typeface.BOLD_ITALIC), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    } else if (bold) {
        ssb.setSpan(new Style.StyleSpan(android.graphics.Typeface.BOLD), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    } else if (italic) {
        ssb.setSpan(new Style.StyleSpan(android.graphics.Typeface.ITALIC), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }
    // }
    if (fontFamily || (fontWeight !== 'normal' && !bold)) {
        const fontCacheKey = fontFamily + fontWeight + fontStyle;

        let typeface = typefaceCache[fontCacheKey];
        if (!typeface) {
            let paint: Paint = paintFontCache[fontCacheKey];
            if (!paint) {
                paint = span.paint;
                paint.setFontFamily(fontFamily);
                paint.setFontWeight(fontWeight);
                paint.setFontStyle(fontStyle);
                paintFontCache[fontCacheKey] = paint;
            }
            typeface = typefaceCache[fontCacheKey] = paint.getFont().getAndroidTypeface();
        }
        const typefaceSpan = new com.nativescript.text.CustomTypefaceSpan(fontFamily, typeface);
        ssb.setSpan(typefaceSpan, 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }
    if (verticalTextAlignment && verticalTextAlignment !== 'initial') {
        ssb.setSpan(new com.nativescript.text.BaselineAdjustedSpan(fontSize as any, verticalTextAlignment, realMaxFontSize as any), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }
    if (fontSize) {
        ssb.setSpan(new Style.AbsoluteSizeSpan(fontSize), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    if (letterSpacing) {
        ssb.setSpan(new Style.ScaleXSpan((letterSpacing + 1) / 10), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    if (lineHeight !== undefined) {
        ssb.setSpan(new com.nativescript.text.HeightSpan(lineHeight), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    if (color) {
        const ncolor = color instanceof Color ? color : new Color(color);
        ssb.setSpan(new Style.ForegroundColorSpan(ncolor.android), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }
    if (backgroundcolor) {
        const color = backgroundcolor instanceof Color ? backgroundcolor : new Color(backgroundcolor as any);
        ssb.setSpan(new Style.BackgroundColorSpan(color.android), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    if (textDecorations) {
        const underline = textDecorations.indexOf('underline') !== -1;
        if (underline) {
            ssb.setSpan(new Style.UnderlineSpan(), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }

        const strikethrough = textDecorations.indexOf('line-through') !== -1;
        if (strikethrough) {
            ssb.setSpan(new Style.StrikethroughSpan(), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
    }
    // if (span._tappable) {
    //     initializeClickableSpan();
    //     ssb.setSpan(new ClickableSpan(span), 0, length, Spanned.SPAN_INCLUSIVE_INCLUSIVE);
    // }
    return ssb;
});

export class Span extends SpanBase {
    _ssb: android.text.SpannableStringBuilder;

    @profile
    createNative(parentCanvas: CanvasLabelBase, parent?: Group, maxFontSize?: number) {
        this._native = this._ssb = createSpannable(this, parentCanvas, parent, maxFontSize);
    }
}

const NSPan = com.nativescript.canvaslabel.Span;
export class Group extends GroupBase {
    _ssb: android.text.SpannableStringBuilder;

    @profile
    createNative(parentCanvas: CanvasLabelBase, parent?: Group, maxFontSize?: number) {
        if (!this._spans) {
            this._native = null;
            return;
        }
        let ssb = this._ssb;
        if (!ssb) {
            this._ssb = ssb = NSPan.createSpannableStringBuilder();
        } else {
            ssb.clear();
            ssb.clearSpans();
        }
        if (maxFontSize === undefined) {
            // top group let s get max font Size
            maxFontSize = this.getMaxFontSize();
        }
        this._spans &&
            this._spans.forEach((s) => {
                const native = (s as Span).getOrCreateNative(parentCanvas, this, maxFontSize);
                if (native) {
                    ssb.append(native);
                }
            });
        this._native = ssb;
    }
    onChildChange(span: Span) {
        this._native = null;
        this._staticlayout = null;
        super.onChildChange(span);
    }
}

export class CanvasLabel extends CanvasLabelBase {}
