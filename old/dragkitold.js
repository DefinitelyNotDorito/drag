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
    createDropdown(label, options, currentValue, events){

        const dropdownLabel = this.createElement('label', {
            text: label,
            classes: ['dropdown-label']
        })
        
        const selectElement = this.createElement('select', {
            classes: ['custom-dropdown'],
            events: events
        });

        options.forEach(option => {
            const optionElement =  this.createElement('option', {
                attributes: {
                    value: option.value
                },
                text: option.text,
                properties: {
                    selected: option.value === currentValue
                }
            })
            selectElement.appendChild(optionElement)
        });

        const dropdownContainer = this.createElement('div', {
            classes: ['dropdown-container'],
            children: [dropdownLabel, selectElement]
        })

        return dropdownContainer
    }
    createDraggable(buttonElement){
        return (event) => { 
            const type = buttonElement.dataset.type
            const color = buttonElement.dataset.color
            let settingsTab = null

            // draggable name
            const dragName = this.createElement('span', {
                text: `${type} - ${color}`,
                classes: ['drag-name']
            })

            // x icon 
            const dragDelIcon = this.createElement('i', {
                classes: ['fa-solid', 'fa-x', 'drag-del-icon']
            })

            // delete button
            const dragDel = this.createElement('button', {
                classes: ['drag-del-button', 'drag-top-button'],
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
            const topBarButtons = this.createElement('div', {
                classes: ['drag-top-bar-buttons'],
                children: [dragDel]
            }) 
            // top bar with name and buttons
            const dragTopBar = this.createElement('div', {
                classes: 'drag-top-bar',
                children: [dragName, topBarButtons]
            })

            // main content area
            const dragContent = this.createElement('div', {
                classes: ['drag-content', `drag-content-${type}`]
            })

            const collapseButton = this.createElement('button', {
                    classes: ['drag-collapse-button', 'drag-top-button'],
                    children: [
                        this.createElement('i', {
                            classes: ['fa-solid', 'fa-chevron-up', 'collapse-icon']
                        })
                    ],
                    events: {
                        click: () => {
                            const content = newDrag.querySelector('.drag-content');
                            const icon = collapseButton.querySelector('.collapse-icon');
                            
                            content.classList.toggle('collapsed');
                            icon.classList.toggle('fa-chevron-up');
                            icon.classList.toggle('fa-chevron-down');
                        }
                    }
                });

            if(type === 'settings'){

                // main settings list container
                const settingList = this.createElement('ul', {
                    classes: 'drag-setting-list'
                })

                // grid toggle setting
                const gridToggle = this.createElement('li', {
                    classes: 'drag-setting-item',
                    children: [
                        // label for grid toggle
                        this.createElement('span', {
                            text: 'Toggle grid'
                        }),

                        // actual toggle switch
                        this.createElement('input', {
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
                    ]
                })

                // note type radio button setting
                const noteToggle = this.createElement('li', {
                    classes: ['drag-setting-item', 'drag-setting-radio'],
                    children: [
                        // setting title
                        this.createElement('span', {
                            text: 'Note input type:'
                        }),
                        // radio button container
                        this.createElement('div', {
                            classes: 'radio-container',
                            children: [
                                // input radio label
                                this.createElement('label', {
                                    text: 'Input',
                                    classes: 'radio-label'
                                }),
                                // input radio button
                                this.createElement('input', {
                                    attributes: {
                                        type: 'radio',
                                        name: 'noteType',
                                        value: 'input'
                                    },
                                    classes: 'custom-radio',
                                    properties: {
                                        checked: setting_manager.getSetting('noteType') === 'input'
                                    },
                                    events:  {
                                        change: (e) => {
                                            if(e.target.checked){
                                                setting_manager.setSetting('noteType', 'input')
                                            }
                                        }
                                    } 
                                }),
                                // prompt radio label
                                this.createElement('label', {
                                    text: 'Prompt',
                                    classes: 'radio-label'
                                }),
                                // prompt radio button
                                this.createElement('input', {
                                    attributes: {
                                        type: 'radio',
                                        name: 'noteType',
                                        value: 'prompt'
                                    },
                                    classes: 'custom-radio',
                                    properties: {
                                        checked: setting_manager.getSetting('noteType') === 'prompt'
                                    },
                                    events:  {
                                        change: (e) => {
                                            if(e.target.checked){
                                                setting_manager.setSetting('noteType', 'prompt')
                                            }
                                        }
                                    } 
                                })                                
                            ]
                        })
                    ]
                })

                //adds all options to setting list
                this.massChilren(settingList, [gridToggle, noteToggle])
                dragContent.appendChild(settingList)
                buttonElement.disabled = true
            }
            else if(type === 'note'){

                const noteColors = [
                    { text: 'Green', value: 'green' },
                    { text: 'Blue', value: 'blue' },
                    { text: 'Red', value: 'red' },
                    { text: 'Yellow', value: 'yellow' },
                    { text: 'Purple', value: 'purple'},
                    { text: 'Gray', value: 'gray'},
                    { text: 'D. Green', value: 'dark-green'}
                ];

                const colorClasses = noteColors.map(color => color.value)

                settingsTab = this.createElement('div', {
                    classes: ['hidden', 'drag-settings-tab'],
                    children: [
                        this.createDropdown('Note Color:', noteColors, color,
                        {
                            change: (e) => {
                                colorClasses.forEach(cls => newDrag.classList.remove(cls))
                                newDrag.classList.add(e.target.value)
                                dragName.textContent = `note - ${e.target.value}`
                            }
                        })
                    ]
                })
                const noteSettingButton = this.createElement('button', {
                    classes: ['drag-settings-button', 'drag-top-button'],
                    children: [
                        this.createElement('i', {
                            classes: ['fa-solid', 'fa-gear']
                        }),
                    ],
                    events: {
                        click: () => {
                            settingsTab.classList.toggle('hidden')
                        }
                    }
                })
            
                topBarButtons.appendChild(noteSettingButton)

                const noteList = this.createElement('ul', {
                    classes: ['note-list']
                })
                const noteButton = this.createElement('button', {
                    classes: ['note-add-button', 'note-button', 'wide'],
                    events: {
                        click: async () => {
                            if(setting_manager.getSetting('noteType') === 'prompt'){
                                try{
                                    noteList.appendChild(this.createElement('li', {
                                        classes: ['note-list-item', 'note-list-thing'],
                                        text: await this.makeCustomPrompt('Enter new note: ', 'NOTES', 'dont be shy...', 32),
                                        events: {
                                            click: (e) => {
                                                this.noteEdit(e.target);
                                            }
                                        }
                                    }))

                                }
                                catch(error){
                                    console.error(error)
                                }
                            }
                            else{
                                const newNoteInput = this.createElement('li', {
                                    classes: ['note-input-item', 'note-list-thing'],
                                    children: [
                                        this.createElement('input', {
                                            attributes: {
                                                type: 'text',
                                                placeholder: 'enter note...',
                                                maxlength: 64   
                                            },
                                            classes: ['note-input'],
                                            events: { 
                                                keydown: (e) => { 
                                                    if(e.key === 'Enter'){ 
                                                        const result = e.target.value
                                                        e.target.parentElement.remove()
                                                        noteList.appendChild(this.createElement('li', {
                                                            classes: ['note-list-item', 'note-list-thing'],
                                                            text: result,
                                                            events: {
                                                                click: (e) => {
                                                                    this.noteEdit(e.target);
                                                                }
                                                            }
                                                        }))
                                                    }
                                                }
                                            }
                                        }),
                                        this.createElement('button', {
                                            classes: ['note-input-confirm'],
                                            children: [
                                                this.createElement('i', {
                                                    classes: ['fa-solid', 'fa-check']
                                                })
                                            ],
                                            events: {
                                                click: () => {
                                                    const result = newNoteInput.querySelector('.note-input').value
                                                    newNoteInput.remove();
                                                    noteList.appendChild(this.createElement('li', {
                                                        classes: ['note-list-item', 'note-list-thing'],
                                                        text: result,
                                                        events: {
                                                            click: (e) => {
                                                                this.noteEdit(e.target);
                                                            }
                                                        }
                                                    }))
                                                }
                                            }
                                        })
                                    ]
                                })
                                noteList.appendChild(newNoteInput)
                            }
                            if(noteList.querySelectorAll('.note-list-thing').length === 0){
                                noteButton.classList.add('wide')
                                noteDelButton.classList.add('tiny')
                            }
                            else{
                                noteDelButton.classList.remove('hidden')
                                noteButton.classList.remove('wide')
                                setTimeout(() => {
                                    noteDelButton.classList.remove('tiny')
                                }, 50);
                            }
                        }
                    },
                    text: 'New note'
                })
                const noteDelButton = this.createElement('button', {
                    classes: ['note-del-button', 'note-button', 'hidden', 'tiny'],
                    text: 'Delete last',
                    events: {
                        click: () => {
                            let notes = noteList.querySelectorAll('.note-list-thing')
                            let notenum = notes.length
                            console.log(notes, notes.length)
                            if(notes.length > 0){
                                notes[notenum - 1].remove()
                                notenum -= 1
                            }
                            if(notenum === 0){
                                noteDelButton.classList.add('tiny')
                                noteButton.classList.add('wide')
                                setTimeout(() => {
                                    noteDelButton.classList.add('hidden')
                                }, 1);
                            }
                        }
                    }
                })
                this.massChilren(dragContent, [noteList, this.createElement('div', {
                    classes: ['button-holder-div-thingie'],
                    children: [noteButton, noteDelButton]
                })])
            }
            
            topBarButtons.appendChild(collapseButton)
            const newDrag = this.createElement('div', {
                classes: ['draggable-item', `drag-${type}`, `${color}`],
                children: [dragTopBar, dragContent],
            })

            if(settingsTab){
                newDrag.appendChild(settingsTab)
            }

            document.body.appendChild(newDrag) 
            this.makeDraggable(newDrag, dragTopBar) 
        }
    }
    makeDraggable(element, handle){
        element.style.position = 'absolute'
        return new Draggable(element, handle)
    }
    //makes custom prompts to get user input
    makeCustomPrompt(message = '', title = '', plcholder = '', maxlen = null){

        // return promise
        return new Promise((resolve) => { 
            let result = ''; // Initialize result to ''

            //custom prompt container
            const barrier = this.createElement('div', {classes: 'barrier'}); 
            const customPrompt = this.createElement('div',{ 
                classes: ['custom-prompt-container'], 
                children: [ 
                    //prompt header
                    this.createElement('h2', { 
                        classes: 'custom-prompt-header', 
                        text: title 
                    }),
                    //div that contains the input, message and buttons
                    this.createElement('div', { 
                        classes: 'custom-prompt-input-container', 
                        children: [ //
                            //input message thing
                            this.createElement('h3', {  
                                classes: 'custom-prompt-input-message', 
                                text: message 
                            }),
                            //input itself
                            this.createElement('input', { 
                                attributes: { 
                                    type: 'text', 
                                    placeholder: plcholder,
                                },
                                classes: 'custom-prompt-input', 
                                events: { 
                                    keydown: (e) => { 
                                        if(e.key === 'Enter'){ 
                                            result = e.target.value
                                            customPrompt.remove(); 
                                            barrier.remove();
                                            resolve(result); 
                                        }
                                    }
                                }
                            }),
                            this.createElement('button', { 
                                classes: 'custom-prompt-confirm-button', 
                                text: 'Confirm', 
                                events: { 
                                    click: (e) => { 
                                        const inputElement = e.target.parentElement.querySelector('.custom-prompt-input'); 
                                        result = inputElement.value;
                                        customPrompt.remove(); 
                                        barrier.remove(); 
                                        resolve(result); 
                                    }
                                }
                            })
                        ]
                    })
                ]

            })
            if(maxlen && maxlen > 0){
                customPrompt.querySelector('.custom-prompt-input').maxLength = maxlen; 
            }
            this.massChilren(document.body, [barrier, customPrompt]); 
        }); 
    }
    noteEdit(element){
        const notetext = element.textContent
        
        const mirror = document.querySelector('.input-mirror');

        const input = this.createElement('input', {
            attributes: {
                type: 'text',
                value: notetext,
                maxlength: 80
            },
            classes: ['note-edit-input'],
            events: {
                keydown: (e) => {
                    if (e.key === 'Enter') {
                        element.textContent = e.target.value;
                        element.classList.remove('editing');
                    }
                },
                blur: () => {
                    element.textContent = input.value;
                    element.classList.remove('editing');
                },
                input: () => this.resizeTheStupidInput(input, mirror)
            }
        })
        element.textContent = '';
        element.appendChild(input);
        element.classList.add('editing');
        input.focus();
        this.resizeTheStupidInput(input, mirror)
    }
    resizeTheStupidInput(input, mirror){
        const style = window.getComputedStyle(input);
        const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        mirror.textContent = input.value || ' ';
        input.style.width = mirror.offsetWidth + padding + 10 + 'px';
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
