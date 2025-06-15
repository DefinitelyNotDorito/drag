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
            this.isDragging = false
            this.currentDragObject = null
        })
    }
    startDrag(dragObject, mouseEvent){
        this.isDragging = true
        this.currentDragObject = dragObject

        const objectRect = dragObject.element.getBoundingClientRect()
        this.dragOffset.x = mouseEvent.clientX - objectRect.left
        this.dragOffset.y = mouseEvent.clientY - objectRect.top
    }
}

class Draggable{
    constructor(element){
        this.element = element
        this.setupDrag()
    }
    setupDrag(){
        this.element.addEventListener('mousedown', (e) => {
            drag_manager.startDrag(this, e)
        })
    }
    moveTo(x, y){
        this.element.style.left = x + 'px'
        this.element.style.top = y + 'px'
    }
}

class DragFactory{
    createDraggable(buttonElement){
        return (event) => { 
            const type = buttonElement.dataset.type
            const color = buttonElement.dataset.color

            const newDrag = document.createElement('div')
            newDrag.classList.add('draggable-item', `drag-${type}`, `drag-${color}`) 

            newDrag.textContent = `${type} - ${color}`

            document.body.appendChild(newDrag) 

            this.makeDraggable(newDrag) 
        }
    }
    makeDraggable(element){
        element.style.position = 'absolute'
        return new Draggable(element)
    }
}

const drag_factory = new DragFactory()
const kit_tab_manager = new KitTabManager()
const drag_manager = new DragManager()
