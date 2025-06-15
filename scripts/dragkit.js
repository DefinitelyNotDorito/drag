class KitTabManager{
    constructor(){
        this.currentKitTab = null
        this.kitTabs = new Map()
        this.kitTabButtons = new Map()
        this.kitActive = true
        this.init()
    }
    
    init(){

        const kitTabElements = document.querySelectorAll('.kit-tab')
        const kitTabButtonElements = document.querySelectorAll('.kit-button')
        const kitHideBtn = document.querySelector('.kit-hide-button')

        kitTabButtonElements.forEach(ktb => {
            if(ktb.id){
                const tabID = ktb.id.substring(6)
                this.kitTabButtons.set(tabID, ktb)
                ktb.addEventListener('click', () => this.switchTab(tabID))
            }
        })
        
        kitTabElements.forEach(kt => {
            if(kt.id){
                this.kitTabs.set(kt.id, kt)
                kt.classList.add('hidden')
                kt.querySelectorAll('.kit-add-button').forEach(kab => {
                    kab.addEventListener('click', drag_factory.createDraggable(kab))
                })
            }
        })

        kitHideBtn.addEventListener('click', () => {
            this.toggleKit()
        })

    }
    
    switchTab(tabID){
        const targetTab = this.kitTabs.get(tabID)
        if(!targetTab) return

        // when the same tab close it 
        if(this.currentKitTab === tabID){
            targetTab.classList.add('hidden')
            this.currentKitTab = null
            return
        }
        
        if(this.currentKitTab){
            const currentTab = this.kitTabs.get(this.currentKitTab)
            if(currentTab) {
                currentTab.classList.add('hidden')
            }
        }
        
        targetTab.classList.remove('hidden')
        this.currentKitTab = tabID
    }
    
    toggleKit(){
        const kitHideIcon = document.querySelector('.kit-hide-icon')
        const kitCont = document.querySelector('.kit-button-container')

        kitHideIcon.classList.toggle('fa-chevron-right')
        kitHideIcon.classList.toggle('fa-chevron-left')
        kitCont.classList.toggle('slideout')
        
        this.kitActive = !this.kitActive
        
        // when the kit close any open tab
        if(!this.kitActive && this.currentKitTab){
            const currentTab = this.kitTabs.get(this.currentKitTab)
            if(currentTab) {
                currentTab.classList.add('hidden')
            }
            this.currentKitTab = null
        }
    }
}
class DragManager{
    constructor(){
        this.currentObject = null
        this.isDragging = false
        this.dragOffset = { x: 0, y: 0}

        this.init()
    }
    init(){
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.currentDragObject) {
                const newX = e.clientX - this.dragOffset.x
                const newY = e.clientY - this.dragOffset.y
                
                this.currentDragObject.moveTo(newX, newY)
            }
        })

        document.addEventListener('mouseup', () => {
            
            if (this.currentDragObject) {
                this.currentDragObject.element.classList.remove('dragging')
            }
            this.isDragging = false
            this.currentDragObject = null
        })
    }
    startDrag(dragObject, mouseEvent){
        this.isDragging = true
        this.currentDragObject = dragObject
        this.currentDragObject.element.classList.add('dragging')

        const objectRect = dragObject.element.getBoundingClientRect()
        this.dragOffset.x = mouseEvent.clientX - objectRect.left
        this.dragOffset.y = mouseEvent.clientY - objectRect.top
    }
}

class Draggable{
    constructor(element, handle = element){
        this.element = element
        this.handle = handle
        this.setupDrag()
    }
    setupDrag(){
        this.handle.addEventListener('mousedown', (e) => {
            drag_manager.startDrag(this, e)
        })
    }
    moveTo(x, y){
        this.element.style.left = x + 'px'
        this.element.style.top = y + 'px'
    }
}

class SettingManager{
    constructor(){
        this.settings = new Map
        this.initDefSettings()
    }
    initDefSettings(){
        const savedSettings = localStorage.getItem('appSettings')
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                for (const key in parsedSettings) {
                    this.settings.set(key, parsedSettings[key]);
                }
            } catch (e) {
                console.error("Error parsing settings from localStorage", e);
                this.setDefSettings();
            }
        } else {
            this.setDefSettings();
        }
        this.applySettings()
    }
    setDefSettings(){
        this.settings.set('showGrid', true)
        this.settings.set('noteType', 'prompt')
        this.settings.set('hideEverything', false)
        this.settings.set('deletableItems', true)
        this.settings.set('darkMode', true)
    }
    getSetting(key) {
        return this.settings.get(key);
    }
    setSetting(key, value) {
        this.settings.set(key, value);
        this.saveSettings();
        this.applySettings(); 
    }
    saveSettings() {
        localStorage.setItem('appSettings', JSON.stringify(Object.fromEntries(this.settings)));
    }
    applySettings() {
        const body = document.body;

        if(this.getSetting('showGrid')) {
            body.classList.remove('hide-grid');
        }
        else {
            body.classList.add('hide-grid');
        }

        if(this.getSetting('noteType') === 'prompt'){
            drag_factory.noteType = 'prompt'
        }
        else{
            drag_factory.noteType = 'input'
        }
        console.log("Settings applied:", Object.fromEntries(this.settings));
    }
}

class DragFactory{
    constructor(){
        this.noteType = 'input'
    }
    createElement(tag, options = {}) {

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
    massChilren(target, childlist){
        childlist.forEach(child => {
            target.appendChild(child)
        })
    }
    createDraggable(buttonElement){
        return (event) => { 
            const type = buttonElement.dataset.type
            const color = buttonElement.dataset.color

            const dragName = this.createElement('span', {
                text: `${type} - ${color}`,
                classes: ['drag-name']
            })

            const dragDelIcon = this.createElement('i', {
                classes: ['fa-solid', 'fa-x', 'drag-del-icon']
            })

            const dragDel = this.createElement('button', {
                classes: 'drag-del-button',
                events: {
                    click: () => {
                        newDrag.remove()
                        if(type === 'settings'){
                            buttonElement.disabled = false
                        }
                    }
                },
                children: [dragDelIcon]
            })

            const newDragTopBar = this.createElement('div', {
                classes: 'drag-top-bar',
                children: [dragName, dragDel]
            })

            const dragContent = this.createElement('div')

            if(type === 'settings'){

                const settingList = this.createElement('ul', {
                    classes: 'drag-setting-list'
                })

                const gridToggle = this.createElement('li', {
                    classes: 'drag-setting-item'
                })

                const gridSpan = this.createElement('span', {
                    text: 'Toggle grid'
                })

                const gridToggleButton = this.createElement('input', {
                    attributes: {
                        type: 'checkbox'
                    },
                    classes: 'grid-setting-switch',
                    properties: {
                        checked: setting_manager.getSetting('showGrid')
                    },
                    events: {
                        change: (e) => {
                            setting_manager.setSetting('showGrid', e.target.checked)
                        }
                    }
                })
                this.massChilren(gridToggle, [gridSpan, gridToggleButton])
                dragContent.appendChild(settingList)
                settingList.appendChild(gridToggle)
                buttonElement.disabled = true
            }

            const newDrag = this.createElement('div', {
                classes: ['draggable-item', `drag-${type}`, `${color}`],
                children: [newDragTopBar, dragContent],
            })

            document.body.appendChild(newDrag) 
            this.makeDraggable(newDrag, newDragTopBar) 
        }
    }
    makeDraggable(element, handle){
        element.style.position = 'absolute'
        return new Draggable(element, handle)
    }
}


const drag_factory = new DragFactory()
const setting_manager = new SettingManager()
setting_manager.applySettings()

const kit_tab_manager = new KitTabManager()
const drag_manager = new DragManager()


const clearAllButton = document.querySelector('.kit-clear-all')

clearAllButton.addEventListener('click', () => {
    document.querySelectorAll('.draggable-item').forEach(dr_item => {
        dr_item.remove()
        if(document.querySelector('[data-type="settings"]').disabled){
            document.querySelector('[data-type="settings"]').disabled = false
        }
    });
})
