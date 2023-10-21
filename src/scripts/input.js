export default class Input {
    
    constructor() {
    }

    getContext(ctx) {
        if (!ctx) {
            return window
        }
        return ctx
    }

    filterContext(ctx) {
        if (ctx instanceof HTMLButtonElement) {
            ctx.addEventListener('mouseenter', (event) => {
                window.canvasClick = false
            })
            ctx.addEventListener('mouseleave', (event) => {
                window.canvasClick = true
            })
        }
    }

    mousedown(fn, ctx) {
        this.getContext(ctx).addEventListener('mousedown', fn, false);
    }

    mousemove(fn, ctx) {
        this.getContext(ctx).addEventListener('mousemove', fn, false);
    }

    mouseup(fn, ctx) {
        this.getContext(ctx).addEventListener('mouseup', fn, false);
    }

    touchstart(fn, ctx) {
        this.getContext(ctx).addEventListener('touchstart', fn, false);
    }

    touchmove(fn, ctx) {
        this.getContext(ctx).addEventListener('touchmove', fn, false);
    }

    touchend(fn, ctx) {
        this.getContext(ctx).addEventListener('touchend', fn, false);
    }

    click(fn, ctx) {
        this.filterContext(ctx);
        this.getContext(ctx).addEventListener('click', fn, false);
    }
    
}