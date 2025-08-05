import { Utils } from "./utils.js";

class WindowManager{
    constructor(){
        this.currentKitTab = null
        this.kitTabs = new Map()
        this.kitTabButtons = new Map()
        this.kitActive = true
        this.initToolbox()
        this.initThemeToggle()

        this.isDragging = false
        this.currentDragObject = null
        this.dragOffset = { x: 0, y: 0 }

        this.initDragAndDrop()
    }
    initToolbox(){
        const toolboxToggle = document.querySelector('.drag-toolbox-toggle')
        const toolbox = document.querySelector('.drag-toolbox')
        toolboxToggle.addEventListener('click', () => {
            toolboxToggle.classList.toggle('active')
            const ToobloxToggleIcon = toolboxToggle.querySelector('i')
            ToobloxToggleIcon.classList.toggle('fa-arrow-right')
            ToobloxToggleIcon.classList.toggle('fa-arrow-left')
            if(toolbox.classList.contains('hidden')){
                toolbox.classList.remove('hidden')
                toolbox.classList.add('slide-in-left')
                toolboxToggle.disabled = true
                setTimeout(() => {
                    toolbox.classList.remove('slide-in-left')
                    toolboxToggle.disabled = false
                }, 500);
            }
            else{
                toolbox.classList.add('slide-out-left')
                toolboxToggle.disabled = true
                setTimeout(() => {
                    toolbox.classList.remove('slide-out-left')
                    toolbox.classList.add('hidden')
                    toolboxToggle.disabled = false
                }, 500);
            }
        })
        const toolboxItems = document.querySelectorAll('.toolbox-item')
        toolboxItems.forEach(item => {
            item.addEventListener('click', () => {
                const noteType = item.dataset.noteType
                new NoteDrag(noteType)
            })
        })

        const categorySelect = document.querySelector('#category-select')
        categorySelect.value = "All"
        categorySelect.addEventListener('change', () => {
            const selectedCategory = categorySelect.value
            this.filterToolboxItems(selectedCategory)
        })
    }
    filterToolboxItems(category){
        const toolboxItems = document.querySelectorAll('.toolbox-item')
        toolboxItems.forEach(item => {
            if(category == "All"){
                item.classList.remove('hidden')
            }
            else if(item.classList.contains(category)){
                item.classList.remove('hidden')
            }
            else{
                item.classList.add('hidden')
            }
        })
    }
    initThemeToggle(){
        const themeToggle = document.querySelector('.theme-toggle')
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode')
            const ThemeIcon = themeToggle.querySelector('i')
            ThemeIcon.classList.toggle('fa-sun-bright')
            ThemeIcon.classList.toggle('fa-moon')
        })
    }
    initDragAndDrop(){
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
                this.recentOnTop(this.currentDragObject)
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
    recentOnTop(dragObject){
        document.querySelectorAll('.drag-element').forEach(element => {
            if (element === dragObject.element) {
                element.classList.add('recent')
            }
            else {
                element.classList.remove('recent')
            }

        });
    }
}

class Draggable{
    constructor(elementName){
        this.elementName = elementName || 'Draggable'
        const builtStuff = this.buildBase()
        this.element = builtStuff[0]
        this.topbar = builtStuff[1]
        this.elementContent = builtStuff[2]
        this.handle = builtStuff[3]
        this.setupDrag()
        document.body.appendChild(this.element)
        this.moveTo(300, 200) // Default position
    }
    setupDrag(){
        this.handle.addEventListener('mousedown', (e) => {
            windowManager.startDrag(this, e)
        })
    }
    buildBase(){

        const dragName = Utils.createElement('span', {
            classes: ['drag-name'],
            text: `${this.elementName}`
        })

        const topBarButtons = Utils.createElement('div', {
            classes: ['top-bar-buttons', 'df', 'spb-c']
        })

        const closeButton = Utils.createElement('button', {
            classes: ['top-bar-button', 'close-button'],
            children: [Utils.createElement('i', {
                classes: ['fa-solid', 'fa-xmark']
            })],
            events: {
                click: () => this.element.remove()
            }
        })

        const collapseButton = Utils.createElement('button', {
            classes: ['top-bar-button', 'collapse-button'],
            children: [Utils.createElement('i', {
                classes: ['fa-solid', 'fa-chevron-up']
            })],
            events: {
                click: () => {
                    this.element.classList.toggle('collapsed')
                    collapseButton.querySelector('i').classList.toggle('fa-chevron-down')
                    collapseButton.querySelector('i').classList.toggle('fa-chevron-up')
                }
            }
        })

        const settingsButton = Utils.createElement('button', {
            classes: ['top-bar-button', 'settings-button'],
            children: [Utils.createElement('i', {
                classes: ['fa-solid', 'fa-gear']
            })],
            events: {
                click: () => this.openSettings()
            }
        })

        topBarButtons.appendChild(settingsButton)
        topBarButtons.appendChild(collapseButton)
        topBarButtons.appendChild(closeButton)

        const dragTopBar = Utils.createElement('div', {
            classes: ['drag-top-bar', 'df', 'spb-c'],
            children: [dragName, topBarButtons]
        })

        const dragContent = Utils.createElement('div', {
            classes: ['drag-content']
        })



        const dragElement = Utils.createElement('div', {
            classes: ['drag-element'],
            children: [dragTopBar, dragContent]
        })
        return [dragElement, dragTopBar, dragContent, dragTopBar]
    }
    moveTo(x, y){
        const maxX = window.innerWidth - this.element.offsetWidth;
        const maxY = window.innerHeight - this.element.offsetHeight;
        this.element.style.left = Math.max(0, Math.min(maxX, x)) + 'px'
        this.element.style.top = Math.max(0, Math.min(maxY, y)) + 'px'
    }
}

class NoteDrag extends Draggable{
    constructor(mode = 'text'){
        const noteName = `Note: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`
        super(noteName)
        this.element.classList.add('drag-note', 'yellow')

        switch (mode) {
            case 'text':
                this.makeTextNote();
                break;
            case 'table':
                this.makeTableNote();
                break;
            case 'list':
                this.makeListNote();
                break;
        }
    }
    makeTextNote(){
        const textArea = Utils.createElement('textarea', {
            classes: ['note-textarea'],
            properties: {
                placeholder: 'Type your note here...'
            }
        });
        this.elementContent.appendChild(textArea);
        textArea.focus();
    }
    makeListNote(){
        
    }
    makeTableNote(){}
}

class TimeDrag extends Draggable{}

class SpecDrag extends Draggable{}   

const windowManager = new WindowManager()