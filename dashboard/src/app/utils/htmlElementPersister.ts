
export class HtmlElementPersister {

    private _el: HTMLElement;
    private _container: HTMLElement;

    init(el: HTMLElement, container = window.document.body) {
        this._el = el;
        this._container = container;
    }

    hide() {
        this._el.style.display = 'none';
        this._container.appendChild(this._el);
    }

    restore(parent: HTMLElement) {
        if (!this._el) {
            return;
        }

        this._el.style.display = 'unset';
        parent.appendChild(this._el);
    }
}