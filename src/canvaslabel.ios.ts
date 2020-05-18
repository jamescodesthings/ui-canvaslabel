import { Group as GroupBase, Span as SpanBase } from './canvaslabel.common';
import { Font } from '@nativescript/core/ui/styling/font';
import { Color } from '@nativescript/core/color';

export { CanvasLabel } from './canvaslabel.common';

export function createSpannable(span: Span, parent?: Group): NSMutableAttributedString {
    const attrDict = {} as { key: string; value: any };
    const fontFamily = span.fontfamily || (parent && parent.fontfamily);
    const fontSize = span.fontsize || (parent && parent.fontsize);
    const fontweight = span.fontweight || (parent && parent.fontweight) || 'normal';
    const fontstyle = span.fontstyle || (parent && parent.fontstyle) || 'normal';
    const textcolor = span.color || (parent && parent.color);
    const backgroundcolor = span.backgroundcolor || (parent && parent.backgroundcolor);
    const textDecorations = span.textdecoration || (parent && parent.textdecoration);
    const verticaltextalignment = span.verticaltextalignment || (parent && parent.verticaltextalignment);

    if (fontweight || fontstyle || fontFamily || fontSize) {
        const font = new Font(fontFamily, fontSize, fontstyle, typeof span.fontweight === 'string' ? fontweight : ((fontweight + '') as any));
        const iosFont = font.getUIFont(null);
        attrDict[NSFontAttributeName] = iosFont;
    }
    if (verticaltextalignment) {
        attrDict['verticalTextAligment'] = verticaltextalignment;
    }
    if (textcolor) {
        const color = textcolor instanceof Color ? textcolor : new Color(textcolor as any);
        attrDict[NSForegroundColorAttributeName] = color.ios;
    }

    if (backgroundcolor) {
        const color = backgroundcolor instanceof Color ? backgroundcolor : new Color(backgroundcolor as any);
        attrDict[NSBackgroundColorAttributeName] = color.ios;
    }

    if (textDecorations) {
        const underline = textDecorations.indexOf('underline') !== -1;
        if (underline) {
            attrDict[NSUnderlineStyleAttributeName] = underline;
        }

        const strikethrough = textDecorations.indexOf('line-through') !== -1;
        if (strikethrough) {
            attrDict[NSStrikethroughStyleAttributeName] = strikethrough;
        }
    }
    let text = span.text;
    if (text.indexOf('\n') !== -1) {
        text = text.replace(/\\n/g, '\u{2029}');
    }
    return NSMutableAttributedString.alloc().initWithStringAttributes(text, attrDict as any);
}

export class Span extends SpanBase {
    createNative(parent?: Group) {
        this._native = createSpannable(this, parent);
    }
}
export class Group extends GroupBase {
    createNative() {
        const ssb = NSMutableAttributedString.new();
        this.spans.forEach((s) => {
            // s._startIndexInGroup = ssb.length;
            // s._endIndexInGroup = s.text ? s.text.length : 0;
            const native = s.getOrCreateNative(this);
            if (native) {
                ssb.appendAttributedString(native);
            }
        });
        // console.log('Group', 'createNative', ssb.toString());
        this._native = ssb;
    }
    onChildChange(span: Span) {
        this._native = null;
        this._staticlayout = null;
        super.onChildChange(span);
        // console.log('Group onChildChange', span.text, !!this._native, span._startIndexInGroup, span._endIndexInGroup, span.getOrCreateNative(this));
        // if (this._native) {
        //     (this._native as NSMutableAttributedString).replaceCharactersInRangeWithAttributedString({location:span._startIndexInGroup, length:span._endIndexInGroup}, span.getOrCreateNative(this) );
        // }
        // span._endIndexInGroup = span.text ? span.text.length : 0;
    }
}