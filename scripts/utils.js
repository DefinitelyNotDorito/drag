export class Utils {
    constructor() {}

    static createElement(tag, options = {}) {

        const element = document.createElement(tag);
        
        if (options.classes) {
            if (Array.isArray(options.classes)) {
                element.classList.add(...options.classes);
            } else {
                element.className = options.classes;
            }
        }

        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (options.properties) {
            Object.entries(options.properties).forEach(([key, value]) => {
                element[key] = value;
            });
        }
        
        if (options.text) element.textContent = options.text;
        
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }
        
        if (options.children) {
            options.children.forEach(child => {
                element.appendChild(child);
            });
        }
        
        return element; 
    }
}